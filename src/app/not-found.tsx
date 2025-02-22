'use client'

import { MdError } from 'react-icons/md'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen background-blue">
      <div className="flex flex-col items-center justify-center">
        <MdError color="#9562FB" size={80} />
        <div className="font-medium mt-2">해당 페이지를 찾을 수 없습니다.</div>
      </div>
    </div>
  )
}
