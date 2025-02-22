'use client'

import React, { useEffect, useRef } from 'react'
import imagesLoaded from 'imagesloaded'

interface VisitorPhotoProps {
  selectedPlace: string[] // pictures 배열
}

const VisitorPhoto: React.FC<VisitorPhotoProps> = ({ selectedPlace }) => {
  const gridRef = useRef<HTMLDivElement>(null)

  const resizeGridItems = () => {
    const grid = gridRef.current
    if (!grid) return

    const rowHeight = parseInt(
      window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'),
    )
    const rowGap = parseInt(
      window.getComputedStyle(grid).getPropertyValue('gap'),
    )
    const items = grid.querySelectorAll<HTMLDivElement>('.grid-item')

    items.forEach((item) => {
      const content = item.querySelector<HTMLImageElement>('.content')
      if (!content) return

      const rowSpan = Math.ceil(
        (content.offsetHeight + rowGap) / (rowHeight + rowGap),
      )
      item.style.gridRowEnd = `span ${rowSpan}`
    })
  }

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const imgLoad = imagesLoaded(grid)
    imgLoad.on('progress', () => {
      resizeGridItems()
    })
    imgLoad.on('always', () => {
      resizeGridItems()
    })

    window.addEventListener('resize', resizeGridItems)

    return () => {
      window.removeEventListener('resize', resizeGridItems)
    }
  }, [])

  if (!selectedPlace || selectedPlace.length === 0) {
    return <div style={{ marginTop: '20px' }}>사진이 없습니다.</div>
  }

  return (
    <div
      style={{
        marginTop: '20px',
        backgroundColor: '#f7f7f7',
        padding: '8px',
      }}
    >
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          gridAutoRows: '8px',
        }}
      >
        {selectedPlace.map((photo, index) => (
          <div
            key={index}
            className="grid-item"
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <img
              src={photo}
              alt={`Visitor ${index}`}
              className="content"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '12px',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default VisitorPhoto
