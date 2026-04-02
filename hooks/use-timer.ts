"use client";

import { useEffect, useRef, useState } from "react";

export function useTimer(isRunning: boolean) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      startedAtRef.current = null;
      return;
    }

    startedAtRef.current = Date.now() - elapsedMs;
    const interval = window.setInterval(() => {
      if (startedAtRef.current) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 50);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const reset = () => {
    startedAtRef.current = null;
    setElapsedMs(0);
  };

  return {
    elapsedMs,
    reset,
    setElapsedMs,
  };
}
