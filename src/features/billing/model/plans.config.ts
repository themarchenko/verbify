export const PLANS = {
  starter: {
    name: 'Starter',
    price_monthly: 29,
    price_yearly: 290,
    stripe_price_id_monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '',
    stripe_price_id_yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || '',
    limits: { students: 50, teachers: 2 },
  },
  pro: {
    name: 'Pro',
    price_monthly: 59,
    price_yearly: 490,
    stripe_price_id_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    stripe_price_id_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    limits: { students: 200, teachers: 10 },
  },
  business: {
    name: 'Business',
    price_monthly: 99,
    price_yearly: 990,
    stripe_price_id_monthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || '',
    stripe_price_id_yearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || '',
    limits: { students: Infinity, teachers: Infinity },
  },
} as const

export type PlanKey = keyof typeof PLANS
