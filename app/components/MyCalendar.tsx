import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const events = [
  {
    id: 1,
    title: "Team Meeting",
    start: new Date(2026, 1, 13, 10, 0),
    end: new Date(2026, 1, 13, 12, 0),
  },
  {
    id: 2,
    title: "Client Call",
    start: new Date(2026, 1, 15, 14, 0),
    end: new Date(2026, 1, 15, 15, 0),
  },
];

export default function MyCalendar() {
  return (
    <div style={{ height: "600px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={[Views.MONTH, Views.WEEK, Views.DAY]} // 👈 Enable only Month, Week, Day
        defaultView={Views.MONTH}
        selectable
        popup
        style={{ height: 600 }}
      />
    </div>
  );
}
