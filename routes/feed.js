const express = require("express");

const router = express.Router();

const { body } = require("express-validator");

const feedController = require("../controller/feed");
const isAuth = require('../middleware/is-auth')


router.get("/posts", isAuth, feedController.getPosts);
router.post(
  "/post", isAuth,
  [
    body("title")
      .isLength({ min: 5 })
      .trim(),
    body("content")
      .isLength({ min: 5 })
      .trim()
  ],
  feedController.postPost
);

router.get("/post/:postId", isAuth, feedController.getPost);
router.put(
  "/post", isAuth,
  [
    body("title")
      .isLength({ min: 5 })
      .trim(),
    body("content")
      .isLength({ min: 5 })
      .trim()
  ],
  feedController.putPost
);

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router;
