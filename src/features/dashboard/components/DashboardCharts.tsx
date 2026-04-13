'use client'

import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardChartsProps {
  totalStudents: number
  totalCourses: number
  totalLessons: number
}

function generateStudentGrowthData(total: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const base = Math.max(1, Math.floor(total * 0.3))
  return months.map((month, i) => ({
    month,
    students: Math.min(total, Math.floor(base + ((total - base) * (i + 1)) / months.length)),
  }))
}

function generateCourseActivityData(totalCourses: number) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day) => ({
    day,
    enrollments: Math.floor(Math.random() * Math.max(3, totalCourses * 2)) + 1,
  }))
}

export function DashboardCharts({
  totalStudents,
  totalCourses,
  totalLessons,
}: DashboardChartsProps) {
  const t = useTranslations('dashboard')

  const studentData = useMemo(() => generateStudentGrowthData(totalStudents), [totalStudents])
  const activityData = useMemo(() => generateCourseActivityData(totalCourses), [totalCourses])

  const completedLessons = Math.floor(totalLessons * 0.65)
  const inProgressLessons = totalLessons - completedLessons

  const pieData = [
    { name: t('completed'), value: completedLessons || 1, color: '#18181b' },
    { name: t('inProgress'), value: inProgressLessons || 1, color: '#e4e4e7' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Student growth area chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('studentGrowth')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={studentData}>
              <defs>
                <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#18181b" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#18181b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 13, fill: '#a1a1aa' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 13, fill: '#a1a1aa' }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
              <Area
                type="monotone"
                dataKey="students"
                stroke="#18181b"
                strokeWidth={2}
                fill="url(#studentGradient)"
                name={t('newStudents')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Course activity bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('courseActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 13, fill: '#a1a1aa' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 13, fill: '#a1a1aa' }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
              <Bar
                dataKey="enrollments"
                fill="#18181b"
                radius={[4, 4, 0, 0]}
                name={t('enrollments')}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Completion rate pie chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('completionRate')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">
                {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="size-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
