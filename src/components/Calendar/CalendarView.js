import Calendar from 'react-calendar';
import { format } from 'date-fns';
import 'react-calendar/dist/Calendar.css';

export default function CalendarView({ sessionDates, onDayClick }) {
  function tileContent({ date, view }) {
    if (view !== 'month') return null;
    const str = format(date, 'yyyy-MM-dd');
    if (!sessionDates.includes(str)) return null;
    return (
      <div className="flex justify-center mt-0.5">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </div>
    );
  }

  function handleChange(date) {
    onDayClick(format(date, 'yyyy-MM-dd'));
  }

  return (
    <div className="calendar-wrapper">
      <Calendar
        onChange={handleChange}
        tileContent={tileContent}
        className="rounded-xl border-none shadow-sm"
      />
    </div>
  );
}
