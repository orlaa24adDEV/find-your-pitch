import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  min?: string;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAY_HEADERS = ["L", "M", "X", "J", "V", "S", "D"];

const DatePicker = ({ label, value, onChange, min }: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties | null>(null);

  const getInitialView = () => {
    const d = value ? new Date(value + "T12:00:00") : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  };

  const [viewMonth, setViewMonth] = useState(getInitialView);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const isWrapper = wrapperRef.current?.contains(target);
      const isDropdown = dropdownRef.current?.contains(target);
      if (!isWrapper && !isDropdown) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setViewMonth(getInitialView());
    }
  }, [value, open]);

  useLayoutEffect(() => {
    if (!open || !wrapperRef.current) {
      setDropdownStyle(null);
      return;
    }
    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceAbove = rect.top;
    if (spaceAbove < 260) {
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    } else {
      setDropdownStyle({
        position: "fixed",
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScroll = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onResize = () => setOpen(false);
    document.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const minDate = min ? new Date(min + "T00:00:00") : null;

  const firstDayOfMonth = new Date(viewMonth.year, viewMonth.month, 1);
  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();

  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const weeks: (number | null)[][] = [];
  let row: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    row.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    row.push(d);
    if (row.length === 7) {
      weeks.push(row);
      row = [];
    }
  }
  if (row.length > 0) {
    weeks.push(row);
  }

  const prevMonth = () => {
    if (viewMonth.month === 0) {
      setViewMonth({ year: viewMonth.year - 1, month: 11 });
    } else {
      setViewMonth({ ...viewMonth, month: viewMonth.month - 1 });
    }
  };

  const nextMonth = () => {
    if (viewMonth.month === 11) {
      setViewMonth({ year: viewMonth.year + 1, month: 0 });
    } else {
      setViewMonth({ ...viewMonth, month: viewMonth.month + 1 });
    }
  };

  const isDisabled = (day: number) => {
    if (!minDate) return false;
    return new Date(viewMonth.year, viewMonth.month, day) < minDate;
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const d = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return d === value;
  };

  const formatDisplay = (v: string) => {
    if (!v) return "Seleccionar";
    const [y, m, d] = v.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink-600 mb-1">
          {label}
        </label>
      )}
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full px-4 py-2.5 border rounded-lg text-left text-ink border-ink-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-pitch focus:border-pitch bg-white"
        >
          {value ? formatDisplay(value) : "Seleccionar"}
        </button>
        {open && dropdownStyle && createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-white border border-ink-200 rounded-lg shadow-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 hover:bg-ink-100 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-ink">
                {MONTHS[viewMonth.month]} {viewMonth.year}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 hover:bg-ink-100 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0 mb-1">
              {DAY_HEADERS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-ink-400 py-1">
                  {d}
                </div>
              ))}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0">
                {week.map((day, di) => (
                  <div key={di} className="text-center">
                    {day !== null ? (
                      <button
                        type="button"
                        disabled={isDisabled(day)}
                        onClick={() => {
                          const dateStr = `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                          onChange(dateStr);
                          setOpen(false);
                        }}
                        className={`w-8 h-8 text-sm rounded-full transition-colors ${
                          isDisabled(day)
                            ? "text-ink-200 cursor-not-allowed"
                            : isSelected(day)
                            ? "bg-pitch text-white font-semibold"
                            : "text-ink hover:bg-pitch-50"
                        }`}
                      >
                        {day}
                      </button>
                    ) : (
                      <div className="w-8 h-8" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default DatePicker;
