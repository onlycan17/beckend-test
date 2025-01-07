import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribeToAttendance } from '@/app/actions/attendanceActions';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ff350a6295bd.ngrok.app';

interface AttendanceParams {
  academicYear: number;
  teacherId: number;
  subjectCode: string;
  episodeNumber: number;
  classCode: string;
}

interface StudentAttendance {
  studentId: number;
  name: string;
  status: number;
  lastPing: string;
}

export default function useStudentAttendance(params: AttendanceParams) {
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isSubscribedRef = useRef<boolean>(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { academicYear, teacherId, subjectCode, episodeNumber, classCode } = params;

  const cleanupEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const setupSSE = useCallback(async () => {
    console.log('setupSSE');
    if (!isSubscribedRef.current) return;
    console.log('cleanupEventSource');
    cleanupEventSource();

    try {
      const stream = await subscribeToAttendance({
        academicYear,
        teacherId,
        subjectCode,
        episodeNumber,
        classCode
      });

      if (!stream) {
        throw new Error('Failed to get stream');
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      console.log('reader', reader);
      while (true) {
        const { done, value } = await reader.read();
        console.log('done', done);
        console.log('value', value);
        if (done) break;
        console.log('value', value);
        const chunk = decoder.decode(value);
        console.log('chunk', chunk);
        const lines = chunk.split('\n');
        console.log('lines', lines);
        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (!data || !data.studentId) continue;

              setAttendanceData(prev => {
                const index = prev.findIndex(s => s.studentId === data.studentId);
                if (index === -1) return [...prev, data];
                const newData = [...prev];
                newData[index] = { ...newData[index], ...data };
                return newData;
              });
            } catch (err) {
              console.error('Error processing SSE data:', err);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error setting up SSE:', err);
      setError('서버 연결에 실패했습니다.');
    }
  }, [academicYear, teacherId, subjectCode, episodeNumber, classCode, cleanupEventSource]);

  useEffect(() => {
    isSubscribedRef.current = true;
    let isMounted = true;

    if (isMounted) {
      setIsLoading(true);
      setupSSE();
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
      isSubscribedRef.current = false;
      cleanupEventSource();
    };
  }, [academicYear, teacherId, subjectCode, episodeNumber, classCode, setupSSE, cleanupEventSource]);

  return {
    attendanceData,
    error,
    isLoading,
  };
}