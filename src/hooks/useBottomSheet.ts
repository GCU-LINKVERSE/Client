import { useState, useRef } from 'react'

export const useBottomSheet = () => {
  const [bottomSheetState, setBottomSheetState] = useState<
    'collapsed' | 'middle' | 'expanded'
  >('collapsed')
  const startY = useRef<number | null>(null)
  const isDraggingRef = useRef<boolean>(false)
  const threshold = 50

  const handleStart = (y: number) => {
    startY.current = y
    isDraggingRef.current = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
  }

  const handleMove = (y: number) => {
    if (!isDraggingRef.current || startY.current === null) return
    const deltaY = startY.current - y

    if (deltaY > threshold) {
      setBottomSheetState((prev) =>
        prev === 'collapsed' ? 'middle' : 'expanded',
      )
      startY.current = y
    } else if (deltaY < -threshold) {
      setBottomSheetState((prev) =>
        prev === 'expanded' ? 'middle' : 'collapsed',
      )
      startY.current = y
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientY)
  }

  const handleEnd = () => {
    startY.current = null
    isDraggingRef.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleEnd)
  }

  return {
    bottomSheetState,
    setBottomSheetState,
    handleStart,
    handleMove,
    handleEnd,
  }
}
