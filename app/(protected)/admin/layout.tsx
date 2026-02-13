import { checkAdminAccess } from '@/lib/actions/admin'
import { AdminNavigation } from '@/components/navigation/admin-navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await checkAdminAccess()

  return (
    <>
      <AdminNavigation user={user} />
      <main className="container mx-auto px-4 py-8 max-w-7xl bg-gray-50 dark:bg-gray-950 min-h-screen">
        {children}
      </main>
    </>
  )
}
