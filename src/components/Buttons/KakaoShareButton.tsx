'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import Image from 'next/image'

interface KakaoShareProps {
  inviteUrl: string
}

const KakaoShareButton = ({ inviteUrl }: KakaoShareProps) => {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)

  useEffect(() => {
    const loadKakaoSDK = () => {
      const script = document.createElement('script')
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'
      script.integrity =
        'sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka'
      script.crossOrigin = 'anonymous'
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY!)
        }
        setIsKakaoLoaded(true)
      }
      document.body.appendChild(script)
    }

    loadKakaoSDK()
  }, [])

  const handleKakaoShare = () => {
    if (!isKakaoLoaded) {
      return
    }

    if (!window.Kakao || !window.Kakao.Share) return

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: 'MOIM',
        description: '모임에 초대되었어요!',
        imageUrl:
          'http://k.kakaocdn.net/dn/Q2iNx/btqgeRgV54P/VLdBs9cvyn8BJXB3o7N8UK/kakaolink40_original.png',
        link: {
          mobileWebUrl: 'https://moim.team/',
          webUrl: 'https://moim.team/',
        },
      },
      buttons: [
        {
          title: '모임 초대 수락하기',
          link: {
            mobileWebUrl: inviteUrl,
            webUrl: inviteUrl,
          },
        },
      ],
    })
  }

  return (
    <>
      {/* Kakao SDK Script 로드 */}
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        integrity="sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka"
        crossOrigin="anonymous"
        onLoad={() => setIsKakaoLoaded(true)}
      />

      {/* 카카오 공유 버튼 */}
      <button
        onClick={handleKakaoShare}
        className="h-[45px] px-[27px] py-2.5 bg-[#fee500] rounded-xl flex-col justify-start items-start gap-2.5 inline-flex overflow-hidden mt-[4px]"
      >
        <div className="w-[158px] justify-center items-center gap-[5px] inline-flex">
          <div className="relative w-6 h-6 py-[5px] flex-col justify-center items-center gap-2.5 inline-flex overflow-hidden">
            <Image src="/share-kakao.svg" alt="share-kakao" fill />
          </div>
          <div className="text-center text-black/90 text-[15px] font-normal font-['Pretendard'] leading-[17px]">
            카카오 공유하기
          </div>
        </div>
      </button>
    </>
  )
}

export default KakaoShareButton
