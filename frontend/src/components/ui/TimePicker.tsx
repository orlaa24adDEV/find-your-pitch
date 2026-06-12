import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";

interface TimePickerProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  minTime?: string;
}

const ALL_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    ALL_SLOTS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

const TimePicker = ({ label, value, onChange, minTime }: TimePickerProps) => {
  const slots = useMemo(() => {
    if (!minTime) return ALL_SLOTS;
    return ALL_SLOTS.filter((s) => s > minTime);
  }, [minTime]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const isWrapper = wrapperRef.current?.contains(target);
      const isDropdown = listRef.current?.contains(target);
      if (!isWrapper && !isDropdown) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !wrapperRef.current) {
      setDropdownStyle(null);
      return;
    }
    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceAbove = rect.top;
    if (spaceAbove < 192) {
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
      if (listRef.current?.contains(e.target as Node)) return;
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

  useEffect(() => {
    if (open && listRef.current && value) {
      const selected = listRef.current.querySelector(`[data-value="${value}"]`);
      if (selected) {
        selected.scrollIntoView({ block: "center" });
      }
    }
  }, [open, value]);

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
          {value || "Seleccionar"}
        </button>
        {open && dropdownStyle && createPortal(
          <div
            ref={listRef}
            style={dropdownStyle}
            className="bg-white border border-ink-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                data-value={slot}
                onClick={() => {
                  onChange(slot);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-pitch-50 transition-colors ${
                  slot === value ? "bg-pitch-100 text-pitch font-semibold" : "text-ink"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default TimePicker;
