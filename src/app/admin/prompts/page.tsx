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

interface AdminPrompt {
  _id: string
  title: string
  prompt_text: string
  prompt_type: string
  tags: string[]
  status: 'draft' | 'published'
  createdAt: string
  isLegacy?: boolean // Flag for prompts migrated from old collection
}

export default function AdminPromptsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const columns: Column<AdminPrompt>[] = [
    { key: 'title', header: 'Title' },
    { key: 'prompt_type', header: 'Type' },
    {
      key: 'tags',
      header: 'Tags',
      render: (item) => (
        <div className="flex gap-1 flex-wrap">
          {item.tags && item.tags.length > 0 ? (
            <>
              {item.tags.slice(0, 3).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && <span className="text-xs">+{item.tags.length - 3}</span>}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No tags</span>
          )}
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
    prompt_type?: string
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
    if (params.prompt_type) queryParams.append('prompt_type', params.prompt_type)

    try {
      const response = await fetch(`/api/admin/prompts?${queryParams}`)
      const data = await response.json()
      
      // Check for errors
      if (!response.ok || !data.success) {
        console.error('Error fetching prompts:', data.error || 'Unknown error')
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
      console.error('Error fetching prompts:', error)
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

  const handleDelete = async (item: AdminPrompt) => {
    const confirmMessage = item.isLegacy 
      ? `Delete legacy prompt "${item.title}"?\n\nThis will permanently remove it from the database.`
      : `Delete prompt "${item.title}"?\n\nThis will permanently remove it from the database.`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = userData._id || userData.id

    try {
      // If it's a legacy prompt, delete from the old Prompt collection
      if (item.isLegacy) {
        // Legacy prompts use the 'id' field, not '_id'
        const promptId = (item as any).id || item._id
        const response = await fetch(`/api/prompts?promptId=${encodeURIComponent(promptId)}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (response.ok && data.success) {
          alert('✅ Legacy prompt deleted successfully')
          // Data will be refreshed by DataTable
          return
        } else {
          alert(`❌ Failed to delete legacy prompt: ${data.error || 'Unknown error'}`)
          return
        }
      }

      // Delete from AdminPrompt collection
      const response = await fetch(`/api/admin/prompts/${item._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert('✅ Prompt deleted successfully')
        // Data will be refreshed by DataTable
      } else {
        alert(`❌ Failed to delete prompt: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
      alert('❌ Failed to delete prompt. Please try again.')
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
            <h1 className="text-3xl font-bold">Manage Prompts</h1>
            <p className="text-muted-foreground">Create, edit, and manage AI prompts</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        <DataTable
          title="Prompts"
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
