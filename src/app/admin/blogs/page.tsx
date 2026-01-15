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

interface AdminBlog {
  _id: string
  id?: string // For static blogs
  title: string
  slug: string
  content: string
  seo_title?: string
  seo_description?: string
  status: 'draft' | 'published'
  createdAt: string
  isLegacy?: boolean // Flag for blogs from static data
}

export default function AdminBlogsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const columns: Column<AdminBlog>[] = [
    { key: 'title', header: 'Title' },
    { key: 'slug', header: 'Slug' },
    {
      key: 'content',
      header: 'Content Preview',
      render: (item) => (
        <div className="max-w-md truncate text-sm text-muted-foreground">
          {item.content ? `${item.content.substring(0, 100)}...` : 'No content'}
        </div>
      )
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
          <Badge variant="outline" className="text-xs">Static</Badge>
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

    try {
      const response = await fetch(`/api/admin/blogs?${queryParams}`)
      const data = await response.json()
      
      // Check for errors
      if (!response.ok || !data.success) {
        console.error('Error fetching blogs:', data.error || 'Unknown error')
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
      console.error('Error fetching blogs:', error)
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

  const handleDelete = async (item: AdminBlog) => {
    // Static blogs cannot be deleted
    if (item.isLegacy) {
      alert('⚠️ Static blogs cannot be deleted. They are part of the application data.')
      return
    }

    const confirmMessage = `Delete blog "${item.title}"?\n\nThis will permanently remove it from the database.`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = userData._id || userData.id

    try {
      const response = await fetch(`/api/admin/blogs/${item._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert('✅ Blog deleted successfully')
        // Data will be refreshed by DataTable
      } else {
        alert(`❌ Failed to delete blog: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('❌ Failed to delete blog. Please try again.')
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
            <h1 className="text-3xl font-bold">Manage Blogs</h1>
            <p className="text-muted-foreground">Create, edit, and manage blog posts</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        <DataTable
          title="Blogs"
          columns={columns}
          fetchData={fetchData}
          onDelete={handleDelete}
          onCreate={() => {}}
          statusFilter={true}
        />
      </div>
    </MainLayout>
  )
}
