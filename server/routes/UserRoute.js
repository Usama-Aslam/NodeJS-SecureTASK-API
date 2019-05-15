const express = require("express");
const _ = require("lodash");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const { User } = require("../models/User");
const { authentication } = require("../middleware/authentication");
const {
  sendEmailLink,
  verifyEmailLink
} = require("../middleware/verificationEmail");

const router = new express.Router();

// var smtpTransport = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: "uaslam345@gmail.com",
//     pass: "03432226546@"
//   },
//   tls: {
//     rejectUnauthorized: false
//   }
// });
// var rand, mailOptions, host, link;

const ValidField = (req, fields) => {
  const keys = Object.keys(req.body);
  const allowedFields = fields;
  const check = keys.every(key => allowedFields.includes(key));
  return check;
};

router.post("/user/signup", async (req, res) => {
  const fields = ["email", "password"];
  if (!ValidField(req, fields))
    return res.status(400).send({ error: "invalid input" });

  const body = _.pick(req.body, fields);
  const user = new User(body);

  try {
    const result = await user.save();
    const token = await result.generateAuthToken();

    res
      .status(200)
      .header("x-auth", token)
      .send({ user: result });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/user/me", authentication, async (req, res) => {
  res.status(200).send(req.user);
});

router.post("/user/login", async (req, res) => {
  const fields = ["email", "password"];
  if (!ValidField(req, fields))
    return res.status(400).send({ error: "invalid fields" });

  const body = _.pick(req.body, fields);
  try {
    const user = await User.findByCredentials(body);
    const token = user.generateAuthToken();
    res
      .status(200)
      .header("x-auth", token)
      .send(user);
  } catch (error) {
    res.status(401).send(error);
  }
});

router.patch("/user/me", authentication, async (req, res) => {
  const updates = Object.keys(req.body);
  const fields = ["password", "newPassword", "confirmPassword"];

  if (!ValidField(req, fields))
    return res.status(400).send({ error: "invalid input" });

  const body = _.pick(req.body, fields);

  try {
    await req.user.validatePassword(body);

    if (
      _.isEqual(body.newPassword, body.confirmPassword) &&
      typeof body[("confirmPassword", "newPassword")] !== "undefined"
    ) {
      req.user["password"] = body["newPassword"];
      await req.user.save();

      res.status(200).send(req.user);
    } else {
      res.status(400).send({ error: "password doesnot match" });
    }
  } catch (error) {
    res.status(401).send(error);
  }
});

router.get("/user/send", [authentication, sendEmailLink], (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    res.status(401).send(error);
  }
});

router.get("/user/verify", [authentication, verifyEmailLink], (req, res) => {
  res.send();
});

module.exports = router;
