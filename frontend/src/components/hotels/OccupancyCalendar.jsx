import { useEffect, useMemo, useState } from "react";
import { hotelsApi } from "../../api";
import "./OccupancyCalendar.css";

function toKey(date) {
  return date.toISOString().slice(0, 10);
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function OccupancyCalendar({ hotelId }) {
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [blocked, setBlocked] = useState([]);

  useEffect(() => {
    if (!hotelId) return;
    const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 2, 0);
    hotelsApi
      .calendar(hotelId, {
        from: from.toISOString(),
        to: to.toISOString(),
      })
      .then((res) => setBlocked(res.data.blocked || []))
      .catch(() => setBlocked([]));
  }, [hotelId, cursor]);

  const occupied = useMemo(() => {
    const set = new Set();
    for (const range of blocked) {
      const start = new Date(range.checkIn);
      const end = new Date(range.checkOut);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        set.add(toKey(d));
      }
    }
    return set;
  }, [blocked]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const total = daysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < firstDow; i += 1) cells.push(null);
  for (let day = 1; day <= total; day += 1) cells.push(day);

  return (
    <div className="occ-cal">
      <div className="occ-cal__head">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          ‹
        </button>
        <strong>
          {cursor.toLocaleString("en", { month: "long", year: "numeric" })}
        </strong>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          ›
        </button>
      </div>
      <div className="occ-cal__week">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="occ-cal__grid">
        {cells.map((day, idx) => {
          if (!day) return <span key={`e-${idx}`} />;
          const key = toKey(new Date(year, month, day));
          const isBusy = occupied.has(key);
          return (
            <span
              key={key}
              className={`occ-cal__day ${isBusy ? "occ-cal__day--busy" : ""}`}
              title={isBusy ? "Unavailable" : "Available"}
            >
              {day}
            </span>
          );
        })}
      </div>
      <p className="occ-cal__legend">
        <span className="occ-cal__swatch" /> Booked / blocked nights
      </p>
    </div>
  );
}
