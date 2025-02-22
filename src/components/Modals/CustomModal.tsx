'use client'

import { ReactNode } from 'react'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { DialogClose, DialogTitle } from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import '../../styles/CustomModal.css'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onOpenChange: () => void
  children: ReactNode
  onNext?: () => void // '다음으로' 버튼 클릭 시 실행
  isFooter: boolean // 하단 버튼 이용 여부
  footerText?: string // 하단 버튼 이용 시 버튼 텍스트
  contentPadding?: boolean
  isDisabled?: boolean // 다음으로 버튼 비활성화 여부
}

export default function CustomModal({
  open,
  onOpenChange,
  children,
  onNext,
  isFooter,
  footerText,
  contentPadding = true,
  isDisabled = false,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#ffffff] rounded-3xl w-[280px] p-0 gap-0 [&>button]:hidden border-0">
        <div
          className={cn('relative w-[280px]', contentPadding ? 'p-6' : 'p-0')}
        >
          <DialogClose className="absolute right-6 focus:outline-none z-[3000]">
            <X></X>
          </DialogClose>
          <DialogTitle></DialogTitle>
          {children}
        </div>
        {isFooter && (
          <DialogFooter className="flex flex-col items-center w-[280px] border-t border-[#afafaf]">
            <button
              onClick={onNext}
              className="text-center text-[#9562fa] font-medium rounded-3xl text-lg py-[16px] w-full disabled:text-gray-400"
              disabled={isDisabled}
            >
              {footerText}
            </button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
