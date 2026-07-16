import UserManagementPageClient from './page-client'
import { loadAdminUsers } from '@/lib/admin/users'

export default async function UserManagementPage() {
  const initialData = await loadAdminUsers()

  return <UserManagementPageClient initialData={initialData} />
}
