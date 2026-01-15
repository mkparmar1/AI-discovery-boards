'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Wrench, FileText, BookOpen, Video, Loader2, MessageSquare, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    tools: 0,
    prompts: 0,
    blogs: 0,
    videos: 0,
    feedback: 0,
    contact: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/')
      return
    }

    if (user?.role === 'admin') {
      loadStats()
    }
  }, [user, isLoading, router])

  const loadStats = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = userData._id || userData.id

      const [toolsRes, promptsRes, blogsRes, videosRes, feedbackRes, contactRes] = await Promise.all([
        fetch(`/api/admin/tools?limit=1&userId=${userId}`),
        fetch(`/api/admin/prompts?limit=1&userId=${userId}`),
        fetch(`/api/admin/blogs?limit=1&userId=${userId}`),
        fetch(`/api/admin/videos?limit=1&userId=${userId}`),
        fetch(`/api/admin/feedback?limit=1&userId=${userId}`),
        fetch(`/api/admin/contact?limit=1&userId=${userId}`)
      ])

      const toolsData = await toolsRes.json()
      const promptsData = await promptsRes.json()
      const blogsData = await blogsRes.json()
      const videosData = await videosRes.json()
      const feedbackData = await feedbackRes.json()
      const contactData = await contactRes.json()

      setStats({
        tools: toolsData.pagination?.totalCount || 0,
        prompts: promptsData.pagination?.totalCount || 0,
        blogs: blogsData.pagination?.totalCount || 0,
        videos: videosData.pagination?.totalCount || 0,
        feedback: feedbackData.pagination?.totalCount || 0,
        contact: contactData.pagination?.totalCount || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (isLoading || loadingStats) {
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
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your content and settings</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Tools</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tools}</div>
              <p className="text-xs text-muted-foreground">Total tools</p>
              <Button asChild variant="link" className="mt-2 p-0 h-auto">
                <Link href="/admin/tools">Manage Tools →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prompts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.prompts}</div>
              <p className="text-xs text-muted-foreground">Total prompts</p>
              <Button asChild variant="link" className="mt-2 p-0 h-auto">
                <Link href="/admin/prompts">Manage Prompts →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blogs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.blogs}</div>
              <p className="text-xs text-muted-foreground">Total blogs</p>
              <Button asChild variant="link" className="mt-2 p-0 h-auto">
                <Link href="/admin/blogs">Manage Blogs →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.videos}</div>
              <p className="text-xs text-muted-foreground">Total videos</p>
              <Button asChild variant="link" className="mt-2 p-0 h-auto">
                <Link href="/admin/videos">Manage Videos →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.feedback}</div>
              <p className="text-xs text-muted-foreground">Total feedback</p>
              <Button asChild variant="link" className="mt-2 p-0 h-auto">
                <Link href="/admin/feedback">Manage Feedback →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contact}</div>
              <p className="text-xs text-muted-foreground">Total messages</p>
              <Button asChild variant="link" className="mt-2 p-0 h-auto">
                <Link href="/admin/contact">Manage Contact →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
