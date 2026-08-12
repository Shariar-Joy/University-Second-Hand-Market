import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, GraduationCap, PackageCheck, ShoppingBag, Users } from 'lucide-react'
import AdminNav from '../../../components/admin/AdminNav'
import Button from '../../../components/common/Button'
import EmptyState from '../../../components/ui/EmptyState'
import StatsCard from '../../../components/ui/StatsCard'
import * as adminService from '../../../services/adminService'
import type { AdminStats } from '../../../services/adminService'
import { extractErrorMessage } from '../../../utils/errorMessage'

function StatSkeleton() {
  return <div className="h-[68px] animate-pulse rounded-2xl bg-slate-200/80" />
}

function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setIsLoading(true)
    setError('')
    adminService
      .fetchStats()
      .then(setStats)
      .catch((loadError) => setError(extractErrorMessage(loadError, 'Could not load dashboard statistics.')))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-ink-soft">Marketplace overview and moderation tools.</p>
        </div>
        <AdminNav />
      </div>

      <div className="mt-8">
        {error ? (
          <EmptyState
            icon={Users}
            title="Could not load dashboard statistics"
            description={error}
            action={<Button onClick={load}>Try Again</Button>}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <StatSkeleton key={index} />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatsCard icon={Users} value={String(stats.totalUsers)} label="Total Users" index={0} />
            <StatsCard icon={ShoppingBag} value={String(stats.totalProducts)} label="Total Products" index={1} />
            <StatsCard icon={CheckCircle2} value={String(stats.activeListings)} label="Active Listings" index={2} />
            <StatsCard icon={PackageCheck} value={String(stats.soldListings)} label="Sold Listings" index={3} />
            <StatsCard icon={GraduationCap} value={String(stats.totalTutors)} label="Tutors" index={4} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default AdminDashboard
