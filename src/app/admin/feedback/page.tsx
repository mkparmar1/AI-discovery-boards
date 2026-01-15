'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import DataTable, { Column } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, LayoutDashboard, Bug, Lightbulb, MessageSquareText } from 'lucide-react'

interface AdminFeedback {
  _id: string
  name?: string
  email?: string
  type: 'bug' | 'idea' | 'other'
  message: string
  pageUrl?: string
  status: 'new' | 'read' | 'archived'
  createdAt: string
}

export default function AdminFeedbackPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const handleStatusUpdate = async (item: AdminFeedback, newStatus: 'new' | 'read' | 'archived') => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = userData._id || userData.id

    try {
      const response = await fetch(`/api/admin/feedback/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        // Data will be refreshed by DataTable
        setTimeout(() => window.location.reload(), 500)
        return true
      } else {
        alert(`❌ Failed to update status: ${data.error || 'Unknown error'}`)
        return false
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('❌ Failed to update status. Please try again.')
      return false
    }
  }

  const columns: Column<AdminFeedback>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (item) => {
        const icons = {
          bug: <Bug className="h-3 w-3" />,
          idea: <Lightbulb className="h-3 w-3" />,
          other: <MessageSquareText className="h-3 w-3" />
        }
        const colors = {
          bug: 'destructive',
          idea: 'default',
          other: 'secondary'
        }
        return (
          <Badge variant={colors[item.type] as any} className="flex items-center gap-1 w-fit">
            {icons[item.type]}
            {item.type}
          </Badge>
        )
      }
    },
    {
      key: 'name',
      header: 'Name',
      render: (item) => item.name || <span className="text-muted-foreground">Anonymous</span>
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => item.email || <span className="text-muted-foreground">N/A</span>
    },
    {
      key: 'message',
      header: 'Message',
      render: (item) => (
        <div className="max-w-md truncate text-sm">
          {item.message.substring(0, 100)}{item.message.length > 100 ? '...' : ''}
        </div>
      )
    },
    {
      key: 'pageUrl',
      header: 'Page',
      render: (item) => item.pageUrl ? (
        <a
          href={item.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-sm truncate max-w-[150px] block"
        >
          {item.pageUrl.replace(/^(https?:\/\/)?(www\.)?/, '')}
        </a>
      ) : (
        <span className="text-muted-foreground text-sm">N/A</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'new' ? 'default' : item.status === 'read' ? 'secondary' : 'outline'}>
          {item.status}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Created At',
      render: (item) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          {item.status !== 'new' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate(item, 'new')}
            >
              Mark New
            </Button>
          )}
          {item.status !== 'read' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate(item, 'read')}
            >
              Mark Read
            </Button>
          )}
          {item.status !== 'archived' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate(item, 'archived')}
            >
              Archive
            </Button>
          )}
        </div>
      )
    }
  ]

  const fetchData = async (params: {
    page: number
    limit: number
    search?: string
    status?: string
    category?: string
    type?: string
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
    // Use category for type filter (bug, idea, other)
    if (params.category) queryParams.append('type', params.category)

    try {
      const response = await fetch(`/api/admin/feedback?${queryParams}`)
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        console.error('Error fetching feedback:', data.error || 'Unknown error')
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
      console.error('Error fetching feedback:', error)
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

  const handleDelete = async (item: AdminFeedback) => {
    if (!window.confirm(`Delete feedback from ${item.name || 'Anonymous'}?`)) {
      return
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = userData._id || userData.id

    try {
      const response = await fetch(`/api/admin/feedback/${item._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert('✅ Feedback deleted successfully')
        // Data will be refreshed by DataTable
      } else {
        alert(`❌ Failed to delete feedback: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
      alert('❌ Failed to delete feedback. Please try again.')
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
            <h1 className="text-3xl font-bold">Manage Feedback</h1>
            <p className="text-muted-foreground">View and manage user feedback</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        <DataTable
          title="Feedback"
          columns={columns}
          fetchData={fetchData}
          onDelete={handleDelete}
          statusFilter={true}
          getStatus={(item) => item.status}
          categoryFilter={true}
          getCategory={(item) => item.type}
        />
      </div>
    </MainLayout>
  )
}
