import '../Block-firewall/calendarbox.css';

import {
  useEffect,
  useState,
} from 'react';

interface CalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedShift: number; 
}

export default function CalendarBox({ selectedDate, onDateChange, selectedShift }: CalendarProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(currentYear);
  const [activeDays, setActiveDays] = useState<Set<number>>(new Set());

useEffect(() => {
  const fetchScheduledDates = async () => {
    try {
      const res = await fetch(
        `http://192.168.0.20:4001/api/blockcalendar?month=${month + 1}&year=${year}`
      );

      const json = await res.json();
      const data = Array.isArray(json) ? json : [];

      const daysSet = new Set<number>();

      data.forEach((item: { DATE: string }) => {
        if (!item.DATE) return;

        const dateObj = new Date(item.DATE);
        if (
          dateObj.getFullYear() === year &&
          dateObj.getMonth() === month
        ) {
          daysSet.add(dateObj.getDate());
        }
      });

      setActiveDays(daysSet);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setActiveDays(new Set());
    }
  };

  fetchScheduledDates();
}, [month, year]);


  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (number | '')[] = [];
  for (let i = 0; i < firstDay; i++) grid.push('');
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);

const handleDateClick = async (day: number) => {
  const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
  onDateChange(dateStr);


  try {
    const kickRes = await fetch('http://192.168.0.20:4001/api/block_kickIOCounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, shift: selectedShift }),
    });

    if (!kickRes.ok) throw new Error('KickIO API error');

    const kickData = await kickRes.json();

    const kickInEl = document.getElementById('block_kick_io_kick_in');
    const kickOutEl = document.getElementById('block_kick_io_kick_out');

    if (kickInEl) kickInEl.textContent = kickData.kick_in_count?.toString() || '0';
    if (kickOutEl) kickOutEl.textContent = kickData.kick_out_count?.toString() || '0';

    const shiftRes = await fetch('http://192.168.0.20:4001/api/blockcalendar_shiftCounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, shift: selectedShift }),
    });

    if (!shiftRes.ok) throw new Error('Shift API error');

    const shiftData = await shiftRes.json();

    const shiftInEl = document.getElementById('block_kick_io_shift_in');
    const shiftOutEl = document.getElementById('block_kick_io_shift_out');

    if (shiftInEl) shiftInEl.textContent = shiftData.shift_in_count?.toString() || '0';
    if (shiftOutEl) shiftOutEl.textContent = shiftData.shift_out_count?.toString() || '0';

  } catch (err) {
    console.error('Error fetching counts:', err);
  }
};

  const prevMonth = () => (month === 0 ? (setMonth(11), setYear(year - 1)) : setMonth(month - 1));
  const nextMonth = () => (month === 11 ? (setMonth(0), setYear(year + 1)) : setMonth(month + 1));
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="block_cal-box">
      <div className="block_cal-header">
        <span className="block_backwardarrow" onClick={prevMonth}>
          ◄
        </span>
        <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="block_month-dropdown">
          {['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'].map(
            (name, i) => (
              <option key={i} value={i}>
                {name}
              </option>
            )
          )}
        </select>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="block_year-dropdown">
          {yearOptions.map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <span className="block_forwardarrow" onClick={nextMonth}>
          ►
        </span>
      </div>

      <div className="block_cal-week">
        {weekdays.map((day, i) => (
          <div key={i} className="block_cal-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="block_cal-grid">
        {grid.map((day, i) => {
          if (day === '') return <div key={`empty-${i}`} className="block_cal-cell empty"></div>;
          const isActive = activeDays.has(day);
          const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day
            .toString()
            .padStart(2, '0')}`;
          const isSelected = dateStr === selectedDate;
          return (
            <div
              key={`day-${day}`}
              className={`cal-cell ${isActive ? 'block_selected-date' : 'inactive'} ${
  isSelected ? 'selected' : ''
}`}

              title={isActive ? 'Shift scheduled' : 'No shifts'}
              onClick={() => isActive && handleDateClick(day)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
