import MainLayout from '@/components/layout/MainLayout'
import TrendingDashboard from '@/components/analytics/TrendingDashboard'

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <TrendingDashboard />
      </div>
    </MainLayout>
  )
}