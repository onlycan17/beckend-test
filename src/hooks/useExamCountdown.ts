import { useState, useEffect, useRef } from 'react';
import { startExam, pauseExam, resumeExam, stopExam, subscribeToExamStatus } from '@/app/actions/examActions';

interface UseExamCountdownReturn {
  remainingTime: number;
  isRunning: boolean;
  error: string | null;
  startCountdown: () => Promise<void>;
  pauseCountdown: () => Promise<void>;
  resumeCountdown: () => Promise<void>;
  stopCountdown: () => Promise<void>;
}

const useExamCountdown = (examQuestionSettingId: number): UseExamCountdownReturn => {
  const [remainingTime, setRemainingTime] = useState<number>(2400);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const closeEventSource = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
  };

  useEffect(() => {
    return () => closeEventSource();
  }, []);

  const startCountdown = async () => {
    try {
      // 시험 시작 및 초기 시간 구독
      const stream = await startExam(examQuestionSettingId);
      
      if (!stream) {
        throw new Error('Failed to get stream');
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();

      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            console.log('done', done);
            console.log('value', value);
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            console.log('lines', lines);
            for (const line of lines) {
              console.log('line', line);
              if (line.trim() && line.startsWith('data:')) {
                try {
                  const data = JSON.parse(line.slice(5));
                  console.log('data', data);
                 
                  setRemainingTime(data);
                  console.log('remainingTime', data);
                  
                  setIsRunning(true);
                  console.log('isRunning', true);
                  
                } catch (err) {
                  console.error('Error processing SSE data:', err);
                }
              }
            }
          }
        } catch (err) {
          console.error('Error reading stream:', err);
          setError('시험 시간 동기화에 실패했습니다.');
        } finally {
          reader.releaseLock();
        }
      })();

    } catch (err) {
      console.error('Error starting countdown:', err);
      setError('카운트다운 시작 중 오류가 발생했습니다.');
      setIsRunning(false);
    }
  };

  const pauseCountdown = async () => {
    try {
      await pauseExam(examQuestionSettingId);
      setIsRunning(false);
      setError(null);
    } catch (err) {
      setError('카운트다운 일시정지 중 오류가 발생했습니다.');
    }
  };

  const resumeCountdown = async () => {
    try {
      await resumeExam(examQuestionSettingId);
      setIsRunning(true);
      setError(null);
    } catch (err) {
      setError('카운트다운 재개 중 오류가 발생했습니다.');
    }
  };

  const stopCountdown = async () => {
    try {
      await stopExam(examQuestionSettingId);
      closeEventSource();
      setIsRunning(false);
      setRemainingTime(2400);
      setError(null);
    } catch (err) {
      setError('카운트다운 중지 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    return () => {
      if (eventSource) {
        console.log('Cleaning up EventSource');
        closeEventSource();
      }
    };
  }, [eventSource]);

  return {
    remainingTime,
    isRunning,
    error,
    startCountdown,
    pauseCountdown,
    resumeCountdown,
    stopCountdown,
  };
};

export default useExamCountdown;