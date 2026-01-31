import React from "react";
import Dashboard from "./Dashboard";
import TaskList from "./TaskList";
import CreateTask from "./CreateTask";
import CalendarPage from "./CalendarPage";

function MainContent({ view, tasks, fetchTasks, token, user }) {
  return (
    <main
      style={{
        marginLeft: "260px",
        padding: "20px",
        width: "100%",
      }}
    >
      {view === "dashboard" && <Dashboard token={token} />}
      {view === "create" && <CreateTask fetchTasks={fetchTasks} token={token} />}
      {view === "calendar" && <CalendarPage tasks={tasks} />}
      {view !== "dashboard" &&
        view !== "create" &&
        view !== "calendar" && (
          <TaskList
            view={view}
            tasks={tasks}
            fetchTasks={fetchTasks}
            token={token}
          />
        )}
    </main>
  );
}

export default MainContent;
