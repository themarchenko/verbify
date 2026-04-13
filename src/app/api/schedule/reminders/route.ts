import { NextResponse } from 'next/server'

import { getUpcomingReminders } from '@/features/schedule/api/schedule.queries'

export async function GET() {
  try {
    const reminders = await getUpcomingReminders()
    return NextResponse.json(reminders)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
