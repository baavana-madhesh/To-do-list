import React from "react";
import {
  FaHome,
  FaPlus,
  FaTasks,
  FaCheckCircle,
  FaHourglassHalf,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar({ setView, tasks, user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">To-Do App</h2>
        {user && <p className="sidebar-username">Hi, {user.username}!</p>}
      </div>

      <button
        className="create-task-btn"
        onClick={() => setView("create")}
      >
        <FaPlus /> Create Task
      </button>

      <ul className="sidebar-menu">
        <li onClick={() => setView("dashboard")}>
          <FaHome /> Dashboard
        </li>

        <li onClick={() => setView("all")}>
          <FaTasks /> All Tasks
        </li>

        <li onClick={() => setView("pending")}>
          <FaHourglassHalf /> Pending
        </li>

        <li onClick={() => setView("completed")}>
          <FaCheckCircle /> Completed
        </li>

        <li onClick={() => setView("upcoming")}>
          <FaCalendarAlt /> Upcoming
        </li>
        <li onClick={() => setView("calendar")}>
          <FaCalendarAlt /> calendar
        </li>
      </ul>

      <button className="logout-btn" onClick={onLogout}>
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}

export default Sidebar;
