'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Zap, Users, Star, ExternalLink, Calendar, FileText } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { aiTools, researchPapers } from '@/data/data'
import { aiPrompts } from '@/lib/data'

export default function Home() {
  const featuredTools = aiTools.slice(0, 3)
  const featuredPapers = researchPapers.slice(0, 3)


  const latestPrompts = aiPrompts.slice(0, 3)

  return (
    <MainLayout>



      {/* Featured Tools Section */}
      <section className="py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">🔥 Trending AI Tools 2025</h2>
            <p className="text-muted-foreground mt-2">Discover the hottest AI tools dominating 2025 - from ChatGPT alternatives to cutting-edge GenAI</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/tools">
              View All Tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => (
            <Card key={tool.id} className="group hover:shadow-lg transition-all duration-300 border border-border bg-card flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {tool.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{tool.rating}</span>
                  </div>
                </div>
                
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {tool.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                  {tool.description}
                </p>
                
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="font-medium text-primary">{tool.pricing}</span>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <Button 
                  variant="outline"
                  className="w-full mt-auto bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg" 
                  asChild
                >
                  <a href={tool.website} target="_blank" rel="noopener noreferrer">
                    Try Tool
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Latest AI Prompts */}
      <section className="py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">💡 Latest AI Prompts</h2>
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
                  variant="outline"
                  className="w-full mt-auto bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg" 
                  asChild
                >
                  <Link href={`/prompts#${prompt.id}`}>
                    Use Prompt
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
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
            <h2 className="text-3xl font-bold text-foreground">🚀 Breakthrough Research 2025</h2>
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




    </MainLayout>
  )
}
