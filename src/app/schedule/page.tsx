'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'
import CustomModal from '@/components/Modals/CustomModal'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import Button from '@/components/Buttons/Floating/Button'
import NavBar from '@/components/Navigate/NavBar'
import { ScheduleCard } from '@/components/Cards/ScheduleCard'
import DirectEditTitle from '@/components/Header/DirectEditTitle'
import CarouselNotification from '@/components/Notification/CarouselNotification'
import DateTimeModal from '@/components/Modals/DirectSelect/DateTimeModal'
import { useHandleSelect } from '@/hooks/useHandleSelect'
import { useDateTimeStore } from '@/store/dateTimeStore'
import { useRouter } from 'next/navigation'
import { useSurveyStore } from '@/store/surveyStore'
import { useGroupStore } from '@/store/groupStore'
import { useNotificationStore } from '@/store/notificationStore'
import axios from 'axios'
import '../../styles/BottomSheet.css'

// /api/members/List 연동
export type Participant = {
  id: number
  name: string
  image: string
  type: string
  scheduleComplete: string
}

export type Schedule = {
  id: number
  startDate: string
  endDate?: string
  title: string
  startTime: string
  endTime: string
  location?: string
  participants: Participant[]
  surveyId: number
}

type Notification = {
  id: number
  leftBtnText: string
  surveyId: number
  notiMessage?: string
}

