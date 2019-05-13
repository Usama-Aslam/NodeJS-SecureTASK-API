const express = require("express");
const { User } = require("../models/User");

const router = new express.Router();

router.post("/user/signup", async (req, res) => {
  res.send("send");
});

module.exports = router;
