'use client'

import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import Image from 'next/image'
import ModalNotification from '../Notification/ModalNotification'
import CustomModal from './CustomModal'
import ScheduleSelectShareModal from './ScheduleSelectShareModal'
import '../../styles/BottomSheet.css'

export interface ModalProps {
  startDate: string
  location?: string
  startTime?: string
  endTime?: string
  members: Array<{
    id: number
    name: string
    image: string
  }>
  onClickX: (id: number) => void
}

export default function MembersVariant({
  startDate,
  location,
  startTime,
  endTime,
  members,
  onClickX,
}: ModalProps) {
  const [showNotification, setShowNotification] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)

  // 멤버 프로필 이미지위의 X버튼 클릭 핸들러
  const handleRemoveClick = (id: number) => {
    setSelectedMemberId(id)
    setShowNotification(true)
  }

  // Notification 컴포넌트로 넘기는 클릭 핸들러
  const handleConfirm = () => {
    if (selectedMemberId !== null) {
      onClickX(selectedMemberId)
      console.log(selectedMemberId)
    }
    setShowNotification(false)
    setSelectedMemberId(null)
    console.log('컨펌')
  }

  const handleCancel = () => {
    setShowNotification(false)
    setSelectedMemberId(null)
    console.log('취소')
  }

  // 친구 추가 버튼 클릭 핸들러
  const [isUserPlusOpen, setIsUserPlusOpen] = useState(false)
  const handleOpenUserPlus = () => {
    setIsUserPlusOpen(!isUserPlusOpen)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-[6px]">
        <div className="text-black text-base font-medium leading-snug">
          {startDate}
        </div>
        <button
          className="text-[#9562fa] mr-[32px]"
          onClick={handleOpenUserPlus}
        >
          <UserPlus size={24} />
        </button>
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
            {startTime}-{endTime}
          </span>
        </div>
      </div>
      <div className="mb-6">
        <ModalNotification
          messageText={
            members.find((member) => member.id === selectedMemberId)?.name ===
            '나'
              ? '정말로 이 모임을 나가시겠어요?'
              : '정말로 이 멤버를 삭제하시겠어요?'
          }
          isVisible={showNotification}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
      {/* 멤버 그리드 부분 */}
      <div className="py-2 grid grid-cols-3 gap-[20px]  max-h-[170px] overflow-hidden">
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
                objectFit="cover"
                className="rounded-3xl"
              />
              {/* X 버튼 */}
              <button
                className="absolute top-0.5 right-0.5 transform translate-x-1/2 -translate-y-1/2 w-5 h-5 p-0.5 opacity-80 bg-[#afafaf] rounded-full border-2 border-[#8e8d8d] flex items-center justify-center z-20"
                onClick={() => handleRemoveClick(member.id)}
              >
                <X className="w-4 h-4 text-[#1e1e1e]" />
              </button>
            </div>
            <span className="self-stretch text-center text-[#8e8d8d] text-base font-normal leading-[17px]">
              {member.name}
            </span>
          </div>
        ))}
      </div>

      <CustomModal
        open={isUserPlusOpen}
        onOpenChange={handleOpenUserPlus}
        isFooter={false}
      >
        <ScheduleSelectShareModal inviteUrl="https://moim.team/" />
      </CustomModal>
    </div>
  )
}
