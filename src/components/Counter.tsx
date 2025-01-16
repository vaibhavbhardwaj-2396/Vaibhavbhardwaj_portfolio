import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface CounterProps {
  end: number;
  suffix?: string;
  label: string;
}

export const Counter = ({ end, suffix = '', label }: CounterProps) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => {
    if (inView) {
      const duration = 2000;
      const steps = 60;
      const increment = end / steps;
      const interval = duration / steps;

      const timer = setInterval(() => {
        if (countRef.current < end) {
          setCount(prev => Math.min(prev + increment, end));
        } else {
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [inView, end]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold mb-2">
        {Math.round(count)}
        {suffix}
      </div>
      <div className="text-gray-400">{label}</div>
    </div>
  );
};