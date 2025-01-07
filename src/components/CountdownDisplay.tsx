import React from 'react';

interface CountdownDisplayProps {
  remainingSeconds: number;
}

const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ remainingSeconds }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(remainingSecs).padStart(2, '0')
    };
  };

  const { minutes, seconds } = formatTime(remainingSeconds);

  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">남은 시험 시간</h2>
      <div className="text-6xl font-mono text-blue-600">
        {minutes}:{seconds}
      </div>
      <div className="mt-2 text-sm text-gray-500">
        {remainingSeconds}초 남음
      </div>
    </div>
  );
};

export default CountdownDisplay;