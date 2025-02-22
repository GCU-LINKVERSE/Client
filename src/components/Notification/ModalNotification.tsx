'use client'

interface ModalNotificationProps {
  isVisible: boolean
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string // 확인 버튼 텍스트
  cancelText?: string // 취소 버튼 텍스트
  messageText?: string // 알림 메시지 텍스트
}

export default function ModalNotification({
  isVisible,
  onConfirm,
  onCancel,
  confirmText = '확인', // 기본값
  cancelText = '취소', // 기본값
  messageText = '정말로 모임원을 삭제할까요?', // 기본값
}: ModalNotificationProps) {
  if (!isVisible) return null

  return (
    <div className="w-[280px] -mx-6 flex items-center justify-center">
      <div className="w-full h-[87px] bg-[#9562fa] flex-col justify-center items-center gap-3 inline-flex">
        <div className="flex-col justify-center items-center gap-2 flex">
          {/* 메시지 텍스트 */}
          <div className="h-5 text-center text-white text-base font-normal leading-[17px]">
            {messageText}
          </div>
          <div className="justify-center items-center gap-4 inline-flex">
            {/* 확인 버튼 */}
            <button
              onClick={onConfirm}
              className="px-6 py-1.5 rounded-3xl border border-white justify-center items-center gap-3 flex"
            >
              <div className="text-center text-white text-base font-normal font-['Pretendard'] leading-[17px]">
                {confirmText}
              </div>
            </button>
            {/* 취소 버튼 */}
            <button
              onClick={onCancel}
              className="px-6 py-1.5 rounded-3xl border border-white justify-center items-center gap-3 flex"
            >
              <div className="text-center text-white text-base font-normal font-['Pretendard'] leading-[17px]">
                {cancelText}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
