'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, ExternalLink, TrendingUp } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Mock news data
const newsArticles = [
  {
    id: 1,
    title: "OpenAI Releases GPT-5: Revolutionary Breakthrough in AI Reasoning",
    description: "The latest model shows unprecedented capabilities in complex reasoning and multimodal understanding.",
    category: "AI Models",
    publishedDate: "2025-01-15",
    readTime: "5 min read",
    trending: true,
    source: "OpenAI Blog",
    url: "#"
  },
  {
    id: 2,
    title: "Google's Gemini Ultra 2.0 Achieves Human-Level Performance",
    description: "New benchmarks show Gemini Ultra 2.0 matching human experts across multiple domains.",
    category: "Research",
    publishedDate: "2025-01-14",
    readTime: "7 min read",
    trending: true,
    source: "Google AI",
    url: "#"
  },
  {
    id: 3,
    title: "Meta Announces Open Source LLaMA 3 with 405B Parameters",
    description: "The largest open-source language model to date, democratizing access to advanced AI.",
    category: "Open Source",
    publishedDate: "2025-01-13",
    readTime: "6 min read",
    trending: false,
    source: "Meta AI",
    url: "#"
  },
  {
    id: 4,
    title: "AI Safety Breakthrough: New Alignment Techniques Show Promise",
    description: "Researchers develop novel methods for ensuring AI systems remain aligned with human values.",
    category: "AI Safety",
    publishedDate: "2025-01-12",
    readTime: "8 min read",
    trending: false,
    source: "AI Safety Institute",
    url: "#"
  },
  {
    id: 5,
    title: "Autonomous AI Agents Transform Software Development",
    description: "New AI coding assistants can now handle complex software projects end-to-end.",
    category: "Development",
    publishedDate: "2025-01-11",
    readTime: "4 min read",
    trending: false,
    source: "TechCrunch",
    url: "#"
  },
  {
    id: 6,
    title: "Quantum-AI Hybrid Systems Achieve Computational Supremacy",
    description: "Combining quantum computing with AI leads to exponential performance gains.",
    category: "Quantum AI",
    publishedDate: "2025-01-10",
    readTime: "9 min read",
    trending: false,
    source: "Nature",
    url: "#"
  }
]

export default function NewsPage() {
  const trendingNews = newsArticles.filter(article => article.trending)
  const latestNews = newsArticles.filter(article => !article.trending)

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            🚀 AI News & Updates
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with the latest breakthroughs, releases, and developments in artificial intelligence
          </p>
        </div>
      </section>

      {/* Trending News */}
      <section className="py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Trending Now
            </h2>
            <p className="text-muted-foreground mt-2">The most important AI news this week</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/news/latest">
              View All News
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {trendingNews.map((article) => (
            <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 border border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="destructive" className="text-xs">
                    TRENDING
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <CardTitle className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </CardTitle>
                
                <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                  {article.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <Badge variant="outline" className="text-xs">
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-4">
                    <span>{article.readTime}</span>
                    <span>{article.source}</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline"
                  className="w-full bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg" 
                  asChild
                >
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read Article
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Latest News */}
      <section className="py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">📰 Latest Updates</h2>
          <p className="text-muted-foreground mt-2">Recent developments in the AI world</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestNews.map((article) => (
            <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 border border-border bg-card flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </CardTitle>
                
                <CardDescription className="text-sm text-muted-foreground line-clamp-3 flex-1">
                  {article.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="mt-auto">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <span>{article.readTime}</span>
                  <span>{article.source}</span>
                </div>
                
                <Button 
                  variant="outline"
                  className="w-full bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg" 
                  asChild
                >
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read More
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-12">
        <Card className="border border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              📧 Stay Updated
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Get the latest AI news delivered to your inbox weekly
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="px-6">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              No spam, unsubscribe at any time
            </p>
          </CardContent>
        </Card>
      </section>
    </MainLayout>
  )
}