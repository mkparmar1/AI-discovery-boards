'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Users, ExternalLink, Calendar, FileText, Mail, Github, Copy, Search, Sparkles, Wrench, MessageSquare, BookOpen, Twitter, Linkedin, Code, Palette, Briefcase, Clock } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { researchPapers } from '@/data/data'
import { aiPrompts, Tool } from '@/lib/data'

type HomeVideo = {
  _id: string
  title: string
  topic: string
  youtubeUrl: string
  thumbnail: string
  description: string
  isTrending?: boolean
}

const getAccentColor = (value: string) => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue} 70% 50%)`
}

const getPricingBadge = (tags: string[] = []) => {
  const normalized = tags.map(tag => tag.toLowerCase())
  if (normalized.includes('freemium')) {
    return { label: 'Freemium', className: 'bg-amber-100 text-amber-900 border-amber-200' }
  }
  if (normalized.includes('paid')) {
    return { label: 'Paid', className: 'bg-rose-100 text-rose-900 border-rose-200' }
  }
  return { label: 'Free', className: 'bg-emerald-100 text-emerald-900 border-emerald-200' }
}

const getTrustSignal = (isTrending: boolean | undefined, clickCount: number) => {
  if (isTrending) return 'Trending'
  if (clickCount >= 1000000) return 'Most used'
  return "Editor's pick"
}

export default function Home() {
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([])
  const [recommendedTools, setRecommendedTools] = useState<Tool[]>([])
  const [recentTools, setRecentTools] = useState<Tool[]>([])
  const [toolsCount, setToolsCount] = useState(0)
  const [learningVideos, setLearningVideos] = useState<HomeVideo[]>([])
  const [toolsLoading, setToolsLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [promptsVisible, setPromptsVisible] = useState(false)
  const promptsSectionRef = useRef<HTMLElement | null>(null)

  const featuredPapers = researchPapers.slice(0, 3)
  const latestPrompts = aiPrompts.slice(0, 3)
  const useCaseCards = [
    { title: 'For Developers', description: 'Code assistants, APIs, and automation.', icon: Code, href: '/tools?category=Devtools' },
    { title: 'For Designers', description: 'Image, video, and creative workflows.', icon: Palette, href: '/tools?category=Image' },
    { title: 'For Business', description: 'Research, writing, and productivity.', icon: Briefcase, href: '/tools?category=Chat' }
  ]

  // State for tracking copied prompts
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch('/api/home')
        const data = await response.json()
        if (data?.success) {
          const homeData = data.data ?? {}
          setFeaturedTools(Array.isArray(homeData.featuredTools) ? homeData.featuredTools : [])
          setToolsCount(typeof homeData.toolsCount === 'number' ? homeData.toolsCount : 0)
          setLearningVideos(Array.isArray(homeData.videos) ? homeData.videos : [])
          setRecommendedTools(Array.isArray(homeData.recommendedTools) ? homeData.recommendedTools : [])
        } else {
          setFeaturedTools([])
          setToolsCount(0)
          setLearningVideos([])
          setRecommendedTools([])
        }
      } catch (error) {
        console.error('Failed to fetch home page data:', error)
        setFeaturedTools([])
        setToolsCount(0)
        setLearningVideos([])
        setRecommendedTools([])
      } finally {
        setToolsLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('recentTools')
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setRecentTools(parsed)
      }
    } catch (error) {
      console.error('Failed to parse recent tools:', error)
    }
  }, [])

  const recordToolView = (tool: Tool) => {
    if (typeof window === 'undefined') return
    setRecentTools(prev => {
      const next = [tool, ...prev.filter(item => item.id !== tool.id)].slice(0, 6)
      window.localStorage.setItem('recentTools', JSON.stringify(next))
      return next
    })
  }

  useEffect(() => {
    const section = promptsSectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPromptsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  // Copy to clipboard function
  const copyToClipboard = async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [promptId]: true }))
      setToastMessage('Prompt copied to clipboard')
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [promptId]: false }))
      }, 2000)
      setTimeout(() => {
        setToastMessage(null)
      }, 2500)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const recommendedList = recommendedTools.length > 0 ? recommendedTools : featuredTools

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
        </div>
        <div className="relative grid gap-10 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              AI Discovery Boards
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Find the right AI tools, prompts, and research in minutes.
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/70 md:text-base">
              A curated discovery hub that helps you compare, evaluate, and save the AI resources that actually move your projects forward.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-white/60" />
                <Input
                  placeholder="Search tools, prompts, or research"
                  className="h-11 border-white/10 bg-white/10 pl-10 text-white placeholder:text-white/60 focus-visible:ring-white/40"
                />
              </div>
              <Button asChild className="h-11 btn-gradient">
                <Link href="/tools">
                  Start exploring
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Verified sources</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Daily updates</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Curated categories</span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="group cursor-pointer rounded-2xl border border-white/10 bg-white/10 px-4 py-4 shadow-sm backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-white/60">Tools tracked</p>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/70">
                    <Wrench className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-semibold">{toolsLoading ? '...' : `${toolsCount}+`}</p>
              </div>
              <div className="group cursor-pointer rounded-2xl border border-white/10 bg-white/10 px-4 py-4 shadow-sm backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-white/60">Prompt packs</p>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/70">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-semibold">{aiPrompts.length}+</p>
              </div>
              <div className="group cursor-pointer rounded-2xl border border-white/10 bg-white/10 px-4 py-4 shadow-sm backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-white/60">Research papers</p>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/70">
                    <BookOpen className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-semibold">{researchPapers.length}+</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Discovery board</p>
              <span className="text-xs text-white/60">This week</span>
            </div>
            <div className="mt-5 space-y-4">
              {featuredTools.map((tool, index) => (
                <div key={tool.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">
                    {tool.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{tool.title}</p>
                    <p className="text-xs text-white/60 line-clamp-2">{tool.description}</p>
                  </div>
                  <span className="text-xs text-white/50">0{index + 1}</span>
                </div>
              ))}
              {!toolsLoading && featuredTools.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
                  No tools available yet.
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild className="btn-gradient">
                <Link href="/tools">Explore AI tools</Link>
              </Button>
              <Button variant="ghost" asChild className="border border-white/15 text-white hover:bg-white/10">
                <Link href="/prompts">Browse prompt library</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              Curated picks
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">Featured AI tools for real work</h2>
            <div className="section-divider mt-3 w-20 rounded-full" />
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Compare the most useful AI platforms and jump directly into the ones that match your workflow.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/tools">
              View all tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => {
            const accent = getAccentColor(tool.title)
            const pricingBadge = getPricingBadge(tool.tags)
            const trustSignal = getTrustSignal(tool.isTrending, tool.clickCount)
            return (
              <a
                key={tool.id}
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${tool.title}`}
                onClick={() => recordToolView(tool)}
                className="group block cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              >
                <Card className="relative h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accent }} />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute -right-10 top-10 h-36 w-36 rounded-full blur-3xl" style={{ backgroundColor: accent, opacity: 0.15 }} />
                  </div>
                  <CardHeader className="relative pb-4 pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-white text-sm font-semibold text-foreground shadow-sm">
                          {tool.title.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {tool.title}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">
                            {tool.category}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {trustSignal}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative flex flex-1 flex-col gap-4 px-6 pb-6">
                    <div className="flex items-center justify-between">
                      <Badge className={`border ${pricingBadge.className} text-xs`}>
                        {pricingBadge.label}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>{tool.clickCount.toLocaleString()} clicks</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {tool.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 w-full rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-center text-sm font-medium text-primary transition-all duration-300 group-hover:shadow-[0_0_18px_rgba(59,130,246,0.45)]">
                      Try tool
                      <ExternalLink className="ml-2 inline h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      </section>

      {/* Recommended + Recent */}
      <section className="py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              Personalized
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">Recommended for you</h2>
            <div className="section-divider mt-3 w-16 rounded-full" />
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Popular picks curated from what creators use most.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/tools">
              Explore all tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendedList.map((tool) => {
            const accent = getAccentColor(tool.title)
            const pricingBadge = getPricingBadge(tool.tags)
            const trustSignal = getTrustSignal(tool.isTrending, tool.clickCount)
            return (
              <a
                key={tool.id}
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordToolView(tool)}
                className="group block"
                aria-label={`Open ${tool.title}`}
              >
                <Card className="h-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
                  <div className="h-1 w-full" style={{ backgroundColor: accent }} />
                  <CardContent className="flex flex-col gap-4 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white text-sm font-semibold text-foreground">
                        {tool.title.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{tool.title}</p>
                        <p className="text-xs text-muted-foreground">{tool.category}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {trustSignal}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className={`border text-xs ${pricingBadge.className}`}>
                        {pricingBadge.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{tool.clickCount.toLocaleString()} clicks</span>
                    </div>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      </section>

      <section className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              History
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">Recently viewed</h3>
            <p className="mt-2 text-muted-foreground">Pick up where you left off.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentTools.map((tool) => (
            <a
              key={tool.id}
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => recordToolView(tool)}
              className="group block"
              aria-label={`Open ${tool.title}`}
            >
              <Card className="h-full border border-border bg-card transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-sm font-semibold text-foreground">
                    {tool.title.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{tool.title}</p>
                    <p className="text-xs text-muted-foreground">{tool.category}</p>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </a>
          ))}
          {!toolsLoading && recentTools.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              No recent tools yet. Start exploring and they will show up here.
            </div>
          )}
        </div>
      </section>

      <section className="py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              Use-case discovery
            </div>
            <h3 className="mt-3 text-2xl font-semibold text-foreground">Explore by focus area</h3>
            <p className="mt-2 text-muted-foreground">Jump into the collections built for your workflow.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {useCaseCards.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Trending Learning Videos */}
      <section className="py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              Learn AI
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">Trending learning videos</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Watch the latest lessons or featured picks to level up fast.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/learn-ai">
              View all videos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learningVideos.map((video) => (
            <Card key={video._id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {video.topic}
                  </Badge>
                  {video.isTrending && (
                    <Badge variant="outline" className="text-xs">
                      Trending
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-3 text-lg font-semibold text-foreground line-clamp-2">
                  {video.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                  {video.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                  asChild
                >
                  <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    Watch video
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
          {!toolsLoading && learningVideos.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No videos available yet.
            </div>
          )}
        </div>
      </section>

      {/* Latest AI Prompts */}
      <section className="py-10" ref={promptsSectionRef}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Latest AI Prompts</h2>
            <div className="section-divider mt-3 w-16 rounded-full" />
            <p className="text-muted-foreground mt-2">Ready-to-use prompts for ChatGPT, Claude, and other AI models</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/prompts">
              Browse All Prompts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestPrompts.map((prompt, index) => (
            <Card
              key={prompt.id}
              className="group border border-border bg-card flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-primary/40"
              style={{
                opacity: promptsVisible ? 1 : 0,
                transform: promptsVisible ? 'translateY(0px)' : 'translateY(12px)',
                transitionDelay: promptsVisible ? `${index * 90}ms` : '0ms'
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {prompt.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Badge
                      className={`text-xs ${
                        prompt.difficulty === 'Beginner'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : prompt.difficulty === 'Intermediate'
                            ? 'bg-blue-100 text-blue-900 border border-blue-200'
                            : 'bg-rose-100 text-rose-900 border border-rose-200'
                      }`}
                    >
                      {prompt.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {prompt.title}
                </CardTitle>
                
                <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                  {prompt.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1 mb-4">
                  {prompt.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {prompt.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{prompt.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>{prompt.useCase}</span>
                </div>
                
                <Button
                  onClick={() => copyToClipboard(prompt.prompt, prompt.id)}
                  variant="outline"
                  className="w-full mt-auto bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg"
                >
                  {copiedStates[prompt.id] ? (
                    <>
                      Copied ✓
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Prompt
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Research Papers */}
      <section className="py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Breakthrough Research 2025</h2>
            <div className="section-divider mt-3 w-16 rounded-full" />
            <p className="text-muted-foreground mt-2">Explore groundbreaking AI papers shaping the future - AGI, multimodal AI, and beyond</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/research">
              Browse Papers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredPapers.map((paper) => (
            <Card key={paper.id} className="group border border-border bg-card flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:bg-muted/40">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {paper.category}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(paper.publishedDate).getFullYear()}
                  </Badge>
                </div>
                
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {paper.title}
                </CardTitle>
                
                <CardDescription className="text-sm text-muted-foreground line-clamp-1">
                  {paper.authors.slice(0, 2).join(', ')}{paper.authors.length > 2 && ' et al.'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[92%] line-clamp-3">
                  {paper.abstract}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>Research Paper</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-xs font-semibold">{paper.citationCount} citations</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  className="w-full mt-auto bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-200 ease-out group-hover:shadow-lg group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100" 
                  asChild
                >
                  <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer">
                    Read Paper
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>




      {/* Contact Section */}
      <section className="py-12" id="contact">
        <div className="rounded-3xl border border-border bg-muted/40 px-6 py-10 shadow-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Get in Touch</h2>
            <p className="text-muted-foreground mt-2">Have an idea, feedback, or collaboration in mind?</p>
          </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <Card className="border border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="h-4 w-4" />
                </span>
                <CardTitle className="text-base">Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Direct support and inquiries</p>
              <a href="mailto:mkparmar.131@gmail.com" className="text-sm font-medium text-primary hover:underline">mkparmar.131@gmail.com</a>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Github className="h-4 w-4" />
                </span>
                <CardTitle className="text-base">GitHub</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Issues, ideas, and contributions</p>
              <a href="https://github.com/mkparmar1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                github.com/mkparmar1
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </CardContent>
          </Card>
        </div>
        </div>
      </section>

      <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
        <Button asChild className="w-full btn-gradient py-6 text-base">
          <Link href="/tools">
            Explore AI tools
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">AI</span>
                </div>
                <div>
                  <p className="text-base font-semibold">AI Discovery Boards</p>
                  <p className="text-xs text-muted-foreground">Discover AI tools, prompts, research, and learning paths.</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Curated insights to help you evaluate, compare, and adopt the right AI tools faster.
              </p>
              <div className="flex items-center gap-3 text-muted-foreground">
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground" aria-label="X">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="https://github.com/mkparmar1" target="_blank" rel="noopener noreferrer" className="hover:text-foreground" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-sm font-semibold text-foreground">Discover</p>
              <Link href="/tools" className="block text-muted-foreground hover:text-foreground">AI Tools</Link>
              <Link href="/prompts" className="block text-muted-foreground hover:text-foreground">AI Prompts</Link>
              <Link href="/research" className="block text-muted-foreground hover:text-foreground">Research</Link>
              <Link href="/blogs" className="block text-muted-foreground hover:text-foreground">Blogs</Link>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-sm font-semibold text-foreground">Learn</p>
              <Link href="/learn-ai" className="block text-muted-foreground hover:text-foreground">Learn AI</Link>
              <Link href="/learn" className="block text-muted-foreground hover:text-foreground">Courses</Link>
              <Link href="/news" className="block text-muted-foreground hover:text-foreground">AI News</Link>
              <Link href="/discover" className="block text-muted-foreground hover:text-foreground">Discover</Link>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-sm font-semibold text-foreground">Company</p>
              <Link href="/" className="block text-muted-foreground hover:text-foreground">Home</Link>
              <a href="#contact" className="block text-muted-foreground hover:text-foreground">Contact</a>
              <a href="mailto:mkparmar.131@gmail.com" className="block text-muted-foreground hover:text-foreground">Email</a>
              <a href="https://aidiscoveryboards.info" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-foreground">Website</a>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-border bg-muted/40 px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Weekly AI highlights</p>
              <p className="text-xs text-muted-foreground">Join the newsletter for new tools, prompts, and research.</p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-10 w-full sm:w-64"
              />
              <Button type="button" className="btn-gradient h-10 px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-8">
          <p className="text-xs text-muted-foreground">Ac {new Date().getFullYear()} AI Discovery Boards. All rights reserved.</p>
        </div>
      </footer>




      {toastMessage && (
        <div className="fixed right-6 top-6 z-50 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-lg">
          {toastMessage}
        </div>
      )}
      <style jsx>{`
        section .group[style] {
          transition: transform 260ms ease-out, opacity 260ms ease-out, box-shadow 260ms ease-out;
        }
      `}</style>
    </MainLayout>
  )
}

