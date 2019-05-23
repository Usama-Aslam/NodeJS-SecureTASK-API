const express = require("express");
const { ObjectID } = require("mongodb");
const _ = require("lodash");

const { authentication } = require("../middleware/authentication");
const { Task } = require("../models/Task");

const router = new express.Router();

const ValidField = (req, fields) => {
  const keys = Object.keys(req.body);
  const allowedFields = fields;
  const check = keys.every(key => allowedFields.includes(key));
  return check;
};

router.post("/task", authentication, async (req, res) => {
  const fields = ["text", "completed"];
  if (!ValidField(req, fields))
    return res.status(400).send({ error: "invalid input" });

  const body = _.pick(req.body, fields);
  try {
    const task = new Task({ ...body, _creator: req.user._id });
    await task.save();
    res.status(200).send({ task });
  } catch (error) {
    res.status(400).send({ error });
  }
});

router.get("/task", authentication, async (req, res) => {
  try {
    // const tasks = await Task.find({ _creator: req.user._id });
    // res.status(200).send({ tasks });

    const match = {};
    //using populate method
    if (req.query.completed) {
      match.completed = req.query.completed == "true";
    }
    await req.user
      .populate({
        path: "tasks",
        match
      })
      .execPopulate();

    res.status(200).send({ task: req.user.tasks });
  } catch (error) {
    res.status(400).send({ error });
  }
});

router.get("/task/:id", authentication, async (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id))
    return res.status(400).send({ error: "invalid id" });

  try {
    const task = await Task.findOne({ _id: id, _creator: req.user._id });
    if (!task) return res.status(400).send({ error: "task not found" });

    res.status(200).send({ task });
  } catch (error) {
    res.status(400).send({ error });
  }
});

router.patch("/task/:id", authentication, async (req, res) => {
  const id = req.params.id;
  const fields = ["text", "completed"];

  if (!ObjectID.isValid(id) || !ValidField(req, fields))
    return res.status(400).send({ error: "invalid id or input" });

  const body = _.pick(req.body, fields);
  try {
    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
      const task = await Task.findOneAndUpdate(
        { _id: id, _creator: req.user._id },
        { $set: body },
        { new: true }
      );

      if (!task) return res.status(400).send({ error: "task not found" });

      res.status(200).send(task);
    } else if (_.isBoolean(body.completed) && !body.completed) {
      body.completed = false;
      body.completedAt = null;

      const task = await Task.findOneAndUpdate(
        { _id: id, _creator: req.user._id },
        { $set: body },
        { new: true }
      );

      if (!task) return res.status(400).send({ error: "task not found" });
      res.status(200).send({ task });
    } else res.status(400).send({ error: "invalid data" });
  } catch (error) {
    res.status(400).send({ error });
  }
});

router.delete("/task/:id", authentication, async (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id))
    return res.status(400).send({ error: "invalid id" });
  try {
    const task = await Task.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    });
    if (!task) return res.status(400).send({ error: "task not found" });

    res.status(200).send({ task });
  } catch (error) {
    res.status(400).send({ error });
  }
});

module.exports = router;
