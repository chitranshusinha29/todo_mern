const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todo");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/todoapp")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Routes
app.use("/auth", authRoutes);
app.use("/todos", todoRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
