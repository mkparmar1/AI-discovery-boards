'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import DataTable, { Column } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, LayoutDashboard } from 'lucide-react'

interface AdminVideo {
  _id: string
  title: string
  description: string
  video_url: string
  duration?: number
  category: string
  status: 'draft' | 'published'
  createdAt: string
  isLegacy?: boolean // Flag for videos from old collection
}

export default function AdminVideosPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const columns: Column<AdminVideo>[] = [
    { key: 'title', header: 'Title' },
    { key: 'category', header: 'Category' },
    {
      key: 'duration',
      header: 'Duration',
      render: (item) => item.duration ? `${item.duration} min` : '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'published' ? 'default' : 'outline'}>
          {item.status}
        </Badge>
      )
    },
    {
      key: 'isLegacy',
      header: 'Source',
      render: (item) => (
        item.isLegacy ? (
          <Badge variant="outline" className="text-xs">Legacy</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">Admin</Badge>
        )
      )
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    }
  ]

  const fetchData = async (params: {
    page: number
    limit: number
    search?: string
    status?: string
    category?: string
  }) => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = userData._id || userData.id

    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      userId
    })
    if (params.search) queryParams.append('search', params.search)
    if (params.status) queryParams.append('status', params.status)
    if (params.category) queryParams.append('category', params.category)

    try {
      const response = await fetch(`/api/admin/videos?${queryParams}`)
      const data = await response.json()
      
      // Check for errors
      if (!response.ok || !data.success) {
        console.error('Error fetching videos:', data.error || 'Unknown error')
        return {
          data: [],
          pagination: {
            page: params.page,
            limit: params.limit,
            totalCount: 0,
            totalPages: 0,
            hasMore: false
          }
        }
      }
      
      // Return data in the format expected by DataTable
      return {
        data: data.data || [],
        pagination: data.pagination || {
          page: params.page,
          limit: params.limit,
          totalCount: 0,
          totalPages: 0,
          hasMore: false
        }
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      return {
        data: [],
        pagination: {
          page: params.page,
          limit: params.limit,
          totalCount: 0,
          totalPages: 0,
          hasMore: false
        }
      }
    }
  }

  const handleDelete = async (item: AdminVideo) => {
    const confirmMessage = item.isLegacy 
      ? `Delete legacy video "${item.title}"?\n\nThis will permanently remove it from the database.`
      : `Delete video "${item.title}"?\n\nThis will permanently remove it from the database.`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = userData._id || userData.id

    try {
      // If it's a legacy video, delete from the old LearnAIVideo collection
      if (item.isLegacy) {
        // Use the admin videos API with a special flag, or create a direct delete
        // For now, we'll use a workaround by calling the model directly via a custom endpoint
        // Or we can just show a message that legacy videos need special handling
        try {
          const response = await fetch(`/api/admin/videos/legacy/${item._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          })
          const data = await response.json()
          if (response.ok && data.success) {
            alert('✅ Legacy video deleted successfully')
            // Data will be refreshed by DataTable
            return
          } else {
            alert(`❌ Failed to delete legacy video: ${data.error || 'Unknown error'}`)
            return
          }
        } catch (error) {
          console.error('Error deleting legacy video:', error)
          alert('❌ Failed to delete legacy video. Please try again or delete it from the LearnAIVideo collection directly.')
          return
        }
      }

      // Delete from AdminLearningVideo collection
      const response = await fetch(`/api/admin/videos/${item._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert('✅ Video deleted successfully')
        // Data will be refreshed by DataTable
      } else {
        alert(`❌ Failed to delete video: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('❌ Failed to delete video. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Learning Videos</h1>
            <p className="text-muted-foreground">Create, edit, and manage learning videos</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        <DataTable
          title="Learning Videos"
          columns={columns}
          fetchData={fetchData}
          onDelete={handleDelete}
          onCreate={() => {}}
          statusFilter={true}
          categoryFilter={true}
        />
      </div>
    </MainLayout>
  )
}
