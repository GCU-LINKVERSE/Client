'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface ScheduleOptionsProps {
  isOpen: boolean
  onClose: () => void
  onClickUp: () => void
  onClickDown: () => void
  optionStringUp: string
  optionStringDown: string
}

export function ScheduleOptions({
  isOpen,
  onClose,
  onClickUp,
  onClickDown,
  optionStringUp,
  optionStringDown,
}: ScheduleOptionsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-20"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 right-4 bg-white rounded-3xl shadow-lg p-3 z-30"
          >
            <button
              className="w-full text-center py-2 hover:bg-purple-50 rounded-3xl text-[#9562fa] text-lg font-medium"
              onClick={onClickUp}
            >
              {optionStringUp}
            </button>
            <button
              className="w-full text-center py-2 hover:bg-purple-50 rounded-3xl text-[#9562fa] text-lg font-medium"
              onClick={onClickDown}
            >
              {optionStringDown}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
