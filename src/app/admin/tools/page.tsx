'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import DataTable, { Column } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ExternalLink, X, LayoutDashboard } from 'lucide-react'

interface AdminTool {
  _id: string
  title: string
  description: string
  category: string
  website_url: string
  website?: string // For legacy tools
  image?: string // Tool image/logo
  pricing_type: 'free' | 'paid' | 'freemium'
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  isLegacy?: boolean // Flag for tools migrated from old collection
}

export default function AdminToolsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<AdminTool | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    website_url: '',
    pricing_type: 'free' as 'free' | 'paid' | 'freemium',
    status: 'draft' as 'draft' | 'published'
  })
  const [isSaving, setIsSaving] = useState(false)
  const selectedToolRef = useRef<AdminTool | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  // Keep ref in sync with selectedTool
  useEffect(() => {
    selectedToolRef.current = selectedTool
  }, [selectedTool])

  // Update form data when selectedTool changes
  useEffect(() => {
    if (selectedTool && !selectedTool.isLegacy) {
      setFormData({
        title: selectedTool.title || '',
        description: selectedTool.description || '',
        category: selectedTool.category || '',
        website_url: selectedTool.website_url || selectedTool.website || '',
        pricing_type: selectedTool.pricing_type || 'free',
        status: selectedTool.status || 'draft'
      })
    } else if (!selectedTool) {
      setFormData({
        title: '',
        description: '',
        category: '',
        website_url: '',
        pricing_type: 'free',
        status: 'draft'
      })
    }
  }, [selectedTool])

  const columns: Column<AdminTool>[] = [
    {
      key: 'image',
      header: 'Preview',
      render: (item: any) => {
        const imageUrl = item.image
        
        // Only show if there's an actual image URL (not placeholder/default)
        const isValidImage = imageUrl && 
          !imageUrl.includes('placeholder') && 
          !imageUrl.includes('64x64') && 
          !imageUrl.includes('500 x 100') &&
          !imageUrl.includes('placehold.co') &&
          imageUrl.trim() !== ''

        // Show nothing if no valid image
        if (!isValidImage) {
          return null
        }

        return (
          <div className="flex items-center justify-center w-12 h-12">
            <div className="relative w-10 h-10 flex-shrink-0">
              <img
                src={imageUrl}
                alt={item.title}
                className="w-full h-full rounded object-cover border"
                style={{ 
                  width: '40px',
                  height: '40px',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  // Hide image completely if it fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          </div>
        )
      }
    },
    { 
      key: 'title', 
      header: 'Title',
      render: (item) => (
        <div className="max-w-xs">
          <div className="font-medium truncate" title={item.title}>
            {item.title}
          </div>
        </div>
      )
    },
    { key: 'category', header: 'Category' },
    {
      key: 'website_url',
      header: 'Website',
      render: (item: any) => {
        const url = item.website_url || item.website
        if (!url) {
          return <span className="text-sm text-muted-foreground">N/A</span>
        }
        return (
          <div className="max-w-xs">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1 group"
              title={`Open ${url} in new tab`}
              onClick={(e) => {
                // Open in new tab
                e.stopPropagation()
              }}
            >
              <span className="truncate">{url}</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </a>
          </div>
        )
      }
    },
    {
      key: 'pricing_type',
      header: 'Pricing',
      render: (item) => (
        <Badge variant={item.pricing_type === 'free' ? 'default' : 'secondary'}>
          {item.pricing_type}
        </Badge>
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

    const response = await fetch(`/api/admin/tools?${queryParams}`)
    const data = await response.json()
    return data
  }

  const handleEdit = (item: AdminTool) => {
    // Warn if trying to edit legacy tool
    if (item.isLegacy) {
      if (!window.confirm('This is a legacy tool. Legacy tools cannot be edited directly. Would you like to create a new admin tool based on this one?')) {
        return
      }
      // Create a new tool based on legacy tool
      setSelectedTool(null)
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        website_url: item.website_url || item.website || '',
        pricing_type: item.pricing_type || 'free',
        status: 'published'
      })
      setEditModalOpen(true)
      return
    }
    
    setSelectedTool(item)
    setEditModalOpen(true)
  }

  const handleDelete = async (item: AdminTool) => {
    const websiteUrl = item.website_url || item.website || 'N/A'
    const confirmMessage = item.isLegacy 
      ? `Delete legacy tool "${item.title}"?\n\nWebsite: ${websiteUrl}\n\nThis will permanently remove it from the database.`
      : `Delete tool "${item.title}"?\n\nWebsite: ${websiteUrl}\n\nThis will permanently remove it from the database.`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = userData._id || userData.id

    try {
      // If it's a legacy tool, delete from the old Tool collection
      if (item.isLegacy) {
        const response = await fetch(`/api/tools/${item._id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (response.ok && data.success) {
          alert('✅ Legacy tool deleted successfully')
          // Data will be refreshed by DataTable
          return
        } else {
          alert(`❌ Failed to delete legacy tool: ${data.error || 'Unknown error'}`)
          return
        }
      }

      // Delete from AdminAITool collection
      const response = await fetch(`/api/admin/tools/${item._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        alert('✅ Tool deleted successfully')
        // Data will be refreshed by DataTable
      } else {
        alert(`❌ Failed to delete tool: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting tool:', error)
      alert('❌ Failed to delete tool. Please try again.')
    }
  }

  const handleCreate = () => {
    setSelectedTool(null)
    setEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.category || !formData.website_url || !formData.pricing_type) {
      alert('Please fill in all required fields')
      return
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = userData._id || userData.id

    // Capture selectedTool at the start to prevent it from being cleared
    const toolToEdit = selectedToolRef.current || selectedTool
    
    // Debug: Check if we have selectedTool
    console.log('🔍 Saving tool - selectedTool state:', selectedTool)
    console.log('🔍 Saving tool - selectedTool ref:', selectedToolRef.current)
    console.log('🔍 Saving tool - toolToEdit:', toolToEdit)
    console.log('🔍 Form data:', formData)

    try {
      setIsSaving(true)
      
      // Check if we're editing (toolToEdit exists, has _id, and is not legacy)
      const isEditing = toolToEdit && toolToEdit._id && !toolToEdit.isLegacy
      
      console.log('🔍 Is editing?', isEditing, 'Tool ID:', toolToEdit?._id)
      
      if (isEditing && toolToEdit?._id) {
        const toolId = toolToEdit._id
        console.log('📝 Updating tool with ID:', toolId)
        // Update existing admin tool
        const response = await fetch(`/api/admin/tools/${toolId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            ...formData
          })
        })

        const data = await response.json()
        console.log('📝 Update response:', data)
        
        if (response.ok && data.success) {
          alert('✅ Tool updated successfully')
          setEditModalOpen(false)
          setSelectedTool(null)
          // Refresh the page to reload data
          setTimeout(() => window.location.reload(), 500)
        } else {
          alert(`❌ Failed to update tool: ${data.error || 'Unknown error'}`)
        }
      } else {
        console.log('➕ Creating new tool')
        // Create new tool
        const response = await fetch('/api/admin/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            ...formData,
            status: formData.status || 'draft'
          })
        })

        const data = await response.json()
        console.log('➕ Create response:', data)
        
        if (response.ok && data.success) {
          alert('✅ Tool created successfully')
          setEditModalOpen(false)
          setSelectedTool(null)
          setFormData({
            title: '',
            description: '',
            category: '',
            website_url: '',
            pricing_type: 'free',
            status: 'draft'
          })
          // Refresh the page to reload data
          setTimeout(() => window.location.reload(), 500)
        } else {
          alert(`❌ Failed to create tool: ${data.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('❌ Error saving tool:', error)
      alert('❌ Failed to save tool. Please try again.')
    } finally {
      setIsSaving(false)
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
            <h1 className="text-3xl font-bold">Manage AI Tools</h1>
            <p className="text-muted-foreground">Create, edit, and manage AI tools</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        <DataTable
          title="AI Tools"
          columns={columns}
          fetchData={fetchData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          statusFilter={true}
          categoryFilter={true}
        />

        {/* Edit/Create Modal */}
        <Dialog 
          open={editModalOpen} 
          onOpenChange={(open) => {
            if (!isSaving) {
              setEditModalOpen(open)
              if (!open) {
                setSelectedTool(null)
              }
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>
                  {selectedTool ? 'Edit Tool' : 'Create New Tool'}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (!isSaving) {
                      setEditModalOpen(false)
                      setSelectedTool(null)
                    }
                  }}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <DialogDescription>
                {selectedTool ? 'Update tool information' : 'Add a new AI tool to the database'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter tool title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter tool description"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Chat, Image, Devtools"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Website URL *</label>
                  <Input
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    placeholder="https://example.com"
                    type="url"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Pricing Type *</label>
                  <select
                    value={formData.pricing_type}
                    onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value as 'free' | 'paid' | 'freemium' })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                    <option value="freemium">Freemium</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  selectedTool ? 'Update Tool' : 'Create Tool'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
