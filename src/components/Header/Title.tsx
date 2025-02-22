'use client'

import { MdArrowBackIos } from 'react-icons/md'
import { IoShareSocialOutline } from 'react-icons/io5'
import { useRouter } from 'next/navigation'
import EditTitle from '@/components/Header/EditTitle'
import { useState } from 'react'
import CustomModal from '../Modals/CustomModal'
import ScheduleSelectShareModal from '../Modals/ScheduleSelectShareModal'

interface TitleProps {
  buttonText: string
  onClickTitleButton?: () => void
  initialTitle: string // 초기 제목
  isPurple?: boolean
  isEdit?: boolean
  onTitleChange: (newTitle: string) => void // 제목 수정 후 부모로 전달
}

export default function Title({
  buttonText,
  onClickTitleButton,
  initialTitle,
  onTitleChange,
  isPurple = false,
  isEdit,
}: TitleProps) {
  const router = useRouter()
  const [isShareOpen, setIsShareOpen] = useState(false)

  const handleOpenDdialg = () => {
    setIsShareOpen(!isShareOpen)
  }

  return (
    <div className="w-full h-16 px-4 py-5 bg-white flex items-center gap-1">
      <button onClick={() => router.push('/schedule')}>
        <MdArrowBackIos className="w-7 h-7 text-[#1e1e1e]" />
      </button>
      <div className="w-[60%] max-w-[300px] overflow-hidden">
        {/* 부모 컨테이너의 최대 가로 길이 제한 */}
        <EditTitle initialTitle={initialTitle} onTitleChange={onTitleChange} />
      </div>
      <div className="flex ml-auto gap-4">
        <button onClick={handleOpenDdialg}>
          <IoShareSocialOutline className="w-8 h-8 text-[#1e1e1e]" />
        </button>
        <button
          className={`text-center text-xl font-medium font-['Pretendard'] leading-[25px] 
          ${isPurple ? 'text-[#9562fa]' : 'text-[#afafaf]'} 
          ${isEdit ? 'cursor-not-allowed' : ''}`}
          onClick={onClickTitleButton}
        >
          {buttonText}
        </button>
      </div>

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
