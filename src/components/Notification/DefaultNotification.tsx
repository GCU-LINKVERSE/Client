'use client'

interface DefaultNotificationProps {
  isVisible: boolean
  onLeftBtn: () => void
  onRightBtn: () => void
  leftBtnText?: string // 왼쪽 버튼 텍스트
  RightBtnText?: string // 오른쪽 버튼 텍스트
  notiMessage?: string // 알림 메시지 텍스트
}

export default function DefaultNotification({
  isVisible,
  onLeftBtn,
  onRightBtn,
  leftBtnText, // 기본값
  RightBtnText, // 기본값
  notiMessage, // 기본값
}: DefaultNotificationProps) {
  if (!isVisible) return null

  return (
    <div className="w-full h-[119px] bg-[#9562fa] px-16 py-5 flex-col justify-center items-center gap-5 inline-flex mt-4">
      <div className="flex-col justify-center items-center gap-5 flex">
        {/* 메시지 텍스트 */}
        <div className="text-white text-xl font-medium leading-[17px]">
          {notiMessage}
        </div>
        <div className="justify-center items-center gap-6 inline-flex">
          {/* 왼쪽 버튼 */}
          <button
            onClick={onLeftBtn}
            className="w-[120px] h-[42px] px-2.5 py-3 rounded-3xl border border-white justify-center items-center flex"
          >
            <div className="text-center text-white text-base font-normal leading-[17px]">
              {leftBtnText}
            </div>
          </button>
          {/* 오른쪽 버튼 */}
          <button
            onClick={onRightBtn}
            className="w-[120px] h-[42px] px-2.5 py-3 rounded-3xl border border-white justify-center items-center flex"
          >
            <div className="text-center text-white text-base font-medium leading-[17px]">
              {RightBtnText}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
