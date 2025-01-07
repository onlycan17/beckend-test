import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://ff350a6295bd.ngrok.app';

export async function POST(
  request: Request,
  { params }: { params: { examQuestionSettingId: string; studentId: string } }
) {
  try {
    const { examQuestionSettingId, studentId } = params;
    
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
      throw new Error('Failed to send ping');
    }

    // 학생 상태 업데이트를 위한 추가 요청
    await fetch(
      `${API_BASE_URL}/api/attendance/notify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: parseInt(studentId),
          status: 1,
          lastPing: new Date().toISOString()
        })
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ping Error:', error);
    return NextResponse.json(
      { error: '핑 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 