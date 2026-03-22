import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// Берілген жыл мен айдағы күндер санын қайтарады
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Айдың бірінші күні дүйсенбіден бастап нешінші күн екенін анықтайды
function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay();
  return (d + 6) % 7;
}

export function DatePicker({ value, onChange, minDate, placeholder }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);

  // Бастапқы көріністі мән немесе бүгінгі күн негізінде орнату
  const [view, setView] = useState(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      return { year: d.getFullYear(), month: d.getMonth() };
    }
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const ref = useRef(null);

  // Ең аз рұқсат берілген күнді анықтау
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate ? new Date(minDate + 'T00:00:00') : today;

  // Сыртқа басқанда күнтізбені жабу
  useEffect(() => {
    function handlePointer(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', handlePointer);
    return () => document.removeEventListener('pointerdown', handlePointer);
  }, []);

  // Таңдалған мәнді локальді форматта көрсету
  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString(i18n.language, {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  const daysInMonth = getDaysInMonth(view.year, view.month);
  const firstDay = getFirstDayOfMonth(view.year, view.month);

  // Ай атауын локальді форматта алу
  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(i18n.language, {
    month: 'long', year: 'numeric',
  });

  // Дүйсенбіден басталатын апта күндерінің қысқартылған атаулары
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, i + 1);
    return d.toLocaleDateString(i18n.language, { weekday: 'short' }).slice(0, 2);
  });

  // Алдыңғы айға өту
  function prevMonth() {
    setView((v) => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  // Келесі айға өту
  function nextMonth() {
    setView((v) => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  // Күнді таңдап, YYYY-MM-DD форматында onChange-ке жіберу
  function selectDay(day) {
    const pad = (n) => String(n).padStart(2, '0');
    onChange(`${view.year}-${pad(view.month + 1)}-${pad(day)}`);
    setOpen(false);
  }

  // Күн минималды шектен кіші болса өшіріледі
  function isDisabled(day) {
    const d = new Date(view.year, view.month, day);
    d.setHours(0, 0, 0, 0);
    return d < min;
  }

  // Күн таңдалған мәнмен сәйкес келетінін тексеру
  function isSelected(day) {
    if (!value) return false;
    const sel = new Date(value + 'T00:00:00');
    return (
      sel.getFullYear() === view.year &&
      sel.getMonth() === view.month &&
      sel.getDate() === day
    );
  }

  // Бүгінгі күнді анықтау
  function isToday(day) {
    const now = new Date();
    return (
      now.getFullYear() === view.year &&
      now.getMonth() === view.month &&
      now.getDate() === day
    );
  }

  // Күнтізбе торының ұяшықтарын құру (бос және нақты күндер)
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="relative" ref={ref}>
      {/* Күнтізбені ашатын негізгі түйме */}
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

      {/* Ашылмалы күнтізбе панелі */}
      {open && (
        <div className="absolute left-0 top-11 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl p-4">
          {/* Ай навигациясы */}
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

          {/* Апта күндерінің тақырыбы */}
          <div className="grid grid-cols-7 mb-2">
            {weekdays.map((w, i) => (
              <div key={i} className="text-center text-[10px] font-medium text-zinc-600 uppercase py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Күндер торы */}
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
