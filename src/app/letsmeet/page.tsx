'use client'

import React, { useState, useEffect, useCallback } from 'react'
import NavBar from '@/components/Navigate/NavBar'
import Button from '@/components/Buttons/Floating/Button'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'
import CarouselNotification from '@/components/Notification/CarouselNotification'
import { LetsmeetCard } from '@/components/Cards/LetsmeetCard'
import { useRouter } from 'next/navigation'
import LocationModal from '@/components/Modals/DirectSelect/LocationModal'

type Schedule = {
  id: number
  startDate: string
  title: string
  startTime: string
  endTime: string
  location?: string
  participants: { id: number; name: string; image: string; type: string }[]
}

type Notification = {
  id: number
  leftBtnText: string
  surveyId: number
  notiMessage?: string
}

export default function LetsMeetPage() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)
  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search))
  }, [])

  const isDirectModal = searchParams?.get('direct') === 'true'
  const place = searchParams?.get('place') || ''
  const lat = searchParams?.get('lat')
    ? parseFloat(searchParams.get('lat')!)
    : null
  const lng = searchParams?.get('lng')
    ? parseFloat(searchParams.get('lng')!)
    : null

  const [isOpen, setIsOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false)
  const [title, setTitle] = useState('제목 없는 일정')
  const [scheduleList, setScheduleList] = useState<Schedule[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  const [selectedLocation, setSelectedLocation] = useState<{
    place: string
    lat: number
    lng: number
  } | null>(null)

  //`direct=true`이면 모달 자동으로 열기
  useEffect(() => {
    if (isDirectModal) {
      setIsDirectModalOpen(true)
    }
  }, [isDirectModal])

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  // ✅ URL에서 받아온 값으로 상태 업데이트
  useEffect(() => {
    if (isDirectModal && place && lat && lng) {
      setSelectedLocation({ place, lat, lng })
    }
  }, [isDirectModal, place, lat, lng])

  const fetchNotification = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/members/notification`, {
        method: 'GET',
        credentials: 'include', // 쿠키 전송을 위해 필요
      })

      if (!response.ok) {
        throw new Error(`서버 에러: ${response.status}`)
      }
      const notiData = await response.json()
      setNotifications(notiData.data)
      console.log('알림 정보:', notiData)
    } catch (error) {
      console.error('알림 정보 불러오기 실패:', error)
    }
  }, [API_BASE_URL])

  const handleFindMidpoint = () => {
    router.push('/search?from=/letsmeet')
  }

  const handleDirectInput = () => {
    setTitle('제목 없는 일정')
    setSelectedLocation(null)
    setIsDirectModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsDirectModalOpen(false)
    router.replace('/letsmeet')
  }

  const handleComplete = () => {
    if (!selectedLocation) return

    const newSchedule = {
      id: scheduleList.length + 1,
      startDate: '',
      title: title,
      startTime: '',
      endTime: '',
      location: selectedLocation.place,
      participants: [],
    }

    setScheduleList([...scheduleList, newSchedule])
    setIsDirectModalOpen(false)
    router.replace('/letsmeet')
  }

  //유저 정보
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          'https://api.moim.team/api/user/information',
          {
            method: 'GET',
            credentials: 'include',
          },
        )
        if (!response.ok) {
          throw new Error(`서버 에러: ${response.status}`)
        }
        const data = await response.json()
        console.log('유저 정보:', data)
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error)
      }
    }

    // 스케줄 정보 리스트
    const getSchedule = async () => {
      try {
        const response = await fetch('https://api.moim.team/api/members/List', {
          method: 'GET',
          credentials: 'include',
        })
        if (!response.ok) {
          throw new Error(`서버 에러: ${response.status}`)
        }
        const data = await response.json()
        console.log('스케줄 정보:', data.data)
        if (Array.isArray(data.data)) {
          const formattedSchedules = data.data.map((schedule: Schedule) => ({
            id: schedule.id,
            startDate: schedule.startDate || '',
            title: schedule.title,
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || '',
            location: schedule.location || '',
            participants: schedule.participants || [],
          }))
          setScheduleList(formattedSchedules)
        } else {
          console.error('데이터 구조 에러:', data.data)
        }
      } catch (error) {
        console.error('스케줄 정보 불러오기 실패:', error)
      }
    }

    fetchUserInfo()
    fetchNotification()
    getSchedule()
  }, [fetchNotification])

  // 캐러셀 알림 버튼 클릭 이벤트
  const handleLeftBtn = () => {
    alert('왼쪽 버튼 클릭')
  }

  const handleRightBtn = () => {
    alert('오른쪽 버튼 클릭')
  }

  return (
    <div className="flex flex-col min-h-screen h-screen">
      <NavBar activeTab="렛츠밋" />

      {/* 캐로셀 알림 컴포넌트 */}
      {notifications.length > 0 && (
        <div className="flex justify-center items-center overflew-hidden">
          <CarouselNotification
            notifications={notifications}
            onClickLeftBtn={handleLeftBtn}
            onClickRightBtn={handleRightBtn}
          />
        </div>
      )}

      {/* 렛츠밋 카드 컴포넌트 */}
      {scheduleList.length > 0 ? (
        <>
          <div className="w-full h-[34px] px-4 my-[8px] flex justify-start items-center gap-[2px]">
            <div className="ml-[8px] text-[#1e1e1e] text-xs font-medium leading-[17px]">
              내 장소
            </div>
            <div className="text-[#9562fa] text-base font-medium leading-[17px]">
              +{scheduleList.length}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-[120px]">
            {scheduleList.map((schedule) => (
              <LetsmeetCard key={schedule.id} {...schedule} />
            ))}
          </div>
        </>
      ) : (
        // 장소 정보 없는 경우 렌더링 화면
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-center text-zinc-400 text-base font-medium leading-[17px]">
            모임 장소를 추가해봐요!
          </div>
        </div>
      )}
      {/* 장소 추가하기 버튼 */}
      <Button
        buttonString="장소 추가하기"
        isOpen={isOpen}
        onClick={() => {
          setIsOpen(!isOpen)
          setIsOptionsOpen(!isOptionsOpen)
        }}
      />

      {/* 옵션 모달 */}
      <ScheduleOptions
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        onClickUp={handleFindMidpoint} // "중간지점 찾기" 버튼 핸들러
        onClickDown={handleDirectInput} // "직접 입력하기" 버튼 핸들러
        optionStringUp="중간지점 찾기"
        optionStringDown="직접 입력하기"
      />
      {/* LocationModal */}
      {isDirectModalOpen && (
        <LocationModal
          isVisible={isDirectModalOpen}
          onClose={handleCloseModal}
          onClickRight={handleComplete}
          initialTitle={title}
          onTitleChange={setTitle}
          selectedLocation={selectedLocation ?? undefined} // `null` 대신 `undefined` 전달
          scheduleId={selectedLocation ? scheduleList.length + 1 : 0} // scheduleId 추가
        />
      )}
    </div>
  )
}
