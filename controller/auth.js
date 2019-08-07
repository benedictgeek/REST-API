const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Error validating inputs");

    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        name: name,
        password: hashedPassword,
        email: email,
        status: "Hey everyone!"
      });

      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: "User created successfully",
        data: result
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let loadedUser;

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error("This email does not exist");
        error.statusCode = 404;
        throw error;
      }

      loadedUser = user;

      return bcrypt.compare(password, user.password);
    })
    .then(isMatch => {
      if (!isMatch) {
        const error = new Error("Password incorrect");
        error.statusCode = 422;
        throw error;
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString()
        },
        "myveryverybigsecuredsignature",
        { expiresIn: "1h" }
      );

      res.status(200).json({
          token: token, userId: loadedUser._id.toString()
      })
    })
    .catch(err => {
        console.log(err)
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};
