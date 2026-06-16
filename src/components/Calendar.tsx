import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
}

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function parseMin(minDate?: string): Date | null {
  if (!minDate) return null;
  const [y, m, d] = minDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export function Calendar({ value, onChange, minDate }: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initMonth = value
    ? (() => { const [y, m] = value.split('-').map(Number); return new Date(y, m - 1, 1); })()
    : new Date(today.getFullYear(), today.getMonth(), 1);

  const [viewDate, setViewDate] = useState<Date>(initMonth);

  const min = parseMin(minDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // First day of month (0=Sun...6=Sat), convert to Mon-first (0=Mon...6=Sun)
  const firstDayRaw = new Date(year, month, 1).getDay();
  const firstDayMon = (firstDayRaw + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isPast = (d: number) => {
    const dt = new Date(year, month, d);
    dt.setHours(0, 0, 0, 0);
    if (min) return dt < min;
    return dt < today;
  };

  const isToday = (d: number) => {
    return year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
  };

  const isSelected = (d: number) => {
    return value === toDateStr(year, month, d);
  };

  // Build grid cells: empty cells + day cells
  const cells: (number | null)[] = [
    ...Array(firstDayMon).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 p-4 select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-stone-800 text-sm capitalize">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-stone-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const past = isPast(day);
          const today_ = isToday(day);
          const selected = isSelected(day);
          return (
            <button
              key={idx}
              type="button"
              disabled={past}
              onClick={() => onChange(toDateStr(year, month, day))}
              className={`
                relative mx-auto w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-150
                ${selected
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                  : today_
                  ? 'ring-2 ring-primary-400 text-primary-600'
                  : past
                  ? 'text-stone-300 cursor-not-allowed'
                  : 'text-stone-700 hover:bg-primary-50 hover:text-primary-600 cursor-pointer'
                }
              `}
            >
              {day}
              {today_ && !selected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
