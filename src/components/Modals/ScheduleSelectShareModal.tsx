'use client'

import { Copy } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'

interface ScheduleSelectShareModalProps {
  inviteUrl: string
}

export default function ScheduleSelectShareModal({
  inviteUrl,
}: ScheduleSelectShareModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      console.log(copied)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div>
      <p className="text-[#1e1e1e] text-xl font-medium">친구 초대</p>
      <div className="flex flex-col items-center space-y-[12px] mt-[28px]">
        <div className="flex w-full flex-col items-center">
          <div className="w-[120px] h-[120px] bg-[#afafaf]">
            <QRCodeSVG value="https://moim.team/" />
          </div>
        </div>

        <p className="text-[#afafaf] text-center text-[16px] font-normal pt-3 font-['Pretendard']">
          링크는 24시간 동안 유효해요!
        </p>

        <div className="flex w-[212px] h-8 px-3.5 py-[5px] rounded-xl border border-[#afafaf] justify-end items-center gap-7 inline-flex mb-[4px]">
          <div className="flex relative">
            <input
              type="text"
              value={inviteUrl}
              readOnly
              className="w-full focus:outline-none text-[#afafaf] text-[16px] overflow-hidden"
            />
            <button
              onClick={handleCopy}
              className=" hover:bg-gray-100 rounded-md transition-colors rounded-[50%]"
            >
              <Copy className="h-4 w-4 text-[#d9d9d9]" />
            </button>
          </div>
        </div>

        <div>
          <div className="h-[45px] px-[27px] py-2.5 bg-[#fee500] rounded-xl flex-col justify-start items-start gap-2.5 inline-flex overflow-hidden mt-[4px]">
            <div className="w-[158px] justify-center items-center gap-[5px] inline-flex">
              <div className="relative w-6 h-6 py-[5px] flex-col justify-center items-center gap-2.5 inline-flex overflow-hidden">
                <Image src="/share-kakao.svg" alt="share-kakao" fill />
              </div>
              <div className="text-center text-black/90 text-[15px] font-normal font-['Pretendard'] leading-[17px]">
                카카오 공유하기
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
