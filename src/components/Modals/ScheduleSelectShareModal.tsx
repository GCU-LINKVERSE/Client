'use client'

import { Copy } from 'lucide-react'
import { useState, useEffect } from 'react'
// import Image from 'next/image'
import { QRCodeSVG } from 'qrcode.react'
import { useGroupStore } from '@/store/groupStore'
import { useNotificationStore } from '@/store/notificationStore'
import axios from 'axios'
import KakaoShareButton from '@/components/Buttons/KakaoShareButton'
import { FaCheck } from 'react-icons/fa6'

export default function ScheduleSelectShareModal() {
  const [copied, setCopied] = useState(false)
  const { selectedGroupId } = useGroupStore()
  const [inviteUrl, setInviteUrl] = useState('')
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  )

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const FRONT_BASE_URL = process.env.NEXT_PUBLIC_FRONT_BASE_URL

  useEffect(() => {
    // console.log('그룹아이디', selectedGroupId)
    const getCode = async () => {
      try {
        const codeRes = await axios.get(`${API_BASE_URL}/api/members/code`, {
          params: {
            groupId: selectedGroupId,
          },
          withCredentials: true, // 쿠키 전송을 위해 필요
        })

        const code = codeRes.data.data.code
        console.log('초대 코드 생성 성공', code)
        setInviteUrl(`${FRONT_BASE_URL}/schedule/${code}`)
      } catch (error) {
        console.log('초대 코드 생성 실패', error)
      }
    }

    getCode()
  }, [selectedGroupId, API_BASE_URL, FRONT_BASE_URL])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      // console.log(copied)
      showNotification('복사되었습니다.')
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
            <QRCodeSVG value={inviteUrl} />
          </div>
        </div>

        <p className="text-[#afafaf] text-center text-[16px] font-normal pt-3 font-['Pretendard']">
          링크는 24시간 동안 유효해요!
        </p>

        <div className="flex w-[212px] h-8 pl-3.5 pr-2 py-[5px] rounded-xl border border-[#afafaf] justify-end items-center gap-7 inline-flex mb-[4px]">
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
              {!copied ? (
                <Copy className="h-4 w-4 text-[#d9d9d9] m-1" />
              ) : (
                <FaCheck className="h-4 w-4 text-[#d9d9d9] m-1" />
              )}
            </button>
          </div>
        </div>

        <div>
          <KakaoShareButton inviteUrl={inviteUrl} />
        </div>
      </div>
    </div>
  )
}
