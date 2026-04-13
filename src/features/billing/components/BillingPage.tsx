'use client'

import { useFormatter, useTranslations } from 'next-intl'

import { AlertCircle, Check, Gift, Mail } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { PLANS, type PlanKey } from '../model/plans.config'

interface BillingPageProps {
  currentPlan: string
  subscriptionStatus: string
  trialEndsAt: string | null
}

type AccessState = 'free' | 'active' | 'expired' | 'none'

function getAccessState(status: string, trialEndsAt: string | null): AccessState {
  if (status === 'active') return 'active'
  if (status === 'trialing' && trialEndsAt) {
    return new Date(trialEndsAt) > new Date() ? 'free' : 'expired'
  }
  if (status === 'canceled' || status === 'past_due') return 'expired'
  return 'none'
}

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

export function BillingPage({ currentPlan, subscriptionStatus, trialEndsAt }: BillingPageProps) {
  const t = useTranslations('billing')
  const format = useFormatter()

  const accessState = getAccessState(subscriptionStatus, trialEndsAt)
  const planKey = currentPlan in PLANS ? (currentPlan as PlanKey) : 'starter'
  const plan = PLANS[planKey]
  const daysRemaining = trialEndsAt ? getDaysRemaining(trialEndsAt) : null

  const features = [
    plan.limits.students === Infinity
      ? `${t('unlimited')} ${t('studentsLimit', { count: '' }).trim()}`
      : t('studentsLimit', { count: plan.limits.students }),
    plan.limits.teachers === Infinity
      ? `${t('unlimited')} ${t('teachersLimit', { count: '' }).trim()}`
      : t('teachersLimit', { count: plan.limits.teachers }),
    t('lessonBuilder'),
    t('progressTracking'),
  ]

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>

      {/* Status card */}
      <Card>
        <CardContent>
          {/* Free access */}
          {accessState === 'free' && trialEndsAt && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/5">
                    <Gift size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg leading-tight">{t('freeAccess')}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t('validUntil', {
                        date: format.dateTime(new Date(trialEndsAt), { dateStyle: 'long' }),
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0 mt-0.5">
                  {daysRemaining === 0
                    ? t('lastDay')
                    : t('daysRemaining', { count: daysRemaining! })}
                </Badge>
              </div>

              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground transition-all duration-500"
                  style={{
                    width: `${Math.max(4, Math.min(100, ((daysRemaining ?? 0) / 30) * 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Active subscription */}
          {accessState === 'active' && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/5">
                <Check size={20} />
              </div>
              <div>
                <p className="font-semibold text-lg leading-tight">{t('activeAccess')}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{plan.name}</p>
              </div>
            </div>
          )}

          {/* Expired */}
          {accessState === 'expired' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle size={20} className="text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-lg leading-tight">{t('expiredAccess')}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {trialEndsAt
                      ? t('expiredOn', {
                          date: format.dateTime(new Date(trialEndsAt), { dateStyle: 'long' }),
                        })
                      : t('expiredDescription')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No subscription */}
          {accessState === 'none' && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <AlertCircle size={20} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg leading-tight">{t('noAccess')}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{t('noAccessDescription')}</p>
              </div>
            </div>
          )}

          {/* Features list */}
          {(accessState === 'free' || accessState === 'active') && (
            <>
              <Separator className="my-5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  {t('planIncludes')}
                </p>
                <ul className="flex flex-col gap-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm">
                      <Check size={15} className="text-foreground shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Coming soon */}
      <Card className="border-dashed bg-muted/40">
        <CardContent className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background border">
            <Mail size={16} />
          </div>
          <div>
            <p className="text-sm font-medium leading-snug">{t('comingSoon')}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{t('contactEmail')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
