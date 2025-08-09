import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ToolCard from '@/components/tool-card'
import BlogItem from '@/components/blog-item'
import { featuredTools, latestPosts } from '@/lib/data'
import TrendingPrompts from '@/components/trending-prompts'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-16">
      <section className="text-center space-y-4 pt-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-balance font-headline">
          Discover the Future of AI
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl text-balance">
          Your curated guide to the latest tools, trending prompts, and breakthroughs in the world of artificial intelligence.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/tools">
              Explore Tools <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">Read the Blog</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Featured AI Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Trending Prompts</h2>
          <TrendingPrompts />
        </section>
        
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">Latest from the Blog</h2>
          <div className="space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm p-4">
            {latestPosts.map((post) => (
              <BlogItem key={post.id} post={post} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
