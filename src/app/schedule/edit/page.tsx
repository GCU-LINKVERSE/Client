'use client'

import { useState, useEffect, useCallback } from 'react'
import EditSelectedDays from '@/components/Header/EditSelectedDays'
import Title from '@/components/Header/Title'
import EditTimeStamp from '@/components/Body/EditTimeStamp'
import SelectedBottom from '@/components/Footer/BottomSheet/SelectedBottom'
import { EditItem } from '@/components/Footer/ListItem/EditItem'

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
  name: string // 일정 이름
  userId: number // 사용자 ID
  groupId: number // 그룹 ID
  mode: string
  selected: string[] | null
  date: [string, string][] // 날짜 배열: [날짜, 요일]의 배열
}

interface TimeSlot {
  slotId: number
  start: string
  end: string
  date?: string
}

interface DateData {
  date: string
  timeSlots: TimeSlot[]
}

interface SelectedDate {
  year: number
  month: number
  day: number
  weekday: string
}

const mockSelectedSchedule: DateData[] = [
  {
    date: '2024-01-06',
    timeSlots: [
      {
        slotId: 1,
        start: '01:00',
        end: '05:30',
      },
      {
        slotId: 2,
        start: '06:30',
        end: '08:00',
      },
    ],
  },
  {
    date: '2024-02-08',
    timeSlots: [
      {
        slotId: 3,
        start: '06:00',
        end: '10:30',
      },
      {
        slotId: 4,
        start: '17:30',
        end: '22:00',
      },
    ],
  },
  {
    date: '2024-01-13',
    timeSlots: [
      {
        slotId: 5,
        start: '09:00',
        end: '12:00',
      },
      {
        slotId: 6,
        start: '13:30',
        end: '15:30',
      },
    ],
  },
  {
    date: '2024-02-15',
    timeSlots: [
      {
        slotId: 7,
        start: '04:30',
        end: '10:00',
      },
      {
        slotId: 8,
        start: '13:30',
        end: '16:00',
      },
    ],
  },
  {
    date: '2024-01-20',
    timeSlots: [
      {
        slotId: 9,
        start: '06:00',
        end: '10:30',
      },
      {
        slotId: 10,
        start: '17:30',
        end: '22:00',
      },
    ],
  },
  {
    date: '2024-02-22',
    timeSlots: [
      {
        slotId: 11,
        start: '06:00',
        end: '10:30',
      },
      {
        slotId: 12,
        start: '16:30',
        end: '22:00',
      },
    ],
  },
  {
    date: '2024-01-27',
    timeSlots: [
      {
        slotId: 13,
        start: '06:00',
        end: '10:30',
      },
      {
        slotId: 14,
        start: '19:30',
        end: '22:00',
      },
    ],
  },
  {
    date: '2024-03-03',
    timeSlots: [
      {
        slotId: 15,
        start: '06:00',
        end: '10:30',
      },
      {
        slotId: 16,
        start: '16:30',
        end: '22:00',
      },
    ],
  },
  {
    date: '2024-03-10',
    timeSlots: [
      {
        slotId: 17,
        start: '06:00',
        end: '10:30',
      },
      {
        slotId: 18,
        start: '19:30',
        end: '22:00',
      },
    ],
  },
  {
    date: '2024-03-17',
    timeSlots: [
      {
        slotId: 19,
        start: '06:00',
        end: '10:30',
      },
      {
        slotId: 20,
        start: '19:30',
        end: '22:00',
      },
    ],
  },
  {
    date: '2024-03-24',
    timeSlots: [
      {
        slotId: 21,
        start: '06:00',
        end: '10:30',
      },
      {
        slotId: 22,
        start: '19:30',
        end: '22:00',
      },
    ],
  },
  {
    date: '2024-03-31',
    timeSlots: [
      {
        slotId: 23,
        start: '06:00',
        end: '10:30',
      },
      {
        slotId: 24,
        start: '14:30',
        end: '15:00',
      },
      {
        slotId: 25,
        start: '17:30',
        end: '19:00',
      },
    ],
  },
  //range 데이터
  // {
  //   date: '2024-12-30',
  //   timeSlots: [
  //     {
  //       slotId: 1,
  //       start: '01:00',
  //       end: '05:30',
  //     },
  //     {
  //       slotId: 2,
  //       start: '12:30',
  //       end: '16:00',
  //     },
  //   ],
  // },
  // {
  //   date: '2024-12-31',
  //   timeSlots: [
  //     {
  //       slotId: 3,
  //       start: '06:00',
  //       end: '10:30',
  //     },
  //     {
  //       slotId: 4,
  //       start: '17:30',
  //       end: '22:00',
  //     },
  //   ],
  // },
  // {
  //   date: '2025-01-01',
  //   timeSlots: [
  //     {
  //       slotId: 5,
  //       start: '09:00',
  //       end: '13:00',
  //     },
  //     {
  //       slotId: 6,
  //       start: '17:30',
  //       end: '22:00',
  //     },
  //   ],
  // },
  // {
  //   date: '2025-01-02',
  //   timeSlots: [
  //     {
  //       slotId: 7,
  //       start: '04:30',
  //       end: '10:00',
  //     },
  //     {
  //       slotId: 8,
  //       start: '13:30',
  //       end: '16:00',
  //     },
  //   ],
  // },
  // {
  //   date: '2025-01-03',
  //   timeSlots: [
  //     {
  //       slotId: 9,
  //       start: '06:00',
  //       end: '10:30',
  //     },
  //     {
  //       slotId: 10,
  //       start: '17:30',
  //       end: '22:00',
  //     },
  //   ],
  // },
  // {
  //   date: '2025-01-04',
  //   timeSlots: [
  //     {
  //       slotId: 11,
  //       start: '06:00',
  //       end: '10:30',
  //     },
  //     {
  //       slotId: 12,
  //       start: '16:30',
  //       end: '22:00',
  //     },
  //   ],
  // },
  // {
  //   date: '2025-01-05',
  //   timeSlots: [
  //     {
  //       slotId: 13,
  //       start: '06:00',
  //       end: '10:30',
  //     },
  //     {
  //       slotId: 14,
  //       start: '19:30',
  //       end: '22:00',
  //     },
  //   ],
  // },
  // {
  //   date: '2025-01-06',
  //   timeSlots: [
  //     {
  //       slotId: 15,
  //       start: '06:00',
  //       end: '10:30',
  //     },
  //     {
  //       slotId: 16,
  //       start: '16:30',
  //       end: '22:00',
  //     },
  //   ],
  // },
  // {
  //   date: '2025-01-07',
  //   timeSlots: [
  //     {
  //       slotId: 17,
  //       start: '06:00',
  //       end: '10:30',
  //     },
  //     {
  //       slotId: 18,
  //       start: '19:30',
  //       end: '22:00',
  //     },
  //   ],
  // },
  // {
  //   date: '2025-01-08',
  //   timeSlots: [
  //     {
  //       slotId: 19,
  //       start: '06:00',
  //       end: '10:30',
  //     },
  //     {
  //       slotId: 20,
  //       start: '19:30',
  //       end: '22:00',
  //     },
  //   ],
  // },
]

