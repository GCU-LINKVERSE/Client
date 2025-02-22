'use client'

import { useState, useEffect, useCallback } from 'react'
import Title from '@/components/Header/Title'
import DecideSelectedDays from '@/components/Header/DecideSelectedDays'
import DecideTimeStamp from '@/components/Body/DecideTimeStamp'
import SelectedBottom from '@/components/Footer/BottomSheet/SelectedBottom'
import { SelectItem } from '@/components/Footer/ListItem/SelectItem'
import CustomModal from '@/components/Modals/CustomModal'
import DecideBottom from '@/components/Footer/BottomSheet/DecideBottom'
import { ScheduleItem } from '@/components/Footer/ListItem/ScheduleItem'
import { useRouter } from 'next/navigation'
import { useSurveyStore } from '@/store/surveyStore'
import { useGroupStore } from '@/store/groupStore'
import axios from 'axios'
import { useNotificationStore } from '@/store/notificationStore'
import Image from 'next/image'

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

interface TimeSlot {
  start: string
  end: string
  selectedById: string[]
  selectedByName: string[]
}

interface DateData {
  date: string
  timeSlots: TimeSlot[]
}

interface PrevScheduleData {
  title: string
  userId: number
  groupId: number
  mode: string
  selected: string[] | null
  dateData: DateData[]
}

interface ScheduleData {
  title: string // 일정 이름
  userId: number // 사용자 ID
  groupId: number // 그룹 ID
  mode: string
  selected: string[] | null
  date: [string, string][] // 날짜 배열: [날짜, 요일]의 배열
}

interface Participants {
  id: number
  name: string
  image: string
  scheduleComplete: string
  locationComplete: string
  type: string
}

