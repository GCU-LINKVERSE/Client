'use client'

import { useState, useRef, useEffect } from 'react'
import { fetchKakaoLoginUrl } from '@/services/place'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [isSheetExpanded, setIsSheetExpanded] = useState(false)
  const startYRef = useRef<number | null>(null)
  const isDraggingRef = useRef<boolean>(false)
  const router = useRouter()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const [loading, setLoading] = useState(true) // 로딩 상태 추가

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/information`, {
          method: 'GET',
          credentials: 'include', // 쿠키 포함 요청
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()
        console.log('유저 정보:', data)

        router.replace('/schedule')
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [router])

  useEffect(() => {
    setTimeout(() => setIsSheetExpanded(true), 0)
  }, [])

  if (loading) return null

  const handleKakaoLogin = async () => {
    try {
      const kakaoLoginUrl = await fetchKakaoLoginUrl()
      console.log('Kakao Login URL:', kakaoLoginUrl)

      // 반환된 URL로 이동
      if (kakaoLoginUrl.startsWith('http')) {
        window.location.href = kakaoLoginUrl
      } else {
        console.error('잘못된 로그인 URL:', kakaoLoginUrl)
        alert('로그인 URL이 유효하지 않습니다.')
      }
    } catch (error) {
      console.error((error as Error).message)
    }
  }

  // 드래그 시작
  const handleStart = (y: number) => {
    startYRef.current = y
    isDraggingRef.current = true
  }

  // 드래그 동작
  const handleMove = (y: number) => {
    if (!isDraggingRef.current || startYRef.current === null) return
    const deltaY = startYRef.current - y

    console.log('Drag Move:', { deltaY })

    // 위로 드래그했을 때
    if (deltaY > 50) {
      console.log('Swiped Up')
      setTimeout(() => setIsSheetExpanded(true), 0)
      startYRef.current = null
      isDraggingRef.current = false
    }

    // 아래로 드래그했을 때
    if (deltaY < -50) {
      console.log('Swiped Down')
      setTimeout(() => setIsSheetExpanded(false), 0)
      startYRef.current = null
      isDraggingRef.current = false
    }
  }

  // 드래그 종료
  const handleEnd = () => {
    console.log('Drag End')
    startYRef.current = null
    isDraggingRef.current = false
  }

  return (
    <div
      className="flex h-screen overflow-hidden items-center justify-center relative"
      style={{
        background: 'linear-gradient(180deg, #9562FB 0%, #F9F0FF 100%)',
      }}
      onMouseMove={(e) => isDraggingRef.current && handleMove(e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* Splash 화면 */}
      <div
        className="flex flex-col items-center"
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <img
          src="/logo.svg"
          alt="MOIM Logo"
          style={{ width: '100px', height: '100px' }}
        />
        <h1
          className="text-white font-bold mt-4"
          style={{
            color: 'var(--Grays-White, #FFF)',
            textAlign: 'center',
            fontFamily: 'Pretendard',
            fontSize: '32px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '17px',
            letterSpacing: '-0.5px',
          }}
        >
          MOIM
        </h1>
      </div>

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 bg-white rounded-t-3xl transition-transform duration-300"
        style={{
          maxWidth: '600px',
          width: '100%',
          left: '50%',
          transform: `translateX(-50%) ${isSheetExpanded ? 'translateY(0)' : 'translateY(calc(100% - 42px))'}`,
          boxShadow: '0 -4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onTouchStart={(e) => handleStart(e.touches[0].clientY)} // 모바일 터치
        onTouchMove={(e) => handleMove(e.touches[0].clientY)} // 모바일 터치 이동
        onTouchEnd={handleEnd} // 모바일 터치 종료
        onMouseDown={(e) => handleStart(e.clientY)} // 데스크탑 드래그 시작
        onMouseMove={(e) => isDraggingRef.current && handleMove(e.clientY)} // 데스크탑 드래그 이동
        onMouseUp={handleEnd} // 데스크탑 드래그 종료
      >
        <div className="w-16 h-1 bg-gray-300 rounded-full mx-auto mt-4"></div>
        <div
          className="p-6"
          style={{
            padding: '40px 48px',
            display: 'block',
          }}
        >
          <h2
            style={{
              color: 'var(--glassmorph-black, #1E1E1E)',
              textAlign: 'left',
              fontFamily: 'Pretendard',
              fontSize: '24px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: '28px',
              letterSpacing: '-0.5px',
              marginBottom: '16px',
            }}
          >
            환영해요!
          </h2>
          <p
            style={{
              color: 'var(--glassmorph-black, #1E1E1E)',
              textAlign: 'left',
              fontFamily: 'Pretendard',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 300,
              lineHeight: '22px',
              letterSpacing: '-0.5px',
              marginBottom: '48px',
            }}
          >
            대학 새내기를 위한 캠퍼스 라이프 필수템
          </p>

          {/* 간편 로그인 + 실선 */}
          <div
            className="flex items-center justify-center mb-8"
            style={{
              marginBottom: '48px',
            }}
          >
            {/* 왼쪽 실선 */}
            <div
              style={{
                flex: 1, // 공간을 채우도록 설정
                height: '0.5px',
                backgroundColor: 'var(--NavBarColor, #AFAFAF)',
              }}
            ></div>

            {/* 텍스트 */}
            <p
              style={{
                color: 'var(--NavBarColor, #AFAFAF)',
                fontFamily: 'Pretendard',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: 'normal',
                margin: '0 12px', // 텍스트와 실선 간격
                whiteSpace: 'nowrap', // 텍스트 줄바꿈 방지
              }}
            >
              간편 로그인
            </p>

            {/* 오른쪽 실선 */}
            <div
              style={{
                flex: 1,
                height: '0.5px',
                backgroundColor: 'var(--NavBarColor, #AFAFAF)',
              }}
            ></div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* 카카오 로그인 버튼 */}
            <div
              className="kakao_button"
              style={{
                display: 'flex',
                width: '300px',
                height: '45px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                borderRadius: '12px',
                background: '#FEE500',
                cursor: 'pointer',
                marginBottom: '20px',
              }}
              onClick={handleKakaoLogin}
            >
              <img
                src="/kakao.svg"
                alt="Kakao Icon"
                style={{
                  width: '20px',
                  height: '20px',
                }}
              />
              <span
                style={{
                  color: '#000',
                  fontSize: '16px',
                  fontFamily: 'AppleSDGothicNeoM00',
                  fontWeight: 400,
                }}
              >
                카카오 로그인
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
