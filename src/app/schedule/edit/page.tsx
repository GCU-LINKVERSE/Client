'use client'

import { useState, useEffect, useCallback } from 'react'
import EditSelectedDays from '@/components/Header/EditSelectedDays'
import Title from '@/components/Header/Title'
import EditTimeStamp from '@/components/Body/EditTimeStamp'
import SelectedBottom from '@/components/Footer/BottomSheet/SelectedBottom'
import { EditItem } from '@/components/Footer/ListItem/EditItem'
import { useSurveyStore } from '@/store/surveyStore'
import axios from 'axios'

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

export default function SchedulePage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [, setTitle] = useState('제목 없는 일정')
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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
  const { selectedSurveyId } = useSurveyStore() // Zustand에서 가져온 그룹아이디
  // console.log('zustand에서 가져온 surveyId', selectedSurveyId)

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
  const [scheduleData, setScheduleData] = useState<ScheduleData[]>([])

  const [selectedSchedule, setSelectedSchedule] = useState<DateData[]>([])
  const [, setSelectedTimeslot] = useState<DateData[]>([])

  const getHeaderData = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/survey/${selectedSurveyId}`,
        { withCredentials: true },
      )

      console.log('header data', res.data.data)

      // scheduleData 저장
      setScheduleData([res.data.data])

      // 받아온 데이터로 selectedSchedule 생성
      const dates = res.data.data.date.map(([fullDate]: [string, string]) => ({
        date: fullDate,
        timeSlots: [], // 초기에는 빈 배열로 설정
      }))

      setSelectedSchedule(dates)
      // console.log('selectedSchedule', selectedSchedule)
    } catch (error) {
      console.error('header data get 실패', error)
    }
  }, [API_BASE_URL, selectedSurveyId])

  const getTimeslotData = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/timeslot/${selectedSurveyId}/edit`,
        { withCredentials: true },
      )
      console.log('timeslot data', res.data.data.data)

      // selectedSchedule 업데이트
      setSelectedSchedule((prevSchedule) => {
        return prevSchedule.map((scheduleItem) => {
          // 현재 날짜와 일치하는 타임슬롯 데이터 찾기
          const matchingTimeslot = res.data.data.data.find(
            (timeslot: DateData) => timeslot.date === scheduleItem.date,
          )

          // 일치하는 데이터가 있으면 해당 타임슬롯으로 업데이트, 없으면 기존 배열 유지
          return {
            date: scheduleItem.date,
            timeSlots: matchingTimeslot
              ? matchingTimeslot.timeSlots
              : scheduleItem.timeSlots,
          }
        })
      })

      // 타임슬롯 데이터 저장
      setSelectedTimeslot(
        Array.isArray(res.data.data.data)
          ? res.data.data.data
          : [res.data.data.data],
      )
    } catch (error) {
      console.error('timeslot data get 실패', error)
    }
  }, [API_BASE_URL, selectedSurveyId])

  // getHeaderData, getTimeslotData 설정
  useEffect(() => {
    const fetchData = async () => {
      await getHeaderData()
      await getTimeslotData()
    }

    if (selectedSurveyId) {
      fetchData()
    }
  }, [getHeaderData, getTimeslotData, selectedSurveyId])

  const DAYS_PER_PAGE = 7
  const highlightedIndex =
    highlightedCol !== null
      ? highlightedCol - currentPage * DAYS_PER_PAGE
      : null

  const selectedDates: SelectedDate[] = convertToSelectedDates(scheduleData)
  const mode = scheduleData[0]?.mode
  const dayofWeek = scheduleData[0]?.selected
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
    return selectedSchedule.map((dateData) => ({
      day: parseInt(dateData.date.split('-')[2]),
      weekday: new Date(dateData.date).toLocaleDateString('ko-KR', {
        weekday: 'short',
      }),
      month: parseInt(dateData.date.split('-')[1]),
      year: parseInt(dateData.date.split('-')[0]),
    }))
  }, [selectedSchedule])

  useEffect(() => {
    // scheduleData가 비어있고 selectedSchedule이 있을 때만 초기화
    if (scheduleData.length === 0 && selectedSchedule.length > 0) {
      setSelectedEditDates(initializeSelectedDates())
    }
  }, [scheduleData, selectedSchedule, initializeSelectedDates])

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
  const handleDeleteSchedule = async (slotId: number) => {
    const deletedSlot = updateData.find((item) => item.slotId === slotId)
    // console.log('deletedSlot: ', deletedSlot)

    if (deletedSlot) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/api/timeslot/${selectedSurveyId}/delete/${deletedSlot.slotId}`,
          {
            withCredentials: true, // 쿠키 전송 허용
          },
        )
        console.log('타임슬롯 정보 삭제 성공:', response.data.data)

        // 데이터 다시 불러오기
        const fetchData = async () => {
          await getHeaderData()
          await getTimeslotData()
        }

        await fetchData() // 데이터 리로드

        // updateData 상태 업데이트
        // setUpdateData((prev) => prev.filter((item) => item.slotId !== slotId))

        // console.log(`${deletedSlot.slotId} 삭제`)
        // console.log(
        //   `${deletedSlot.slotId}의 일자: ${deletedSlot.startDate} ${deletedSlot.startTime}  - ${deletedSlot.endTime} 삭제`,
        // )
      } catch (error) {
        console.error('타임슬롯 정보 삭제 실패:', error)
        return []
      }
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

  const handleDateCountsChange = useCallback(
    (counts: number[], groupedData: GroupedDate[]) => {
      setDateCounts(counts)
      setGroupedDate(groupedData)
    },
    [],
  )

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
        // console.log('rangemodecol', actualColIndex)
        // console.log('rangemode', selectedDate)
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
        initialTitle={scheduleData[0]?.title}
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
          mockSelectedSchedule={selectedSchedule}
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
