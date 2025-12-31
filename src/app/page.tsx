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
  
  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)

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

  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newsletterEmail.trim()) {
      setToastMessage('Please enter your email address')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/
    if (!emailRegex.test(newsletterEmail)) {
      setToastMessage('Please enter a valid email address')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }

    setNewsletterLoading(true)
    setNewsletterSuccess(false)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      })

      const data = await response.json()

      if (data.success) {
        setNewsletterSuccess(true)
        setNewsletterEmail('')
        setToastMessage('🎉 Successfully subscribed! You\'ll receive weekly AI highlights.')
        setTimeout(() => {
          setToastMessage(null)
          setNewsletterSuccess(false)
        }, 5000)
      } else {
        setToastMessage(data.error || 'Something went wrong. Please try again.')
        setTimeout(() => setToastMessage(null), 4000)
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setToastMessage('Failed to subscribe. Please try again later.')
      setTimeout(() => setToastMessage(null), 4000)
    } finally {
      setNewsletterLoading(false)
    }
  }

  const recommendedList = recommendedTools.length > 0 ? recommendedTools : featuredTools

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl">
        {/* Animated background gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-96 w-96 animate-soft-pulse rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 animate-soft-pulse rounded-full bg-sky-500/20 blur-3xl" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(120,119,198,0.15),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.15),_transparent_50%)]" />
        </div>
        
        <div className="relative grid gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/80 shadow-lg">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              AI Discovery Boards
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Find the right{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI tools
              </span>
              , prompts, and research in minutes.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              A curated discovery hub that helps you compare, evaluate, and save the AI resources that actually move your projects forward.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 group">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60 transition-colors group-focus-within:text-white/90" />
                <Input
                  placeholder="Search tools, prompts, or research"
                  className="h-12 border-white/20 bg-white/10 pl-12 pr-4 text-white placeholder:text-white/60 backdrop-blur-sm transition-all duration-300 focus-visible:border-white/40 focus-visible:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/30"
                />
              </div>
              <Button asChild className="h-12 px-8 btn-gradient shadow-lg hover:shadow-xl">
                <Link href="/tools" className="flex items-center">
                  Start exploring
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm text-white/80 shadow-sm">Verified sources</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm text-white/80 shadow-sm">Daily updates</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm text-white/80 shadow-sm">Curated categories</span>
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Tools tracked</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white/90 shadow-sm">
                    <Wrench className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold">{toolsLoading ? '...' : `${toolsCount}+`}</p>
              </div>
              <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Prompt packs</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white/90 shadow-sm">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold">{aiPrompts.length}+</p>
              </div>
              <div className="group cursor-pointer rounded-2xl border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:bg-white/15 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-widest text-white/70">Research papers</p>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 text-white/90 shadow-sm">
                    <BookOpen className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold">{researchPapers.length}+</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm shadow-xl lg:p-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Discovery board</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">This week</span>
            </div>
            <div className="mt-6 space-y-3">
              {featuredTools.map((tool, index) => (
                <div 
                  key={tool.id} 
                  className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm font-semibold text-white shadow-sm">
                    {tool.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{tool.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/60 line-clamp-2">{tool.description}</p>
                  </div>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white/70">0{index + 1}</span>
                </div>
              ))}
              {!toolsLoading && featuredTools.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-xs text-white/60">
                  No tools available yet.
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild className="btn-gradient shadow-lg hover:shadow-xl">
                <Link href="/tools">Explore AI tools</Link>
              </Button>
              <Button variant="ghost" asChild className="border border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:border-white/30">
                <Link href="/prompts">Browse prompt library</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Curated picks
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Featured AI tools for real work</h2>
            <div className="section-divider mt-4 w-24 rounded-full" />
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Compare the most useful AI platforms and jump directly into the ones that match your workflow.
            </p>
          </div>
          <Button variant="outline" asChild className="group">
            <Link href="/tools" className="flex items-center">
              View all tools
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                className="group block cursor-pointer"
              >
                <Card className="relative h-full overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:border-primary/30">
                  <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: accent }} />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="absolute -right-12 top-12 h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: accent, opacity: 0.2 }} />
                  </div>
                  <CardHeader className="relative pb-4 pt-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-border bg-gradient-to-br from-white to-muted text-base font-bold text-foreground shadow-sm transition-transform duration-300 group-hover:scale-110">
                          {tool.title.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                            {tool.title}
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs font-medium text-muted-foreground">
                            {tool.category}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs font-medium shrink-0">
                        {trustSignal}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative flex flex-1 flex-col gap-4 px-6 pb-6">
                    <div className="flex items-center justify-between">
                      <Badge className={`border ${pricingBadge.className} text-xs font-medium`}>
                        {pricingBadge.label}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Zap className="h-3.5 w-3.5" />
                        <span>{tool.clickCount.toLocaleString()} clicks</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {tool.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 w-full rounded-lg border-2 border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-center text-sm font-semibold text-primary transition-all duration-300 group-hover:border-primary/60 group-hover:bg-gradient-to-r group-hover:from-primary/15 group-hover:to-primary/10 group-hover:shadow-lg">
                      Try tool
                      <ExternalLink className="ml-2 inline h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      </section>

      {/* Recommended + Recent */}
      <section className="py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Personalized
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Recommended for you</h2>
            <div className="section-divider mt-4 w-20 rounded-full" />
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Popular picks curated from what creators use most.
            </p>
          </div>
          <Button variant="outline" asChild className="group">
            <Link href="/tools" className="flex items-center">
              Explore all tools
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                <Card className="h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl">
                  <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border bg-gradient-to-br from-white to-muted text-sm font-bold text-foreground shadow-sm transition-transform duration-300 group-hover:scale-110">
                        {tool.title.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">{tool.title}</p>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">{tool.category}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-medium shrink-0">
                        {trustSignal}
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <Badge className={`border text-xs font-medium ${pricingBadge.className}`}>
                        {pricingBadge.label}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>{tool.clickCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      </section>

      <section className="py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            History
          </div>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">Recently viewed</h3>
          <p className="mt-2 text-base text-muted-foreground">Pick up where you left off.</p>
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
              <Card className="h-full border border-border bg-card shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-border bg-gradient-to-br from-white to-muted text-sm font-bold text-foreground shadow-sm transition-transform duration-300 group-hover:scale-110">
                    {tool.title.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">{tool.title}</p>
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">{tool.category}</p>
                  </div>
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
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

      <section className="py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
            Use-case discovery
          </div>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">Explore by focus area</h3>
          <p className="mt-2 text-base text-muted-foreground">Jump into the collections built for your workflow.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {useCaseCards.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:border-primary/30 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Trending Learning Videos */}
      <section className="py-16">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              Learn AI
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Trending learning videos</h2>
            <div className="section-divider mt-4 w-20 rounded-full" />
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Watch the latest lessons or featured picks to level up fast.
            </p>
          </div>
          <Button variant="outline" asChild className="group">
            <Link href="/learn-ai" className="flex items-center">
              View all videos
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learningVideos.map((video) => (
            <Card key={video._id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl">
              <div className="relative overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {video.topic}
                  </Badge>
                  {video.isTrending && (
                    <Badge variant="outline" className="text-xs font-medium border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400">
                      <Zap className="mr-1 h-3 w-3" />
                      Trending
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4 text-lg font-bold text-foreground transition-colors group-hover:text-primary line-clamp-2">
                  {video.title}
                </CardTitle>
                <CardDescription className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {video.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-2 border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 font-semibold text-primary transition-all duration-300 hover:border-primary/60 hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/10 hover:shadow-lg"
                  asChild
                >
                  <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                    Watch video
                    <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
      <section className="py-16" ref={promptsSectionRef}>
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              AI Prompts
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Latest AI Prompts</h2>
            <div className="section-divider mt-4 w-20 rounded-full" />
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">Ready-to-use prompts for ChatGPT, Claude, and other AI models</p>
          </div>
          <Button variant="outline" asChild className="group">
            <Link href="/prompts" className="flex items-center">
              Browse All Prompts
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestPrompts.map((prompt, index) => (
            <Card
              key={prompt.id}
              className="group border border-border bg-card flex flex-col h-full shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl"
              style={{
                opacity: promptsVisible ? 1 : 0,
                transform: promptsVisible ? 'translateY(0px)' : 'translateY(12px)',
                transitionDelay: promptsVisible ? `${index * 90}ms` : '0ms'
              }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {prompt.category}
                  </Badge>
                  <Badge
                    className={`text-xs font-medium ${
                      prompt.difficulty === 'Beginner'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700'
                        : prompt.difficulty === 'Intermediate'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                          : 'bg-rose-100 text-rose-900 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700'
                    }`}
                  >
                    {prompt.difficulty}
                  </Badge>
                </div>
                
                <CardTitle className="text-lg font-bold text-foreground transition-colors group-hover:text-primary line-clamp-2">
                  {prompt.title}
                </CardTitle>
                
                <CardDescription className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {prompt.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
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
                
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  <span>{prompt.useCase}</span>
                </div>
                
                <Button
                  onClick={() => copyToClipboard(prompt.prompt, prompt.id)}
                  variant="outline"
                  className="w-full mt-auto border-2 border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 font-semibold text-primary transition-all duration-300 hover:border-primary/60 hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/10 hover:shadow-lg dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
                >
                  {copiedStates[prompt.id] ? (
                    <span className="flex items-center">
                      <span className="mr-2">✓</span>
                      Copied!
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Prompt
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Research Papers */}
      <section className="py-16">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Research
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Breakthrough Research 2025</h2>
            <div className="section-divider mt-4 w-20 rounded-full" />
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">Explore groundbreaking AI papers shaping the future - AGI, multimodal AI, and beyond</p>
          </div>
          <Button variant="outline" asChild className="group">
            <Link href="/research" className="flex items-center">
              Browse Papers
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredPapers.map((paper) => (
            <Card key={paper.id} className="group border border-border bg-card flex flex-col h-full shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <Badge variant="secondary" className="rounded-full text-xs font-medium">
                    {paper.category}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-xs font-medium text-muted-foreground">
                    <Calendar className="mr-1.5 h-3 w-3" />
                    {new Date(paper.publishedDate).getFullYear()}
                  </Badge>
                </div>
                
                <CardTitle className="text-lg font-bold text-foreground transition-colors group-hover:text-primary line-clamp-2">
                  {paper.title}
                </CardTitle>
                
                <CardDescription className="mt-2 text-sm font-medium text-muted-foreground line-clamp-1">
                  {paper.authors.slice(0, 2).join(', ')}{paper.authors.length > 2 && ' et al.'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {paper.abstract}
                </p>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Research Paper</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold">{paper.citationCount} citations</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  className="w-full mt-auto border-2 border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 font-semibold text-primary transition-all duration-300 hover:border-primary/60 hover:bg-gradient-to-r hover:from-primary/15 hover:to-primary/10 hover:shadow-lg" 
                  asChild
                >
                  <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                    Read Paper
                    <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>




      {/* Contact Section */}
      <section className="py-16" id="contact">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-muted/60 to-muted/40 px-8 py-12 shadow-lg backdrop-blur-sm">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground mb-4">
              <Mail className="h-3.5 w-3.5" />
              Contact
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Get in Touch</h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">Have an idea, feedback, or collaboration in mind?</p>
          </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="group border border-border bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <Mail className="h-5 w-5" />
                </span>
                <CardTitle className="text-lg font-bold">Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">Direct support and inquiries</p>
              <a href="mailto:mkparmar.131@gmail.com" className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline">
                mkparmar.131@gmail.com
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </CardContent>
          </Card>

          <Card className="group border border-border bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <Github className="h-5 w-5" />
                </span>
                <CardTitle className="text-lg font-bold">GitHub</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">Issues, ideas, and contributions</p>
              <a href="https://github.com/mkparmar1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline">
                github.com/mkparmar1
                <ExternalLink className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-sm font-semibold text-foreground">Company</p>
              <Link href="/" className="block text-muted-foreground hover:text-foreground">Home</Link>
              <a href="#contact" className="block text-muted-foreground hover:text-foreground">Contact</a>
              <a href="mailto:mkparmar.131@gmail.com" className="block text-muted-foreground hover:text-foreground">Email</a>
              <a href="https://aidiscoveryboards.info" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-foreground">Website</a>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-muted/40 px-6 py-6 shadow-md md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Weekly AI highlights</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Join the newsletter for new tools, prompts, and research.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full flex-col gap-2 sm:flex-row sm:items-center md:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterLoading}
                className={`h-11 w-full sm:w-72 transition-all duration-300 ${
                  newsletterSuccess 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                    : 'border-border'
                }`}
                required
              />
              <Button 
                type="submit" 
                disabled={newsletterLoading || newsletterSuccess}
                className={`h-11 px-8 font-semibold transition-all duration-300 ${
                  newsletterSuccess 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'btn-gradient'
                } ${newsletterLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {newsletterLoading ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Subscribing...
                  </span>
                ) : newsletterSuccess ? (
                  <span className="flex items-center">
                    <span className="mr-2">✓</span>
                    Subscribed!
                  </span>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </form>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-8">
          <p className="text-xs text-muted-foreground">Ac {new Date().getFullYear()} AI Discovery Boards. All rights reserved.</p>
        </div>
      </footer>




      {toastMessage && (
        <div className="fixed right-6 top-6 z-50 animate-in slide-in-from-top-5 rounded-xl border border-border bg-card px-5 py-4 text-sm font-medium text-foreground shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {toastMessage.includes('🎉') || toastMessage.includes('Successfully') ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                <span className="text-xs">✓</span>
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                <span className="text-xs">!</span>
              </div>
            )}
            <span>{toastMessage}</span>
          </div>
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

