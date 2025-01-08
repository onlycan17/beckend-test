'use server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ff350a6295bd.ngrok.app';

export async function startExam(examQuestionSettingId: number) {
  const response = await fetch(`${API_BASE_URL}/api/exam-starts/${examQuestionSettingId}/countdown`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('시험 시작에 실패했습니다.');
  }
  return response.body;
}

export async function pauseExam(examQuestionSettingId: number) {
  const response = await fetch(`${API_BASE_URL}/api/exam-starts/${examQuestionSettingId}/countdown/pause`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('시험 일시정지에 실패했습니다.');
  }
  
  return response.json();
}

export async function resumeExam(examQuestionSettingId: number) {
  const response = await fetch(`${API_BASE_URL}/api/exam-starts/${examQuestionSettingId}/countdown/resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('시험 재개에 실패했습니다.');
  }
  
  return response.json();
}

export async function stopExam(examQuestionSettingId: number) {
  const response = await fetch(`${API_BASE_URL}/api/exam-starts/${examQuestionSettingId}/countdown`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('시험 중지에 실패했습니다.');
  }
  
  return response.body;
}

export async function sendStudentPing(examQuestionSettingId: number, studentId: number) {
  const response = await fetch(
    `${API_BASE_URL}/api/exam-starts/${examQuestionSettingId}/students/${studentId}/ping`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error('핑 전송에 실패했습니다.');
  }
  
  return response.json();
}

export async function subscribeToExamStatus(examQuestionSettingId: number) {
  const response = await fetch(
    `${API_BASE_URL}/api/exam-starts/${examQuestionSettingId}/subscribe`,
    {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to subscribe to exam status');
  }

  return response.body;
} 