export default function SchedulePage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [title, setTitle] = useState('제목 없는 일정')
  const [isPurple, setIsPurple] = useState(false)
  const [isEdit] = useState(true)
  const [, setDateTime] = useState<
    { date: string; timeSlots: { start: string; end: string }[] }[]
  >([])
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [, setStartTime] = useState<string | null>(null)
  const [, setEndTime] = useState<string | null>(null)
  const [updateData, setUpdateData] = useState<
    {
      slotId: number
      number: number
      startDate: string
      startTime: string
      endTime: string
    }[]
  >([])

  const [dateCounts, setDateCounts] = useState<number[]>([])
  const [groupedDate, setGroupedDate] = useState<GroupedDate[]>([])
  // const [selectedDates, setSelectedDates] = useState<SelectedDate[]>([])
  const [, setSelectedEditDates] = useState<SelectedDate[]>([])
  const [selectedTimeInfo, setSelectedTimeInfo] = useState<{
    date: string
    startTime: string
    endTime: string
    slotId: number
  } | null>(null)

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
      name: '팀플 대면 모임',
      userId: 2,
      groupId: 1,
      mode: 'week',
      selected: ['mon', 'wed', 'fri'],
      date: [
        ['2024-01-06', 'mon'],
        ['2024-02-08', 'wed'],
        ['2024-01-13', 'mon'],
        ['2024-02-15', 'wed'],
        ['2024-01-20', 'mon'],
        ['2024-02-22', 'wed'],
        ['2024-01-27', 'mon'],
        ['2024-03-03', 'fri'],
        ['2024-03-10', 'fri'],
        ['2024-03-17', 'fri'],
        ['2024-03-24', 'fri'],
        ['2024-03-31', 'fri'],
      ],
      // mode: 'range',
      // selected: null,
      // date: [
      //   ['2024-12-30', 'mon'],
      //   ['2024-12-31', 'tue'],
      //   ['2025-01-01', 'wed'],
      //   ['2025-01-02', 'thu'],
      //   ['2025-01-03', 'fri'],
      //   ['2025-01-04', 'sat'],
      //   ['2025-01-05', 'sun'],
      //   ['2025-01-06', 'mon'],
      //   ['2025-01-07', 'tue'],
      //   ['2025-01-08', 'wed'],
      //   // ['2024-01-09', 'thu'],
      //   // ['2024-01-10', 'fri'],
      //   // ['2024-01-11', 'sat'],
      //   // ['2024-01-12', 'sun'],
      // ],
    },
  ]

  const DAYS_PER_PAGE = 7
  const highlightedIndex =
    highlightedCol !== null
      ? highlightedCol - currentPage * DAYS_PER_PAGE
      : null

  const selectedDates: SelectedDate[] = convertToSelectedDates(scheduleData)
  const mode = scheduleData[0].mode
  const dayofWeek = scheduleData[0].selected
  const month =
    mode === 'range'
      ? currentPage === Math.floor((highlightedCol ?? 0) / DAYS_PER_PAGE)
        ? `${selectedDates[highlightedCol ?? currentPage * DAYS_PER_PAGE]?.month}월`
        : `${selectedDates[currentPage * DAYS_PER_PAGE]?.month}월`
      : `${groupedDate[currentPage]?.date?.[highlightedIndex ?? 0]?.month ?? groupedDate[currentPage]?.date?.[0]?.month}월`

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setIsOpen(false)
  }

  // useEffect(() => {
  //   console.log(`Updated dateTimeData:`, dateTime)

  //   const updatedData = dateTime.flatMap((dateItem, index) => {
  //     console.log(updateData)
  //     const { date, timeSlots } = dateItem

  //     // const day = date.toString().split('-')[2]
  //     console.log(updateData[0])

  //     const startDate = `${new Date().getMonth() + 1} - ${date}`
  //     console.log(`월일 ${startDate}`)

  //     return timeSlots.map((slot) => ({
  //       slotId: index + 1, // 고유 ID 생성
  //       number: index + 1,
  //       startDate,
  //       startTime: slot.start,
  //       endTime: slot.end,
  //     }))
  //   })

  //   setUpdateData(updatedData)
  // }, [dateTime]) // dateTimeData가 변경될 때마다 호출

  const getDateTime = (date: string, start: string, end: string) => {
    setTimeout(() => {
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

          timeSlots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start))

          updated[existingDateIndex].timeSlots = timeSlots
          return updated
        } else {
          newEntry = { date: date, timeSlots: [{ start, end }] }
          return [...prev, newEntry]
        }
      })
      setIsPurple(true)
      setIsOpen(false)
    }, 0) // 비동기로 처리
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle) // 수정된 제목으로 상태 업데이트
  }

  const initializeSelectedDates = useCallback(() => {
    return mockSelectedSchedule.map((dateData) => ({
      day: parseInt(dateData.date.split('-')[2]),
      weekday: new Date(dateData.date).toLocaleDateString('ko-KR', {
        weekday: 'short',
      }),
      month: parseInt(dateData.date.split('-')[1]),
      year: parseInt(dateData.date.split('-')[0]),
    }))
  }, [])

  useEffect(() => {
    if (selectedDates.length === 0) {
      setSelectedEditDates(initializeSelectedDates())
    }
  }, [initializeSelectedDates, selectedDates])

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
  const handleDeleteSchedule = (slotId: number) => {
    // setUpdateData((prev) => prev.filter((item) => item.slotId !== slotId))
    console.log(slotId)

    const deletedSlot = updateData.find((item) => item.slotId === slotId)
    console.log('deletedSlot: ', deletedSlot)

    if (deletedSlot) {
      console.log(`${deletedSlot.slotId} 삭제`)
      console.log(
        `${deletedSlot.slotId}의 일자: ${deletedSlot.startDate} ${deletedSlot.startTime}  - ${deletedSlot.endTime} 삭제`,
      )
    }
  }

  const handleSelectedCol = useCallback(
    (colIndex: number, rowIndex: number) => {
      const actualColIndex = currentPage * DAYS_PER_PAGE + colIndex
      if (rowIndex === -1) {
        setHighlightedCol(null)
        return 0
      }

      // 시간 관련 로직
      const pairStartRow = Math.floor(rowIndex / 2) * 2
      const pairEndRow = pairStartRow + 1

      const getStartLabel = (rowIndex: number) => {
        const hours = Math.floor(rowIndex / 2)
        const minutes = (rowIndex % 2) * 30
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      }

      const getEndLabel = (rowIndex: number) => {
        const nextRowIndex = rowIndex + 1
        const hours = Math.floor(nextRowIndex / 2)
        const minutes = (nextRowIndex % 2) * 30
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      }

      const DefaultStartTime = getStartLabel(pairStartRow)
      const DefaultEndTime = getEndLabel(pairEndRow)

      setStartTime(DefaultStartTime)
      setEndTime(DefaultEndTime)

      setHighlightedCol(actualColIndex)
      // console.log('highlightedCol:', actualColIndex)
      setIsOpen(true)
    },
    [currentPage],
  )

  const handleDateCountsChange = (
    counts: number[],
    groupedData: GroupedDate[],
  ) => {
    setDateCounts(counts)
    setGroupedDate(groupedData)
  }

  const handleTimeSelect = (
    colIndex: number,
    startTime: string,
    endTime: string,
    slotId: number,
  ) => {
    if (mode === 'week') {
      if (colIndex >= 0 && groupedDate[currentPage]?.date?.[colIndex]) {
        const selectedDate = groupedDate[currentPage]?.date?.[colIndex]
        if (!selectedDate) return
        setTimeout(() => {
          setSelectedTimeInfo({
            date: `${selectedDate.month}월 ${selectedDate.day}일`,
            // date: `${selectedDate.year}년 ${selectedDate.month}월 ${selectedDate.day}일`,
            startTime,
            endTime,
            slotId,
          })
        }, 0)
      }
    } else if (mode === 'range') {
      const actualColIndex = currentPage * DAYS_PER_PAGE + colIndex
      if (colIndex >= 0 && selectedDates[actualColIndex]) {
        const selectedDate = selectedDates[actualColIndex]
        console.log('rangemodecol', actualColIndex)
        console.log('rangemode', selectedDate)
        if (!selectedDate) return
        setTimeout(() => {
          setSelectedTimeInfo({
            date: `${selectedDate.month}월 ${selectedDate.day}일`,
            startTime,
            endTime,
            slotId,
          })
        }, 0)
      }
    }
  }

  useEffect(() => {
    if (selectedTimeInfo) {
      setUpdateData((prev) => {
        const updatedData = prev.map((item) =>
          item.slotId === selectedTimeInfo.slotId
            ? {
                ...item,
                startDate: selectedTimeInfo.date,
                startTime: selectedTimeInfo.startTime,
                endTime: selectedTimeInfo.endTime,
              }
            : item,
        )

        if (
          !updatedData.some((item) => item.slotId === selectedTimeInfo.slotId)
        ) {
          updatedData.push({
            slotId: selectedTimeInfo.slotId,
            number: prev.length + 1,
            startDate: selectedTimeInfo.date,
            startTime: selectedTimeInfo.startTime,
            endTime: selectedTimeInfo.endTime,
          })
        }

        // console.log('updatedData', updatedData)
        return updatedData
      })
    }
  }, [selectedTimeInfo])

  return (
    <div className="flex flex-col h-full bg-white">
      <Title
        buttonText="완료"
        initialTitle={title}
        onTitleChange={handleTitleChange}
        isEdit={isEdit}
      />
      <EditSelectedDays
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
        <EditTimeStamp
          mode={mode}
          dateCounts={dateCounts}
          handleActiveTime={handleActiveTime}
          selectedDates={selectedDates}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          handleSelectedCol={handleSelectedCol}
          getDateTime={getDateTime}
          groupedDate={groupedDate}
          mockSelectedSchedule={mockSelectedSchedule}
          handleTimeSelect={handleTimeSelect}
          isBottomSheetOpen={isOpen}
        />
      </div>
      <SelectedBottom isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div>
          <EditItem
            slotId={selectedTimeInfo?.slotId || 0}
            date={selectedTimeInfo?.date || ''}
            // date={
            //   highlightedCol !== null && highlightedIndex !== null
            //     ? mode === 'range'
            //       ? `${selectedDates[highlightedCol]?.month}월 ${selectedDates[highlightedCol]?.day}일`
            //       : (() => {
            //           const month =
            //             groupedDate[currentPage]?.date?.[highlightedIndex]
            //               ?.month
            //           const day =
            //             groupedDate[currentPage]?.date?.[highlightedIndex]?.day
            //           return month && day ? `${month}월 ${day}일` : ''
            //         })()
            //     : ''
            // }
            startTime={selectedTimeInfo?.startTime || ''}
            endTime={selectedTimeInfo?.endTime || ''}
            onDelete={(slotId) => handleDeleteSchedule(slotId)}
          />
        </div>
      </SelectedBottom>
    </div>
  )
}
