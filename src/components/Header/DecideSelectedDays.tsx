'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { isEqual } from 'lodash'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GoTriangleUp, GoTriangleDown } from 'react-icons/go'
import { LuDot } from 'react-icons/lu'
import { ProfileSmall } from '@/components/Profiles/ProfileSmall'
import CustomModal from '@/components/Modals/CustomModal'
import MembersDefault from '@/components/Modals/MembersDefault'

interface SelectedDate {
  year: number
  month: number
  day: number
  weekday: string
}

interface GroupedDate {
  weekday: string
  dates?: {
    year: number
    month: number
    day: number
    weekday: string
  }[]
  date?: {
    year: number
    month: number
    day: number
    weekday: string
  }[]
}

interface SelectedDaysProps {
  selectedDates: SelectedDate[]
  month: string
  mode: string
  dayofWeek: string[] | null
  currentPage: number
  onPageChange: (newPage: number) => void
  highlightedCol: number | null
  onDateCountsChange: (counts: number[], groupedData: GroupedDate[]) => void
  isPurple: boolean
  participants: {
    id: number
    name: string
    image: string
    scheduleComplete: string
    locationComplete: string
    type: string
  }[]
  title: string
}

const DAYS_PER_PAGE = 7

const weekdayMap: { [key: string]: string } = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
  sat: '토',
  sun: '일',
}

