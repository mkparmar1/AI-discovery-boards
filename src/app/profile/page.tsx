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

  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role])

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
          <CardContent className="flex items-center gap-2">
            <Badge variant="secondary">{user?.role || 'user'}</Badge>
          </CardContent>
        </Card>

        {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle>Admin: Add Tools</CardTitle>
                <CardDescription>Add or update tools one by one or multiple at a time.</CardDescription>
              </CardHeader>
              <CardContent>
              <form onSubmit={handleToolsSubmit} className="space-y-6">
                {tools.map((tool, index) => (
                  <div key={`tool-form-${index}`} className="rounded-lg border border-border/50 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Tool #{index + 1}</h3>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => generateId(index)}>
                          <Wand2 className="h-4 w-4 mr-1" />
                          Generate ID
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTool(index)}
                          disabled={tools.length === 1}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Mode</label>
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={tool.mode}
                          onChange={(e) => updateTool(index, 'mode', e.target.value as ToolForm['mode'])}
                        >
                          <option value="create">Create new tool</option>
                          <option value="update">Update existing tool</option>
                        </select>
                        <p className="text-xs text-muted-foreground">
                          Update mode only changes fields you fill in.
                        </p>
                      </div>
                      {tool.mode === 'update' && (
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">Find tool</label>
                          <SearchableSelect
                            options={toolOptions}
                            value={tool.id}
                            onChange={(value) => {
                              updateTool(index, 'id', value)
                              loadToolDetails(value, index)
                            }}
                            placeholder={isLoadingTools ? 'Loading tools...' : 'Search tools...'}
                          />
                          <p className="text-xs text-muted-foreground">
                            Select a tool to auto-fill details.
                          </p>
                        </div>
                      )}
                      <Input
                        placeholder="Tool ID"
                        value={tool.id}
                        onChange={(e) => updateTool(index, 'id', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Title"
                        value={tool.title}
                        onChange={(e) => updateTool(index, 'title', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Website URL"
                        value={tool.website}
                        onChange={(e) => updateTool(index, 'website', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Image URL"
                        value={tool.image}
                        onChange={(e) => updateTool(index, 'image', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Tags (comma separated)"
                        value={tool.tags}
                        onChange={(e) => updateTool(index, 'tags', e.target.value)}
                      />
                      <Input
                        placeholder="Click Count (optional)"
                        value={tool.clickCount}
                        onChange={(e) => updateTool(index, 'clickCount', e.target.value)}
                      />
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Trending status</label>
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={tool.trendingState}
                          onChange={(e) => updateTool(index, 'trendingState', e.target.value as ToolForm['trendingState'])}
                        >
                          <option value="unchanged">Leave unchanged</option>
                          <option value="true">Trending</option>
                          <option value="false">Not trending</option>
                        </select>
                      </div>
                      <select
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={tool.category}
                        onChange={(e) => updateTool(index, 'category', e.target.value)}
                      >
                        <option value="">Select category</option>
                        <option value="Chat">Chat</option>
                        <option value="Image">Image</option>
                        <option value="Devtools">Devtools</option>
                        <option value="Other">Other</option>
                      </select>
                      <Input
                        placeholder="Short description"
                        value={tool.description}
                        onChange={(e) => updateTool(index, 'description', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" variant="outline" onClick={addTool}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add another tool
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-1" />
                    {isSubmitting ? 'Saving...' : 'Save tools'}
                  </Button>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {results.length > 0 && (
                  <div className="text-sm text-green-600 space-y-1">
                    {results.map((message, idx) => (
                      <p key={`result-${idx}`}>{message}</p>
                    ))}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Admin: Manage Prompts</CardTitle>
              <CardDescription>Add, update, or delete prompts in bulk.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePromptsSubmit} className="space-y-6">
                {prompts.map((prompt, index) => (
                  <div key={`prompt-form-${index}`} className="rounded-lg border border-border/50 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Prompt #{index + 1}</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePrompt(index)}
                        disabled={prompts.length === 1}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Mode</label>
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={prompt.mode}
                          onChange={(e) => updatePrompt(index, 'mode', e.target.value as PromptForm['mode'])}
                        >
                          <option value="create">Create new prompt</option>
                          <option value="update">Update existing prompt</option>
                          <option value="delete">Delete prompt</option>
                        </select>
                      </div>
                      {prompt.mode !== 'create' && (
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">Find prompt</label>
                          <SearchableSelect
                            options={promptOptions}
                            value={prompt.id}
                            onChange={(value) => {
                              updatePrompt(index, 'id', value)
                              if (prompt.mode !== 'delete') {
                                loadPromptDetails(value, index)
                              }
                            }}
                            placeholder={isLoadingPrompts ? 'Loading prompts...' : 'Search prompts...'}
                          />
                        </div>
                      )}
                      <Input
                        placeholder="Prompt ID"
                        value={prompt.id}
                        onChange={(e) => updatePrompt(index, 'id', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Title"
                        value={prompt.title}
                        onChange={(e) => updatePrompt(index, 'title', e.target.value)}
                      />
                      <Input
                        placeholder="Category"
                        value={prompt.category}
                        onChange={(e) => updatePrompt(index, 'category', e.target.value)}
                      />
                      <Input
                        placeholder="Tags (comma separated)"
                        value={prompt.tags}
                        onChange={(e) => updatePrompt(index, 'tags', e.target.value)}
                      />
                      <Input
                        placeholder="Use case"
                        value={prompt.useCase}
                        onChange={(e) => updatePrompt(index, 'useCase', e.target.value)}
                      />
                      <select
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={prompt.difficulty}
                        onChange={(e) => updatePrompt(index, 'difficulty', e.target.value)}
                      >
                        <option value="">Select difficulty</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <textarea
                        className="min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Short description"
                        value={prompt.description}
                        onChange={(e) => updatePrompt(index, 'description', e.target.value)}
                      />
                      <textarea
                        className="min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-2"
                        placeholder="Prompt text"
                        value={prompt.prompt}
                        onChange={(e) => updatePrompt(index, 'prompt', e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" variant="outline" onClick={addPrompt}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add another prompt
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-1" />
                    {isSubmitting ? 'Saving...' : 'Save prompts'}
                  </Button>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {results.length > 0 && (
                  <div className="text-sm text-green-600 space-y-1">
                    {results.map((message, idx) => (
                      <p key={`result-prompt-${idx}`}>{message}</p>
                    ))}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Admin Tools</CardTitle>
              <CardDescription>Only admins can add tools. Ask an admin to update your role.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
