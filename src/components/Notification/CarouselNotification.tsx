'use client'

import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import '../../styles/CarouselNotification.css'
// import { useSurveyStore } from '@/store/surveyStore'
// import { useRouter } from 'next/navigation' // useRouter 훅 사용

export interface CarouselNotificationPros {
  notifications: {
    id: number
    surveyId: number
    leftBtnText?: string // 확인 버튼 텍스트
    rightBtnText?: string // 취소 버튼 텍스트
    notiMessage?: string // 알림 메시지 텍스트
  }[]
  onClickLeftBtn: (id: number) => void
  onClickRightBtn: (id: number) => void
}

export default function CarouselNotification({
  notifications,
  onClickLeftBtn,
  onClickRightBtn,
}: CarouselNotificationPros) {
  const settings = {
    dots: true, // 아래에 점 표시
    infinite: notifications.length > 1,
    speed: 500,
    slidesToShow: 1, // 한 번에 1개의 슬라이드만 보여줌
    slidesToScroll: 1, // 한 번에 1개의 슬라이드씩 스크롤
    arrows: false, // 양 옆 화살표 숨김
    centerMode: false,
  }

  // const router = useRouter()

  // const { setSelectedSurveyId } = useSurveyStore()

  // const onClickLeftBtn = (id: number) => {
  //   if (notifications[id].leftBtnText === '확정하기') {
  //     setSelectedSurveyId(notifications[id].surveyId)
  //     router.push('schedule/select')
  //   }
  // }

  // const onClickRightBtn = () => {
  //   console.log('오른쪽 클릭')
  // }
  return (
    <div className="w-full mt-4">
      <Slider {...settings}>
        {notifications.map((notification) => (
          <div key={notification.id}>
            <div className="w-full h-full bg-[#9562fa] px-4 py-6 flex flex-col justify-center items-center gap-4">
              {/* 메시지 */}
              <div className="text-white text-xl font-medium text-center">
                {notification.notiMessage || '생성하던 일정이 있습니다!'}
              </div>
              {/* 버튼 그룹 */}
              <div className="flex  justify-center items-center gap-6">
                {/* 왼쪽 버튼 */}
                <button
                  onClick={() => onClickLeftBtn(notification.id)}
                  className="w-[120px] h-[42px] rounded-3xl border border-white text-white font-medium text-base "
                >
                  {notification.leftBtnText}
                </button>
                {/* 오른쪽 버튼 */}
                <button
                  onClick={() => onClickRightBtn(notification.id)}
                  className="w-[120px] h-[42px] rounded-3xl border border-white text-white font-medium text-base"
                >
                  {notification.rightBtnText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}
