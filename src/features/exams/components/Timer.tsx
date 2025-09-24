import { useEffect, useState } from 'react';

interface Props {
  durationSec: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export function Timer({ durationSec, onTimeUp, isActive }: Props) {
  const [timeLeft, setTimeLeft] = useState(durationSec);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = timeLeft <= 300; // 5 minutes
  const isCritical = timeLeft <= 60; // 1 minute

  return (
    <div className={`
      px-4 py-2 rounded font-mono text-lg font-semibold
      ${isCritical ? 'bg-red-100 text-red-800 border border-red-300' : 
        isWarning ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
        'bg-blue-100 text-blue-800 border border-blue-300'}
    `}>
      Time Remaining: {formatTime(timeLeft)}
      {isCritical && (
        <div className="text-sm font-normal">⚠️ Last minute!</div>
      )}
    </div>
  );
}