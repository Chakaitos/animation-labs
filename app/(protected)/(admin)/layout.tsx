import { checkAdminAccess } from '@/lib/actions/admin'
import { AdminNavigation } from '@/components/navigation/admin-navigation'
import { Footer } from '@/components/marketing/Footer'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await checkAdminAccess()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <AdminNavigation user={user} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <Footer />
    </div>
  )
}
