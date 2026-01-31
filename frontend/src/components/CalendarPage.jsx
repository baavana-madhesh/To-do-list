import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function CalendarPage({ tasks }) {
  return (
    <div className="calendar-page">
      <h2>Upcoming Tasks Calendar</h2>
      <Calendar
        tileContent={({ date, view }) => {
          const dayTasks = tasks?.filter(
            task => task.deadlineDate === date.toISOString().split("T")[0]
          );

          return (
            <div className="calendar-emoji">
              {dayTasks?.map((t, i) => (
                <span key={i}>{t.emoji}</span>
              ))}
            </div>
          );
        }}
      />
    </div>
  );
}

export default CalendarPage;
