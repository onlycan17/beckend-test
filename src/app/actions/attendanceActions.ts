'use server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ff350a6295bd.ngrok.app';

export async function subscribeToAttendance(params: {
  academicYear: number;
  teacherId: number;
  subjectCode: string;
  episodeNumber: number;
  classCode: string;
}) {
  const response = await fetch(
    `${API_BASE_URL}/api/attendances/subscribe/${params.academicYear}/${params.teacherId}/${params.subjectCode}/${params.episodeNumber}/${params.classCode}`,
    {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      method: 'GET',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to subscribe to attendance updates');
  }
  console.log('response', response);
  // ReadableStream을 반환
  return response.body;
}

export async function markAttendance(params: {
  academicYear: number;
  teacherId: number;
  subjectCode: string;
  episodeNumber: number;
  classCode: string;
  studentId: number;
}) {
  console.log('markAttendance', params);
  const response = await fetch(
    `${API_BASE_URL}/api/attendances/student/${params.academicYear}/${params.teacherId}/${params.subjectCode}/${params.episodeNumber}/${params.classCode}/${params.studentId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  console.log('response', response);
  if (!response.ok) {
    throw new Error('출석 처리에 실패했습니다.');
  }

  return response.json();
} 