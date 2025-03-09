"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ")
}

type NavType = "dots" | "arrows" | "both" | "none"
type StartPosition = "start" | "center" | "end" | number

interface CustomSliderProps {
  items: React.ReactNode[]
  itemsPerSlide?: number
  autoplay?: boolean
  loop?: boolean
  autoplaySpeed?: number
  vertical?: boolean
  navType?: NavType
  startPosition?: StartPosition
  gap?: number
  className?: string
}

const CustomSlider = ({
  items = [],
  itemsPerSlide = 4,
  autoplay = true,
  loop = true,
  autoplaySpeed = 3000,
  vertical = false,
  navType = "both",
  startPosition = "start",
  gap = 20,
  className = "",
}: CustomSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const totalSlides = Math.ceil(items.length / itemsPerSlide)

  const getInitialIndex = (): number => {
    if (typeof startPosition === "number") {
      return Math.min(Math.max(0, startPosition), totalSlides - 1)
    }

    switch (startPosition) {
      case "center":
        return Math.floor(totalSlides / 2)
      case "end":
        return totalSlides - 1
      case "start":
      default:
        return 0
    }
  }

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex())

  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState(0)
  const [currentTranslate, setCurrentTranslate] = useState(0)
  const [prevTranslate, setPrevTranslate] = useState(0)

  useEffect(() => {
    if (sliderRef.current) {
      const initialIndex = getInitialIndex()
      setCurrentIndex(initialIndex)
    }
  }, [startPosition, totalSlides])

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(() => {
        nextSlide()
      }, autoplaySpeed)

      return () => clearInterval(interval)
    }
  }, [autoplay, autoplaySpeed, currentIndex])

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) {
        return loop ? totalSlides - 1 : 0
      }
      return prev - 1
    })
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      if (prev >= totalSlides - 1) {
        return loop ? 0 : totalSlides - 1
      }
      return prev + 1
    })
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(Math.max(0, index), totalSlides - 1))
  }

  useEffect(() => {
    if (sliderRef.current) {
      const percentage = (currentIndex / totalSlides) * 100
      if (vertical) {
        sliderRef.current.style.transform = `translateY(-${percentage}%)`
      } else {
        sliderRef.current.style.transform = `translateX(-${percentage}%)`
      }
    }
  }, [currentIndex, vertical, totalSlides])

  const handleDragStart = (e: { clientX: number; clientY: number }) => {
    setIsDragging(true)
    setStartPos(vertical ? e.clientY : e.clientX)
    setPrevTranslate(currentTranslate)
  }

  const handleDragMove = (e: { clientX: number; clientY: number }) => {
    if (!isDragging || !sliderRef.current) return

    const currentPosition = vertical ? e.clientY : e.clientX
    const diff = currentPosition - startPos
    const containerSize = vertical ? sliderRef.current.clientHeight : sliderRef.current.clientWidth

    const newTranslate = prevTranslate + diff

    const maxTranslate = 0
    const minTranslate = -(totalSlides - 1) * (containerSize / totalSlides)

    const boundedTranslate = Math.max(Math.min(newTranslate, maxTranslate), minTranslate)
    setCurrentTranslate(boundedTranslate)

    if (vertical) {
      sliderRef.current.style.transform = `translateY(${boundedTranslate}px)`
    } else {
      sliderRef.current.style.transform = `translateX(${boundedTranslate}px)`
    }
  }

  const handleDragEnd = () => {
    if (!isDragging || !sliderRef.current) return

    setIsDragging(false)

    const containerSize = vertical
      ? sliderRef.current.clientHeight / totalSlides
      : sliderRef.current.clientWidth / totalSlides

    const movePercentage = currentTranslate / containerSize
    const targetIndex = Math.round(Math.abs(movePercentage))

    goToSlide(targetIndex)
  }

  const showArrows = navType === "arrows" || navType === "both"
  const showDots = navType === "dots" || navType === "both"

  return (
    <div className={cn("relative w-full h-[300px] flex flex-col overflow-hidden", className)}>
      <div
        ref={sliderRef}
        className={cn(
          "flex transition-transform duration-500 ease-out",
          vertical ? "flex-col h-full" : "flex-row w-full",
          isDragging ? "transition-none" : "",
        )}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) =>
          handleDragStart({
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
          })
        }
        onTouchMove={(e) =>
          handleDragMove({
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
          })
        }
        onTouchEnd={handleDragEnd}
        style={{
          touchAction: "none",
          userSelect: "none",
          gap: `${gap}px`,
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex justify-center items-center bg-gray-300 p-4 rounded-lg shadow-md"
            style={{
              flex: `0 0 calc(${100 / itemsPerSlide}% - ${(gap * (itemsPerSlide - 1)) / itemsPerSlide}px)`,
              width: vertical
                ? "100%"
                : `calc(${100 / itemsPerSlide}% - ${(gap * (itemsPerSlide - 1)) / itemsPerSlide}px)`,
              height: vertical
                ? `calc(${100 / itemsPerSlide}% - ${(gap * (itemsPerSlide - 1)) / itemsPerSlide}px)`
                : "100%",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && (
        <>
          <button
            onClick={prevSlide}
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10 hover:bg-gray-700 transition-colors",
              vertical ? "left-1/2 -translate-x-1/2 -translate-y-[calc(50%+60px)] rotate-90" : "left-4",
            )}
            aria-label="Previous slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10 hover:bg-gray-700 transition-colors",
              vertical ? "left-1/2 -translate-x-1/2 translate-y-[60px] rotate-90" : "right-4",
            )}
            aria-label="Next slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {showDots && (
        <div
          className={cn(
            "absolute flex space-x-2 z-10",
            vertical
              ? "top-1/2 right-4 transform -translate-y-1/2 flex-col space-x-0 space-y-2"
              : "bottom-4 left-1/2 transform -translate-x-1/2",
          )}
        >
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={cn(
                "w-3 h-3 rounded-full bg-gray-400 transition-all hover:bg-gray-600",
                currentIndex === i && "bg-gray-800",
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomSlider

