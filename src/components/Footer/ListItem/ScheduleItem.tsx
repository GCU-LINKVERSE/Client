import React, { useState } from 'react'
import { X } from 'lucide-react'
import SelectModal from '@/components/Modals/SelectModal'

export interface ScheduleItemProps {
  id: string
  number: number
  startDate: string
  startTime: string
  endTime: string
  onDelete: (id: string) => void
}

export function ScheduleItem({
  id,
  number,
  // title,
  startDate,
  startTime,
  endTime,
  onDelete,
  // participants,
}: ScheduleItemProps) {
  const [isSelectDeleteOpen, setIsSelectDeleteOpen] = useState(false)

  const handleDeleteModal = () => {
    setIsSelectDeleteOpen(!isSelectDeleteOpen)
    console.log('모달 열기')
  }

  // 실제 삭제 api 연동할 함수
  const deleteSchedule = () => {
    onDelete(id) // Call the onDelete function with the item's id
    setIsSelectDeleteOpen(false)
  }

  return (
    <div className="flex items-center justify-between py-9 h-full">
      <div className="flex items-center gap-2">
        <span className="text-[20px] font-medium text-[#9562fa]">{number}</span>
        <span className="text-[16px] font-normal text-black">
          {startDate} &nbsp;
          {startTime} - {endTime}
        </span>
      </div>
      <button>
        <X onClick={handleDeleteModal} />
      </button>
      <SelectModal
        open={isSelectDeleteOpen}
        onOpenChange={handleDeleteModal}
        leftText={'예'}
        rightText={'아니오'}
        onClickLeft={deleteSchedule}
        onClickRight={handleDeleteModal}
      >
        <div className="flex item-center justify-center text-[#1e1e1e] text-xl font-medium leading-snug py-4 mt-3">
          정말로 일정을
          <br />
          삭제할까요?
        </div>
      </SelectModal>
    </div>
  )
}
