"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TokenCompressionAnimationProps {
  tokenCount: number
  isCompressing: boolean
  onCompressionComplete?: () => void
}

export function TokenCompressionAnimation({
  tokenCount,
  isCompressing,
  onCompressionComplete,
}: TokenCompressionAnimationProps) {
  const [compressionStage, setCompressionStage] = useState(0)

  useEffect(() => {
    if (isCompressing) {
      // Reset compression stage
      setCompressionStage(0)

      // Animate through compression stages
      const timer1 = setTimeout(() => setCompressionStage(1), 800)
      const timer2 = setTimeout(() => setCompressionStage(2), 1600)
      const timer3 = setTimeout(() => {
        setCompressionStage(3)
        onCompressionComplete?.()
      }, 2400)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isCompressing, onCompressionComplete])

  if (!isCompressing && compressionStage === 0) {
    return null
  }

  return (
    <div className="relative w-full h-40 bg-muted/30 rounded-lg overflow-hidden my-4">
      <AnimatePresence>
        {/* Initial tokens */}
        {compressionStage < 2 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
              {Array.from({ length: tokenCount }).map((_, i) => (
                <motion.div
                  key={`token-${i}`}
                  className="w-12 h-12 bg-primary/80 rounded-full flex items-center justify-center text-white font-bold"
                  initial={{ scale: compressionStage === 0 ? 0 : 1 }}
                  animate={{ scale: 1 }}
                  exit={{
                    scale: 0,
                    x: i % 2 === 0 ? -20 : 20,
                    y: i % 3 === 0 ? -20 : i % 3 === 1 ? 20 : 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: compressionStage === 0 ? i * 0.1 : 0,
                  }}
                >
                  T
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Compression process */}
        {compressionStage === 2 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 0.8, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: 1,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.29 7 12 12 20.71 7"></polyline>
                <line x1="12" y1="22" x2="12" y2="12"></line>
              </svg>
            </motion.div>
          </motion.div>
        )}

        {/* Compressed result */}
        {compressionStage === 3 && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="w-16 h-16 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xl"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(124, 58, 237, 0)",
                  "0 0 0 15px rgba(124, 58, 237, 0.3)",
                  "0 0 0 0 rgba(124, 58, 237, 0)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
              }}
            >
              {tokenCount}
            </motion.div>
            <motion.p
              className="mt-4 text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Tokens Compressed Successfully
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
