import * as React from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageZoomProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onClose: () => void
}

export function ImageZoom({ images, initialIndex = 0, open, onClose }: ImageZoomProps) {
  const [index, setIndex] = React.useState(initialIndex)
  const [zoom, setZoom] = React.useState(1)
  const [position, setPosition] = React.useState({ x: 50, y: 50 })
  const containerRef = React.useRef<HTMLDivElement>(null)
  const isDragging = React.useRef(false)
  const lastPos = React.useRef({ x: 0, y: 0 })

  React.useEffect(() => {
    if (open) {
      setIndex(initialIndex)
      setZoom(1)
      setPosition({ x: 50, y: 50 })
    }
  }, [open, initialIndex])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, index, images.length])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      isDragging.current = true
      lastPos.current = { x: e.clientX, y: e.clientY }
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || zoom === 1) return

    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    const speed = 0.2 / zoom

    setPosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x - dx * speed)),
      y: Math.max(0, Math.min(100, prev.y - dy * speed)),
    }))

    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setZoom(z => Math.max(1, Math.min(5, z + delta)))
  }

  const zoomIn = () => setZoom(z => Math.min(5, z + 0.5))
  const zoomOut = () => setZoom(z => Math.max(1, z - 0.5))
  const resetZoom = () => {
    setZoom(1)
    setPosition({ x: 50, y: 50 })
  }

  const prevImage = () => {
    setIndex(i => (i > 0 ? i - 1 : images.length - 1))
    resetZoom()
  }

  const nextImage = () => {
    setIndex(i => (i < images.length - 1 ? i + 1 : 0))
    resetZoom()
  }

  if (!open || images.length === 0) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 bg-black/80 text-white shrink-0">
        <span className="text-sm font-medium">
          {index + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={zoom === 1}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm w-14 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
          <button
            onClick={zoomIn}
            disabled={zoom === 5}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={resetZoom}
            className="p-2 rounded-lg hover:bg-white/10 flex items-center gap-1"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-2" />
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 flex items-center gap-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          src={images[index]}
          alt=""
          draggable={false}
          className={cn(
            'absolute max-w-none transition-transform duration-75',
            zoom > 1 ? 'cursor-move' : 'cursor-default'
          )}
          style={{
            transform: `translate(-${position.x}%, -${position.y}%) scale(${zoom})`,
            left: '50%',
            top: '50%',
            maxHeight: zoom === 1 ? '90%' : 'none',
            maxWidth: zoom === 1 ? '90%' : 'none',
          }}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="p-4 flex justify-center gap-3 bg-black/80 shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                setIndex(i)
                resetZoom()
              }}
              className={cn(
                'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                i === index ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
