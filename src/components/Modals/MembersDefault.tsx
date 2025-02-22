'use client'

import Image from 'next/image'
import '../../styles/BottomSheet.css'
import { FaCrown } from 'react-icons/fa6'

export interface ModalProps {
  title: string
  memberCount?: number
  members: {
    id: number
    name: string
    image: string
    type: string
    scheduleComplete?: string
  }[]
  blackText: boolean
}

export default function MembersDefault({
  title,
  memberCount,
  members,
  blackText,
}: ModalProps) {
  return (
    <div>
      {blackText ? (
        <>
          {/* 헤더 부분: 모임 이름, 엑스 버튼 */}
          <div className="mb-[6px]">
            <div className="text-black text-base font-medium leading-snug">
              {title}
            </div>
          </div>
          {/* 제목, 부제목 부분*/}
          <div className="mb-8">
            <div className="flex items-center gap-1">
              <span className="text-[#8e8d8d] text-base font-medium leading-snug">
                참여 인원
              </span>
              {memberCount && (
                <span className="text-[#9562fa] text-base font-semibold leading-snug">
                  {memberCount}
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="my-[20px]">
          <div className="flex items-center gap-1">
            <span className="text-[#8e8d8d] text-base font-medium leading-snug">
              {title}
            </span>
            {memberCount && (
              <span className="text-[#9562fa] text-base font-semibold leading-snug">
                {memberCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 멤버 그리드 부분 */}
      <div className="py-1 grid grid-cols-3 gap-[15px] max-h-[154px] overflow-hidden">
        {members.map((member) => (
          <div key={member.id} className="flex flex-col items-center gap-1">
            <div className="relative w-12 h-12 rounded-3xl border-2 border-[#9562fa] overflow-hidden">
              {/* {!(member.isScheduleSelect ?? true) && (
                <div className="absolute inset-0 bg-[#afafaf]/80 rounded-3xl z-10"></div>
              )} */}
              {member.scheduleComplete === 'INCOMPLETE' ||
              member.scheduleComplete === 'ONGOING' ? (
                <div className="absolute inset-0 bg-[#afafaf]/80 rounded-[20px] z-10"></div>
              ) : (
                <></>
              )}
              <Image
                src={member.image}
                alt={member.name}
                width={48}
                height={48}
                style={{ objectFit: 'cover' }} // 비율 유지하며 채우기
              />
            </div>
            <div className="relative flex justify-center items-center">
              {member.type === 'creator&my' ||
              member.type === 'creator&other' ? (
                <>
                  <FaCrown
                    size={14}
                    className="absolute -left-2 text-[#9562fa]"
                  />
                  <span className="ml-[8px] text-center text-[#8e8d8d] text-base font-normal leading-[17px]">
                    {member.type === 'creator&my' ? '나' : member.name}
                  </span>
                </>
              ) : (
                <span className="text-center text-[#8e8d8d] text-base font-normal leading-[17px]">
                  {member.type === 'creator&my' || member.type === '&my'
                    ? '나'
                    : member.name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
