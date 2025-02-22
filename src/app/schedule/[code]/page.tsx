'use client'

import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSurveyStore } from '@/store/surveyStore'
import { useGroupStore } from '@/store/groupStore'
import { MdError } from 'react-icons/md'
import { useInviteStore } from '@/store/inviteStore'
import { useNotificationStore } from '@/store/notificationStore'

export default function CodePage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const { code } = useParams() // URL에서 code 파라미터 가져오기
  const router = useRouter()
  const [err, setErr] = useState<string>()

  const { setSelectedSurveyId } = useSurveyStore()
  const { setSelectedGroupId } = useGroupStore()
  const { setInviteUrl } = useInviteStore()
  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  )

  const FRONT_BASE_URL = process.env.NEXT_PUBLIC_FRONT_BASE_URL

  const handleNotification = useCallback(
    (message: string) => {
      showNotification(message)
    },
    [showNotification],
  )

  useEffect(() => {
    // console.log(code)
    const postCode = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/group-members/code`,
          {
            code: code,
          },
          {
            withCredentials: true, // 쿠키 전송을 위해 필요
          },
        )

        console.log('초대 코드 성공', response)
        handleNotification('초대받은 모임에 참여했어요!')
        const surveyId = response.data.data.surveyId
        const groupId = response.data.data.groupId

        if (surveyId === -1) {
          // 확정된 일정일 경우 스케줄 카드로 이동
          router.push('/schedule')
        } else {
          // 조율중인 일정일 경우 select 페이지로 이동
          setSelectedGroupId(groupId)
          setSelectedSurveyId(surveyId)
          router.push('/schedule/select')
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 403) {
            //setErr('로그인 후 다시 초대링크에 접속해주세요.')
            console.log('초대 실패 403', error) // 403 에러(로그아웃 상태) 시 알림 -> 예외처리 확인 필요
            setInviteUrl(`${FRONT_BASE_URL}/schedule/select/${code}`)
            router.push('/')
            handleNotification('로그인이 필요합니다.')
          } else if (error.response.status === 409) {
            router.push('/schedule')
            handleNotification('이미 참여중인 모임이에요!')
          } else {
            setErr('해당 페이지를 찾을 수 없습니다.')
            console.log('초대 코드 실패', error)
          }
        }
      }
    }

    postCode()
  }, [
    API_BASE_URL,
    FRONT_BASE_URL,
    code,
    router,
    setSelectedGroupId,
    setSelectedSurveyId,
    setInviteUrl,
    handleNotification,
  ])
  return (
    <div className="flex flex-col items-center justify-center min-h-screen background-blue">
      {err ? (
        <div className="flex flex-col items-center justify-center">
          <MdError color="#9562FB" size={80} />
          <div className="font-medium mt-2">{err}</div>
        </div>
      ) : (
        <>
          <Image src="/loadingspinner.gif" alt="로딩" width={100} height={50} />
          <div className="font-medium">모임에 초대 중입니다</div>
        </>
      )}
    </div>
  )
}
