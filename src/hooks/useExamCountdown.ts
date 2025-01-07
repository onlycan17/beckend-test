import { useState, useEffect } from 'react';
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
  const [remainingTime, setRemainingTime] = useState<number>(2400); // 40분 = 2400초
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ff350a6295bd.ngrok.app';

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
      await startExam(examQuestionSettingId);
      // SSE 연결 설정...
    } catch (err) {
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
      await fetch(`/api/exam-starts/${examQuestionSettingId}/countdown/resume`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setIsRunning(true);
    } catch (err) {
      setError('카운트다운 재개 중 오류가 발생했습니다.');
    }
  };

  const stopCountdown = async () => {
    try {
      await fetch(`/api/exam-starts/${examQuestionSettingId}/countdown`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      closeEventSource();
      setIsRunning(false);
      setRemainingTime(2400);
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

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRunning && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            if (timer) clearInterval(timer);
            setIsRunning(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, remainingTime]);

  useEffect(() => {
    const setupExamSubscription = async () => {
      try {
        const stream = await subscribeToExamStatus(examQuestionSettingId);
        if (!stream) return;

        const reader = stream.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                setRemainingTime(data.remainingTime);
                setIsRunning(data.isRunning);
              } catch (err) {
                console.error('Error processing exam status:', err);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error setting up exam subscription:', err);
        setError('시험 상태 구독에 실패했습니다.');
      }
    };

    setupExamSubscription();
  }, [examQuestionSettingId]);

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