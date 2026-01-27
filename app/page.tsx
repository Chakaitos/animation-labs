import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  // This verifies the import works - will fail at runtime without real credentials
  // but should compile without errors
  // Uncomment when Supabase project is configured:
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">AnimateLabs</h1>
      <p className="text-muted-foreground">
        Professional logo animations in minutes
      </p>
    </main>
  )
}
