import { useEffect, useMemo, useState } from "react";
import { Button, Flex, Typography } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { hotelsApi } from "../../api";
import { tw } from "../../styles/tw";

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
    <div className={`${tw.surface} p-4`}>
      <Flex justify="space-between" align="center" className="mb-3">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        />
        <Typography.Text strong>
          {cursor.toLocaleString("en", { month: "long", year: "numeric" })}
        </Typography.Text>
        <Button
          type="text"
          icon={<RightOutlined />}
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        />
      </Flex>
      <div className="mb-1.5 grid grid-cols-7 gap-1.5 text-center text-[0.75rem] font-bold text-ink-soft">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {cells.map((day, idx) => {
          if (!day) return <span key={`e-${idx}`} />;
          const key = toKey(new Date(year, month, day));
          const isBusy = occupied.has(key);
          return (
            <span
              key={key}
              className={[
                "grid aspect-square place-items-center rounded-[10px] text-[0.85rem] font-semibold",
                isBusy
                  ? "bg-coral/22 text-coral line-through"
                  : "bg-sea/12 text-ink",
              ].join(" ")}
              title={isBusy ? "Unavailable" : "Available"}
            >
              {day}
            </span>
          );
        })}
      </div>
      <Typography.Text
        type="secondary"
        className="mt-3.5 !flex items-center gap-1.5 text-[0.85rem]"
      >
        <span className="inline-block size-3.5 rounded bg-coral/35" /> Booked /
        blocked nights
      </Typography.Text>
    </div>
  );
}