export default function SelectedDays({
  selectedDates,
  month,
  mode,
  dayofWeek,
  currentPage,
  onPageChange,
  highlightedCol,
  onDateCountsChange,
  participants,
  title,
}: SelectedDaysProps) {
  const [dateCounts, setDateCounts] = useState<number[]>([])
  const [groupedData, setGroupedData] = useState<GroupedDate[]>([])
  const [isMembersModalOpen, setIsMemberModalOpen] = useState(false)

  const isSingleDate = selectedDates.length === 1
  const highlightedIndex =
    highlightedCol !== null
      ? highlightedCol - currentPage * DAYS_PER_PAGE
      : null

  const groupByWeekday = useCallback(
    (selectedDates: SelectedDate[], dayofWeek: string[] | null) => {
      if (!dayofWeek) {
        // console.log('dayofWeek is null or empty.')
        return []
      }

      const grouped = dayofWeek.map((day) => {
        const weekdayKor = weekdayMap[day]
        const datesForWeekday = selectedDates.filter(
          (date) => date.weekday === weekdayKor,
        )

        return {
          weekday: day,
          date: datesForWeekday,
        }
      })
      return grouped
    },
    [],
  )

  const getCurrentPageDates = useCallback(() => {
    if (mode === 'range') {
      const start = currentPage * DAYS_PER_PAGE
      return selectedDates.slice(start, start + DAYS_PER_PAGE)
    } else {
      const groupedData = groupByWeekday(selectedDates, dayofWeek)

      if (!Array.isArray(groupedData)) {
        return []
      }

      const pageGroupedData = groupedData[currentPage]
        ? groupedData[currentPage].date
        : []

      // dateCounts와 groupedData를 최신 상태로 설정
      const newDateCounts = groupedData.map((group) => group.date.length)

      // 상태 업데이트 조건 추가: 실제로 값이 변경될 때만 상태 업데이트
      if (
        !dateCountsRef.current ||
        !isEqual(dateCountsRef.current, newDateCounts)
      ) {
        setDateCounts(newDateCounts) // 상태 변경
        dateCountsRef.current = newDateCounts // ref 업데이트
      }

      if (
        !groupedDataRef.current ||
        !isEqual(groupedDataRef.current, groupedData)
      ) {
        setGroupedData(groupedData) // 상태 변경
        groupedDataRef.current = groupedData // ref 업데이트
      }

      return pageGroupedData
    }
  }, [mode, currentPage, selectedDates, groupByWeekday, dayofWeek])

  // useRef로 이전 값을 추적
  const dateCountsRef = useRef<number[] | null>(null)
  const groupedDataRef = useRef<GroupedDate[] | null>(null)

  useEffect(() => {
    // groupedData와 dateCounts가 변경된 경우에만 onDateCountsChange 호출
    if (dateCountsRef.current && groupedDataRef.current) {
      onDateCountsChange(dateCountsRef.current, groupedDataRef.current)
    }
  }, [dateCounts, groupedData, onDateCountsChange])

  const currentDates = getCurrentPageDates()
  const isFullWeek = currentDates.length === 7

  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const totalPages =
    mode === 'range'
      ? Math.ceil(selectedDates.length / DAYS_PER_PAGE)
      : groupByWeekday(selectedDates, dayofWeek).reduce((acc, group) => {
          return acc + Math.ceil(group.date.length / DAYS_PER_PAGE)
        }, 0)

  // console.log('totalPages:', totalPages)

  const handlePrevPage = () => {
    onPageChange(Math.max(0, currentPage - 1))
  }

  const handleNextPage = () => {
    onPageChange(Math.min(totalPages - 1, currentPage + 1))
  }

  const handleMembersModalOpen = () => {
    setIsMemberModalOpen(!isMembersModalOpen)
  }

  return (
    <div className="pt-0 relative">
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="text-[#1e1e1e] font-['Pretendard'] leading-[17px] tracking-tight pl-5 pr-4 pt-3 pb-5">
          <div className="flex justify-between">
            <div className="flex items-center">
              <span className="text-3xl">{month}</span>
              <span className="text-[21px] ml-2 pt-3">
                {dayofWeek && dayofWeek[currentPage] !== null
                  ? dayofWeek[currentPage].toUpperCase()
                  : ''}
              </span>
              <div
                onClick={handleMembersModalOpen}
                className="cursor-pointer ml-2"
              >
                <ProfileSmall profiles={participants} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-0 pb-3 bg-white rounded-bl-3xl rounded-br-3xl shadow-[0_4px_6px_-1px_rgba(30,30,30,0.1),0_2px_4px_-2px_rgba(30,30,30,0.1)] flex items-center">
        <button
          onClick={handlePrevPage}
          className={`flex items-center justify-center ml-2 ${
            currentPage === 0 ? 'text-gray-400' : 'text-[#9562FA]'
          }`}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-7 h-7 mb-4" />
        </button>
        <div className="flex-1 px-0 pb-4">
          {mode === 'range' ? (
            isSingleDate ? (
              <div className="grid grid-cols-7 gap-0 items-center w-full">
                <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
                <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
                <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
                <div
                  className={`flex flex-col items-center w-full ${
                    highlightedIndex === 0 ? 'text-[#9562FA]' : ''
                  }`}
                >
                  <span className="text-3xl font-normal mb-1">
                    {currentDates[0].day}
                  </span>
                  <span className="text-s mt-0">{currentDates[0].weekday}</span>
                </div>
                <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
                <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
                <LuDot className="ml-3 text-[#AFAFAF] w-7 h-7" />
              </div>
            ) : isFullWeek ? (
              <div className="grid grid-cols-7 gap-0">
                {currentDates.map(({ day, weekday }, index) => (
                  <div
                    key={day}
                    className={`flex flex-col items-center w-full ${
                      highlightedIndex === index ? 'text-[#9562FA]' : ''
                    }`}
                  >
                    <span className="text-3xl font-normal">{day}</span>
                    <span className="text-s mt-0">{weekday}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex justify-between w-full"
                style={{
                  width: `calc(100% - ${currentDates.length}px)`,
                  margin: '0 auto',
                }}
              >
                {currentDates.map(({ day, weekday }, index) => (
                  <div
                    key={day}
                    className={`flex flex-col items-center w-full ${
                      highlightedIndex === index ? 'text-[#9562FA]' : ''
                    }`}
                  >
                    <span className="text-3xl font-normal">{day}</span>
                    <span className="text-s mt-0">{weekday}</span>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div
              className="flex justify-between w-full"
              style={{
                width: `calc(100% - ${currentDates.length}px)`,
                margin: '0 auto',
              }}
            >
              {currentDates.map(({ day, weekday }, index) => (
                <div
                  key={day}
                  className={`flex flex-col items-center w-full ${
                    highlightedIndex === index ? 'text-[#9562FA]' : ''
                  }`}
                >
                  <span className="text-3xl font-normal">{day}</span>
                  <span className="text-s mt-0">{weekday}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleNextPage}
          className={`flex items-center justify-center ${
            currentPage >= totalPages - 1 ? 'text-gray-400' : 'text-[#9562FA]'
          }`}
          disabled={currentPage >= totalPages - 1}
        >
          <ChevronRight className="w-7 h-7 mb-4 mr-2" />
        </button>
      </div>
      <div onClick={toggleExpand} className="flex items-center justify-center">
        {isExpanded ? (
          <GoTriangleUp className="w-5 h-5 text-[#9562FA] absolute bottom-1" />
        ) : (
          <GoTriangleDown className="w-5 h-5 text-[#9562FA] absolute bottom-1" />
        )}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[80px] h-2 bg-[#9562FB] border-b-red rounded-full flex items-center justify-center"></div>
      </div>

      <CustomModal
        open={isMembersModalOpen}
        onOpenChange={handleMembersModalOpen}
        isFooter={false}
      >
        <MembersDefault
          blackText={true}
          title={title}
          members={participants}
          memberCount={participants.length}
        />
      </CustomModal>
    </div>
  )
}
