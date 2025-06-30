import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ message: '검색어가 필요합니다.' }, { status: 400 });
    }

    const kakaoApiUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`;
    const apiKey = process.env.KAKAO_REST_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ message: '카카오 API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const response = await fetch(kakaoApiUrl, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      return NextResponse.json({ message: '카카오 API 요청에 실패했습니다.', error: errorBody }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('카카오 API 프록시 처리 중 오류 발생:', error);
    return NextResponse.json({ message: '내부 서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 