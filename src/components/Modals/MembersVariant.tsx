'use client'

import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import Image from 'next/image'
import ModalNotification from '../Notification/ModalNotification'
import CustomModal from './CustomModal'
import ScheduleSelectShareModal from './ScheduleSelectShareModal'
import '../../styles/BottomSheet.css'
import { FaCrown } from 'react-icons/fa6'

export interface ModalProps {
  startDate: string
  endDate?: string
  location?: string
  startTime?: string
  endTime?: string
  members: Array<{
    id: number
    name: string
    image: string
    type: string
  }>
  onClickX: (id: number, type: string) => void
}

export default function MembersVariant({
  startDate,
  endDate,
  location,
  startTime,
  endTime,
  members,
  onClickX,
}: ModalProps) {
  const [showNotification, setShowNotification] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [selectedMemberType, setSelectedMemberType] = useState<string>()

  // 멤버 프로필 이미지위의 X버튼 클릭 핸들러
  const handleRemoveClick = (id: number, type: string) => {
    setSelectedMemberId(id)
    setSelectedMemberType(type)
    setShowNotification(true)
  }

  // Notification 컴포넌트로 넘기는 클릭 핸들러
  const handleConfirm = () => {
    if (selectedMemberId !== null && selectedMemberType) {
      onClickX(selectedMemberId, selectedMemberType)
      // console.log(selectedMemberId)
    }
    setShowNotification(false)
    setSelectedMemberId(null)
    setSelectedMemberType('')
  }

  const handleCancel = () => {
    setShowNotification(false)
    setSelectedMemberId(null)
  }

  // 친구 추가 버튼 클릭 핸들러
  const [isUserPlusOpen, setIsUserPlusOpen] = useState(false)
  const handleOpenUserPlus = () => {
    setIsUserPlusOpen(!isUserPlusOpen)
  }

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return null
    // 문자열에서 숫자(월, 일)와 요일 추출
    const match = dateStr.match(/(\d+)월 (\d+)일 (\S+)/)
    if (!match) return null // 형식이 다르면 null 반환

    const [, month, day, dayOfWeek] = match

    // 요일을 변환 (한 글자로 줄이기)
    const dayMap: Record<string, string> = {
      월요일: '월',
      화요일: '화',
      수요일: '수',
      목요일: '목',
      금요일: '금',
      토요일: '토',
      일요일: '일',
    }

    return `${month.padStart(2, '0')}.${day.padStart(2, '0')}(${dayMap[dayOfWeek] || '?'})`
  }

  const dateText =
    startDate === '' && endDate === '' ? (
      '날짜 미정'
    ) : endDate === '' ? (
      startDate
    ) : (
      <>
        {formatDate(startDate)} - {formatDate(endDate)}
      </>
    )

  const timeText =
    startTime === '' && endTime === ''
      ? '조율 진행중'
      : `${startTime} - ${endTime}`

  // creator&my가 있는지 확인
  const isCreator = members.some((m) => m.type === 'creator&my')

  // member.type === 'creator&my' ||
  // member.type === 'creator&other')

  return (
    <div>
      <div className="flex justify-between items-center mb-[6px]">
        <div className="text-black text-base font-medium leading-snug">
          {dateText}
        </div>
        {isCreator && (
          <button
            className="text-[#9562fa] mr-[32px]"
            onClick={handleOpenUserPlus}
          >
            <UserPlus size={24} />
          </button>
        )}
      </div>
      {/* 제목, 부제목 부분*/}
      <div className="mb-4">
        <div className="flex items-center gap-1">
          {location && (
            <span className="text-[#8e8d8d] text-base font-medium leading-snug">
              {location}
            </span>
          )}
          <span className="text-[#9562fa] text-base font-semibold leading-snug">
            {timeText}
          </span>
        </div>
      </div>
      <div className="mb-6">
        <ModalNotification
          messageText={
            members.find((member) => member.id === selectedMemberId)?.type ===
              'creator&my' ||
            members.find((member) => member.id === selectedMemberId)?.type ===
              '&my'
              ? '정말로 이 모임을 나가시겠어요?'
              : '정말로 이 멤버를 삭제하시겠어요?'
          }
          alertText={(() => {
            const selectedMember = members.find(
              (member) => member.id === selectedMemberId,
            )

            return selectedMember?.type === 'creator&my'
              ? '모임장이 나가면 모임이 삭제됩니다.'
              : undefined
          })()}
          isVisible={showNotification}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
      {/* 멤버 그리드 부분 */}
      <div className="py-2 grid grid-cols-3 gap-[15px]  max-h-[158px] overflow-hidden">
        {members.map((member) => (
          <div key={member.id} className="flex flex-col items-center gap-1">
            <div className="relative w-12 h-12 rounded-3xl border-2 border-[#9562fa]">
              {/* X 아이콘 눌린 id값 멤버 이미지 음영처리  */}
              {selectedMemberId === member.id && (
                <div className="absolute inset-0 bg-[#afafaf]/80 rounded-3xl z-10"></div>
              )}
              <Image
                src={member.image}
                alt={member.name}
                width={48}
                height={48}
                style={{ objectFit: 'cover' }}
                className="rounded-3xl"
              />
              {/* X 버튼 */}
              {(isCreator || member.type === '&my') && (
                <button
                  className="absolute top-0.5 right-0.5 transform translate-x-1/2 -translate-y-1/2 w-5 h-5 p-0.5 opacity-80 bg-[#afafaf] rounded-full border-2 border-[#8e8d8d] flex items-center justify-center z-20"
                  onClick={() => handleRemoveClick(member.id, member.type)}
                >
                  <X className="w-4 h-4 text-[#1e1e1e]" />
                </button>
              )}
            </div>
            {/* 멤버 이름 부분 */}
            <div className="relative flex justify-center items-center">
              {member.type === 'creator&my' ||
              member.type === 'creator&other' ? (
                <>
                  <FaCrown
                    size={14}
                    className="absolute -left-2 text-[#9562fa]"
                  />
                  <span className="ml-[8px] text-center text-[#8e8d8d] text-base font-normal leading-[17px]">
                    {member.type === 'creator&my' ? '나' : member.name}
                  </span>
                </>
              ) : (
                <span className="text-center text-[#8e8d8d] text-base font-normal leading-[17px]">
                  {member.type === 'creator&my' || member.type === '&my'
                    ? '나'
                    : member.name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <CustomModal
        open={isUserPlusOpen}
        onOpenChange={handleOpenUserPlus}
        isFooter={false}
      >
        <ScheduleSelectShareModal />
      </CustomModal>
    </div>
  )
}
