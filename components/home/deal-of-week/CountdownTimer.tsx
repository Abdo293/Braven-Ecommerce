"use client";
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endDate: string;
}
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = new Date(endDate).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeLeft) return null;
  const pad = (v: number) => v.toString().padStart(2, "0");

  return (
    <div className="inline-flex items-stretch gap-2 bg-gray-100 rounded-xl px-3 py-2">
      {/* Days */}
      <div className="text-center px-2">
        <div className="font-bold text-[18px]" dir="ltr">
          {timeLeft.days}
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">
          Days
        </div>
      </div>
      <div className="self-center font-bold">:</div>
      {/* Hours */}
      <div className="text-center px-2">
        <div className="font-bold text-[18px]" dir="ltr">
          {pad(timeLeft.hours)}
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">
          Hour
        </div>
      </div>
      <div className="self-center font-bold">:</div>
      {/* Minutes */}
      <div className="text-center px-2">
        <div className="font-bold text-[18px]" dir="ltr">
          {pad(timeLeft.minutes)}
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">
          Min
        </div>
      </div>
      <div className="self-center font-bold">:</div>
      {/* Seconds */}
      <div className="text-center px-2">
        <div className="font-bold text-[18px] text-red-600" dir="ltr">
          {pad(timeLeft.seconds)}
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">
          Sec
        </div>
      </div>
    </div>
  );
}
