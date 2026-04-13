'use client'

import { DayPicker } from 'react-day-picker'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

function Calendar({ className, classNames, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col gap-2',
        month: 'flex flex-col gap-2',
        month_caption: 'flex items-center justify-center relative h-8',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1',
        button_previous:
          'absolute left-0 inline-flex items-center justify-center size-7 rounded-md border border-border bg-background hover:bg-muted transition-colors',
        button_next:
          'absolute right-0 inline-flex items-center justify-center size-7 rounded-md border border-border bg-background hover:bg-muted transition-colors',
        month_grid: 'w-full border-collapse',
        weekdays: '',
        weekday: 'text-muted-foreground text-xs font-medium w-8 h-8',
        weeks: '',
        week: '',
        day: 'text-center p-0',
        day_button: cn(
          'inline-flex items-center justify-center size-8 rounded-md text-sm font-normal transition-colors',
          'hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
        ),
        today: 'font-semibold',
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90',
        outside: 'text-muted-foreground/40',
        disabled: 'text-muted-foreground/30 pointer-events-none',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
