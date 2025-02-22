'use client'

import { MdArrowBackIos } from 'react-icons/md'
import { IoShareSocialOutline } from 'react-icons/io5'
import { useRouter } from 'next/navigation'
import EditTitle from '@/components/Header/EditTitle'
import { useState, useEffect } from 'react'
import CustomModal from '../Modals/CustomModal'
import ScheduleSelectShareModal from '../Modals/ScheduleSelectShareModal'
import { useGroupStore } from '@/store/groupStore'
import axios from 'axios'

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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const { selectedGroupId } = useGroupStore()
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isGroupLeader, setIsGroupLeader] = useState(false)

  const handleOpenDdialg = () => {
    setIsShareOpen(!isShareOpen)
  }

  useEffect(() => {
    if (!selectedGroupId) {
      setIsGroupLeader(false) // selectedGroupId가 없을 때 초기화
      return
    }
    // console.log('groupId', selectedGroupId)
    const getGroupLeader = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/members/creator/check/${selectedGroupId}`,
          {
            withCredentials: true, // 쿠키 전송을 위해 필요
          },
        )
        console.log('모임장 여부 get 성공', res.data)
        setIsGroupLeader(res.data.data)
      } catch (error) {
        console.log('모임장 여부 get 실패', error)
      }
    }

    getGroupLeader()
  }, [API_BASE_URL, selectedGroupId])

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
        {isGroupLeader && (
          <button onClick={handleOpenDdialg}>
            <IoShareSocialOutline className="w-8 h-8 text-[#1e1e1e]" />
          </button>
        )}
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
        <ScheduleSelectShareModal />
      </CustomModal>
    </div>
  )
}
