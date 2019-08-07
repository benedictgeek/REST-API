const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");

const deleteFile = filePath => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, err => {
    if (err) {
      const error = new Error("Image delete failed");
      error.statusCode = 500;
      throw error;
    }
  });
};

exports.getPosts = (req, res, next) => {
  const userId = req.userId;
  Post.find({ creator: userId })
    .populate("creator")
    .then(posts => {
      console.log(posts);
      res.status(200).json({
        posts: posts
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};

exports.postPost = async (req, res, next) => {
  if (!req.file) {
    const error = new Error("No image uploaded");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("incorrect input please try again");
    error.statusCode = 422;
    throw error;
  }

  //save imto db
  //   let newPost;

  const post = new Post();
  post.title = title;
  post.content = content;
  post.imageUrl = req.file.path;
  post.creator = req.userId;

  try {
    const newPost = await post.save();
    const user = await User.findOne({ _id: req.userId });
    user.posts = [...user.posts, newPost._id];
    const savedUser = await user.save();
    res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    throw err;
  }

  //   post
  //     .save()
  //     .then(post => {
  //       newPost = post;
  //       return User.findOne({ _id: req.userId });
  //     })
  //     .then(user => {
  //       user.posts = [...user.posts, newPost._id];
  //       return user.save();
  //     })
  //     .then(result => {
  //       return res.status(201).json({
  //         message: "Post created successfully",
  //         post: newPost
  //       });
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       if (!err.statusCode) {
  //         err.statusCode = 500;
  //       }
  //         next(err);
  //     });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Post not found");
        error.statusCode = 400;
        return next(error);
      }

      res.status(200).json({
        post: post
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};

exports.putPost = (req, res, next) => {
  const postId = req.body.postId;

  let imageUrl;

  if (!req.file) {
    imageUrl = req.body.image;
  } else {
    imageUrl = req.file.path;
  }

  const title = req.body.title;
  const content = req.body.content;

  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Product not found.");
        error.statusCode = 404;
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        deleteFile(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then(post => {
      res.status(200).json({
        message: "Post Updated successfully",
        post: post
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then(post => {
      if (post.creator.toString() !== req.userId.toString()) {
        const error = new Error("Not authenticated");
        error.statusCode = 401;
        throw error;
      }
      deleteFile(post.imageUrl);

      return Post.findByIdAndDelete(postId);
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(result => {
      res.status(200).json({
        message: "Post deleted successfully"
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
        next(err);
      }
    });
};