export default function Page() {
  const [isPurple, setIsPurple] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [finalData, setFinalData] = useState<
    {
      id: string
      number: number
      startDate: string
      startTime: string
      endTime: string
    }[]
  >([])
  const [dateTime, setDateTime] = useState<
    { date: string; timeSlots: { start: string; end: string }[] }[]
  >([])

  const [isOpen, setIsOpen] = useState(false)
  const [dateCounts, setDateCounts] = useState<number[]>([])
  const [groupedDate, setGroupedDate] = useState<GroupedDate[]>([])

  const [warning, setWarning] = useState(false)
  const [decideBottomOpen, setDecideBottomOpen] = useState(false)

  const router = useRouter()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const { selectedSurveyId } = useSurveyStore() // Zustand에서 가져옴
  const { selectedGroupId } = useGroupStore()

  const [decideData, setDecideData] = useState<PrevScheduleData[]>([])
  const [participants, setParticipants] = useState<Participants[]>()

  const [title, setTitle] = useState<string>('')
  const [err, setErr] = useState(false)

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  )

  // 모든 인원의 survey 정보 받아오기
  useEffect(() => {
    if (!selectedSurveyId || !selectedGroupId) return

    // console.log('surveyId', selectedSurveyId)
    const getSurveyData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/timeslot/${selectedSurveyId}`,
          {
            withCredentials: true, // 쿠키 전송을 위해 필요
          },
        )

        console.log('decide data', res.data.data)
        setDecideData([res.data.data])
        setTitle(res.data.data.title)
      } catch (error) {
        setErr(true)
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 404) {
            // console.log(404)
            showNotification(
              '모든 모임원이 가능 시간을 입력하지 않아서 일정을 조율할 수 없어요.',
            )
            router.push('/schedule/select')
          } else {
            console.log('survey data get 실패', error)
          }
        }
      }
    }

    // 멤버 불러오기
    const getMemberData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/group-members/List/${selectedGroupId}`,
          {
            withCredentials: true, // 쿠키 전송을 위해 필요
          },
        )

        console.log('멤버 불러오기 성공', res.data.data)
        const member = res.data.data
        setParticipants(member)
      } catch (error) {
        console.log('멤버 불러오기 실패', error)
      }
    }

    getMemberData()
    getSurveyData()
  }, [
    API_BASE_URL,
    selectedSurveyId,
    selectedGroupId,
    router,
    showNotification,
  ])

  // dateTime(최종 선택 결과)에서 각 타임슬롯별로 가능한 유저ID 추가하는 함수 - userIds
  function transformToReqData(
    dateTime: { date: string; timeSlots: { start: string; end: string }[] }[],
    decideData: PrevScheduleData[],
    title: string,
  ) {
    return {
      title,
      timeSlots: dateTime.flatMap(({ date, timeSlots }) => {
        return timeSlots.map(({ start, end }) => {
          // 모든 `decideData`에서 해당 날짜의 `timeSlots` 찾기
          const matchingDecideSlots = decideData.flatMap(
            (d) =>
              d.dateData.find((dData) => dData.date === date)?.timeSlots || [],
          )

          // 겹치는 시간대의 `selectedById` 정보를 `userIds`로 추가
          const userIds = matchingDecideSlots
            .filter(
              (decideSlot) =>
                (start >= decideSlot.start && start < decideSlot.end) || // 시작 시간이 겹치는 경우
                (end > decideSlot.start && end <= decideSlot.end) || // 끝 시간이 겹치는 경우
                (start <= decideSlot.start && end >= decideSlot.end), // `dateTime`이 `decideData` 전체를 포함하는 경우
            )
            .flatMap((decideSlot) => decideSlot.selectedById || [])

          // UTC 변환을 명확하게 지정
          const startDateObj = new Date(`${date}T${start}:00`)
          const endDateObj = new Date(`${date}T${end}:00`)

          // 날짜와 시간에서 UTC 변환
          const startDate = new Date(
            Date.UTC(
              startDateObj.getFullYear(),
              startDateObj.getMonth(),
              startDateObj.getDate(),
              startDateObj.getHours(),
              startDateObj.getMinutes(),
            ),
          ).toISOString()

          const endDate = new Date(
            Date.UTC(
              endDateObj.getFullYear(),
              endDateObj.getMonth(),
              endDateObj.getDate(),
              endDateObj.getHours(),
              endDateObj.getMinutes(),
            ),
          ).toISOString()

          return {
            startDate,
            endDate,
            userIds: [...new Set(userIds)], // 중복 제거
          }
        })
      }),
    }
  }

  const onClickConfirm = async () => {
    if (isPurple && !decideBottomOpen) {
      setDecideBottomOpen(true)
    } else if (!isPurple && !decideBottomOpen) {
      setWarning(true)
    } else if (isPurple && decideBottomOpen) {
      //console.log('dateTime', dateTime)
      // console.log('decideData', decideData)
      // 요청 바디 형식에 맞춰 변경
      const reqBody = transformToReqData(
        dateTime,
        decideData,
        title || decideData[0]?.title,
      )

      console.log('req', reqBody)

      // api 요청
      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/schedule/${selectedSurveyId}/decide`,
          reqBody,
          {
            withCredentials: true, // 쿠키 전송을 위해 필요
          },
        )

        console.log('일정 확정 성공', res)
        router.push('/schedule')
        showNotification('모임 확정 완료!')
      } catch (error) {
        console.log('일정 확정 실패', error)
      }
    }
  }

  const DAYS_PER_PAGE = 7
  const highlightedIndex =
    highlightedCol !== null
      ? highlightedCol - currentPage * DAYS_PER_PAGE
      : null

  function transformDateTime(decideData: PrevScheduleData[]) {
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

    // Helper function to get the day name for a given date
    function getDayName(dateStr: string) {
      const date = new Date(dateStr)
      return dayNames[date.getUTCDay()]
    }

    return decideData.map(
      ({ title, userId, groupId, mode, selected, dateData }) => {
        const date = dateData.flatMap(({ date }) => [[date, getDayName(date)]])

        return {
          title,
          userId,
          groupId,
          mode,
          selected,
          date,
        }
      },
    )
  }

  const transformData = transformDateTime(decideData).map((data) => ({
    ...data,
    date: data.date as [string, string][],
  }))

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
              .padStart(
                2,
                '0',
              )}:${(mergedStart % 60).toString().padStart(2, '0')}`,
            end: `${Math.floor(mergedEnd / 60)
              .toString()
              .padStart(
                2,
                '0',
              )}:${(mergedEnd % 60).toString().padStart(2, '0')}`,
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
    //console.log(`Updated dateTimeData:`, dateTime)

    // 먼저 모든 날짜와 시간대를 하나의 배열로 변환
    const allTimeSlots = dateTime
      .sort((a, b) => a.date.localeCompare(b.date)) // 날짜순 정렬
      .reduce(
        (acc, dateItem) => {
          const month = dateItem.date.split('-')[1]
          const day = dateItem.date.split('-')[2].padStart(2, '0')
          const startDate = `${month}월 ${day}일`

          // 각 날짜의 timeSlots을 시간순 정렬
          const sortedTimeSlots = dateItem.timeSlots
            .sort((a, b) => a.start.localeCompare(b.start))
            .map((slot) => ({
              date: dateItem.date,
              startDate,
              startTime: slot.start,
              endTime: slot.end,
            }))

          return [...acc, ...sortedTimeSlots]
        },
        [] as Array<{
          date: string
          startDate: string
          startTime: string
          endTime: string
        }>,
      )

    // 정렬된 전체 배열에 번호 부여
    const transformedData = allTimeSlots.map((slot, index) => ({
      id: `${index}`,
      number: index + 1,
      startDate: slot.startDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }))

    setFinalData(transformedData)
    //console.log('transformedData', transformedData)

    if (dateTime.length === 0) {
      setIsPurple(false)
    }
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
    transformData: ScheduleData[],
  ): SelectedDate[] {
    return transformData.flatMap((schedule) =>
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

  const selectedDates: SelectedDate[] = convertToSelectedDates(transformData)
  const mode = decideData[0]?.mode
  const dayofWeek = decideData[0]?.selected
  const month =
    mode === 'range'
      ? currentPage === Math.floor((highlightedCol ?? 0) / DAYS_PER_PAGE)
        ? `${selectedDates[highlightedCol ?? currentPage * DAYS_PER_PAGE]?.month}월`
        : `${selectedDates[currentPage * DAYS_PER_PAGE]?.month}월`
      : `${groupedDate[currentPage]?.date?.[highlightedIndex ?? 0]?.month ?? groupedDate[currentPage]?.date?.[0]?.month}월`

  // const router = useRouter()

  const handleDeleteSchedule = (id: string | undefined) => {
    if (id === undefined) return

    // finalData에서 해당 항목 찾기
    const itemToDelete = finalData.find((item) => item.id === id)
    if (!itemToDelete) return

    // dateTime에서 해당 날짜와 시간대 찾아서 삭제
    setDateTime((prevDateTime) => {
      return prevDateTime
        .map((dateItem) => {
          // 날짜가 일치하는 항목 찾기
          if (
            dateItem.date ===
            itemToDelete.startDate.replace(/(\d+)월\s+(\d+)일/, '2025-$1-$2')
          ) {
            // 해당 시간대 제거
            const updatedTimeSlots = dateItem.timeSlots.filter(
              (slot) =>
                !(
                  slot.start === itemToDelete.startTime &&
                  slot.end === itemToDelete.endTime
                ),
            )

            // timeSlots가 비어있으면 해당 날짜 항목 제거
            if (updatedTimeSlots.length === 0) {
              return null
            }

            return {
              ...dateItem,
              timeSlots: updatedTimeSlots,
            }
          }
          return dateItem
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
    })

    // finalData 업데이트
    setFinalData((prevFinalData) => {
      const newData = prevFinalData.filter((item) => item.id !== id)
      // 번호 재할당
      return newData.map((item, index) => ({
        ...item,
        id: `${index}`,
        number: index + 1,
      }))
    })
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {err && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Image src="/loadingspinner.gif" alt="로딩" width={100} height={50} />
        </div>
      )}
      <Title
        buttonText={'확정'}
        initialTitle={decideData[0]?.title}
        onTitleChange={handleTitleChange}
        isPurple={isPurple}
        onClickTitleButton={onClickConfirm}
      />
      <DecideSelectedDays
        selectedDates={selectedDates}
        month={month}
        mode={mode}
        dayofWeek={dayofWeek}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        highlightedCol={highlightedCol}
        onDateCountsChange={handleDateCountsChange}
        isPurple={isPurple}
        participants={participants ?? []}
        title={title}
      />
      <div className="flex-grow overflow-hidden mt-2">
        <DecideTimeStamp
          selectedDates={selectedDates}
          currentPage={currentPage}
          mode={mode}
          groupedDate={groupedDate}
          onPageChange={handlePageChange}
          dateCounts={dateCounts}
          handleSelectedCol={handleSelectedCol}
          handleActiveTime={handleActiveTime}
          getDateTime={getDateTime}
          isBottomSheetOpen={isOpen}
          mockDateTime={decideData[0]?.dateData ?? []}
          dateTime={dateTime}
        />
      </div>
      {!decideBottomOpen && (
        <div className="z-[1000]">
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
                            groupedDate[currentPage]?.date?.[highlightedIndex]
                              ?.day
                          return month && day ? `${month}월 ${day}일` : ''
                        })()
                    : ''
                }
                startTime={`${startTime}`}
                endTime={`${endTime}`}
              />
            </div>
          </SelectedBottom>
        </div>
      )}

      <CustomModal
        isFooter={true}
        footerText="확인"
        onNext={() => setWarning(false)}
        open={warning}
        onOpenChange={() => setWarning(!warning)}
      >
        <div className="text-center pt-4">
          한 개 이상 일정을 선택해야 <br />
          확정할 수 있어요
        </div>
      </CustomModal>

      <div className="z-[1000]">
        <DecideBottom
          isOpen={decideBottomOpen}
          onClose={() => setDecideBottomOpen(false)}
        >
          {finalData.map((item) => (
            <ScheduleItem
              key={item.id}
              id={item.id}
              number={item.number}
              startDate={item.startDate}
              startTime={item.startTime}
              endTime={item.endTime}
              onDelete={handleDeleteSchedule}
            />
          ))}
        </DecideBottom>
      </div>
    </div>
  )
}
