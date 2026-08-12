import { useCallback, useEffect, useState } from 'react'
import { Users as UsersIcon } from 'lucide-react'
import AdminNav from '../../../components/admin/AdminNav'
import Button from '../../../components/common/Button'
import Badge from '../../../components/ui/Badge'
import EmptyState from '../../../components/ui/EmptyState'
import { TextLineSkeleton } from '../../../components/ui/LoadingSkeleton'
import * as adminService from '../../../services/adminService'
import type { AdminUser } from '../../../services/adminService'
import { extractErrorMessage } from '../../../utils/errorMessage'

function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setIsLoading(true)
    setError('')
    adminService
      .listUsers()
      .then(setUsers)
      .catch((loadError) => setError(extractErrorMessage(loadError, 'Could not load users.')))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Users</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {isLoading ? 'Loading users…' : `${users.length} registered user${users.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <AdminNav />
      </div>

      <div className="mt-8">
        {error ? (
          <EmptyState
            icon={UsersIcon}
            title="Could not load users"
            description={error}
            action={<Button onClick={load}>Try Again</Button>}
          />
        ) : isLoading ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-card">
            {Array.from({ length: 6 }, (_, index) => (
              <TextLineSkeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users yet" description="Registered users will appear here." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold tracking-wide text-ink-soft uppercase">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Username</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">University</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{user.fullName}</td>
                    <td className="px-5 py-3 text-ink-soft">@{user.username}</td>
                    <td className="px-5 py-3 text-ink-soft">{user.email}</td>
                    <td className="px-5 py-3 text-ink-soft">{user.university}</td>
                    <td className="px-5 py-3">
                      <Badge variant={user.isAdmin ? 'primary' : 'neutral'}>{user.isAdmin ? 'Admin' : 'User'}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
