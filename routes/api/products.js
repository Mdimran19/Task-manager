const express = require("express");
//const bcrypt = require("bcrypt");
const router = express.Router();
const { body, validationResult } = require("express-validator");
//const jwt = require("jsonwebtoken");
//const User = require("../../models/User");
const Task = require("../../models/Task");
const authenticateToken = require("../../middleware/auth");

router.post(
  "/",
  [authenticateToken, [body("title", "title is required").notEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors });
      }
      const id = req.user.id;
      const taskObj = {
        title: req.body.title,
        desc: req.body.desc ?? "",
        userId: id,
        //status: 'to-do'
      };

      const task = new Task(taskObj);
      await task.save();
      res.status(201).json(task);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "something is wrong" });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    //const id = req.user.id;
    const tasks = await Task.find({});
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something is wrong" });
  }
});
router.put(
  "/status/:id",
  [
    authenticateToken,
    [
      body("status", "status is required").notEmpty(),
      body("status", "status must be to-do or in-progress or done").isIn([
        "to-do",
        "in-progress",
        "done",
      ]),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors });
      }
      const id = req.params.id;
      const userId = req.user.id;
      const status = req.body.status;
      const task = await Task.findByIdAndUpdate(
        { _id: id, userId: userId },
        { status: status },
        { new: true }
      );
      if (task) {
        res.json(task);
      } else {
        res.status(404).json({ message: "tasks not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "something is wrong" });
    }
  }
);
router.put(
  "/:id",
  [
    authenticateToken,
    [
      body("status", "status is invalid").isIn([
        "to-do",
        "in-progress",
        "done",
      ]),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors });
      }
      const id = req.params.id;
      const userId = req.user.id;
      const body = req.body;
      const task = await Task.findByIdAndUpdate(
        { _id: id, userId: userId },
        body,
        { new: true }
      );
      if (task) {
        res.json(task);
      } else {
        res.status(404).json({ message: "tasks not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "something is wrong" });
    }
  }
);
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const task = await Task.findOne({_id: id, userId: userId});
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: "task not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something is wrong" });
  }
});
router.get("/", (req, res) => {
  res.json({ message: "welcome" });
});


router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const task = await Task.findOneAndDelete({_id: id, userId: userId});
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something is wrong" });
  }
});

module.exports = router;

