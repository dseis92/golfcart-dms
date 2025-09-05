"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";

export default function TechTimer({ running, startedAt, onStart, onStop }) {
  const [now, setNow] = useState(Date.now());
  const tick = useRef(null);

  useEffect(() => {
    if (running) {
      tick.current = setInterval(() => setNow(Date.now()), 1000);
    } else if (tick.current) {
      clearInterval(tick.current);
      tick.current = null;
    }
    return () => tick.current && clearInterval(tick.current);
  }, [running]);

  const minutes = useMemo(() => {
    if (!running || !startedAt) return 0;
    const ms = now - startedAt;
    return Math.max(0, Math.floor(ms / 60000));
  }, [now, running, startedAt]);

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-zinc-100 px-3 py-1 text-sm font-medium">
        {running ? `${Math.floor(minutes/60)}h ${minutes%60}m` : "00h 00m"}
      </div>
      {!running ? (
        <button onClick={onStart} className="btn btn-primary">Start</button>
      ) : (
        <button onClick={() => onStop(minutes)} className="btn">Stop</button>
      )}
    </div>
  );
}
