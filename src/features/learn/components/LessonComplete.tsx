'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import confetti from 'canvas-confetti'
import { motion, useInView } from 'framer-motion'
import { ChevronRight, PartyPopper } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { completeLesson } from '../api/learn.mutations'

interface LessonCompleteProps {
  lessonId: string
  courseId: string
  nextLesson: { id: string; title: string } | null
  immediate?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function fireConfetti() {
  const defaults = { particleCount: 60, spread: 70, ticks: 120 }
  confetti({ ...defaults, origin: { x: 0.25, y: 0.7 }, angle: 60 })
  confetti({ ...defaults, origin: { x: 0.75, y: 0.7 }, angle: 120 })
}

export function LessonComplete({ lessonId, courseId, nextLesson, immediate }: LessonCompleteProps) {
  const t = useTranslations('learn')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [hasFired, setHasFired] = useState(false)

  const shouldFire = immediate || isInView

  useEffect(() => {
    if (shouldFire && !hasFired) {
      setHasFired(true)
      fireConfetti()
      completeLesson(lessonId)
    }
  }, [shouldFire, hasFired, lessonId])

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={shouldFire ? 'visible' : 'hidden'}
      className="flex flex-col items-center text-center py-16 mt-8 border-t"
    >
      <motion.div
        variants={itemVariants}
        className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-6"
      >
        <PartyPopper size={28} />
      </motion.div>

      <motion.h2 variants={itemVariants} className="text-2xl font-bold tracking-tight mb-2">
        {t('lessonComplete')}
      </motion.h2>

      <motion.p variants={itemVariants} className="text-base text-muted-foreground mb-8 max-w-sm">
        {t('completionMessage')}
      </motion.p>

      <motion.div variants={itemVariants} className="flex gap-3">
        <Button variant="outline" render={<Link href={`/learn/${courseId}`} />}>
          {t('allLessons')}
        </Button>
        {nextLesson && (
          <Button render={<Link href={`/learn/${courseId}/${nextLesson.id}`} />}>
            {t('nextLesson')}
            <ChevronRight size={16} className="ml-1" />
          </Button>
        )}
      </motion.div>
    </motion.div>
  )
}
