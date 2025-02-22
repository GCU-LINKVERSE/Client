'use client'

import { IoShareSocialOutline } from 'react-icons/io5'
import { useRouter } from 'next/navigation'
import EditTitle from '@/components/Header/Middle/EditTitle'
import { useState } from 'react'
import CustomModal from '@/components/Modals/CustomModal'
import ScheduleSelectShareModal from '@/components/Modals/ScheduleSelectShareModal'

interface TitleProps {
  buttonText: string
  buttonLink: string
  initialTitle: string // 초기 제목
  isPurple: boolean
  onTitleChange: (newTitle: string) => void // 제목 수정 후 부모로 전달
  isDisabled?: boolean // 확정 버튼 비활성화 여부
  onConfirm?: () => void // 확정 버튼 클릭 시 동작
}

export default function Title({
  buttonText,
  buttonLink,
  initialTitle,
  isPurple,
  onTitleChange,

  isDisabled = false,
  onConfirm,
}: TitleProps) {
  const router = useRouter()
  const [isShareOpen, setIsShareOpen] = useState(false)

  const handleButtonClick = () => {
    if (onConfirm) {
      onConfirm() // 중간 지점을 확정
    } else if (buttonLink) {
      router.push(buttonLink)
    }
  }

  const handleOpenDdialg = () => {
    setIsShareOpen(!isShareOpen)
  }

  return (
    <div
      className="w-full h-16 px-5 py-5 bg-white flex items-center gap-1"
      style={{
        borderRadius: '0px 0px 24px 24px',
      }}
    >
      {/* 제목 수정 */}
      <div className="w-[60%] max-w-[300px] overflow-hidden pl-[5px]">
        {/* 부모 컨테이너의 최대 가로 길이 제한 */}
        <EditTitle initialTitle={initialTitle} onTitleChange={onTitleChange} />
      </div>

      {/* 우측 버튼 그룹 */}
      <div className="flex ml-auto gap-3">
        {/* 공유 그룹 */}
        <button onClick={handleOpenDdialg}>
          <IoShareSocialOutline className="w-8 h-8 text-[#1e1e1e]" />
        </button>

        {/* 확정 버튼 */}
        <button
          className={`text-center text-xl font-medium font-['Pretendard'] mr-2
          ${isPurple ? 'text-purple-500' : 'text-[#afafaf]'}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleButtonClick}
          disabled={isDisabled}
        >
          {buttonText}
        </button>
      </div>

      {/* 공유 모달 */}
      <CustomModal
        open={isShareOpen}
        onOpenChange={handleOpenDdialg}
        isFooter={false}
      >
        <ScheduleSelectShareModal inviteUrl="https://moim.team/" />
      </CustomModal>
    </div>
  )
}
