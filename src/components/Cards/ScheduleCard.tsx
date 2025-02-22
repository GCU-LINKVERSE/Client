import { WhiteButton } from '../Buttons/WhiteButtton'
import { ProfileSmall } from '../Profiles/ProfileSmall'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation' // useRouter 훅 사용
import CustomModal from '@/components/Modals/CustomModal'
import MembersVariant from '../Modals/MembersVariant'
import SelectModal from '../Modals/SelectModal'

export interface ScheduleCardProps {
  startDate: string
  endDate?: string
  title: string
  startTime: string
  endTime: string
  location?: string
  participants: { id: number; name: string; image: string }[]
}

export function ScheduleCard({
  startDate,
  title,
  startTime,
  endTime,
  location,
  participants,
}: ScheduleCardProps) {
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [isSelectedPlace, setIsSelectedPlace] = useState(false)

  const router = useRouter()

  // membersVariant 모달 핸들
  const handleMembersModalOpen = () => {
    setIsMembersModalOpen(!isMembersModalOpen)
  }

  // 장소 선정하기 버튼 모달 open 핸들
  const handleOpenSelectedPlace = (e: React.MouseEvent) => {
    e.stopPropagation() // 이벤트 버블링 방지
    setIsSelectedPlace(true)
    console.log('dkdkdk')
  }

  // 장소 선정하기 버튼 모달 close 핸들
  const handleCloseSelectedPlace = () => {
    setIsSelectedPlace(false)
  }

  // 선택된 멤버의 id값 전달을 위한 상태추적
  const [selectedMember, setSelectedMember] = useState(participants)

  // 실제 삭제 api 여기에 연동
  const handleRemoveMember = (id: number) => {
    setSelectedMember((prev) => prev.filter((member) => member.id !== id))
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
        <div className="flex flex-col gap-4">
          {/* 내용 정렬 */}
          <div className="flex justify-between">
            {/* 일정 제목 */}
            <div className="flex flex-col justify-between gap-2">
              <span className="text-xl font-medium leading-[17px] text-[#8e8d8d] group-hover:text-[#fff]">
                {title}
              </span>
              {/* 모임원 프로필 */}
              <ProfileSmall profiles={participants} />
            </div>

            {/* 약속 시간, 장소 */}
            <div className="flex flex-col justify-center items-end gap-2">
              <span className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff]">
                {startTime} - {endTime}
              </span>
              {location ? (
                <span className="text-xl font-medium text-[#9562fa] group-hover:text-[#fff] my-1">
                  {location}
                </span>
              ) : (
                <WhiteButton
                  text="장소 정하기"
                  className={
                    'border-[#9562fa] text-[#9562fa] group-hover:border-white group-hover:text-white'
                  }
                  onClick={handleOpenSelectedPlace}
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

      {/* SelectModal 모달 - 장소 선정 */}
      <SelectModal
        open={isSelectedPlace}
        onOpenChange={handleCloseSelectedPlace}
        leftText={'직접 입력'}
        rightText={'장소선정'}
        onClickLeft={() => alert('직접 입력 모달 연결')}
        onClickRight={() => router.push('/search?from=schedule')}
      >
        <div className="flex item-center justify-center text-[#1e1e1e] text-xl font-medium leading-snug py-4 mt-3">
          장소를
          <br />
          선정할까요?
        </div>
      </SelectModal>
    </div>
  )
}
