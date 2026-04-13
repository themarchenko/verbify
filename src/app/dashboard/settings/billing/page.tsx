import { BillingPage } from '@/features/billing'
import { createClient } from '@/shared/api/supabase.server'

export default async function BillingSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('user_id', user!.id)
    .single()

  const { data: school } = await supabase
    .from('schools')
    .select('subscription_plan, subscription_status, trial_ends_at')
    .eq('id', profile!.school_id!)
    .single()

  return (
    <BillingPage
      currentPlan={school?.subscription_plan || 'starter'}
      subscriptionStatus={school?.subscription_status || 'trialing'}
      trialEndsAt={school?.trial_ends_at || null}
    />
  )
}
