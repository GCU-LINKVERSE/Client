import { useState } from 'react'
import Image from 'next/image'
import { FiMoreHorizontal } from 'react-icons/fi'
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md'

export interface ProfileLargeProps {
  profiles: {
    id: number
    name: string
    image: string
    scheduleComplete?: string
  }[]
  maxDisplayImg?: number // 선택적으로 처리할 수 있게 하기 위해 물음표 사용, 물음표 없이 number로 선언되면 무조건 props로 넘겨받아야 함
  maxDisplayNum?: number
  onExpandChange: (newExpandState: boolean) => void
}

export function ProfileLarge({
  profiles,
  maxDisplayImg = 5,
  maxDisplayNum = 9,
  onExpandChange,
}: ProfileLargeProps) {
  // 전체 프로필 개수를 계산(length)
  // 배열의 처음부터 최대 갯수까지 슬라이스, 최대 maxDisplayImg 프로필만 화면에 표시
  // 표시된 프로필 수가 전체 프로필 수보다 적다면 더보기 기능 필요
  const totalCount = profiles.length
  const displayProfiles = profiles.slice(0, maxDisplayImg)
  const viewMore = displayProfiles.length < totalCount

  const [isExpanded, setIsExpanded] = useState(false)
  const toggleArrow = () => {
    const newExpandState = !isExpanded
    setIsExpanded(newExpandState)
    onExpandChange(newExpandState) // 상태 변경 시 부모 컴포넌트로 알림
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <div className="flex -space-x-[14px]">
        {displayProfiles.map((profile, index) => (
          // {displayProfiles.map((profile) => (
          <div
            key={profile.id}
            className="relative w-[42px] h-[42px] rounded-[20px] border-2 border-[#9562fa] z-20 overflow-hidden"
            style={{
              zIndex: displayProfiles.length + index,
            }}
          >
            {/* {!profile.isScheduleSelect && (
              <div className="absolute inset-0 bg-[#afafaf]/80 rounded-[20px] z-10"></div>
            )} */}
            {profile.scheduleComplete === 'INCOMPLETE' ||
            profile.scheduleComplete === 'ONGOING' ? (
              <div className="absolute inset-0 bg-[#afafaf]/80 rounded-[20px] z-10"></div>
            ) : (
              <></>
            )}
            {/* 프로필 이미지 */}
            <Image src={profile.image} alt={profile.name} fill sizes="42px" />
            {/* 다섯 번째 프로필 이미지에 회색 배경, 더보기 아이콘 */}
            {viewMore && index === maxDisplayImg - 1 && (
              <div className="absolute inset-0 bg-[#afafaf]/80 flex items-center justify-center cursor-pointer">
                <FiMoreHorizontal className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center">
        {/* 모임 인원이 9명 이상인 경우 9+로 보이게 설정 */}
        <div className="text-2xl font-medium text-[#9562fa] group-hover:text-[#fff]">
          {totalCount > maxDisplayNum ? `${maxDisplayNum}+` : totalCount}
        </div>
        <div onClick={toggleArrow} className="cursor-pointer">
          {isExpanded ? (
            <MdArrowDropUp
              size="27"
              className="text-[#afafaf] group-hover:text-[#fff]"
            />
          ) : (
            <MdArrowDropDown
              size="27"
              className="text-[#afafaf] group-hover:text-[#fff]"
            />
          )}
        </div>
      </div>
    </div>
  )
}
