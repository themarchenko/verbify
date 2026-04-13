import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { AccessExpired } from '@/features/learn'
import {
  checkCourseAccess,
  getCourseLessonsWithLockStatus,
} from '@/features/learn/api/learn.queries'
import { createClient } from '@/shared/api/supabase.server'
import { ArrowLeft, BookOpen, Check, ClipboardCheck, Lock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  params: Promise<{ courseId: string }>
}

export default async function CourseLessonsPage({ params }: Props) {
  const { courseId } = await params

  const access = await checkCourseAccess(courseId)
  if (access.status === 'denied') redirect('/learn')
  if (access.status === 'expired') {
    return (
      <div className="max-w-3xl mx-auto">
        <AccessExpired />
      </div>
    )
  }

  const supabase = await createClient()
  const t = await getTranslations('learn')
  const tHw = await getTranslations('homework')

  const { data: course } = await supabase
    .from('courses')
    .select('id, title')
    .eq('id', courseId)
    .single()

  const lessons = await getCourseLessonsWithLockStatus(courseId)

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        {t('allCourses')}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight mb-6">{course?.title}</h1>
      <div className="flex flex-col gap-3">
        {lessons.map((lesson, i) => {
          if (lesson.isLocked) {
            return (
              <Card key={lesson.id} className="opacity-50">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                  <Lock size={16} className="text-muted-foreground" />
                  <span className="font-medium text-sm text-muted-foreground">{lesson.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{t('lessonLocked')}</span>
                </CardContent>
              </Card>
            )
          }

          return (
            <Link key={lesson.id} href={`/learn/${courseId}/${lesson.id}`}>
              <Card className="hover:shadow-md transition-all hover:-translate-y-px cursor-pointer">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                  {lesson.isCompleted ? (
                    <Check size={16} className="text-green-600" />
                  ) : lesson.lesson_type === 'homework' ? (
                    <ClipboardCheck size={16} className="text-amber-500" />
                  ) : (
                    <BookOpen size={16} className="text-muted-foreground" />
                  )}
                  <span className="font-medium text-sm">{lesson.title}</span>
                  {lesson.lesson_type === 'homework' && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-amber-300 text-amber-600 ml-auto"
                    >
                      {tHw('title')}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
