import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API =process.env.REACT_APP_API;

function Dashboard({ token }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, [token]);

  if (!stats) return <p>Loading dashboard...</p>;

  const data = {
    labels: ["Completed", "Pending", "Important"],
    datasets: [
      {
        label: "Tasks",
        data: [
          stats.completedTasks,
          stats.pendingTasks,
          stats.importantTasks,
        ],
        backgroundColor: [
          "#22c55e", // Green for Completed
          "#eab308", // Yellow for Pending
          "#8b5cf6", // Purple for Important
        ],
        borderColor: [
          "#16a34a",
          "#ca8a04",
          "#7c3aed",
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>

      <div className="stats">
        <div className="card">Total Tasks: {stats.totalTasks}</div>
        <div className="card">Completed: {stats.completedTasks}</div>
        <div className="card">Pending: {stats.pendingTasks}</div>
        <div className="card">Important: {stats.importantTasks}</div>
      </div>

      <div className="chart-container">
        <Bar data={data} />
      </div>
    </div>
  );
}

export default Dashboard;
