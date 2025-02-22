'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Title from '@/components/Header/Title'
import SelectedDays from '@/components/Header/SelectedDays'
import TimeStamp from '@/components/Body/TimeStamp'
import SelectedBottom from '@/components/Footer/BottomSheet/SelectedBottom'
import { SelectItem } from '@/components/Footer/ListItem/SelectItem'
import CustomModal from '@/components/Modals/CustomModal'
import { ProfileLarge } from '@/components/Profiles/ProfileLarge'
import MembersDefault from '@/components/Modals/MembersDefault'
import { useRouter } from 'next/navigation'
import { useSurveyStore } from '@/store/surveyStore'
import { useGroupStore } from '@/store/groupStore'
import axios from 'axios'

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
  mode: string
  selected: string[] | null
  date: [string, string][] // 날짜 배열: [날짜, 요일]의 배열
}

export default function Page() {
  const { selectedSurveyId } = useSurveyStore()
  const { selectedGroupId } = useGroupStore()
  // console.log('zustand에서 가져온 surveyId', selectedSurveyId)
  const [title, setTitle] = useState('제목 없는 일정')
  const [currentPage, setCurrentPage] = useState(0)
  const [highlightedCol, setHighlightedCol] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [dateCounts, setDateCounts] = useState<number[]>([])
  const [groupedDate, setGroupedDate] = useState<GroupedDate[]>([])
  const [surveyData, setSurveyData] = useState<ScheduleData[]>([])
  const [confirmedData, setConfirmedData] = useState<
    { date: string; timeSlots: { start: string; end: string }[] }[]
  >([])
  const [dateTime, setDateTime] =
    useState<{ date: string; timeSlots: { start: string; end: string }[] }[]>(
      confirmedData,
    )
  const [participants, setParticipants] = useState<
    {
      id: number
      name: string
      image: string
      type: string
      scheduleComplete: string
    }[]
  >([])
  const [isPurple, setIsPurple] = useState(false)

  const DAYS_PER_PAGE = 7
  const highlightedIndex =
    highlightedCol !== null
      ? highlightedCol - currentPage * DAYS_PER_PAGE
      : null

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const getMemberList = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/group-members/List/${selectedGroupId}`,
        {
          withCredentials: true, // 쿠키 전송을 위해 필요
        },
      )
      console.log('참여자 리스트 get 성공', res.data)
      setParticipants(res.data.data)
    } catch (error) {
      console.log('참여자 리스트 get 실패', error)
    }
  }, [API_BASE_URL, selectedGroupId])

  useEffect(() => {
    if (!selectedGroupId) return
    // console.log('groupId', selectedGroupId)
    getMemberList()
  }, [API_BASE_URL, getMemberList, selectedGroupId])

  const patchApi = useMemo(
    () => ({
      updateMemberState: async (groupId: number, state: string) => {
        try {
          const response = await axios.patch(
            `${API_BASE_URL}/api/group-members/schedule`,
            { groupId, state },
            { withCredentials: true },
          )
          // console.log('status', state)
          console.log('멤버 상태 업데이트 성공', response)
          getMemberList()
        } catch (error) {
          console.log('멤버 상태 업데이트 실패', error)
        }
      },
    }),
    [API_BASE_URL, getMemberList],
  )

  const selectApi = {
    createTimeSlot: async (
      surveyId: number,
      slotDate: string,
      startTime: string,
      endTime: string,
    ) => {
      // console.log('surveyId', surveyId)
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/timeslot/${surveyId}`,
          {
            slotDate: slotDate,
            startTime: startTime,
            endTime: endTime,
          },
          {
            withCredentials: true, // 쿠키 전송을 위해 필요
          },
        )
        // console.log('타임슬롯', slotDate, startTime, endTime)
        console.log('타임슬롯 생성 성공', response)
        if (selectedGroupId) {
          patchApi.updateMemberState(selectedGroupId, 'ONGOING')
        }
      } catch (error) {
        console.log('타임슬롯 생성 실패', error)
      }
    },
  }

  useEffect(() => {
    if (!selectedSurveyId) return
    // console.log('surveyId', selectedSurveyId)
    const getSurveyData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/survey/${selectedSurveyId}`,
          {
            withCredentials: true, // 쿠키 전송을 위해 필요
          },
        )

        console.log('survey data', res.data.data)
        setSurveyData([res.data.data])
      } catch (error) {
        console.log('survey data get 실패', error)
      }
    }

    getSurveyData()
  }, [API_BASE_URL, selectedSurveyId])

  useEffect(() => {
    if (!selectedSurveyId) return
    // console.log('surveyId', selectedSurveyId)
    const getSavedSlot = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/timeslot/${selectedSurveyId}/select`,
          {
            withCredentials: true, // 쿠키 전송을 위해 필요
          },
        )
        console.log('Saved slot data get 성공', res.data)
        setConfirmedData(res.data.data)
        if (res.data.data.length > 0 && selectedGroupId) {
          setIsPurple(true)
          patchApi.updateMemberState(selectedGroupId, 'ONGOING')
        }
        if (res.data.data.length == 0 && selectedGroupId) {
          patchApi.updateMemberState(selectedGroupId, 'INCOMPLETE')
        }
      } catch (error) {
        console.log('Saved slot data get 실패', error)
      }
    }

    getSavedSlot()
  }, [API_BASE_URL, patchApi, selectedGroupId, selectedSurveyId])

  useEffect(() => {
    setDateTime(confirmedData)
  }, [confirmedData])

  const patchCompletedStatus = () => {
    if (selectedGroupId) {
      patchApi.updateMemberState(selectedGroupId, 'COMPLETED')
    }
  }

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

  const getDateTime = async (date: string, start: string, end: string) => {
    setDateTime((prev) => {
      // console.log('setDateTime 호출', prev)
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

        const postTimeSlot = {
          slotDate: date,
          startTime: newEntry.timeSlots[0].start,
          endTime: newEntry.timeSlots[0].end,
        }

        if (selectedSurveyId !== null) {
          // console.log('Post할 항목:', postTimeSlot)
          selectApi.createTimeSlot(
            selectedSurveyId,
            postTimeSlot.slotDate,
            postTimeSlot.startTime,
            postTimeSlot.endTime,
          )
        }

        updated[existingDateIndex].timeSlots = timeSlots
        return updated
      } else {
        newEntry = { date: date, timeSlots: [{ start, end }] }
        if (selectedSurveyId !== null) {
          // console.log('Post할 항목:', newEntry)
          selectApi.createTimeSlot(selectedSurveyId, date, start, end)
        }
        return [...prev, newEntry]
      }
    })
    setIsPurple(true)
    setIsOpen(false)
  }

  useEffect(() => {
    // console.log(`Updated dateTimeData:`, dateTime)
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

  function convertToSelectedDates(surveyData: ScheduleData[]): SelectedDate[] {
    return (
      surveyData[0]?.date?.map(([fullDate, weekday]) => {
        const [year, month, day] = fullDate.split('-').map(Number)
        return {
          year,
          month,
          day,
          weekday: weekdayMap[weekday],
        }
      }) || []
    )
  }

  const selectedDates: SelectedDate[] = convertToSelectedDates(surveyData)
  const mode = surveyData[0]?.mode
  const dayofWeek = surveyData[0]?.selected
  const month =
    mode === 'range'
      ? currentPage === Math.floor((highlightedCol ?? 0) / DAYS_PER_PAGE)
        ? `${selectedDates[highlightedCol ?? currentPage * DAYS_PER_PAGE]?.month}월`
        : `${selectedDates[currentPage * DAYS_PER_PAGE]?.month}월`
      : `${groupedDate[currentPage]?.date?.[highlightedIndex ?? 0]?.month ?? groupedDate[currentPage]?.date?.[0]?.month}월`

  // console.log('selectedGroupID', selectedGroupId)

  const router = useRouter()
  // 완료 버튼 누르면 나오는 일정 입력 중 모달
  const [isToDecideModal, setIsToDecideModal] = useState(false)
  const [isNextOpen, setIsNextOpen] = useState(false)

  const otherParticipants = participants.filter((p) => !p.type.includes('&my'))

  const allOthersCompleted = otherParticipants.every(
    (p) => p.scheduleComplete === 'COMPLETED',
  )

  const handleToDecideModal = () => {
    // getMemberList()
    if (isPurple) {
      patchCompletedStatus()
      if (isGroupLeader && allOthersCompleted) {
        router.push('/schedule/decide')
      } else {
        // getMemberList()
        setIsToDecideModal(true)
        setIsExpanded(false)
        setIsDanger(false)
      }
    } else {
      // getMemberList()
      setIsNextOpen(true)
    }
  }

  const handleNextModal = () => {
    patchCompletedStatus()
    if (isGroupLeader && allOthersCompleted) {
      router.push('/schedule/decide')
    }
    setIsNextOpen(false)
    // getMemberList()
    setIsToDecideModal(true)
  }

  const handleOpenChange = () => {
    setIsToDecideModal(!isToDecideModal)
    if (isToDecideModal) {
      setIsExpanded(false)
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
    const hasIncompleteMember = participants.some(
      (participant) => !participant.scheduleComplete,
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
  const [isGroupLeader, setIsGroupLeader] = useState(false)

  useEffect(() => {
    if (!selectedGroupId) {
      setIsGroupLeader(false) // selectedGroupId가 없을 때 초기화
      return
    }
    // console.log('groupId', selectedGroupId)
    const getGroupLeader = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/members/creator/check/${selectedGroupId}`,
          {
            withCredentials: true, // 쿠키 전송을 위해 필요
          },
        )
        console.log('모임장 여부 get 성공', res.data)
        setIsGroupLeader(res.data.data)
      } catch (error) {
        console.log('모임장 여부 get 실패', error)
      }
    }

    getGroupLeader()
  }, [API_BASE_URL, selectedGroupId])

  return (
    <div>
      <Title
        buttonText={'완료'}
        initialTitle={surveyData[0]?.title || title}
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
      {isGroupLeader ? (
        !allOthersCompleted && (
          <CustomModal
            open={isToDecideModal}
            onOpenChange={handleOpenChange}
            onNext={() => {
              // patchCompletedStatus()
              handleDanger()
            }}
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
                  profiles={participants}
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
              <div>
                {isExpanded && (
                  <MembersDefault
                    blackText={false}
                    title={surveyData[0]?.title || title}
                    members={participants}
                    memberCount={participants.length}
                  />
                )}
              </div>
            </div>
          </CustomModal>
        )
      ) : (
        <CustomModal
          open={isToDecideModal}
          onOpenChange={handleOpenChange}
          onNext={() => {
            // patchCompletedStatus()
            router.push('/schedule')
          }}
          isFooter={true}
          footerText={'확정된 일정은 곧 안내해드릴게요!'}
        >
          <div className="flex flex-col item-center justify-center">
            <div className="text-center text-[#1e1e1e] text-[18px] font-medium leading-[25px] mb-[24px]">
              함께하는 친구들이
              <br /> 시간을 입력하고 있어요!
            </div>
            <div className="flex item-center justify-center mb-[12px]">
              <ProfileLarge
                profiles={participants}
                onExpandChange={handleExpandChange}
              />
            </div>
            <div className="text-center text-[#afafaf] text-xs font-medium">
              입력을 완료한 친구의 프로필만 활성화돼요!
            </div>
            <div>
              {isExpanded && (
                <MembersDefault
                  blackText={false}
                  title={surveyData[0]?.title || title}
                  members={participants}
                  memberCount={participants.length}
                />
              )}
            </div>
          </div>
        </CustomModal>
      )}
      <CustomModal
        open={isNextOpen}
        onOpenChange={() => setIsNextOpen(!isNextOpen)}
        onNext={handleNextModal}
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
