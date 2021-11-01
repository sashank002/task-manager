const express = require("express");
const Tasks = require("../models/Task");
const Auth = require("../middleware/Auth");

const route = express.Router();

// *************************  FOR ADDING TASKS **************************************
route.post("/tasks", Auth, (req, res) => {
  // console.log(req.body);

  // const Task = new Tasks(req.body);
  const task = new Tasks({
    ...req.body,
    owner: req.user._id,
  });

  task
    .save()
    .then((result) => res.status(201).send(result))
    .catch((error) => {
      res.status(400);
      res.send(error);
    });
});

//
// *************************  FOR READING ALL TASKS **************************************
// /tasks?completed=true
// /tasks?limit=2&skip=1
route.get("/tasks", Auth, async (req, res) => {
  try {
    const match = {};
    const sort = {};

    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
      // completed : -1 for descending order
      // completed = 1 for ascending order
    }

    // const task = await Tasks.find({ owner: req.user._id });
    await req.user.populate({
      path: "tasks",
      match: match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort: sort,
      },
    }); // this  line will populate task into user.tasks
    res.send(req.user.tasks);
    // res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

//
// *************************  FOR READING TASK BY THEIR ID ********************************
route.get("/tasks/:id", Auth, (req, res) => {
  const _id = req.params.id;

  Tasks.findOne({ _id: _id, owner: req.user._id })
    .then((task) => {
      if (!task) {
        return res.status(404).send("task not found");
      }

      res.send(task);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

//
// ************************* FOR UPDATING TASK BY THEIR ID ********************************
route.patch("/tasks/:id", Auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const isAllowed = ["description", "completed"];
  const isValid = updates.every((update) => {
    return isAllowed.includes(update);
  });

  // if user want to update something thaat is not present then this if will run
  if (!isValid) {
    return res.status(400).send({ error: "invalid updates" });
  }

  try {
    // const task = await Tasks.findById(req.params.id);
    const task = await Tasks.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    // const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    // if task not found then this if will run
    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      task[update] = req.body[update];
    });

    await task.save();

    // if everything go well then success
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

// ************************* FOR DELETING TASK BY THEIR ID ********************************

route.delete("/tasks/:id", Auth, async (req, res) => {
  try {
    const task = await Tasks.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = route;
