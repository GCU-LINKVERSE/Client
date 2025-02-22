'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import '@/styles/TimeStamp.css'

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

interface Selection {
  startRow: number
  startCol: number
  endRow: number
  endCol: number
  isSelected: boolean
  isConfirmed: boolean
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

interface EditTimeStampProps {
  mode: string
  dateCounts: number[]
  handleActiveTime: (start: number, end: number) => void
  selectedDates: { year: number; month: number; day: number }[]
  currentPage: number
  onPageChange: (newPage: number) => void
  handleSelectedCol: (colIndex: number, rowIndex: number) => void
  getDateTime: (date: string, start: string, end: string) => void
  mockSelectedSchedule: DateData[]
  isBottomSheetOpen: boolean
  handleTimeSelect: (
    colIndex: number,
    startTime: string,
    endTime: string,
    slotId: number,
  ) => void
  groupedDate: GroupedDate[]
}

let isTouchInProgress = false
const COLUMNS_PER_PAGE = 7

// 시간 문자열을 인덱스로 변환하는 함수
const timeToIndex = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 2 + (minutes >= 30 ? 1 : 0)
}

// 인덱스를 시간 문자열로 변환하는 함수
const indexToTime = (index: number) => {
  const hours = Math.floor(index / 2)
  const minutes = (index % 2) * 30
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export default function EditTimeStamp({
  currentPage,
  handleSelectedCol,
  getDateTime,
  mockSelectedSchedule,
  isBottomSheetOpen,
  handleTimeSelect,
  mode,
  dateCounts,
  // handleActiveTime,
  // groupedDate,
}: EditTimeStampProps) {
  const [selections] = useState<Selection[]>([])
  const [isResizing, setIsResizing] = useState(false)
  const [activeSelection, setActiveSelection] = useState<Selection | null>(null)
  const [resizingPoint, setResizingPoint] = useState<'start' | 'end' | null>(
    null,
  )
  const [scale, setScale] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)
  const [initialTouchRow] = useState<number | null>(null)
  const [sortedMockData, setSortedMockData] = useState<DateData[]>([]) // 정렬된 데이터를 상태로 관리

  const currentDates =
    mode === 'range'
      ? sortedMockData.slice(
          currentPage * COLUMNS_PER_PAGE,
          (currentPage + 1) * COLUMNS_PER_PAGE,
        )
      : (() => {
          let startIndex = 0
          let endIndex = 0

          // for (let i = 0; i <= currentPage; i++) {
          //   startIndex = endIndex
          //   endIndex = startIndex + (dateCounts[i] || 0)
          //   // console.log('dataIndex:', dateCounts[i])
          // }
          for (let i = 0; i <= dateCounts.length; i++) {
            const pageSize = dateCounts[i]
            if (currentPage === i) {
              endIndex = startIndex + pageSize
              break
            }
            startIndex += pageSize
            // console.log('dataIndex:', dateCounts[i])
          }

          // console.log('slicing', sortedMockData.slice(startIndex, endIndex))
          return sortedMockData.slice(startIndex, endIndex)
        })()

  const onColumnClick = useCallback(
    (colIndex: number, rowIndex: number) => {
      if (colIndex === -1 && rowIndex === -1) {
        console.log('oncolumnindex:', colIndex)
        handleSelectedCol(colIndex, rowIndex)
        return
      }
      if (gridRef.current) {
        const actualColIndex = currentPage * COLUMNS_PER_PAGE + colIndex
        handleSelectedCol(actualColIndex, rowIndex)
      }
    },
    [handleSelectedCol, currentPage],
  )

  // const onActiveTime = useCallback(
  //   (start: number, end: number) => {
  //     setTimeout(() => {
  //       handleActiveTime(start, end)
  //     }, 0)
  //   },
  //   [handleActiveTime],
  // )

  const handleDateTimeSelect = useCallback(
    (date: string, start: string, end: string) => {
      setTimeout(() => {
        getDateTime(date, start, end)
      }, 0)
    },
    [getDateTime],
  )

  const [selectionsByPage, setSelectionsByPage] = useState<{
    [key: number]: Selection[]
  }>({})

  //목데이터를 정렬시켜주는 useEffect 코드
  useEffect(() => {
    const sortingData = mockSelectedSchedule.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateA.getTime() - dateB.getTime()
    })
    setSortedMockData(sortingData)
    console.log('sortingData:', sortingData)
  }, [mockSelectedSchedule])

  const currentSelections = useMemo(() => {
    return selectionsByPage[currentPage] || []
  }, [selectionsByPage, currentPage])

  const isOverlapping = useCallback(
    (selection: Selection) => {
      const { startRow, endRow } = selection
      const minRow = Math.min(startRow, endRow)
      const maxRow = Math.max(startRow, endRow)

      return selections.some((existing) => {
        const existingMinRow = Math.min(existing.startRow, existing.endRow)
        const existingMaxRow = Math.max(existing.startRow, existing.endRow)

        return !(maxRow < existingMinRow || minRow > existingMaxRow)
      })
    },
    [selections],
  )

  const handleMouseClick = (rowIndex: number, colIndex: number) => {
    if (isTouchInProgress) {
      return
    }
    if (isBottomSheetOpen) return

    // console.log('currentDates: ', currentDates)
    // const scheduleIndex = currentPage * COLUMNS_PER_PAGE + colIndex
    // const schedule = currentDates[scheduleIndex]
    // console.log('schedule', schedule)

    const schedule = currentDates[colIndex]
    // console.log('schedule', schedule)
    if (!schedule) return

    // 클릭된 슬롯을 찾기
    const clickedSlot = schedule.timeSlots.find((slot) => {
      const startIdx = timeToIndex(slot.start)
      const endIdx = timeToIndex(slot.end) - 1
      return rowIndex >= startIdx && rowIndex <= endIdx
    })

    if (!clickedSlot) return

    console.log(schedule.date, clickedSlot?.start, '-', clickedSlot?.end)

    if (clickedSlot) {
      const startIdx = timeToIndex(clickedSlot.start)
      const endIdx = timeToIndex(clickedSlot.end)

      setActiveSelection({
        startRow: startIdx,
        startCol: colIndex,
        endRow: endIdx - 1,
        endCol: colIndex,
        isSelected: true,
        isConfirmed: false,
      })
      setSelectionsByPage((prev) => {
        const currentSelections = prev[currentPage] || []
        // console.log('curselections:', currentSelections)
        return {
          ...prev,
          [currentPage]: [
            ...currentSelections,
            {
              startRow: startIdx,
              startCol: colIndex,
              endRow: endIdx - 1,
              endCol: colIndex,
              isSelected: true,
              isConfirmed: true,
            },
          ],
        }
      })

      // 바텀시트 열기
      console.log('handleMouseClick')
      handleSelectedCol(colIndex, rowIndex)
      console.log('colIndex', colIndex, 'rowIndex', rowIndex)

      // 시간 정보 전달
      handleTimeSelect(
        colIndex,
        clickedSlot.start,
        clickedSlot.end,
        clickedSlot.slotId,
      )
    }
  }

  const handleMouseDown = (
    rowIndex: number,
    colIndex: number,
    isStartPoint: boolean,
    selection: Selection,
  ) => {
    setIsResizing(true)
    setActiveSelection(selection)
    setResizingPoint(isStartPoint ? 'start' : 'end')
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!gridRef.current || !activeSelection) return

      const rect = gridRef.current.getBoundingClientRect()
      const cellHeight = rect.height / 48
      const row = Math.min(
        Math.max(Math.floor((e.clientY - rect.top) / cellHeight), 0),
        47,
      )

      if (isResizing) {
        const timestampContainer = gridRef.current.closest(
          '.timestamp-container',
        )
        if (timestampContainer) {
          const containerRect = timestampContainer.getBoundingClientRect()
          const scrollThreshold = 250

          if (e.clientY > containerRect.bottom - scrollThreshold) {
            timestampContainer.scrollTop += 5
          } else if (e.clientY < containerRect.top + scrollThreshold) {
            timestampContainer.scrollTop -= 5
          }
        }
      }

      // console.log('ActiveSelection', activeSelection)

      setActiveSelection((prev) => {
        if (!prev) return null

        const newSelection = { ...prev }
        const scheduleIndex = currentPage * COLUMNS_PER_PAGE + prev.startCol
        const schedule = currentDates[scheduleIndex]
        // const schedule = currentDates[col]
        const slotId =
          schedule?.timeSlots.find(
            (slot) =>
              slot.start === indexToTime(row) &&
              slot.end === indexToTime(prev.endRow + 1),
          )?.slotId || 0 // ID 가져오기

        if (isResizing) {
          if (resizingPoint === 'start') {
            // 시작 핸들은 종료 핸들 위치까지 이동 가능
            if (row < prev.endRow) {
              newSelection.startRow = row
              if (isBottomSheetOpen) {
                handleTimeSelect(
                  prev.startCol,
                  indexToTime(row),
                  indexToTime(prev.endRow + 1),
                  slotId, // ID 추가
                )
              }
            }
          } else if (resizingPoint === 'end') {
            // 종료 핸들은 시작 핸들 위치까지 이동 가능
            if (row > prev.startRow) {
              newSelection.endRow = row
              if (isBottomSheetOpen) {
                handleTimeSelect(
                  prev.startCol,
                  indexToTime(prev.startRow),
                  indexToTime(row + 1),
                  slotId,
                )
              }
            }
          }
        }
        // console.log('handleMouseMove')
        return !isOverlapping(newSelection) ? newSelection : prev
      })
    },
    [
      activeSelection,
      isResizing,
      currentPage,
      currentDates,
      isOverlapping,
      resizingPoint,
      isBottomSheetOpen,
      handleTimeSelect,
    ],
  )

  const handleMouseUp = useCallback(() => {
    if (activeSelection) {
      const finalizedSelection = {
        ...activeSelection,
        isSelected: false,
        isConfirmed: true,
      }

      const startCol = finalizedSelection.startCol

      const getTimeLabel = (rowIndex: number) => {
        const hours = Math.floor(rowIndex / 2)
        const minutes = (rowIndex % 2) * 30
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      }

      const schedule = currentDates[startCol]
      if (schedule) {
        let selectedSlotId = null

        // 병합 및 업데이트
        const updatedTimeSlots = []
        let mergedStartRow = finalizedSelection.startRow
        let mergedEndRow = finalizedSelection.endRow

        schedule.timeSlots.forEach((slot) => {
          const slotStart = timeToIndex(slot.start)
          const slotEnd = timeToIndex(slot.end) - 1

          const isOverlap =
            slotStart <= finalizedSelection.endRow + 1 &&
            slotEnd >= finalizedSelection.startRow - 1

          const isReducingSize =
            finalizedSelection.startRow >= slotStart &&
            finalizedSelection.endRow <= slotEnd

          if (isOverlap) {
            if (isReducingSize) {
              // 크기 줄이는 경우 finalizedSelection 적용
              mergedStartRow = finalizedSelection.startRow
              mergedEndRow = finalizedSelection.endRow
              selectedSlotId = slot.slotId // 기존 ID 유지
            } else {
              // 병합 범위 확장
              mergedStartRow = Math.min(mergedStartRow, slotStart)
              mergedEndRow = Math.max(mergedEndRow, slotEnd)
              selectedSlotId = slot.slotId // 기존 ID 유지
            }
          } else {
            // 겹치지 않는 경우 기존 슬롯 유지
            updatedTimeSlots.push(slot)
          }
        })

        const mergedStartTime = getTimeLabel(mergedStartRow)
        const mergedEndTime = getTimeLabel(mergedEndRow + 1)

        // 병합된 슬롯 추가
        updatedTimeSlots.push({
          slotId: selectedSlotId || finalizedSelection.startCol,
          start: mergedStartTime,
          end: mergedEndTime,
        })

        schedule.timeSlots = updatedTimeSlots

        // console.log('병합 슬롯', mergedStartTime, '-', mergedEndTime)

        // 시각화 상태 업데이트
        setSelectionsByPage((prev) => {
          const currentSelections = prev[currentPage] || []
          const updatedSelections = currentSelections.flatMap((sel) => {
            const isOverlap =
              sel.startRow <= finalizedSelection.endRow + 1 &&
              sel.endRow >= finalizedSelection.startRow - 1 &&
              sel.startCol === finalizedSelection.startCol

            if (!isOverlap) {
              return [sel]
            }

            const splitSelections = []
            if (sel.startRow < finalizedSelection.startRow) {
              splitSelections.push({
                ...sel,
                endRow: finalizedSelection.startRow - 1,
              })
            }
            if (sel.endRow > finalizedSelection.endRow) {
              splitSelections.push({
                ...sel,
                startRow: finalizedSelection.endRow + 1,
              })
            }
            return splitSelections
          })

          const mergedSelections = [
            ...updatedSelections,
            {
              ...finalizedSelection,
              startRow: mergedStartRow,
              endRow: mergedEndRow,
            },
          ]

          // console.log('mergedSelections:', mergedSelections)

          handleDateTimeSelect(String(startCol), mergedStartTime, mergedEndTime)
          console.log('handleMouseUp')
          return {
            ...prev,
            [currentPage]: mergedSelections,
          }
        })

        console.log(
          `최종 병합 영역:${selectedSlotId} ${mergedStartTime} - ${mergedEndTime}`,
        )
      }

      // 리사이징 상태 초기화
      setIsResizing(false)
      setActiveSelection(null)
      setResizingPoint(null)
    }
  }, [
    activeSelection,
    currentPage,
    currentDates,
    handleDateTimeSelect,
    setSelectionsByPage,
  ])

  const handleTouchClick = (rowIndex: number, colIndex: number) => {
    isTouchInProgress = true

    setTimeout(() => {
      isTouchInProgress = false
    }, 500)

    const cellStatus = getCellStatus(rowIndex, colIndex)
    if (!cellStatus.isSelected && cellStatus.isConfirmed) return

    const schedule = currentDates[colIndex]
    // console.log('schedule', schedule)
    if (!schedule) return

    // 클릭된 슬롯을 찾기
    const clickedSlot = schedule.timeSlots.find((slot) => {
      const startIdx = timeToIndex(slot.start)
      const endIdx = timeToIndex(slot.end) - 1
      return rowIndex >= startIdx && rowIndex <= endIdx
    })
    if (!clickedSlot) return

    // setInitialTouchRow(pairStartRow)

    if (clickedSlot) {
      const startIdx = timeToIndex(clickedSlot.start)
      const endIdx = timeToIndex(clickedSlot.end)

      setActiveSelection({
        startRow: startIdx,
        startCol: colIndex,
        endRow: endIdx - 1,
        endCol: colIndex,
        isSelected: true,
        isConfirmed: false,
      })

      setSelectionsByPage((prev) => {
        const currentSelections = prev[currentPage] || []
        // console.log('curselections:', currentSelections)
        return {
          ...prev,
          [currentPage]: [
            ...currentSelections,
            {
              startRow: startIdx,
              startCol: colIndex,
              endRow: endIdx - 1,
              endCol: colIndex,
              isSelected: true,
              isConfirmed: true,
            },
          ],
        }
      })
    }
  }

  const handleTouchDown = (
    rowIndex: number,
    colIndex: number,
    selection?: Selection,
  ) => {
    isTouchInProgress = true

    if (selection) {
      setIsResizing(true)
      setActiveSelection(selection)

      if (!resizingPoint) {
        if (rowIndex == selection.startRow) {
          setResizingPoint('start')
        } else if (rowIndex == selection.endRow) {
          setResizingPoint('end')
        }
      }
    }
    console.log('handleTouchDown', rowIndex, initialTouchRow)
  }

  const handleTouchMove = useCallback(
    (e: TouchEvent | React.TouchEvent) => {
      if (!gridRef.current || !activeSelection) return

      const touch = e.touches[0]
      if (!touch) return

      if (isResizing) {
        const timestampContainer = gridRef.current.closest(
          '.timestamp-container',
        )
        if (timestampContainer) {
          const containerRect = timestampContainer.getBoundingClientRect()
          const scrollThreshold = 300

          if (touch.clientY > containerRect.bottom - scrollThreshold) {
            timestampContainer.scrollTop += 5
          } else if (touch.clientY < containerRect.top + scrollThreshold) {
            timestampContainer.scrollTop -= 5
          }
        }
      }

      const rect = gridRef.current.getBoundingClientRect()
      const cellHeight = rect.height / 48
      const row = Math.min(
        Math.max(Math.floor((touch.clientY - rect.top) / cellHeight), 0),
        47,
      )

      setActiveSelection((prev) => {
        if (!prev) return null

        const newSelection = { ...prev }
        const scheduleIndex = currentPage * COLUMNS_PER_PAGE + prev.startCol
        const schedule = currentDates[scheduleIndex]
        // const schedule = currentDates[col]
        const slotId =
          schedule?.timeSlots.find(
            (slot) =>
              slot.start === indexToTime(row) &&
              slot.end === indexToTime(prev.endRow + 1),
          )?.slotId || 0 // ID 가져오기

        if (isResizing) {
          if (resizingPoint === 'start') {
            // 시작 핸들은 종료 핸들 위치까지 이동 가능
            if (row < prev.endRow) {
              newSelection.startRow = row
              if (isBottomSheetOpen) {
                handleTimeSelect(
                  prev.startCol,
                  indexToTime(row),
                  indexToTime(prev.endRow + 1),
                  slotId, // ID 추가
                )
              }
            }
          } else if (resizingPoint === 'end') {
            // 종료 핸들은 시작 핸들 위치까지 이동 가능
            if (row > prev.startRow) {
              newSelection.endRow = row
              if (isBottomSheetOpen) {
                handleTimeSelect(
                  prev.startCol,
                  indexToTime(prev.startRow),
                  indexToTime(row + 1),
                  slotId,
                )
              }
            }
          }
        }
        // console.log('handleMouseMove')
        return !isOverlapping(newSelection) ? newSelection : prev
      })
    },
    [
      activeSelection,
      isResizing,
      currentPage,
      currentDates,
      isOverlapping,
      resizingPoint,
      isBottomSheetOpen,
      handleTimeSelect,
    ],
  )

  const handleTouchUp = useCallback(() => {
    if (activeSelection) {
      const finalizedSelection = {
        ...activeSelection,
        isSelected: false,
        isConfirmed: true,
      }

      const startCol = finalizedSelection.startCol
      const getTimeLabel = (rowIndex: number) => {
        const hours = Math.floor(rowIndex / 2)
        const minutes = (rowIndex % 2) * 30
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
      }

      const schedule = currentDates[startCol]
      if (schedule) {
        let selectedSlotId = null

        // 병합 및 업데이트
        const updatedTimeSlots = []
        let mergedStartRow = finalizedSelection.startRow
        let mergedEndRow = finalizedSelection.endRow

        schedule.timeSlots.forEach((slot) => {
          const slotStart = timeToIndex(slot.start)
          const slotEnd = timeToIndex(slot.end) - 1

          const isOverlap =
            slotStart <= finalizedSelection.endRow + 1 &&
            slotEnd >= finalizedSelection.startRow - 1

          const isReducingSize =
            finalizedSelection.startRow >= slotStart &&
            finalizedSelection.endRow <= slotEnd

          if (isOverlap) {
            if (isReducingSize) {
              // 크기 줄이는 경우 finalizedSelection 적용
              mergedStartRow = finalizedSelection.startRow
              mergedEndRow = finalizedSelection.endRow
              selectedSlotId = slot.slotId // 기존 ID 유지
            } else {
              // 병합 범위 확장
              mergedStartRow = Math.min(mergedStartRow, slotStart)
              mergedEndRow = Math.max(mergedEndRow, slotEnd)
              selectedSlotId = slot.slotId // 기존 ID 유지
            }
          } else {
            // 겹치지 않는 경우 기존 슬롯 유지
            updatedTimeSlots.push(slot)
          }
        })

        const mergedStartTime = getTimeLabel(mergedStartRow)
        const mergedEndTime = getTimeLabel(mergedEndRow + 1)

        // 병합된 슬롯 추가
        updatedTimeSlots.push({
          slotId: selectedSlotId || finalizedSelection.startCol,
          start: mergedStartTime,
          end: mergedEndTime,
        })

        schedule.timeSlots = updatedTimeSlots

        // console.log('병합 슬롯', mergedStartTime, '-', mergedEndTime)

        // 시각화 상태 업데이트
        setSelectionsByPage((prev) => {
          const currentSelections = prev[currentPage] || []
          const updatedSelections = currentSelections.flatMap((sel) => {
            const isOverlap =
              sel.startRow <= finalizedSelection.endRow + 1 &&
              sel.endRow >= finalizedSelection.startRow - 1 &&
              sel.startCol === finalizedSelection.startCol

            if (!isOverlap) {
              return [sel]
            }

            const splitSelections = []
            if (sel.startRow < finalizedSelection.startRow) {
              splitSelections.push({
                ...sel,
                endRow: finalizedSelection.startRow - 1,
              })
            }
            if (sel.endRow > finalizedSelection.endRow) {
              splitSelections.push({
                ...sel,
                startRow: finalizedSelection.endRow + 1,
              })
            }
            return splitSelections
          })

          const mergedSelections = [
            ...updatedSelections,
            {
              ...finalizedSelection,
              startRow: mergedStartRow,
              endRow: mergedEndRow,
            },
          ]

          // console.log('mergedSelections:', mergedSelections)

          handleDateTimeSelect(String(startCol), mergedStartTime, mergedEndTime)
          console.log('handleMouseUp')
          return {
            ...prev,
            [currentPage]: mergedSelections,
          }
        })

        console.log(
          `최종 병합 영역:${selectedSlotId} ${mergedStartTime} - ${mergedEndTime}`,
        )
      }

      setIsResizing(false)
      setActiveSelection(null)
      setResizingPoint(null)
    }
  }, [activeSelection, currentDates, currentPage, handleDateTimeSelect])

  useEffect(() => {
    const handleMouseUpWithColumnClick = () => {
      handleMouseUp()
      onColumnClick(-1, -1)
    }

    const handleTouchUpWithColumnClick = () => {
      handleTouchUp()
      onColumnClick(-1, -1)
    }

    const grid = gridRef.current
    if (!grid) return

    let touchStartY = 0
    let isDragging = false

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        touchStartY = e.touches[0].clientY
      }
    }

    const handleTouchMoveWithCheck = (e: TouchEvent) => {
      if (!e.touches[0]) return

      const touchCurrentY = e.touches[0].clientY
      const deltaY = Math.abs(touchCurrentY - touchStartY)

      if (!isDragging && deltaY > 10) {
        isDragging = true
      }

      if (isDragging && (activeSelection || isResizing)) {
        if (e.cancelable) e.preventDefault()
        handleTouchMove(e)
      }
    }

    if (activeSelection || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUpWithColumnClick)

      grid.addEventListener('touchstart', handleTouchStart)
      grid.addEventListener('touchmove', handleTouchMoveWithCheck, {
        passive: false,
      })
      grid.addEventListener('touchend', handleTouchUpWithColumnClick)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUpWithColumnClick)
      if (grid) {
        grid.removeEventListener('touchstart', handleTouchStart)
        grid.removeEventListener('touchmove', handleTouchMoveWithCheck)
        grid.removeEventListener('touchend', handleTouchUpWithColumnClick)
      }
    }
  }, [
    activeSelection,
    isResizing,
    handleMouseMove,
    handleMouseUp,
    onColumnClick,
    currentSelections,
    handleTouchUp,
    handleTouchMove,
  ])

  // 셀 상태 계산
  const getCellStatus = (row: number, col: number) => {
    // 현재 페이지의 목데이터 인덱스 계산
    // const scheduleIndex = currentPage * COLUMNS_PER_PAGE + col
    // const schedule = currentDates[scheduleIndex]
    const schedule = currentDates[col]

    // 활성화된 선택 영역 확인
    const activeCell =
      activeSelection &&
      col === activeSelection.startCol &&
      row >= Math.min(activeSelection.startRow, activeSelection.endRow) &&
      row <= Math.max(activeSelection.startRow, activeSelection.endRow)

    // 목데이터에서 해당 셀이 포함된 시간 슬롯 찾기
    const timeSlot = schedule?.timeSlots.find((slot) => {
      const startIdx = timeToIndex(slot.start)
      const endIdx = timeToIndex(slot.end) - 1
      return row >= startIdx && row <= endIdx
    })

    if (activeCell) {
      // 활성화된 선택 영역
      return {
        isSelected: true,
        isConfirmed: false,
        isStartCell: row === activeSelection.startRow,
        isEndCell: row === activeSelection.endRow,
        selection: activeSelection,
      }
    }

    if (timeSlot) {
      // 목데이터 시각화
      const startIdx = timeToIndex(timeSlot.start)
      const endIdx = timeToIndex(timeSlot.end) - 1
      return {
        isSelected: true,
        isConfirmed: true,
        isStartCell: row === startIdx,
        isEndCell: row === endIdx,
        selection: null,
      }
    }

    return {
      isSelected: false,
      isConfirmed: false,
      isStartCell: false,
      isEndCell: false,
      selection: null,
    }
  }

  // 셀 테두리 처리
  const getCellBorder = (row: number, col: number) => {
    const cellStatus = getCellStatus(row, col)

    // 활성화된 선택 영역에만 border 적용
    if (!cellStatus.isSelected || cellStatus.isConfirmed) return {}

    const topCell = getCellStatus(row - 1, col)
    const bottomCell = getCellStatus(row + 1, col)

    return {
      borderTop:
        !topCell.isSelected || topCell.isConfirmed
          ? '2px solid #9562fa'
          : 'none',
      borderBottom:
        !bottomCell.isSelected || bottomCell.isConfirmed
          ? '2px solid #9562fa'
          : 'none',
      borderLeft: '2px solid #9562fa',
      borderRight: '2px solid #9562fa',
    }
  }

  // 터치 줌 이벤트
  useEffect(() => {
    const element = gridRef.current
    if (!element) return

    let initialDistance = 0

    // 핀치 줌 이벤트 처리
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2),
        )
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2),
        )

        const scaleChange = currentDistance / initialDistance
        setScale((prev) => Math.min(Math.max(prev * scaleChange, 1), 2))
        initialDistance = currentDistance
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialDistance = 0
      }
    }

    // 마우스 휠 줌 이벤트
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setScale((prev) => Math.min(Math.max(prev * delta, 1), 2))
      }
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('wheel', handleWheel)
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return (
    <div
      className={`timestamp-container ${isBottomSheetOpen ? 'pb-[32%]' : 'pb-[12%]'}`}
    >
      <div className="timestamp-content">
        <div className="w-full max-w-4xl mx-auto bg-white pl-2 pr-8 pt-3 pb-8 flex grid grid-cols-[auto_1fr]">
          <div className="w-7 pr-1 -mt-1">
            {Array.from({ length: 23 }, (_, i) => (
              <div
                key={i}
                className="text-[10px] text-[#afafaf]"
                style={{
                  height: `${18 * scale}px`,
                  paddingTop: `${36 * scale}px`,
                }}
              >
                {`${String(i + 1).padStart(2, '0')}시`}{' '}
              </div>
            ))}
          </div>
          <div
            ref={gridRef}
            className=" w-full relative grid z-500 border-[1px] border-[#d9d9d9] rounded-3xl"
            style={{
              gridTemplateColumns: `repeat(${currentDates.length}, 1fr)`,
              backgroundImage: 'linear-gradient(#d9d9d9 1px, transparent 1px)',
              backgroundSize: `100% ${36 * scale}px`,
              // clipPath: 'inset(1px 0 0 0)', // 위쪽 1px 잘라냄
            }}
          >
            {currentDates.map((_, colIndex) => (
              <div
                key={colIndex}
                className="relative border-r border-[#d9d9d9] z-100 last:border-r-0"
              >
                {Array.from({ length: 48 }, (_, rowIndex) => {
                  const cellStatus = getCellStatus(rowIndex, colIndex)
                  const cellBorder = getCellBorder(rowIndex, colIndex)

                  const isTopLeftCorner = rowIndex === 0 && colIndex === 0
                  const isTopRightCorner =
                    rowIndex === 0 && colIndex === currentDates.length - 1
                  const isBottomLeftCorner = rowIndex === 47 && colIndex === 0
                  const isBottomRightCorner =
                    rowIndex === 47 && colIndex === currentDates.length - 1

                  const cornerStyleRound = `
                    ${isTopLeftCorner ? 'rounded-tl-[20px]' : ''}
                    ${isTopRightCorner ? 'rounded-tr-[20px]' : ''}
                    ${isBottomLeftCorner ? 'rounded-bl-[20px]' : ''}
                    ${isBottomRightCorner ? 'rounded-br-[20px]' : ''}
                  `

                  return (
                    <div
                      key={rowIndex}
                      className={`relative cursor-pointer ${cornerStyleRound} ${
                        cellStatus.isSelected
                          ? cellStatus.isConfirmed
                            ? 'bg-[#9562fa]/60'
                            : 'bg-[#9562fa]/20'
                          : ''
                      }`}
                      style={{
                        ...cellBorder,
                        height: `${18 * scale}px`,
                      }}
                      onClick={() => {
                        handleMouseClick(rowIndex, colIndex)
                        // if (cellStatus.isConfirmed) {
                        if (cellStatus.isConfirmed && !cellStatus.isSelected) {
                          onColumnClick(colIndex, rowIndex)
                        }
                      }}
                      onTouchStart={() => {
                        if (!cellStatus.isConfirmed) {
                          handleTouchClick(rowIndex, colIndex)
                          handleTouchDown(
                            rowIndex,
                            colIndex,
                            cellStatus.selection!,
                          )
                        }
                      }}
                    >
                      {!cellStatus.isConfirmed && cellStatus.isStartCell && (
                        <div
                          className="absolute -top-[5px] left-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                          onMouseDown={() => {
                            handleMouseDown(
                              rowIndex,
                              colIndex,
                              true,
                              cellStatus.selection!,
                            )
                          }}
                        />
                      )}
                      {!cellStatus.isConfirmed && cellStatus.isEndCell && (
                        <div
                          className="absolute -bottom-[5px] right-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            handleMouseDown(
                              rowIndex,
                              colIndex,
                              false,
                              cellStatus.selection!,
                            )
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
