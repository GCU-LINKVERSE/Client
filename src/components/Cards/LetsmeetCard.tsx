import { WhiteButton } from '../Buttons/WhiteButtton'
import { ProfileSmall } from '../Profiles/ProfileSmall'
import React, { useState } from 'react'
import CustomModal from '@/components/Modals/CustomModal'
import MembersVariant from '../Modals/MembersVariant'
import DateTimeModal from '@/components/Modals/DirectSelect/DateTimeModal'
import EditTitle from '@/components/Header/EditTitle'
import CustomCalendar from '@/components/Calendars/CustomCalendar'
import { useHandleSelect } from '@/hooks/useHandleSelect'
import { useDateTimeStore } from '@/store/dateTimeStore'
import { useRouter } from 'next/navigation'
import { ScheduleOptions } from '@/components/Buttons/Floating/Options'

export interface LetsmeetCardProps {
  id: number
  startDate: string
  title: string
  startTime: string
  endTime: string
  location?: string
  participants: { id: number; name: string; image: string }[]
}

export function LetsmeetCard({
  id,
  startTime,
  endTime,
  location,
  participants,
}: LetsmeetCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const [title, setTitle] = useState('제목 없는 일정') // 제목 상태 관리

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [isCdialogOpen, setIsCdialogOpen] = useState(false) // 일정 조율하기 모달 상태 C: Coordinate
  const [isDdialogOpen, setIsDdialogOpen] = useState(false) // 직접 입력하기 모달 상태 D: Direct

  const { selectedDates, stringDates, handleSelect, mode, selected } =
    useHandleSelect() // 커스텀 훅으로 날짜 선택 기능 가져오기 (백에 보낼때 stringDates 가져오면 됨)
  const [startDate, setStartDate] = useState<string>('') // 직접입력하기-시작날짜,시간
  const [endDate, setEndDate] = useState<string | null>(null) // 직접입력하기-끝날짜,시간

  const resetDateTime = useDateTimeStore((state) => state.resetDateTime)
  const router = useRouter()

  const [selectedLocation, setSelectedLocation] = useState(location || '')
  const [isEditingLocation, setIsEditingLocation] = useState(false)

  const handleLocationClick = () => {
    setIsEditingLocation(true)
  }

  const handleLocationBlur = () => {
    setIsEditingLocation(false)
  }

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingLocation(false)
    }
  }

  //참가자
  // membersVariant 모달 핸들
  const handleMembersModalOpen = () => {
    setIsMembersModalOpen(!isMembersModalOpen)
  }

  // 선택된 멤버의 id값 전달을 위한 상태추적
  const [selectedMember, setSelectedMember] = useState(participants)

  // 실제 삭제 api 여기에 연동
  const handleRemoveMember = (id: number) => {
    setSelectedMember((prev) => prev.filter((member) => member.id !== id))
  }

  //제목 수정
  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle) // UI 업데이트

    try {
      const response = await fetch(`/api/members?groupId=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName: newTitle,
          location: selectedLocation,
        }),
        credentials: 'include', // 인증 정보 포함
      })

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`)
      }

      const data = await response.json()
      console.log('약속 이름 수정 성공:', data)
    } catch (error) {
      console.error('약속 이름 수정 실패:', error)
    }
  }

  /// 장소 수정 API 요청
  const handleLocationChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newLocation = e.target.value
    setSelectedLocation(newLocation)

    try {
      const response = await fetch(`/api/members?groupId=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName: title,
          location: newLocation, // 입력된 장소 업데이트
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`)
      }

      const data = await response.json()
      console.log('장소 정보 수정 성공:', data)
    } catch (error) {
      console.error('장소 정보 수정 실패:', error)
    }
  }

  //일정 정하기 모달
  const handleOpenScheduleModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(true)
  }

  const handleOpenCdialog = () => {
    if (isCdialogOpen) {
      handleSelect(undefined)
    }
    setIsCdialogOpen(!isCdialogOpen)
  }

  const handleOpenDdialg = async () => {
    if (isDdialogOpen) {
      resetDateTime()
    }
    setIsDdialogOpen(!isDdialogOpen)
  }

  const handleDateChange = (startDateState: string, endDate: string) => {
    setStartDate(startDateState)
    setEndDate(endDate)
  }

  const handlePostSchedule = () => {
    console.log('선택날짜', stringDates)
    console.log('mode', mode)
    console.log('selected', selected)

    router.push('/schedule/select')
  }

  const handlePostDirectSchedule = async () => {
    console.log('startDate', startDate)
    console.log('endDate', endDate)

    try {
      // 1. 그룹 생성 API
      const test = await fetch('https://api.moim.team/api/members', {
        method: 'POST',
        credentials: 'include',
      })

      if (!test.ok) {
        throw new Error(`서버 에러: ${test.status}`)
      }

      const check = await test.json()
      const groupId = check.data.groupId

      // 2. 약속 생성 API
      const response = await fetch('https://api.moim.team/api/schedule', {
        method: 'POST',
        credentials: 'include', // 인증 정보 포함
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: groupId,
          name: title,
          location: selectedLocation,
          startDate: startDate,
          endDate: endDate,
        }),
      })

      if (!response.ok) {
        throw new Error(`서버 에러: ${response.status}`)
      }

      const create = await response.json()
      console.log('직접 생성 성공', create)
    } catch (error) {
      console.error('API 요청 실패', error)
    }

    setIsDdialogOpen(false)
    setIsOpen(false)
    resetDateTime()
    router.push('/schedule')
  }

  return (
    <div className="px-4 mb-5">
      <div className="text-[#1e1e1e] text-xs font-medium leading-[17px] ml-[12px]">
        {startDate}
      </div>
      <div
        className="group w-full h-full rounded-3xl border-2 border-[#9562fa] px-6 py-[18px] cursor-pointer bg-white border-[#9562fa] hover:bg-[#9562fa] hover:text-[#fff]"
        onClick={handleMembersModalOpen}
      >
        <div className="flex flex-col">
          {/* 내용 정렬 */}
          <div className="flex justify-between">
            {/* 일정 제목 */}
            <div className="flex flex-col justify-between gap-4">
              <span className="text-xl font-medium leading-[17px] text-[#8e8d8d] group-hover:text-[#fff] ml-[5px]s">
                {title}
              </span>
              {/* 모임원 프로필 */}
              <ProfileSmall profiles={participants} />
            </div>

            {/* 약속 장소 */}
            <div className="flex flex-col justify-center items-end gap-3">
              {isEditingLocation ? (
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                  onBlur={handleLocationBlur} // 입력창이 비활성화되면 변경 완료
                  onKeyDown={handleLocationKeyDown} // Enter 키를 누르면 변경 완료
                  autoFocus
                  className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff] bg-transparent border-b border-[#9562fa] focus:outline-none"
                />
              ) : (
                <span
                  className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff] cursor-pointer"
                  onClick={handleLocationClick}
                >
                  {selectedLocation}
                </span>
              )}
              {(!startTime || !endTime) && (
                <WhiteButton
                  text="일정 정하기"
                  className={
                    'border-[#9562fa] text-[#9562fa] group-hover:border-white group-hover:text-white'
                  }
                  onClick={handleOpenScheduleModal}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MembersVariant 모달 */}
      <CustomModal
        open={isMembersModalOpen}
        onOpenChange={handleMembersModalOpen}
        isFooter={false}
      >
        <MembersVariant
          onClickX={handleRemoveMember}
          startDate={startDate}
          location={location}
          startTime={startTime}
          endTime={endTime}
          members={selectedMember}
        />
      </CustomModal>
      <ScheduleOptions
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        optionStringUp="일정 조율하기"
        optionStringDown="직접 입력하기"
        onClickUp={handleOpenCdialog}
        onClickDown={handleOpenDdialg}
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
        <EditTitle initialTitle={title} onTitleChange={handleTitleChange} />
        <DateTimeModal onDateChange={handleDateChange} />
      </CustomModal>
    </div>
  )
}
