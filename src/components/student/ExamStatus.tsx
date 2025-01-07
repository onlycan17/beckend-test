'use client';

import { useState, useEffect } from 'react';

interface ExamStatusProps {
  studentId: number;
  examQuestionSettingId: number;
}

interface ExamState {
  remainingTime: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'PAUSED' | 'FINISHED';
  message: string;
}

export default function ExamStatus({ studentId, examQuestionSettingId }: ExamStatusProps) {
  const [examState, setExamState] = useState<ExamState>({
    remainingTime: 2400,
    status: 'WAITING',
    message: '시험 시작을 기다리고 있습니다...'
  });

  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 시험 시작 상태 구독
    const examStartEventSource = new EventSource(
      `/api/exam-starts/${examQuestionSettingId}/subscribe`
    );

    // 카운트다운 구독
    const countdownEventSource = new EventSource(
      `/api/exam-starts/${examQuestionSettingId}/countdown`
    );

    examStartEventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setExamState(prev => ({
        ...prev,
        status: data.status,
        message: getStatusMessage(data.status)
      }));
    };

    countdownEventSource.onmessage = (event) => {
      const remainingTime = parseInt(event.data);
      setExamState(prev => ({
        ...prev,
        remainingTime
      }));
    };

    examStartEventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleError = (e: Event) => {
      setIsConnected(false);
      setError('서버와의 연결이 끊어졌습니다. 재연결을 시도합니다...');
    };

    examStartEventSource.onerror = handleError;
    countdownEventSource.onerror = handleError;

    // 학생 ping 전송 (15초마다)
    const pingInterval = setInterval(() => {
      fetch(`/api/exam-starts/${examQuestionSettingId}/students/${studentId}/ping`, {
        method: 'POST'
      }).catch(err => {
        console.error('Ping 전송 실패:', err);
      });
    }, 15000);

    return () => {
      examStartEventSource.close();
      countdownEventSource.close();
      clearInterval(pingInterval);
    };
  }, [examQuestionSettingId, studentId]);

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'WAITING':
        return '시험 시작을 기다리고 있습니다...';
      case 'IN_PROGRESS':
        return '시험이 진행 중입니다.';
      case 'PAUSED':
        return '시험이 일시 중지되었습니다.';
      case 'FINISHED':
        return '시험이 종료되었습니다.';
      default:
        return '상태를 확인할 수 없습니다.';
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* 연결 상태 표시 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">시험 상태</h2>
        <div className="flex items-center">
          <span className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? '연결됨' : '연결 끊김'}
          </span>
        </div>
      </div>

      {/* 시험 상태 정보 */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-mono text-blue-600 mb-2">
            {formatTime(examState.remainingTime)}
          </div>
          <div className="text-gray-600">남은 시간</div>
        </div>

        <div className="text-center">
          <div className={`inline-block px-4 py-2 rounded-full ${
            examState.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
            examState.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
            examState.status === 'FINISHED' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {examState.message}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}
      </div>

      {/* 학생 정보 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div>학생 ID: {studentId}</div>
          <div>시험 ID: {examQuestionSettingId}</div>
        </div>
      </div>
    </div>
  );
}