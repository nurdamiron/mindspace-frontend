import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7; // Monday-first
}

export function DatePicker({ value, onChange, minDate, placeholder }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      return { year: d.getFullYear(), month: d.getMonth() };
    }
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const ref = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate ? new Date(minDate + 'T00:00:00') : today;

  useEffect(() => {
    function handlePointer(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, []);

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString(i18n.language, {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  const daysInMonth = getDaysInMonth(view.year, view.month);
  const firstDay = getFirstDayOfMonth(view.year, view.month);

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(i18n.language, {
    month: 'long', year: 'numeric',
  });

  // Mon-Sun weekday labels
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, i + 1); // Jan 1 2024 = Monday
    return d.toLocaleDateString(i18n.language, { weekday: 'short' }).slice(0, 2);
  });

  function prevMonth() {
    setView((v) => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function nextMonth() {
    setView((v) => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function selectDay(day) {
    const pad = (n) => String(n).padStart(2, '0');
    onChange(`${view.year}-${pad(view.month + 1)}-${pad(day)}`);
    setOpen(false);
  }

  function isDisabled(day) {
    const d = new Date(view.year, view.month, day);
    d.setHours(0, 0, 0, 0);
    return d < min;
  }

  function isSelected(day) {
    if (!value) return false;
    const sel = new Date(value + 'T00:00:00');
    return (
      sel.getFullYear() === view.year &&
      sel.getMonth() === view.month &&
      sel.getDate() === day
    );
  }

  function isToday(day) {
    const now = new Date();
    return (
      now.getFullYear() === view.year &&
      now.getMonth() === view.month &&
      now.getDate() === day
    );
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400',
          open
            ? 'border-zinc-500 text-zinc-100'
            : 'border-zinc-700 hover:border-zinc-600',
          displayValue ? 'text-zinc-100' : 'text-zinc-500',
        )}
      >
        <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
        <span className="flex-1 text-left truncate">{displayValue || placeholder || t('datePicker.select')}</span>
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-zinc-200 capitalize">{monthLabel}</span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-2">
            {weekdays.map((w, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-zinc-600 uppercase py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => (
              <div key={i} className="aspect-square">
                {day && (
                  <button
                    type="button"
                    onClick={() => !isDisabled(day) && selectDay(day)}
                    disabled={isDisabled(day)}
                    className={cn(
                      'w-full h-full rounded-lg text-xs font-medium transition-colors',
                      isSelected(day)
                        ? 'bg-zinc-100 text-zinc-900 font-semibold'
                        : isToday(day)
                        ? 'ring-1 ring-zinc-500 text-zinc-200 hover:bg-zinc-800'
                        : isDisabled(day)
                        ? 'text-zinc-700 cursor-not-allowed'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
                    )}
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
