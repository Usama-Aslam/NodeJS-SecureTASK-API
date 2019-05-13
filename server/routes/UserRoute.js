const express = require("express");
const _ = require("lodash");

const { User } = require("../models/User");

const router = new express.Router();

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
    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});


module.exports = router;
