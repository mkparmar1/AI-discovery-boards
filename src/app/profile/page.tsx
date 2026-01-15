'use client'

import React, { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Wand2, Save } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import SearchableSelect, { SelectOption } from '@/components/ui/searchable-select'

type ToolForm = {
  id: string
  title: string
  description: string
  tags: string
  image: string
  category: '' | 'Chat' | 'Image' | 'Devtools' | 'Other'
  website: string
  clickCount: string
  mode: 'create' | 'update'
  trendingState: 'unchanged' | 'true' | 'false'
}

const emptyTool = (): ToolForm => ({
  id: '',
  title: '',
  description: '',
  tags: '',
  image: '',
  category: '',
  website: '',
  clickCount: '',
  mode: 'create',
  trendingState: 'unchanged'
})

type PromptForm = {
  id: string
  title: string
  prompt: string
  category: string
  tags: string
  description: string
  useCase: string
  difficulty: '' | 'Beginner' | 'Intermediate' | 'Advanced'
  mode: 'create' | 'update' | 'delete'
}

const emptyPrompt = (): PromptForm => ({
  id: '',
  title: '',
  prompt: '',
  category: '',
  tags: '',
  description: '',
  useCase: '',
  difficulty: '',
  mode: 'create'
})

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [tools, setTools] = useState<ToolForm[]>([emptyTool()])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [toolOptions, setToolOptions] = useState<SelectOption[]>([])
  const [isLoadingTools, setIsLoadingTools] = useState(false)
  const [prompts, setPrompts] = useState<PromptForm[]>([emptyPrompt()])
  const [promptOptions, setPromptOptions] = useState<SelectOption[]>([])
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false)
  const [refreshingUser, setRefreshingUser] = useState(false)

  // Debug: Log user object to see structure
  useEffect(() => {
    if (user) {
      console.log('🔍 User object in profile:', user)
      console.log('🔍 User role:', user.role)
      console.log('🔍 Is admin?', user.role === 'admin')
    }
  }, [user])

  const isAdmin = useMemo(() => {
    // Check multiple possible ways the role might be stored
    const role = user?.role || (user as any)?.role || (user as any)?.userRole
    const isAdminUser = role === 'admin'
    console.log('🔍 Admin check - role:', role, 'isAdmin:', isAdminUser)
    return isAdminUser
  }, [user?.role])

  // Manual refresh function (no auto-refresh to prevent loops)
  const handleRefreshRole = async () => {
    if (!user?.id) return
    
    try {
      setRefreshingUser(true)
      const response = await fetch(`/api/auth/me?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          // Update localStorage with fresh user data
          localStorage.setItem('user', JSON.stringify(data.user))
          // Reload page to update AuthContext
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
      alert('Failed to refresh role. Please try logging out and back in.')
    } finally {
      setRefreshingUser(false)
    }
  }

  const updateTool = (index: number, field: keyof ToolForm, value: string) => {
    setTools(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addTool = () => setTools(prev => [...prev, emptyTool()])
  const addPrompt = () => setPrompts(prev => [...prev, emptyPrompt()])

  const removeTool = (index: number) => {
    setTools(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)
  }

  const updatePrompt = (index: number, field: keyof PromptForm, value: string) => {
    setPrompts(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const removePrompt = (index: number) => {
    setPrompts(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)
  }

  const generateId = (index: number) => {
    if (!('randomUUID' in crypto)) return
    updateTool(index, 'id', crypto.randomUUID())
  }

  const loadToolOptions = async () => {
    setIsLoadingTools(true)
    try {
      const response = await fetch('/api/tools?lookup=true')
      const data = await response.json()
      if (response.ok && data.success) {
        const options = (data.data || []).map((tool: { id: string; title: string }) => ({
          value: tool.id,
          label: tool.title
        }))
        setToolOptions(options)
      }
    } catch {
      // no-op, fallback to empty list
    } finally {
      setIsLoadingTools(false)
    }
  }

  const loadPromptOptions = async () => {
    setIsLoadingPrompts(true)
    try {
      const response = await fetch('/api/prompts?lookup=true')
      const data = await response.json()
      if (response.ok && data.success) {
        const options = (data.data || []).map((prompt: { id: string; title: string }) => ({
          value: prompt.id,
          label: prompt.title
        }))
        setPromptOptions(options)
      }
    } catch {
      // no-op
    } finally {
      setIsLoadingPrompts(false)
    }
  }

  const loadToolDetails = async (toolId: string, index: number) => {
    if (!toolId) return
    try {
      const response = await fetch(`/api/tools?toolId=${encodeURIComponent(toolId)}`)
      const data = await response.json()
      if (response.ok && data.success) {
        const tool = data.data
        setTools(prev => {
          const next = [...prev]
          next[index] = {
            id: tool.id || '',
            title: tool.title || '',
            description: tool.description || '',
            tags: Array.isArray(tool.tags) ? tool.tags.join(', ') : '',
            image: tool.image || '',
            category: tool.category || '',
            website: tool.website || '',
            clickCount: typeof tool.clickCount === 'number' ? String(tool.clickCount) : '',
            mode: 'update',
            trendingState: tool.isTrending ? 'true' : 'false'
          }
          return next
        })
      }
    } catch {
      // no-op, surface via required validation if needed
    }
  }

  const loadPromptDetails = async (promptId: string, index: number) => {
    if (!promptId) return
    try {
      const response = await fetch(`/api/prompts?promptId=${encodeURIComponent(promptId)}`)
      const data = await response.json()
      if (response.ok && data.success) {
        const prompt = data.data
        setPrompts(prev => {
          const next = [...prev]
          next[index] = {
            id: prompt.id || '',
            title: prompt.title || '',
            prompt: prompt.prompt || '',
            category: prompt.category || '',
            tags: Array.isArray(prompt.tags) ? prompt.tags.join(', ') : '',
            description: prompt.description || '',
            useCase: prompt.useCase || '',
            difficulty: prompt.difficulty || '',
            mode: 'update'
          }
          return next
        })
      }
    } catch {
      // no-op
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadToolOptions()
      loadPromptOptions()
    }
  }, [isAdmin])

  const handleToolsSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setResults([])

    const invalidIndex = tools.findIndex(tool => {
      if (!tool.id) return true

      if (tool.mode === 'create') {
        const tags = tool.tags.split(',').map(t => t.trim()).filter(Boolean)
        return !tool.title || !tool.description || !tool.image || !tool.website || !tool.category || tags.length === 0
      }

      const hasAnyField = Boolean(
        tool.title ||
        tool.description ||
        tool.image ||
        tool.website ||
        tool.tags.trim() ||
        tool.clickCount ||
        tool.category ||
        tool.trendingState !== 'unchanged'
      )
      return !hasAnyField
    })

    if (invalidIndex !== -1) {
      setError(`Please complete required fields for tool #${invalidIndex + 1}.`)
      return
    }

    setIsSubmitting(true)
    try {
      const responses = await Promise.all(tools.map(async (tool, index) => {
        const tags = tool.tags.split(',').map(t => t.trim()).filter(Boolean)
        const payload: Record<string, unknown> = {
          id: tool.id
        }

        if (tool.title) payload.title = tool.title
        if (tool.description) payload.description = tool.description
        if (tool.image) payload.image = tool.image
        if (tool.website) payload.website = tool.website
        if (tool.category) payload.category = tool.category
        if (tags.length > 0) payload.tags = tags
        if (tool.clickCount) payload.clickCount = Number(tool.clickCount)
        if (tool.trendingState !== 'unchanged') {
          payload.isTrending = tool.trendingState === 'true'
        }

        if (tool.mode === 'create') {
          payload.isTrending = tool.trendingState === 'true'
        }

        const response = await fetch('/api/tools', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (!response.ok || !data.success) {
          const message = data?.error || `Failed to save tool #${index + 1}`
          throw new Error(message)
        }

        const label = tool.title || tool.id
        return `${tool.mode === 'create' ? 'Created' : 'Updated'} "${label}"`
      }))

      setResults(responses)
      setTools([emptyTool()])
    } catch (submitError: any) {
      setError(submitError?.message || 'Failed to save tools.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePromptsSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setResults([])

    const invalidIndex = prompts.findIndex(prompt => {
      if (!prompt.id) return true

      if (prompt.mode === 'delete') return false

      if (prompt.mode === 'create') {
        const tags = prompt.tags.split(',').map(t => t.trim()).filter(Boolean)
        return !prompt.title || !prompt.prompt || !prompt.category || !prompt.description || !prompt.useCase || !prompt.difficulty || tags.length === 0
      }

      const hasAnyField = Boolean(
        prompt.title ||
        prompt.prompt ||
        prompt.category ||
        prompt.tags.trim() ||
        prompt.description ||
        prompt.useCase ||
        prompt.difficulty
      )
      return !hasAnyField
    })

    if (invalidIndex !== -1) {
      setError(`Please complete required fields for prompt #${invalidIndex + 1}.`)
      return
    }

    setIsSubmitting(true)
    try {
      const responses = await Promise.all(prompts.map(async (prompt, index) => {
        if (prompt.mode === 'delete') {
          const response = await fetch(`/api/prompts?promptId=${encodeURIComponent(prompt.id)}`, {
            method: 'DELETE'
          })
          const data = await response.json()
          if (!response.ok || !data.success) {
            const message = data?.error || `Failed to delete prompt #${index + 1}`
            throw new Error(message)
          }
          return `Deleted "${prompt.id}"`
        }

        const tags = prompt.tags.split(',').map(t => t.trim()).filter(Boolean)
        const payload: Record<string, unknown> = {
          id: prompt.id
        }

        if (prompt.title) payload.title = prompt.title
        if (prompt.prompt) payload.prompt = prompt.prompt
        if (prompt.category) payload.category = prompt.category
        if (tags.length > 0) payload.tags = tags
        if (prompt.description) payload.description = prompt.description
        if (prompt.useCase) payload.useCase = prompt.useCase
        if (prompt.difficulty) payload.difficulty = prompt.difficulty

        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (!response.ok || !data.success) {
          const message = data?.error || `Failed to save prompt #${index + 1}`
          throw new Error(message)
        }

        const label = prompt.title || prompt.id
        return `${prompt.mode === 'create' ? 'Created' : 'Updated'} "${label}"`
      }))

      setResults(responses)
      setPrompts([emptyPrompt()])
    } catch (submitError: any) {
      setError(submitError?.message || 'Failed to save prompts.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="py-8 text-center text-muted-foreground">Loading profile...</div>
      </MainLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Please sign in to access your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Go to login</Link>
            </Button>
          </CardContent>
        </Card>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account and admin tools.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Signed in as {user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{user?.role || 'user'}</Badge>
              {refreshingUser && (
                <span className="text-sm text-muted-foreground ml-2">Refreshing...</span>
              )}
              {isAdmin && (
                <Button asChild className="ml-auto">
                  <Link href="/admin/dashboard">Go to Admin Panel</Link>
                </Button>
              )}
              {!isAdmin && user?.id && (
                <Button 
                  variant="outline" 
                  className="ml-auto"
                  onClick={handleRefreshRole}
                  disabled={refreshingUser}
                >
                  {refreshingUser ? 'Refreshing...' : 'Refresh Role'}
                </Button>
              )}
            </div>
            
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                <p><strong>Debug Info:</strong></p>
                <p>Role from user object: {user?.role || 'undefined'}</p>
                <p>Is Admin check: {isAdmin ? 'true' : 'false'}</p>
                <p>User ID: {user?.id || 'undefined'}</p>
                <details className="mt-1">
                  <summary className="cursor-pointer">Full user object</summary>
                  <pre className="mt-1 text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
        

      </div>
    </MainLayout>
  )
}
