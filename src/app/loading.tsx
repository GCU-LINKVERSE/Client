'use client'
import Image from 'next/image'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen background-blue">
      {/* <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div> */}
      <Image src="/loadingspinner.gif" alt="로딩" width={100} height={50} />
    </div>
  )
}
