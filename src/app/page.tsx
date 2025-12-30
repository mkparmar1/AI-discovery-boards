'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Users, ExternalLink, Calendar, FileText, Mail, Github, Globe, Copy, Check, Search, Sparkles } from 'lucide-react'
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

export default function Home() {
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([])
  const [toolsCount, setToolsCount] = useState(0)
  const [learningVideos, setLearningVideos] = useState<HomeVideo[]>([])
  const [toolsLoading, setToolsLoading] = useState(true)

  const featuredPapers = researchPapers.slice(0, 3)
  const latestPrompts = aiPrompts.slice(0, 3)

  // State for tracking copied prompts
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch('/api/home')
        const data = await response.json()
        if (data?.success) {
          const homeData = data.data ?? {}
          setFeaturedTools(Array.isArray(homeData.tools) ? homeData.tools : [])
          setToolsCount(typeof homeData.toolsCount === 'number' ? homeData.toolsCount : 0)
          setLearningVideos(Array.isArray(homeData.videos) ? homeData.videos : [])
        } else {
          setFeaturedTools([])
          setToolsCount(0)
          setLearningVideos([])
        }
      } catch (error) {
        console.error('Failed to fetch home page data:', error)
        setFeaturedTools([])
        setToolsCount(0)
        setLearningVideos([])
      } finally {
        setToolsLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  // Copy to clipboard function
  const copyToClipboard = async (text: string, promptId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [promptId]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [promptId]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

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
              <Button asChild className="h-11 bg-white text-slate-900 hover:bg-white/90">
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
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-white/60">Tools tracked</p>
                <p className="mt-1 text-2xl font-semibold">{toolsLoading ? '...' : `${toolsCount}+`}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-white/60">Prompt packs</p>
                <p className="mt-1 text-2xl font-semibold">{aiPrompts.length}+</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-white/60">Research papers</p>
                <p className="mt-1 text-2xl font-semibold">{researchPapers.length}+</p>
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
              <Button asChild className="bg-white text-slate-900 hover:bg-white/90">
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
          {featuredTools.map((tool) => (
            <Card key={tool.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -right-12 top-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
              </div>
              <CardHeader className="relative pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                      {tool.title.slice(0, 2).toUpperCase()}
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
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3" />
                    <span>{tool.clickCount.toLocaleString()} clicks</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative flex flex-1 flex-col">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {tool.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tool.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="mt-5 w-full border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                  asChild
                >
                  <a href={tool.website} target="_blank" rel="noopener noreferrer">
                    Try tool
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
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
      <section className="py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Latest AI Prompts</h2>
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
          {latestPrompts.map((prompt) => (
            <Card key={prompt.id} className="group hover:shadow-lg transition-all duration-300 border border-border bg-card flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {prompt.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Badge variant={prompt.difficulty === 'Beginner' ? 'default' : prompt.difficulty === 'Intermediate' ? 'secondary' : 'destructive'} className="text-xs">
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
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
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
            <Card key={paper.id} className="group hover:shadow-lg transition-all duration-300 border border-border bg-card flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {paper.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(paper.publishedDate).getFullYear()}</span>
                  </div>
                </div>
                
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {paper.title}
                </CardTitle>
                
                <CardDescription className="text-sm text-muted-foreground line-clamp-1">
                  {paper.authors.slice(0, 2).join(', ')}{paper.authors.length > 2 && ' et al.'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                  {paper.abstract}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>Research Paper</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{paper.citationCount} citations</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  className="w-full mt-auto bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg" 
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Get in Touch</h2>
          <p className="text-muted-foreground mt-2">Questions, feedback, or partnerships? We would love to hear from you.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <Card className="border border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4" />
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
                <Github className="h-4 w-4" />
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

      </section>

      {/* Footer */}
      <footer className="mt-8 border-t">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">AI</span>
            </div>
            <div>
              <p className="text-sm font-semibold">AI Discovery Boards</p>
              <p className="text-xs text-muted-foreground">Discover AI tools, prompts, research, and learning paths.</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/tools" className="text-muted-foreground hover:text-foreground">AI Tools</Link>
            <Link href="/prompts" className="text-muted-foreground hover:text-foreground">AI Prompts</Link>
            <Link href="/blogs" className="text-muted-foreground hover:text-foreground">Blogs</Link>
            <Link href="/research" className="text-muted-foreground hover:text-foreground">Research</Link>
            <Link href="/learn-ai" className="text-muted-foreground hover:text-foreground">Learn AI</Link>
            <a href="#contact" className="text-muted-foreground hover:text-foreground">Contact</a>
          </nav>

          <div className="flex items-center gap-3 text-muted-foreground">
            <a href="mailto:mkparmar.131@gmail.com" className="hover:text-foreground" aria-label="Email"><Mail className="h-4 w-4" /></a>
            <a href="https://github.com/mkparmar1" target="_blank" rel="noopener noreferrer" className="hover:text-foreground" aria-label="GitHub"><Github className="h-4 w-4" /></a>
            <a href="https://aidiscoveryboards.info" target="_blank" rel="noopener noreferrer" className="hover:text-foreground" aria-label="Website"><Globe className="h-4 w-4" /></a>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-8">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AI Discovery Boards. All rights reserved.</p>
        </div>
      </footer>




    </MainLayout>
  )
}
