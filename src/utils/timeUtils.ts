interface TimeSlot {
  start: string
  end: string
  selectedBy: string[]
}

interface ProcessedTimeSlot {
  row: number
  count: number
}

export const processTimeSlots = (
  timeSlots: TimeSlot[],
): { [key: number]: ProcessedTimeSlot[] } => {
  const grid: { [key: number]: ProcessedTimeSlot[] } = {}

  const timeToRow = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours + (minutes >= 30 ? 0.5 : 0)
  }

  timeSlots.forEach((slot) => {
    const startRow = timeToRow(slot.start)
    const endRow = timeToRow(slot.end)

    for (let row = startRow; row < endRow; row += 0.5) {
      if (row >= 0 && row < 24) {
        if (!grid[row]) {
          grid[row] = []
        }
        grid[row].push({
          row,
          count: slot.selectedBy.length,
        })
      }
    }
  })

  return grid
}

export const getMaxOverlap = (processedSlots: {
  [key: number]: ProcessedTimeSlot[]
}): number => {
  return Math.max(
    ...Object.values(processedSlots)
      .flat()
      .map((slot) => slot.count),
    1,
  )
}