export default function ScheduleLanding() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCdialogOpen, setIsCdialogOpen] = useState(false) // 일정 조율하기 모달 상태 C: Coordinate
  const [isDdialogOpen, setIsDdialogOpen] = useState(false) // 직접 입력하기 모달 상태 D: Direct
  const [title, setTitle] = useState('제목 없는 일정') // 제목 상태 관리
  const { selectedDates, stringDates, handleSelect, mode, selected } =
    useHandleSelect() // 커스텀 훅으로 날짜 선택 기능 가져오기 (백에 보낼때 stringDates 가져오면 됨)
  const [startDate, setStartDate] = useState<string | null>(null) // 직접입력하기-시작날짜,시간
  const [endDate, setEndDate] = useState<string | null>(null) // 직접입력하기-끝날짜,시간
  const [scheduleList, setScheduleList] = useState<Schedule[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filterOption, setFilterOption] = useState<
    'all' | 'confirmed' | 'unconfirmed'
  >('all')

  const resetDateTime = useDateTimeStore((state) => state.resetDateTime)
  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const { setSelectedSurveyId } = useSurveyStore() // Zustand에서 가져옴
  const { selectedGroupId, setSelectedGroupId } = useGroupStore()
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  )

  const getSchedule = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/members/List`, {
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
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          title: schedule.title,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          location: schedule.location || '',
          participants: schedule.participants || [],
          surveyId: schedule.surveyId,
        }))

        setScheduleList(formattedSchedules.reverse())
        setFilterOption('all')
      } else {
        console.error('데이터 구조 에러:', data.data)
      }
    } catch (error) {
      console.error('스케줄 정보 불러오기 실패:', error)
    }
  }, [API_BASE_URL])

  const filteredSchedules = useMemo(() => {
    if (filterOption === 'confirmed') {
      return scheduleList.filter((schedule) => schedule.startDate)
    } else if (filterOption === 'unconfirmed') {
      return scheduleList.filter((schedule) => !schedule.startDate)
    }
    return scheduleList
  }, [filterOption, scheduleList])

  const handleFilterChange = (option: 'all' | 'confirmed' | 'unconfirmed') => {
    setFilterOption(option)
  }

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

  const handleNotification = () => {
    showNotification('모임 생성 완료!')
  }

  // 연동 데이터
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/information`, {
          method: 'GET',
          credentials: 'include', // 쿠키 전송을 위해 필요
        })
        if (!response.ok) {
          // 예외 처리
          throw new Error(`서버 에러: ${response.status}`)
        }
        const data = await response.json()
        console.log('유저 정보:', data)
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error)
      }
    }

    fetchUserInfo()
    fetchNotification()
    getSchedule()
  }, [API_BASE_URL, fetchNotification, getSchedule])

  // 제목 수정 함수
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle) // 수정된 제목으로 상태 업데이트
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }
  const handleOpenCdialog = () => {
    if (isCdialogOpen) {
      // 모달이 닫힐 때 선택된 날짜 초기화
      handleSelect(undefined)
    }
    setIsCdialogOpen(!isCdialogOpen)
  }

  const handleOpenDdialg = async () => {
    if (isDdialogOpen) {
      // 직접 입력 모달이 닫힐 때 시작/끝 날짜,시간 초기화
      resetDateTime()
      setTitle('제목 없는 일정')
    }
    setIsDdialogOpen(!isDdialogOpen)
  }

  // 직접입력하기 모달에서 받아온 시작, 끝 string 저장
  const handleDateChange = (startDate: string, endDate: string) => {
    setStartDate(startDate)
    setEndDate(endDate)
  }

  // // 캐러셀 알림 버튼 클릭 이벤트
  const handleLeftBtn = (id: number) => {
    const currentNotification = notifications.find((n) => n.id === id)
    if (currentNotification?.notiMessage?.includes('일정')) {
      setSelectedSurveyId(currentNotification.surveyId)
      router.push('schedule/select')
    } else {
      if (selectedGroupId) setSelectedGroupId(selectedGroupId)
      router.push('letsmeet/middle')
    }
  }

  const handleRightBtn = (id: number) => {
    const filter = notifications.filter((n) => n.id !== id)
    setNotifications(filter)
  }

  const handlePostSchedule = async () => {
    // console.log('선택날짜', stringDates)
    // console.log('mode', mode)
    // console.log('selected', selected)

    try {
      // 1. 그룹 생성
      const groupRes = await axios.post(
        `${API_BASE_URL}/api/members`,
        {},
        {
          withCredentials: true, // 쿠키 전송을 위해 필요
        },
      )

      const groupId = await groupRes.data.data.groupId
      console.log('그룹 ID:', groupRes.data.data.groupId)

      // 2. 조율할 스케줄 생성
      const cresteSurveyRes = await axios.post(
        `${API_BASE_URL}/api/survey`,
        {
          groupId: groupId,
          mode: mode,
          selected: selected,
          date: stringDates,
        },
        {
          withCredentials: true, // 쿠키 전송을 위해 필요
        },
      )

      console.log('조율할 일정 생성', cresteSurveyRes)
      const surveyId = await cresteSurveyRes.data.data.surveyId

      // surveyId 전역으로 저장
      setSelectedSurveyId(surveyId)
      setSelectedGroupId(groupId)

      router.push('/schedule/select')
    } catch (error) {
      console.log('일정 생성 실패', error)
    }
  }

  const handlePostDirectSchedule = async () => {
    // console.log('startDate', startDate)
    // console.log('endDate', endDate)

    try {
      // 그룹 생성
      const groupRes = await axios.post(
        `${API_BASE_URL}/api/members`,
        {},
        {
          withCredentials: true, // 쿠키 전송을 위해 필요
        },
      )

      const groupId = await groupRes.data.data.groupId
      console.log('그룹 ID:', groupRes.data.data.groupId)

      // 직접 입력 스케줄 생성
      const createScheduleRes = await axios.post(
        `${API_BASE_URL}/api/schedule`,
        {
          groupId: groupId, // 첫 번째 요청에서 받은 그룹 ID 사용
          title: title,
          startDate: startDate,
          endDate: endDate,
        },
        {
          withCredentials: true, // 쿠키 전송을 위해 필요
          headers: {
            'Content-Type': 'application/json', // JSON 형식 명시
          },
        },
      )
      console.log('직접 일정 생성 성공', createScheduleRes)

      // 일정이 추가된 후 다시 스케줄 목록 가져오기
      await getSchedule()
      handleNotification()
    } catch (error) {
      console.error('API 요청 실패', error)
    }

    setIsDdialogOpen(false)
    setIsOpen(false)
    resetDateTime()
    setTitle('제목 없는 일정')
    router.push('/schedule')
  }

  return (
    <div className="flex flex-col min-h-screen h-screen">
      {/* Add Moim Button */}
      <NavBar activeTab="스케줄" />

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

      {/* 스케줄 카드 컴포넌트 */}
      {scheduleList.length > 0 ? (
        <>
          <div className="w-full h-[34px] px-4 my-[8px] flex justify-between items-center">
            <div className="flex justify-start items-center gap-[2px]">
              <div className="ml-[8px] text-[#1e1e1e] text-xs font-medium leading-[17px]">
                내 일정
              </div>
              <div className="text-[#9562fa] text-base font-medium leading-[17px]">
                +{filteredSchedules.length}
              </div>
            </div>
            <div className="flex text-[15px] items-center gap-[10px] ">
              <button
                className={` ${
                  filterOption === 'all'
                    ? 'text-[#9562fa] font-bold'
                    : 'text-[#afafaf]'
                }`}
                onClick={() => handleFilterChange('all')}
              >
                전체
              </button>
              <button
                className={` ${
                  filterOption === 'unconfirmed'
                    ? 'text-[#9562fa] font-bold'
                    : 'text-[#afafaf]'
                }`}
                onClick={() => handleFilterChange('unconfirmed')}
              >
                진행중
              </button>
              <button
                className={` ${
                  filterOption === 'confirmed'
                    ? 'text-[#9562fa] font-bold'
                    : 'text-[#afafaf]'
                }`}
                onClick={() => handleFilterChange('confirmed')}
              >
                확정
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-[120px] overflow-hidden">
            {filteredSchedules.map((schedule: Schedule) => (
              <div key={schedule?.id}>
                <ScheduleCard
                  id={schedule?.id}
                  startDate={schedule?.startDate}
                  endDate={schedule?.endDate}
                  title={schedule?.title}
                  startTime={schedule?.startTime}
                  endTime={schedule?.endTime}
                  location={schedule?.location}
                  participants={schedule?.participants}
                  surveyId={schedule?.surveyId}
                  getSchedule={getSchedule}
                  fetchNotification={fetchNotification}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        // 스케줄 정보 없는 경우 렌더링 화면
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="text-center text-[#afafaf] text-base font-medium leading-[17px]">
            모임 일정을 추가해봐요!
          </div>
        </div>
      )}
      <ScheduleOptions
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        optionStringUp="일정 조율하기"
        optionStringDown="직접 입력하기"
        onClickUp={handleOpenCdialog}
        onClickDown={handleOpenDdialg}
      />
      <Button
        buttonString="일정 추가하기"
        onClick={handleToggle}
        isOpen={isOpen}
      />

      {/* 일정 조율하기 모달 */}
      <CustomModal
        open={isCdialogOpen}
        onOpenChange={handleOpenCdialog}
        onNext={handlePostSchedule}
        isFooter={true}
        footerText={'다음으로'}
        isDisabled={stringDates[0] ? false : true}
      >
        <CustomCalendar
          initialMode="range"
          selected={selectedDates}
          onSelect={handleSelect}
        />
      </CustomModal>

      {/* 직접 입력하기 모달 - 날짜, 시간 */}
      <CustomModal
        open={isDdialogOpen}
        onOpenChange={handleOpenDdialg}
        onNext={handlePostDirectSchedule}
        isFooter={true}
        footerText={'입력완료'}
      >
        <DirectEditTitle
          initialTitle={title}
          onTitleChange={handleTitleChange}
        />
        <DateTimeModal onDateChange={handleDateChange} />
      </CustomModal>
    </div>
  )
}
