import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = '하영플레이스 - 제주도 맛집과 카페 추천'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          backgroundImage: 'linear-gradient(45deg, #3b82f6 0%, #1d4ed8 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '60px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            margin: '60px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            🏝️ 하영플레이스
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#64748b',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            제주도의 숨겨진 맛집과 카페, 포토스팟을 발견하고 공유하세요!
          </div>
          <div
            style={{
              fontSize: '20px',
              color: '#3b82f6',
              marginTop: '30px',
              textAlign: 'center',
            }}
          >
            🍽️ 맛집 • ☕ 카페 • 📸 포토스팟 • 🎨 문화체험
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
} 