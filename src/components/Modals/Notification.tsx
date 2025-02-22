'use client'

import React from 'react'
import { useEffect } from 'react'
import { ToastContainer, Zoom, toast } from 'react-toastify'
import { useNotificationStore } from '@/store/notificationStore'
import '@/styles/Notification.css'

export default function Notification() {
  const { notification, hideNotification } = useNotificationStore()

  useEffect(() => {
    if (notification) {
      toast(notification)
      hideNotification()
    }
  }, [notification, hideNotification])
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        closeButton={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Zoom}
      />
    </>
  )
}
