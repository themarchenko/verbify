import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { DashboardCharts } from '@/features/dashboard/components/DashboardCharts'
import { resolveSchemeColors } from '@/features/settings/model/color-schemes.config'
import { createClient } from '@/shared/api/supabase.server'
import { BookOpen, ClipboardCheck, GraduationCap, Plus, UserPlus, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')
  const tCourses = await getTranslations('courses')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, school_id')
    .eq('user_id', user!.id)
    .single()

  const userName = profile?.full_name?.split(' ')[0] || ''
  const schoolId = profile?.school_id

  const [
    studentsResult,
    coursesResult,
    lessonsResult,
    recentCoursesResult,
    pendingReviewsResult,
    schoolResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId!)
      .eq('role', 'student'),
    supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId!),
    supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId!)
      .eq('is_published', true),
    supabase
      .from('courses')
      .select('id, title, is_published, created_at, lessons(count)')
      .eq('school_id', schoolId!)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('homework_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId!)
      .eq('status', 'submitted'),
    supabase
      .from('schools')
      .select('color_scheme, primary_color')
      .eq('id', schoolId!)
      .single(),
  ])

  const pendingReviews = pendingReviewsResult.count ?? 0
  const { primary: accentColor } = resolveSchemeColors(
    schoolResult.data?.color_scheme ?? null,
    schoolResult.data?.primary_color ?? null
  )
  const stats = [
    { label: t('totalStudents'), value: studentsResult.count ?? 0, icon: Users },
    { label: t('totalCourses'), value: coursesResult.count ?? 0, icon: BookOpen },
    { label: t('activeLessons'), value: lessonsResult.count ?? 0, icon: GraduationCap },
    ...(pendingReviews > 0
      ? [{ label: t('pendingReviews'), value: pendingReviews, icon: ClipboardCheck }]
      : []),
  ]

  const recentCourses = (recentCoursesResult.data ?? []) as Array<{
    id: string
    title: string
    is_published: boolean
    created_at: string
    lessons: Array<{ count: number }>
  }>

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('welcome', { name: userName })}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('overview')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon size={20} className="text-muted-foreground/60" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts
        totalStudents={studentsResult.count ?? 0}
        totalCourses={coursesResult.count ?? 0}
        totalLessons={lessonsResult.count ?? 0}
        accentColor={accentColor}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{t('recentCourses')}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard/courses" />}
              >
                {t('viewAllCourses')}
              </Button>
            </CardHeader>
            <CardContent>
              {recentCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen size={36} className="text-muted-foreground mb-3" />
                  <p className="text-base font-medium">{t('noCourses')}</p>
                  <p className="text-sm text-muted-foreground">{t('noCoursesDesc')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentCourses.map((course) => {
                    const lessonCount = course.lessons?.[0]?.count ?? 0
                    return (
                      <Link
                        key={course.id}
                        href={`/dashboard/courses/${course.id}`}
                        className="flex items-center justify-between rounded-xl border p-4 transition-all hover:bg-accent hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                            <BookOpen size={18} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{course.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('lessonsCount', { count: lessonCount })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={course.is_published ? 'default' : 'secondary'}>
                          {course.is_published ? tCourses('live') : tCourses('draft')}
                        </Badge>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                {
                  href: '/dashboard/courses',
                  icon: Plus,
                  title: t('createCourse'),
                  desc: t('createCourseDesc'),
                },
                {
                  href: '/dashboard/students',
                  icon: UserPlus,
                  title: t('inviteStudent'),
                  desc: t('inviteStudentDesc'),
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:bg-accent hover:shadow-sm min-h-[72px]"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <action.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
