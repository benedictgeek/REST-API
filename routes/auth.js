const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const authController = require("../controller/auth");

const User = require("../models/user");

router.put(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.find({ email: value })
          .countDocuments()
          .then(count => {
            if (count > 0) {
              return Promise.reject("This email already exists");
            }
          });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 6 }),
    body("name")
      .trim()
      .not()
      .isEmpty()
  ],
  authController.signup
);

router.post('/login', authController.login)
module.exports = router;
