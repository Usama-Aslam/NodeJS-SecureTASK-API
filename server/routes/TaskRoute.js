const express = require("express");
const { ObjectID } = require("mongodb");
const _ = require("lodash");
const { Task } = require("../models/Task");

const router = new express.Router();

const ValidField = (req, fields) => {
  const keys = Object.keys(req.body);
  const allowedFields = fields;
  const check = keys.every(key => allowedFields.includes(key));
  return check;
};

router.post("/task", async (req, res) => {
  const fields = ["text", "completed"];
  if (!ValidField(req, fields))
    return res.status(400).send({ error: "invalid input" });

  const body = _.pick(req.body, fields);
  try {
    const task = new Task(body);
    await task.save();
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/task", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).send({ tasks });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/task/:id", async (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(400).send({ error: "invalid id" });

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(400).send({ error: "task not found" });

    res.status(200).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
