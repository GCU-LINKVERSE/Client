'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import '../../styles/TimeStamp.css'

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

interface TimeStampProps {
  selectedDates: { year: number; month: number; day: number }[]
  confirmedData: { date: string; timeSlots: { start: string; end: string }[] }[]
  currentPage: number
  mode: string
  onPageChange: (newPage: number) => void
  dateCounts: number[]
  handleSelectedCol: (colIndex: number, rowIndex: number) => void
  handleActiveTime: (start: number, end: number) => void
  getDateTime: (date: string, start: string, end: string) => void
  isBottomSheetOpen: boolean
  groupedDate: GroupedDate[]
}

const COLUMNS_PER_PAGE = 7
let isTouchInProgress = false // 터치 진행 중 플래그

export default function TimeStamp({
  selectedDates,
  confirmedData,
  currentPage,
  mode,
  dateCounts,
  groupedDate,
  handleSelectedCol,
  handleActiveTime,
  getDateTime,
  isBottomSheetOpen,
}: TimeStampProps) {
  const [selections] = useState<Selection[]>([])
  const [isResizing, setIsResizing] = useState(false)
  const [activeSelection, setActiveSelection] = useState<Selection | null>(null)
  const [resizingPoint, setResizingPoint] = useState<'start' | 'end' | null>(
    null,
  )
  const [scale, setScale] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)
  const [initialTouchRow, setInitialTouchRow] = useState<number | null>(null)
  // const [confirmedTimeSlots, setConfirmedTimeSlots] = useState<
  //   {
  //     confirmedCol: number
  //     timeSlots: { start: number; end: number }[]
  //   }[]
  // >([])

  const currentDates =
    mode === 'range'
      ? selectedDates.slice(
          currentPage * COLUMNS_PER_PAGE,
          (currentPage + 1) * COLUMNS_PER_PAGE,
        )
      : (() => {
          let startIndex = 0
          let endIndex = 0
          for (let i = 0; i < dateCounts.length; i++) {
            const pageSize = dateCounts[i]
            if (currentPage === i) {
              endIndex = startIndex + pageSize
              break
            }
            startIndex += pageSize
          }

          return selectedDates.slice(startIndex, endIndex)
        })()

  const [selectionsByPage, setSelectionsByPage] = useState<{
    [key: number]: Selection[]
  }>({})

  const currentSelections = useMemo(() => {
    return selectionsByPage[currentPage] || []
  }, [selectionsByPage, currentPage])

  const onColumnClick = useCallback(
    (colIndex: number, rowIndex: number) => {
      if (colIndex === -1) {
        handleSelectedCol(colIndex, rowIndex)
        return 0
      }

      if (gridRef.current) {
        const actualColIndex = currentPage * COLUMNS_PER_PAGE + colIndex
        handleSelectedCol(actualColIndex, rowIndex)
      }
    },
    [handleSelectedCol, currentPage],
  )

  const onActiveTime = useCallback(
    (start: number, end: number) => {
      setTimeout(() => {
        handleActiveTime(start, end)
      }, 0)
    },
    [handleActiveTime],
  )

  const handleDateTimeSelect = useCallback(
    (date: string, start: string, end: string) => {
      setTimeout(() => {
        getDateTime(date, start, end)
      }, 0)
    },
    [getDateTime],
  )

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

    const cellStatus = getCellStatus(rowIndex, colIndex)

    if (cellStatus.isConfirmed) return
    else if (cellStatus.isSelected && cellStatus.selection) {
      const finalizedSelection = {
        ...cellStatus.selection,
        isSelected: false,
        isConfirmed: true,
      }

      setSelectionsByPage((prev) => {
        const currentSelections = prev[currentPage] || []
        const updatedSelections = currentSelections.flatMap((sel) => {
          const isOverlap =
            sel.startRow <= finalizedSelection.endRow &&
            sel.endRow >= finalizedSelection.startRow &&
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

        const mergedSelections = [...updatedSelections, finalizedSelection]

        const startCol = finalizedSelection.startCol
        const getTimeLabel = (rowIndex: number) => {
          const hours = Math.floor(rowIndex / 2)
          const minutes = (rowIndex % 2) * 30
          const formattedHour = String(hours).padStart(2, '0')
          const formattedMinute = String(minutes).padStart(2, '0')
          return `${formattedHour}:${formattedMinute}`
        }

        let selectedDate: string
        if (mode === 'range') {
          selectedDate = `${currentDates[startCol]?.year}-${String(currentDates[startCol]?.month).padStart(2, '0')}-${String(currentDates[startCol]?.day).padStart(2, '0')}`
        } else {
          const groupedArray = groupedDate?.[currentPage]?.date ?? []
          selectedDate = `${groupedArray[startCol]?.year}-${String(groupedArray[startCol]?.month).padStart(2, '0')}-${String(groupedArray[startCol]?.day).padStart(2, '0')}`
        }

        const startTime = getTimeLabel(finalizedSelection.startRow)
        const endTime = getTimeLabel(finalizedSelection.endRow + 1)

        handleDateTimeSelect(selectedDate, startTime, endTime)

        return {
          ...prev,
          [currentPage]: mergedSelections,
        }
      })

      return
    }

    const pairStartRow = Math.floor(rowIndex / 2) * 2
    const pairEndRow = pairStartRow + 1

    setSelectionsByPage((prev) => {
      const updatedSelections = Object.keys(prev).reduce(
        (acc, page) => {
          acc[Number(page)] = (prev[Number(page)] || []).filter(
            (selection) => selection.isConfirmed,
          )
          return acc
        },
        {} as { [key: number]: Selection[] },
      )

      const newSelection: Selection = {
        startRow: pairStartRow,
        startCol: colIndex,
        endRow: pairEndRow,
        endCol: colIndex,
        isSelected: true,
        isConfirmed: false,
      }

      // console.log('handleMouseClick')

      return {
        ...updatedSelections,
        [currentPage]: [
          ...(updatedSelections[currentPage] || []),
          newSelection,
        ],
      }
    })
  }

  const handleMouseDown = (
    rowIndex: number,
    colIndex: number,
    isEndpoint: boolean,
    selection?: Selection,
  ) => {
    // console.log('selection', selection)

    if (selection) {
      setIsResizing(true)
      setActiveSelection(selection)
      setResizingPoint(
        rowIndex === selection.startRow && colIndex === selection.startCol
          ? 'start'
          : 'end',
      )
      // console.log('Resizing started on', resizingPoint, selection)
      // console.log('handleMouseDown', selection, resizingPoint)
    }
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

        if (isResizing) {
          if (resizingPoint === 'start') {
            if (row < prev.endRow) {
              newSelection.startRow = row
            }
          } else if (resizingPoint === 'end') {
            if (row > prev.startRow) {
              newSelection.endRow = row
            }
          }
        }

        // console.log('handleMouseMove')
        return !isOverlapping(newSelection) ? newSelection : prev
      })
    },
    [activeSelection, isResizing, resizingPoint, isOverlapping],
  )

  const handleMouseUp = useCallback(() => {
    if (activeSelection) {
      const finalizedSelection = {
        ...activeSelection,
        isSelected: false,
        isConfirmed: true,
      }

      setSelectionsByPage((prev) => {
        const currentSelections = prev[currentPage] || []
        const updatedSelections = currentSelections.flatMap((sel) => {
          const isOverlap =
            sel.startRow <= finalizedSelection.endRow &&
            sel.endRow >= finalizedSelection.startRow &&
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

        const mergedSelections = [...updatedSelections, finalizedSelection]

        const startCol = finalizedSelection.startCol
        const getTimeLabel = (rowIndex: number) => {
          const hours = Math.floor(rowIndex / 2)
          const minutes = (rowIndex % 2) * 30
          const formattedHour = String(hours).padStart(2, '0')
          const formattedMinute = String(minutes).padStart(2, '0')
          return `${formattedHour}:${formattedMinute}`
        }

        let selectedDate: string
        if (mode === 'range') {
          // mode가 'range'일 경우 기존 로직
          selectedDate = `${currentDates[startCol]?.year}-${String(currentDates[startCol]?.month).padStart(2, '0')}-${String(currentDates[startCol]?.day).padStart(2, '0')}`
        } else {
          // mode가 'range'가 아닐 경우 다른 로직
          const groupedArray = groupedDate?.[currentPage]?.date ?? []
          selectedDate = `${groupedArray[startCol]?.year}-${String(groupedArray[startCol]?.month).padStart(2, '0')}-${String(groupedArray[startCol]?.day).padStart(2, '0')}`
        }

        // console.log('selectedDate', selectedDate)

        const startTime = getTimeLabel(finalizedSelection.startRow)
        const endTime = getTimeLabel(finalizedSelection.endRow + 1)

        handleDateTimeSelect(selectedDate, startTime, endTime)

        // console.log('handleMouseUp')

        return {
          ...prev,
          [currentPage]: mergedSelections,
        }
      })
    }

    setIsResizing(false)
    setActiveSelection(null)
    setResizingPoint(null)
  }, [
    activeSelection,
    currentDates,
    currentPage,
    groupedDate,
    handleDateTimeSelect,
    mode,
  ])

  const handleTouchClick = (rowIndex: number, colIndex: number) => {
    isTouchInProgress = true

    setTimeout(() => {
      isTouchInProgress = false
    }, 500)

    const cellStatus = getCellStatus(rowIndex, colIndex)
    if (cellStatus.isSelected || cellStatus.isConfirmed) return

    const pairStartRow = Math.floor(rowIndex / 2) * 2
    const pairEndRow = pairStartRow + 1

    setInitialTouchRow(pairStartRow)

    setSelectionsByPage((prev) => {
      const updatedSelections = Object.keys(prev).reduce(
        (acc, page) => {
          acc[Number(page)] = (prev[Number(page)] || []).filter(
            (selection) => selection.isConfirmed,
          )
          return acc
        },
        {} as { [key: number]: Selection[] },
      )

      const newSelection: Selection = {
        startRow: pairStartRow,
        startCol: colIndex,
        endRow: pairEndRow,
        endCol: colIndex,
        isSelected: true,
        isConfirmed: false,
      }

      // console.log('handleTouchClick')

      return {
        ...updatedSelections,
        [currentPage]: [
          ...(updatedSelections[currentPage] || []),
          newSelection,
        ],
      }
    })
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
    // console.log('handleTouchDown', rowIndex, initialTouchRow)
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

        if (isResizing && initialTouchRow !== null) {
          if (resizingPoint === 'start') {
            const limitedRow = Math.min(row, initialTouchRow)
            newSelection.startRow = limitedRow
            newSelection.endRow = initialTouchRow + 1
          } else if (resizingPoint === 'end') {
            const limitedRow = Math.max(row, initialTouchRow + 1)
            newSelection.endRow = limitedRow
            newSelection.startRow = initialTouchRow
          }
        }
        // console.log('handleTouchMove')
        return !isOverlapping(newSelection) ? newSelection : prev
      })
    },
    [
      activeSelection,
      resizingPoint,
      isResizing,
      initialTouchRow,
      isOverlapping,
    ],
  )

  const handleTouchUp = useCallback(() => {
    if (activeSelection) {
      const finalizedSelection = {
        ...activeSelection,
        isSelected: false,
        isConfirmed: true,
      }

      setSelectionsByPage((prev) => {
        const currentSelections = prev[currentPage] || []
        const updatedSelections = currentSelections.flatMap((sel) => {
          const isOverlap =
            sel.startRow <= finalizedSelection.endRow &&
            sel.endRow >= finalizedSelection.startRow &&
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

        const mergedSelections = [...updatedSelections, finalizedSelection]

        const startCol = finalizedSelection.startCol
        const getTimeLabel = (rowIndex: number) => {
          const hours = Math.floor(rowIndex / 2)
          const minutes = (rowIndex % 2) * 30
          const formattedHour = String(hours).padStart(2, '0')
          const formattedMinute = String(minutes).padStart(2, '0')
          return `${formattedHour}:${formattedMinute}`
        }

        let selectedDate: string
        if (mode === 'range') {
          // 모드가 'range'일 경우
          selectedDate = `${currentDates[startCol]?.year}-${String(
            currentDates[startCol]?.month,
          ).padStart(
            2,
            '0',
          )}-${String(currentDates[startCol]?.day).padStart(2, '0')}`
        } else {
          // 모드가 'range'가 아닐 경우 다른 날짜 계산 방식 사용
          const groupedArray = groupedDate?.[currentPage]?.date ?? []
          selectedDate = `${groupedArray[startCol]?.year}-${String(
            groupedArray[startCol]?.month,
          ).padStart(
            2,
            '0',
          )}-${String(groupedArray[startCol]?.day).padStart(2, '0')}`
        }
        // console.log('selectedDate', selectedDate)
        const startTime = getTimeLabel(finalizedSelection.startRow)
        const endTime = getTimeLabel(finalizedSelection.endRow + 1)

        handleDateTimeSelect(selectedDate, startTime, endTime)
        setInitialTouchRow(null)

        // console.log('handleTouchUp')

        return {
          ...prev,
          [currentPage]: mergedSelections,
        }
      })
    }

    setIsResizing(false)
    setActiveSelection(null)
    setResizingPoint(null)
  }, [
    activeSelection,
    currentDates,
    currentPage,
    groupedDate,
    handleDateTimeSelect,
    mode,
  ])

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
        e.preventDefault()
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

  const initialConfirmedTimeSlots: {
    confirmedCol: number
    timeSlots: { start: number; end: number; isConfirmed: boolean }[]
  }[] = []

  if (confirmedData.length > 0) {
    const getTimeRow = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 2 + (minutes === 30 ? 1 : 0)
    }

    if (mode === 'range') {
      currentDates.forEach((date, col) => {
        const dateString = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
        confirmedData.forEach((confirmed) => {
          if (confirmed.date === dateString) {
            confirmed.timeSlots.forEach((slot) => {
              const startRow = getTimeRow(slot.start)
              const endRow = getTimeRow(slot.end)
              initialConfirmedTimeSlots.push({
                confirmedCol: col,
                timeSlots: [
                  { start: startRow, end: endRow, isConfirmed: true },
                ],
              })
            })
          }
        })
      })
      // console.log('initialConfirmedTimeSlots', initialConfirmedTimeSlots)
    } else {
      // console.log('groupedDate', groupedDate)
      const groupedArray = groupedDate?.[currentPage]?.date ?? []
      groupedArray.forEach((date, col) => {
        const dateString = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
        confirmedData.forEach((confirmed) => {
          if (confirmed.date === dateString) {
            confirmed.timeSlots.forEach((slot) => {
              const startRow = getTimeRow(slot.start)
              const endRow = getTimeRow(slot.end)
              initialConfirmedTimeSlots.push({
                confirmedCol: col,
                timeSlots: [
                  { start: startRow, end: endRow, isConfirmed: true },
                ],
              })
            })
          }
        })
      })
    }
    // console.log('initialConfirmedTimeSlots', initialConfirmedTimeSlots)
  }

  const getCellStatus = (row: number, col: number) => {
    // console.log('getconfirmedTimeSlots', confirmedTimeSlots)

    const allSelections = [...currentSelections, ...selections].filter(
      Boolean,
    ) as Selection[]

    if (activeSelection) {
      const minRow = Math.min(activeSelection.startRow, activeSelection.endRow)

      const maxRow = Math.max(activeSelection.startRow, activeSelection.endRow)
      const minCol = Math.min(activeSelection.startCol, activeSelection.endCol)
      const maxCol = Math.min(activeSelection.startCol, activeSelection.endCol)

      if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol) {
        const isStartCell =
          row === activeSelection.startRow && col === activeSelection.startCol
        const isEndCell =
          row === activeSelection.endRow && col === activeSelection.endCol

        return {
          isSelected: true,
          isConfirmed: false,
          isStartCell,
          isEndCell,
          selection: activeSelection,
        }
      }
    }

    for (const selection of allSelections) {
      const minRow = Math.min(selection.startRow, selection.endRow)
      const maxRow = Math.max(selection.startRow, selection.endRow)
      const minCol = Math.min(selection.startCol, selection.endCol)
      const maxCol = Math.max(selection.startCol, selection.endCol)

      if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol) {
        const isStartCell =
          row === selection.startRow && col === selection.startCol
        const isEndCell = row === selection.endRow && col === selection.endCol

        return {
          isSelected: true,
          isConfirmed: selection.isConfirmed,
          isStartCell,
          isEndCell,
          selection,
        }
      }
    }

    const confirmedTimeSlot = initialConfirmedTimeSlots.find(
      (slot) =>
        slot.confirmedCol === col &&
        slot.timeSlots.some(
          (timeSlot) => timeSlot.start <= row && row < timeSlot.end,
        ),
    )
    if (confirmedTimeSlot) {
      // 새로운 로직: 초기 확인된 시간 슬롯이 존재할 경우
      return {
        isSelected: true,
        isConfirmed: true,
        isStartCell: false,
        isEndCell: false,
      }
    }

    return {
      isSelected: false,
      isConfirmed: false,
      isStartCell: false,
      isEndCell: false,
    }
  }

  const getCellBorder = (row: number, col: number) => {
    const allSelections = [...currentSelections, ...selections].filter(
      Boolean,
    ) as Selection[]

    const cellStatus = getCellStatus(row, col)
    if (!cellStatus.isSelected || cellStatus.isConfirmed) return {}

    const isSelected = (r: number, c: number) =>
      allSelections.some(
        (selection) =>
          Math.min(selection.startRow, selection.endRow) <= r &&
          Math.max(selection.startRow, selection.endRow) >= r &&
          Math.min(selection.startCol, selection.endCol) <= c &&
          Math.max(selection.startCol, selection.endCol) >= c,
      )

    const isActiveSelection = (r: number, c: number) =>
      activeSelection &&
      Math.min(activeSelection.startRow, activeSelection.endRow) <= r &&
      Math.max(activeSelection.startRow, activeSelection.endRow) >= r &&
      Math.min(activeSelection.startCol, activeSelection.endCol) <= c &&
      Math.max(activeSelection.startCol, activeSelection.endCol) >= c

    // console.log(activeSelection)
    if (activeSelection) {
      onActiveTime(activeSelection.startRow, activeSelection.endRow)
    }

    return {
      borderTop:
        !isSelected(row - 1, col) && !isActiveSelection(row - 1, col)
          ? '2px solid #9562fa'
          : 'none',
      borderBottom:
        !isSelected(row + 1, col) && !isActiveSelection(row + 1, col)
          ? '2px solid #9562fa'
          : 'none',
      borderLeft: '2px solid #9562fa',
      borderRight: '2px solid #9562fa',
    }
  }

  useEffect(() => {
    // 핀치 줌 구현
    const element = gridRef.current
    if (!element) return

    let initialDistance = 0

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
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
        e.preventDefault()
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

  useEffect(() => {
    if (!isBottomSheetOpen) {
      onColumnClick(-1, -1)
    }
  }, [isBottomSheetOpen, onColumnClick])

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
            className=" w-full relative grid z-100 border-[1px] border-[#d9d9d9] rounded-3xl"
            style={{
              gridTemplateColumns: `repeat(${currentDates.length}, 1fr)`,
              backgroundImage: 'linear-gradient(#d9d9d9 1px, transparent 1px)',
              backgroundSize: `100% ${36 * scale}px`,
              // clipPath: 'inset(1px 0 0)',
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
                            ? 'bg-[#9562fa]/60 z-200'
                            : 'bg-[#9562fa]/20 z-200'
                          : ''
                      }`}
                      style={{
                        ...cellBorder,
                        height: `${18 * scale}px`,
                      }}
                      onMouseDown={() => {
                        handleMouseClick(rowIndex, colIndex)
                        if (!cellStatus.isConfirmed)
                          onColumnClick(colIndex, rowIndex)
                      }}
                      onTouchStart={() => {
                        if (!cellStatus.isConfirmed) {
                          handleTouchClick(rowIndex, colIndex)
                          handleTouchDown(
                            rowIndex,
                            colIndex,
                            cellStatus.selection!,
                          )
                          onColumnClick(colIndex, rowIndex)
                        }
                      }}
                    >
                      {!cellStatus.isConfirmed && cellStatus.isStartCell && (
                        <div
                          className="absolute -top-[5px] left-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move"
                          onMouseDown={(event) => {
                            event.stopPropagation() // 버블링 방지
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
                          className="absolute -bottom-[5px] right-[10%] w-2 h-2 border-[2px] border-[#9562fa] bg-white rounded-full cursor-move "
                          onMouseDown={(event) => {
                            event.stopPropagation() // 버블링 방지
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
