import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { getStripe } from '@/shared/api/stripe.client'
import { createClient } from '@supabase/supabase-js'

// Use service role for webhook operations (no user session)
function getAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function POST(request: Request) {
  const body = await request.text()
  const headerList = await headers()
  const signature = headerList.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const schoolId = session.metadata?.school_id
      if (!schoolId) break

      await supabase
        .from('schools')
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: 'active',
        })
        .eq('id', schoolId)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const { data: school } = await supabase
        .from('schools')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (school) {
        await supabase
          .from('schools')
          .update({ subscription_status: subscription.status })
          .eq('id', school.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      await supabase
        .from('schools')
        .update({
          subscription_status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer as string
      await supabase
        .from('schools')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
