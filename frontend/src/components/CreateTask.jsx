import React, { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API; // your backend URL

function CreateTask({ fetchTasks, token }) {
  const [task, setTask] = useState({
    title: "",
    description: "",
    deadlineDate: "",
    deadlineTime: "",
    priority: "medium",
    emoji:"",
    important: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTask({
      ...task,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!task.title || !task.deadlineDate) {
      alert("Title and deadline are required");
      return;
    }

    try {
      await axios.post(
        `${API}/tasks`,
        {
          title: task.title,
          description: task.description,
          deadlineDate: task.deadlineDate,
          deadlineTime: task.deadlineTime,
          priority: task.priority,
          important: task.important,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Task added successfully!");

      // Optional: refresh task list
      if (fetchTasks) fetchTasks();

      // Reset form
      setTask({
        title: "",
        description: "",
        deadlineDate: "",
        deadlineTime: "",
        priority: "medium",
        important: false,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add task");
    }
  };

  return (
    <div className="create-task">
      <h2>Create Task</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Task title"
          value={task.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Task description"
          value={task.description}
          onChange={handleChange}
        />

        <div className="deadline">
          <input
            type="date"
            name="deadlineDate"
            value={task.deadlineDate}
            onChange={handleChange}
          />
          <input
            type="time"
            name="deadlineTime"
            value={task.deadlineTime}
            onChange={handleChange}
          />
        </div>

        <label>Priority</label>
        <select name="priority" value={task.priority} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label className="important">
          <input
            type="checkbox"
            name="important"
            checked={task.important}
            onChange={handleChange}
          />
          Mark as Important ⭐
        </label>

        <button type="submit">Add Task</button>
      </form>
    </div>
  );
}

export default CreateTask;
