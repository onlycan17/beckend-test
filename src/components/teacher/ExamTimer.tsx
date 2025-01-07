'use client';

import { useState, useEffect } from 'react';

interface ExamTimerProps {
  examQuestionSettingId: number;
}

export default function ExamTimer({ examQuestionSettingId }: ExamTimerProps) {
  const [remainingTime, setRemainingTime] = useState<number>(2400);
  const [status, setStatus] = useState<'READY' | 'RUNNING' | 'PAUSED' | 'FINISHED'>('READY');

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const startTimer = async () => {
      try {
        eventSource = new EventSource(`/api/exam-starts/${examQuestionSettingId}/countdown`);
        
        eventSource.onmessage = (event) => {
          const time = parseInt(event.data);
          setRemainingTime(time);
          if (time <= 0) {
            setStatus('FINISHED');
            eventSource?.close();
          }
        };

        eventSource.onerror = () => {
          eventSource?.close();
          setStatus('FINISHED');
        };

        setStatus('RUNNING');
      } catch (error) {
        console.error('Timer error:', error);
      }
    };

    return () => {
      eventSource?.close();
    };
  }, [examQuestionSettingId]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="text-center">
      <div className="text-6xl font-mono mb-4">
        {formatTime(remainingTime)}
      </div>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {/* 시작 로직 */}}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={status !== 'READY'}
        >
          시작
        </button>
        <button
          onClick={() => {/* 일시정지 로직 */}}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          disabled={status !== 'RUNNING'}
        >
          일시정지
        </button>
      </div>
    </div>
  );
}