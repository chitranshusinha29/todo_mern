const express = require("express");
const Todo = require("../models/Todo");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get todos
router.get("/", auth, async (req, res) => {
  const todos = await Todo.find({ user: req.userId });
  res.json(todos);
});

// Add todo
router.post("/", auth, async (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    user: req.userId
  });
  await todo.save();
  res.json(todo);
});

// Update todo (edit OR toggle)
router.put("/:id", auth, async (req, res) => {
  const todo = await Todo.findById(req.params.id);

  if (req.body.text !== undefined) {
    todo.text = req.body.text;
  } else {
    todo.completed = !todo.completed;
  }

  await todo.save();
  res.json(todo);
});

// Delete todo
router.delete("/:id", auth, async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
