require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

/* ---------- JWT SECRET ---------- */
const JWT_SECRET = process.env.SECRET||"secret_key";

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

/* ---------- AUTHENTICATION MIDDLEWARE ---------- */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid token"
      });
    }
    req.user = user;
    next();
  });
};

/* ---------- MONGODB CONNECTION ---------- */
mongoose.connect(process.env.MONGO_URL||"mongodb+srv://baavanacs23_db_user:eoLcSG8WwDaxjC2s@cluster0.rkuy8cf.mongodb.net/to_do_list?appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

/* ---------- USER SCHEMA ---------- */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);

/* ---------- TASK SCHEMA ---------- */
const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,

  deadlineDate: String,
  deadlineTime: String,

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },

  important: {
    type: Boolean,
    default: false,
  },

  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },

  emoji: {
    type: String,
    default: "", // default empty if user doesn't provide
  },
}, {
  timestamps: true
});

const Task = mongoose.model("Task", taskSchema);

/* ---------- ROUTES ---------- */

/* REGISTER */
app.post("/auth/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{
        email
      }, {
        username
      }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({
          message: "User already exists with this email or username"
        });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email
      },
      JWT_SECRET, {
        expiresIn: "7d"
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* LOGIN */
app.post("/auth/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    // Find user
    const user = await User.findOne({
      email
    });
    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    // Generate token
    const token = jwt.sign({
        id: user._id,
        username: user.username,
        email: user.email
      },
      JWT_SECRET, {
        expiresIn: "7d"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* CREATE TASK */
app.post("/tasks", authenticateToken, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      userId: req.user.id
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});

/* GET ALL TASKS FOR AUTHENTICATED USER */
app.get("/tasks", authenticateToken, async (req, res) => {
  const tasks = await Task.find({
    userId: req.user.id
  }).sort({
    createdAt: -1,
  });
  res.json(tasks);
});

/* UPDATE TASK (edit / mark complete) */
app.put("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Check if task belongs to user
    if (task.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "Not authorized to update this task"
        });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body, {
        new: true
      }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* DELETE TASK */
app.delete("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Check if task belongs to user
    if (task.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          message: "Not authorized to delete this task"
        });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({
      message: "Task deleted"
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});

// DASHBOARD STATS
app.get("/dashboard/stats", authenticateToken, async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({
      userId: req.user.id
    });
    const completedTasks = await Task.countDocuments({
      userId: req.user.id,
      status: "completed",
    });
    const pendingTasks = await Task.countDocuments({
      userId: req.user.id,
      status: "pending",
    });
    const importantTasks = await Task.countDocuments({
      userId: req.user.id,
      important: true,
    });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      importantTasks,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT||5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});