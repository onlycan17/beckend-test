import React, { useState } from 'react';
import CountdownDisplay from './CountdownDisplay';
import useExamCountdown from '../hooks/useExamCountdown';

interface ExamCountdownProps {
  examQuestionSettingId: number;
}

const ExamCountdown: React.FC<ExamCountdownProps> = ({ examQuestionSettingId }) => {
  const {
    remainingTime,
    isRunning,
    startCountdown,
    pauseCountdown,
    resumeCountdown,
    stopCountdown,
    error
  } = useExamCountdown(examQuestionSettingId);

  const [isPaused, setIsPaused] = useState<boolean>(false);

  const handlePause = async () => {
    await pauseCountdown();
    setIsPaused(true);
  };

  const handleResume = async () => {
    await resumeCountdown();
    setIsPaused(false);
  };

  const handleStop = async () => {
    await stopCountdown();
    setIsPaused(false);
  };

  const handleStart = async () => {
    await startCountdown();
    setIsPaused(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-50 rounded-xl">
      <CountdownDisplay remainingSeconds={remainingTime} />
      <div className="mt-2 text-sm text-gray-600">
        상태: {!isRunning ? '정지됨' : isPaused ? '일시정지' : '실행 중'}
      </div>
      
      <div className="mt-6 space-x-4 flex justify-center">
        {!isRunning && !isPaused ? (
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            시작
          </button>
        ) : isPaused ? (
          <>
            <button
              onClick={handleResume}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              재개
            </button>
            <button
              onClick={handleStop}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              중지
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handlePause}
              className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              일시정지
            </button>
            <button
              onClick={handleStop}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              중지
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 text-sm">
          <div>디버그 정보:</div>
          <div>remainingTime: {remainingTime}</div>
          <div>isRunning: {String(isRunning)}</div>
          <div>isPaused: {String(isPaused)}</div>
          <div>examQuestionSettingId: {examQuestionSettingId}</div>
        </div>
      )}
    </div>
  );
};

export default ExamCountdown;