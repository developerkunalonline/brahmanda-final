// src/components/shared/LiveCounter.tsx
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface LiveCounterProps {
  to: number;
  className?: string;
}

export const LiveCounter = ({ to, className }: LiveCounterProps) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (inView) {
      setIsGlitching(true);
      const duration = 2000;
      const frameRate = 1000 / 60;
      const totalFrames = Math.round(duration / frameRate);
      let frame = 0;

      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        setCount(Math.round(to * progress));
        if (frame === totalFrames) {
          clearInterval(counter);
          setCount(to);
          setTimeout(() => setIsGlitching(false), 500); // Glitch effect ends
        }
      }, frameRate);
      
      return () => clearInterval(counter); // Cleanup on unmount
    }
  }, [inView, to]);

  // We add the "+" sign within the component for consistency
  return (
    <span ref={ref} className={isGlitching ? `${className} glitch-effect` : className}>
      {count.toLocaleString()}+
    </span>
  );
};