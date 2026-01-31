import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

function TaskList({ view, tasks: parentTasks, fetchTasks, token }) {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    deadlineDate: "",
    deadlineTime: "",
    priority: "medium",
    important: false,
    emoji: "",
  });

  // Start editing a task
  const startEditing = (task) => {
    setEditingTaskId(task._id);
    setEditData({
      title: task.title,
      deadlineDate: task.deadlineDate,
      deadlineTime: task.deadlineTime || "",
      priority: task.priority,
      important: task.important,
      emoji: task.emoji || "",
    });
  };

  // Handle changes in edit form
  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData({ ...editData, [name]: type === "checkbox" ? checked : value });
  };

  // Update task on server
  const updateTask = async (id) => {
    try {
      await axios.put(`${API}/tasks/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle complete/pending status
  const toggleComplete = async (task) => {
    try {
      const newStatus = task.status === "pending" ? "completed" : "pending";
      await axios.put(`${API}/tasks/${task._id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks(); // refresh tasks
    } catch (err) {
      console.error(err);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter tasks based on view
  const now = new Date();
  const filteredTasks = parentTasks.filter((task) => {
    if (view === "all" || view === "dashboard") return true;
    if (view === "completed") return task.status === "completed";
    if (view === "pending") return task.status === "pending";
    if (view === "upcoming") {
      const taskDate = new Date(task.deadlineDate + " " + (task.deadlineTime || ""));
      return taskDate > now && task.status === "pending";
    }
    return true;
  });

  return (
    <div className="task-list">
      <h2>{view.toUpperCase()} TASKS</h2>
      {filteredTasks.length === 0 && <p>No tasks found</p>}

      {filteredTasks.map((task) => (
        <div
          key={task._id}
          className={`task-box ${task.status === "completed" ? "completed-box" : ""} ${task.important ? "important-box" : ""}`}
        >
          {editingTaskId === task._id ? (
            <div className="task-details">
              <input type="text" name="title" value={editData.title} onChange={handleEditChange} className="edit-input" />
              <input type="date" name="deadlineDate" value={editData.deadlineDate} onChange={handleEditChange} className="edit-input" />
              <input type="time" name="deadlineTime" value={editData.deadlineTime} onChange={handleEditChange} className="edit-input" />
              <select name="priority" value={editData.priority} onChange={handleEditChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <label>
                <input type="checkbox" name="important" checked={editData.important} onChange={handleEditChange} /> ⭐ Important
              </label>
              <input
                type="text"
                name="emoji"
                value={editData.emoji}
                onChange={handleEditChange}
                maxLength={2}
                placeholder="Emoji"
                className="edit-input"
              />
            </div>
          ) : (
            <div className="task-details">
              <h3 className="task-title">
                {task.title} {task.emoji && <span className="task-emoji">{task.emoji}</span>}
              </h3>
              <p className="task-deadline">Deadline: {task.deadlineDate} {task.deadlineTime}</p>
              <p className="task-priority">Priority: {task.priority}</p>
              {task.important && <p className="task-important">⭐ Important</p>}
            </div>
          )}

          <div className="task-buttons">
            {editingTaskId === task._id ? (
              <button className="edit-btn" onClick={() => updateTask(task._id)}>Update</button>
            ) : (
              <button className="edit-btn" onClick={() => startEditing(task)}>Edit</button>
            )}
            <button
              onClick={() => toggleComplete(task)}
              className="complete-btn"
            >
              {task.status === "completed" ? "Undo" : "Complete"}
            </button>
            <button className="delete-btn" onClick={() => deleteTask(task._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskList;
