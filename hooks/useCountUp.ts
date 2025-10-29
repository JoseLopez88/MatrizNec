import { useState, useEffect } from 'react';

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const useCountUp = (end: number, duration: number = 1000, decimals: number = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const endValue = end || 0;
    let animationFrameId: number;

    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      const currentCount = easedProgress * endValue;
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(endValue); // Ensure it ends on the exact value
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    
    // Cleanup function to avoid memory leaks
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [end, duration]);

  return parseFloat(count.toFixed(decimals));
};
