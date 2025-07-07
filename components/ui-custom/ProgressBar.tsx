"use client"
import { useEffect, useState } from "react";

export default function ProgressBar({
  duration,
  active,
  onComplete,
}: {
  duration: number;
  active: boolean;
  onComplete: () => void;
}) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!active) {
      setShouldAnimate(false);
      return;
    }

    // Reset animation state, then start animation
    setShouldAnimate(false);
    const startTimer = setTimeout(() => {
      setShouldAnimate(true);
    }); // Small delay to ensure reset

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(completeTimer);
    };
  }, [active, duration, onComplete]);

  return (
    <div className="h-4 bg-white/40 overflow-hidden flex-1 mx-1">
      <div
        className={`h-full bg-white transition-transform ease-linear ${
          shouldAnimate ? 'scale-x-100' : 'scale-x-0'
        }`}
        style={{
          transformOrigin: 'left center',
          transitionDuration: shouldAnimate ? `${duration}ms` : '0ms',
        }}
      />
    </div>
  );
}