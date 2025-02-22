'use client'

import { useState, useEffect, useCallback } from 'react'
import Title from '@/components/Header/Title'
import SelectedDays from '@/components/Header/SelectedDays'
import TimeStamp from '@/components/Body/TimeStamp'
import SelectedBottom from '@/components/Footer/BottomSheet/SelectedBottom'
import { SelectItem } from '@/components/Footer/ListItem/SelectItem'
import CustomModal from '@/components/Modals/CustomModal'
import { ProfileLarge } from '@/components/Profiles/ProfileLarge'
import MembersDefault from '@/components/Modals/MembersDefault'
import { useRouter } from 'next/navigation'

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

interface ScheduleData {
  title: string // 일정 이름
  userId: number // 사용자 ID
  groupId: number // 그룹 ID
  mode: string
  selected: string[] | null
  date: [string, string][] // 날짜 배열: [날짜, 요일]의 배열
}

export default function Page() {
  const [title, setTitle] = useState('제목 없는 일정')
  const [currentPage, setCurrentPage] = useState(0)
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)

  const confirmedData = [
    {
      date: '2024-12-31',
      timeSlots: [{ start: '03:00', end: '09:30' }],
    },
    {
      date: '2024-01-03',
      timeSlots: [{ start: '06:30', end: '12:00' }],
    },
    {
      date: '2024-01-05',
      timeSlots: [{ start: '06:00', end: '12:00' }],
    },
    {
      date: '2024-01-06',
      timeSlots: [{ start: '06:00', end: '12:00' }],
    },
    // {
    //   date: '2024-01-06',
    //   timeSlots: [{ start: '03:00', end: '09:30' }],
    // },
    // {
    //   date: '2024-01-13',
    //   timeSlots: [{ start: '06:00', end: '12:00' }],
    // },
    // {
    //   date: '2024-02-08',
    //   timeSlots: [{ start: '06:00', end: '12:00' }],
    // },
    // {
    //   date: '2024-03-17',
    //   timeSlots: [{ start: '06:00', end: '12:00' }],
    // },
  ]

  const [dateTime, setDateTime] =
    useState<{ date: string; timeSlots: { start: string; end: string }[] }[]>(
      confirmedData,
    )
  const [isPurple, setIsPurple] = useState(confirmedData.length > 0)
  const [isOpen, setIsOpen] = useState(false)
  const [dateCounts, setDateCounts] = useState<number[]>([])
  const [groupedDate, setGroupedDate] = useState<GroupedDate[]>([])

  const DAYS_PER_PAGE = 7
  const highlightedIndex =
    highlightedCol !== null
      ? highlightedCol - currentPage * DAYS_PER_PAGE
      : null

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setIsOpen(false)
  }

  const handleDateCountsChange = (
    counts: number[],
    groupedData: GroupedDate[],
  ) => {
    setDateCounts(counts)
    setGroupedDate(groupedData)
  }

  // console.log('groupedData', groupedDate)

  const handleSelectedCol = useCallback(
    (colIndex: number, rowIndex: number) => {
      if (rowIndex === -1) {
        setHighlightedCol(null)
        return 0
      }

      const pairStartRow = Math.floor(rowIndex / 2) * 2
      const pairEndRow = pairStartRow + 1

      const getStartLabel = (rowIndex: number) => {
        const hours = Math.floor(rowIndex / 2)
        const minutes = (rowIndex % 2) * 30
        const formattedHour = String(hours).padStart(2, '0')
        const formattedMinute = String(minutes).padStart(2, '0')
        return `${formattedHour}:${formattedMinute}`
      }

      const getEndLabel = (rowIndex: number) => {
        const nextRowIndex = rowIndex + 1
        const hours = Math.floor(nextRowIndex / 2)
        const minutes = (nextRowIndex % 2) * 30
        const formattedHour = String(hours).padStart(2, '0')
        const formattedMinute = String(minutes).padStart(2, '0')
        return `${formattedHour}:${formattedMinute}`
      }

      const DefaultStartTime = getStartLabel(pairStartRow)
      const DefaultEndTime = getEndLabel(pairEndRow)

      setStartTime(DefaultStartTime)
      setEndTime(DefaultEndTime)

      setHighlightedCol(colIndex)
      setIsOpen(true)
    },
    [],
  )

  const handleActiveTime = (start: number, end: number) => {
    const getStartLabel = (rowIndex: number) => {
      const hours = Math.floor(rowIndex / 2)
      const minutes = (rowIndex % 2) * 30
      const formattedHour = String(hours).padStart(2, '0')
      const formattedMinute = String(minutes).padStart(2, '0')
      return `${formattedHour}:${formattedMinute}`
    }

    const getEndLabel = (rowIndex: number) => {
      const nextRowIndex = rowIndex + 1
      const hours = Math.floor(nextRowIndex / 2)
      const minutes = (nextRowIndex % 2) * 30
      const formattedHour = String(hours).padStart(2, '0')
      const formattedMinute = String(minutes).padStart(2, '0')
      return `${formattedHour}:${formattedMinute}`
    }

    const calculatedStartTime = getStartLabel(start)
    const calculatedEndTime = getEndLabel(end)

    setStartTime(calculatedStartTime)
    setEndTime(calculatedEndTime)

    setIsOpen(true)
  }

  const getDateTime = (date: string, start: string, end: string) => {
    setDateTime((prev) => {
      const existingDateIndex = prev.findIndex((item) => item.date === date)
      let newEntry = null

      if (existingDateIndex !== -1) {
        const updated = [...prev]
        let timeSlots = updated[existingDateIndex].timeSlots

        const toMinutes = (time: string) => {
          const [hours, minutes] = time.split(':').map(Number)
          return hours * 60 + minutes
        }

        const newStartMinutes = toMinutes(start)
        const newEndMinutes = toMinutes(end)

        const overlappingSlots = timeSlots.filter((slot) => {
          const slotStartMinutes = toMinutes(slot.start)
          const slotEndMinutes = toMinutes(slot.end)

          return (
            (newStartMinutes <= slotEndMinutes &&
              newEndMinutes >= slotStartMinutes) ||
            slotEndMinutes === newStartMinutes ||
            slotStartMinutes === newEndMinutes
          )
        })

        if (overlappingSlots.length > 0) {
          const mergedStart = Math.min(
            newStartMinutes,
            ...overlappingSlots.map((slot) => toMinutes(slot.start)),
          )
          const mergedEnd = Math.max(
            newEndMinutes,
            ...overlappingSlots.map((slot) => toMinutes(slot.end)),
          )

          timeSlots = timeSlots.filter(
            (slot) => !overlappingSlots.includes(slot),
          )
          const mergedSlot = {
            start: `${Math.floor(mergedStart / 60)
              .toString()
              .padStart(2, '0')}:${(mergedStart % 60)
              .toString()
              .padStart(2, '0')}`,
            end: `${Math.floor(mergedEnd / 60)
              .toString()
              .padStart(2, '0')}:${(mergedEnd % 60)
              .toString()
              .padStart(2, '0')}`,
          }
          timeSlots.push(mergedSlot)
          newEntry = { date: date, timeSlots: [mergedSlot] }
        } else {
          const newSlot = { start, end }
          timeSlots.push(newSlot)
          newEntry = { date: date, timeSlots: [newSlot] }
        }
        // console.log(date)
        timeSlots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start))

        updated[existingDateIndex].timeSlots = timeSlots
        // console.log('새로 추가된 항목:', newEntry)
        return updated
      } else {
        newEntry = { date: date, timeSlots: [{ start, end }] }
        // console.log('새로 추가된 항목:', newEntry)
        return [...prev, newEntry]
      }
    })
    setIsPurple(true)
    setIsOpen(false)
  }

  useEffect(() => {
    console.log(`Updated dateTimeData:`, dateTime)
  }, [dateTime])

  const weekdayMap: { [key: string]: string } = {
    mon: '월',
    tue: '화',
    wed: '수',
    thu: '목',
    fri: '금',
    sat: '토',
    sun: '일',
  }

  function convertToSelectedDates(
    scheduleData: ScheduleData[],
  ): SelectedDate[] {
    return scheduleData.flatMap((schedule) =>
      schedule.date.map(([fullDate, weekday]) => {
        const [year, month, day] = fullDate.split('-').map(Number)
        return {
          year,
          month,
          day: day,
          weekday: weekdayMap[weekday],
        }
      }),
    )
  }

  const scheduleData: ScheduleData[] = [
    {
      title: '팀플 대면 모임',
      userId: 2,
      groupId: 1,
      // mode: 'week',
      // selected: ['mon', 'wed', 'fri'],
      // date: [
      //   ['2024-01-06', 'mon'],
      //   ['2024-02-08', 'wed'],
      //   ['2024-01-13', 'mon'],
      //   ['2024-02-15', 'wed'],
      //   ['2024-01-20', 'mon'],
      //   ['2024-02-22', 'wed'],
      //   ['2024-01-27', 'mon'],
      //   ['2024-03-03', 'fri'],
      //   ['2024-03-10', 'fri'],
      //   ['2024-03-17', 'fri'],
      //   ['2024-03-24', 'fri'],
      //   ['2024-03-31', 'fri'],
      // ],
      mode: 'range',
      selected: null,
      date: [
        ['2024-12-30', 'mon'],
        ['2024-12-31', 'tue'],
        ['2024-01-01', 'wed'],
        ['2024-01-02', 'thu'],
        ['2024-01-03', 'fri'],
        ['2024-01-04', 'sat'],
        ['2024-01-05', 'sun'],
        ['2024-01-06', 'mon'],
        ['2024-01-07', 'tue'],
        ['2024-01-08', 'wed'],
        ['2024-01-09', 'thu'],
        ['2024-01-10', 'fri'],
        ['2024-01-11', 'sat'],
        ['2024-01-12', 'sun'],
      ],
    },
  ]

  const selectedDates: SelectedDate[] = convertToSelectedDates(scheduleData)
  const mode = scheduleData[0].mode
  const dayofWeek = scheduleData[0].selected
  const month =
    mode === 'range'
      ? currentPage === Math.floor((highlightedCol ?? 0) / DAYS_PER_PAGE)
        ? `${selectedDates[highlightedCol ?? currentPage * DAYS_PER_PAGE]?.month}월`
        : `${selectedDates[currentPage * DAYS_PER_PAGE]?.month}월`
      : `${groupedDate[currentPage]?.date?.[highlightedIndex ?? 0]?.month ?? groupedDate[currentPage]?.date?.[0]?.month}월`

  const scheduleModalData = [
    {
      id: 2,
      number: 2,
      startDate: '12월 30일',
      startTime: '18:00',
      endTime: '20:00',
      participants: [
        {
          id: 1,
          name: '나',
          image: '/sampleProfile.png',
          isScheduleSelect: true,
        },
        {
          id: 2,
          name: '김태엽',
          image: '/sampleProfile.png',
          isScheduleSelect: true,
        },
        {
          id: 3,
          name: '지유진',
          image: '/sampleProfile.png',
          isScheduleSelect: true,
        },
        {
          id: 4,
          name: '이소룡',
          image: '/sampleProfile.png',
          isScheduleSelect: false,
        },
        {
          id: 5,
          name: '박진우',
          image: '/sampleProfile.png',
          isScheduleSelect: false,
        },
        {
          id: 6,
          name: '이예지',
          image: '/sampleProfile.png',
          isScheduleSelect: false,
        },
        {
          id: 7,
          name: '조성하',
          image: '/sampleProfile.png',
          isScheduleSelect: true,
        },
        {
          id: 8,
          name: '성윤정',
          image: '/sampleProfile.png',
          isScheduleSelect: false,
        },
        {
          id: 9,
          name: '김나영',
          image: '/sampleProfile.png',
          isScheduleSelect: false,
        },
        {
          id: 10,
          name: '이채연',
          image: '/sampleProfile.png',
          isScheduleSelect: false,
        },
      ],
    },
  ]

  const router = useRouter()
  // 완료 버튼 누르면 나오는 일정 입력 중 모달
  const [isToDecideModal, setIsToDecideModal] = useState(false)
  const handleToDecideModal = () => {
    if (isPurple) {
      setIsToDecideModal(!isToDecideModal)
      setIsExpanded(false)
      setIsDanger(false)
    } else {
      setIsNextOpen(!isNextOpen)
    }
  }

  // 확장 상태 관리, ProfileLarge에서 전달받은 확장 상태 업데이트
  const [isExpanded, setIsExpanded] = useState(false)
  const handleExpandChange = (newExpandState: boolean) => {
    setIsExpanded(newExpandState)
  }

  // onNext 버튼 누르면 경고 문구 출력 상태 관리
  const [isDanger, setIsDanger] = useState(false)
  const handleDanger = () => {
    const hasIncompleteMember = scheduleModalData[0].participants.some(
      (participant) => !participant.isScheduleSelect,
    )
    setIsDanger(hasIncompleteMember ? !isDanger : isDanger)

    // isDanger가 true로 변경되었을 때 페이지 이동
    if (hasIncompleteMember) {
      if (isDanger) {
        // 경고가 이미 표시된 상태에서 다시 누르면 페이지 이동
        router.push('/schedule/decide')
      } else {
        // 경고 보여주기
        setIsDanger(true)
      }
    } else {
      // 모두 완료되었으면 바로 페이지 이동
      router.push('/schedule/decide')
    }
  }

  const [isNextOpen, setIsNextOpen] = useState(false)

  return (
    <div>
      <Title
        buttonText={'완료'}
        initialTitle={scheduleData[0]?.title || title}
        onTitleChange={handleTitleChange}
        isPurple={isPurple}
        onClickTitleButton={handleToDecideModal}
      />
      <SelectedDays
        selectedDates={selectedDates}
        month={month}
        mode={mode}
        dayofWeek={dayofWeek}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        highlightedCol={highlightedCol}
        onDateCountsChange={handleDateCountsChange}
        isPurple={isPurple}
      />
      <div className="flex-grow overflow-hidden mt-2">
        <TimeStamp
          selectedDates={selectedDates}
          confirmedData={confirmedData}
          currentPage={currentPage}
          mode={mode}
          groupedDate={groupedDate}
          onPageChange={handlePageChange}
          dateCounts={dateCounts}
          handleSelectedCol={handleSelectedCol}
          handleActiveTime={handleActiveTime}
          getDateTime={getDateTime}
          isBottomSheetOpen={isOpen}
        />
      </div>
      <SelectedBottom isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div>
          <SelectItem
            date={
              highlightedCol !== null && highlightedIndex !== null
                ? mode === 'range'
                  ? `${selectedDates[highlightedCol]?.month}월 ${selectedDates[highlightedCol]?.day}일`
                  : (() => {
                      const month =
                        groupedDate[currentPage]?.date?.[highlightedIndex]
                          ?.month
                      const day =
                        groupedDate[currentPage]?.date?.[highlightedIndex]?.day
                      return month && day ? `${month}월 ${day}일` : ''
                    })()
                : ''
            }
            startTime={`${startTime}`}
            endTime={`${endTime}`}
          />
        </div>
      </SelectedBottom>
      <CustomModal
        open={isToDecideModal}
        onOpenChange={handleToDecideModal}
        onNext={handleDanger}
        isFooter={true}
        footerText={'최적의 일정 찾기'}
      >
        <div className="flex flex-col item-center justify-center">
          <div className="text-center text-[#1e1e1e] text-[18px] font-medium leading-[25px] mb-[24px]">
            함께하는 친구들이
            <br /> 시간을 입력하고 있어요!
          </div>
          <div className="flex item-center justify-center mb-[12px]">
            <ProfileLarge
              key={scheduleModalData[0].id}
              profiles={scheduleModalData[0].participants}
              onExpandChange={handleExpandChange}
            />
          </div>
          {isDanger ? (
            <div className="text-center text-[#ff0000] text-xs font-medium ">
              아직 입력을 마치지 않은 친구가 있어요!
              <br />
              그래도 진행하시겠어요?
            </div>
          ) : (
            <div className="text-center text-[#afafaf] text-xs font-medium">
              입력을 완료한 친구의 프로필만 활성화돼요!
            </div>
          )}
          <div className="flex item-center justify-center">
            {isExpanded && (
              <MembersDefault
                blackText={false}
                title={title}
                members={scheduleModalData[0].participants}
                memberCount={scheduleModalData[0].participants.length}
              />
            )}
          </div>
        </div>
      </CustomModal>
      <CustomModal
        open={isNextOpen}
        onOpenChange={handleToDecideModal}
        onNext={() => router.push('/schedule/decide')}
        isFooter={true}
        footerText={'다음으로'}
      >
        <div className="flex item-center justify-center text-center text-[#1e1e1e] text-xl font-medium py-4 mt-3">
          아무것도 선택 <br />
          안하고 넘어갈까요?
        </div>
      </CustomModal>
    </div>
  )
}
