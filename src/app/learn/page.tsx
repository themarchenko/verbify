import { getTranslations } from 'next-intl/server'

import { ContinueLearningCard, CourseListStudent, StudentStatsCards } from '@/features/learn'
import {
  getContinueLearning,
  getEnrolledCourses,
  getStudentStats,
} from '@/features/learn/api/learn.queries'

export default async function LearnPage() {
  const t = await getTranslations('learn')
  const [courses, stats, continueLearning] = await Promise.all([
    getEnrolledCourses(),
    getStudentStats(),
    getContinueLearning(),
  ])

  const hasCourses = courses.length > 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t('myCourses')}</h1>
      {hasCourses && (
        <>
          <StudentStatsCards stats={stats} />
          {continueLearning && <ContinueLearningCard data={continueLearning} />}
        </>
      )}
      <CourseListStudent courses={courses} />
    </div>
  )
}
