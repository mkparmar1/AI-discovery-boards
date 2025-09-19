import React from 'react'
import { notFound } from 'next/navigation'
import { allPosts } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, ExternalLink } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

import Link from 'next/link'

interface BlogDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

// Helper function to create URL-friendly slugs from titles
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

const BlogDetailPage = async ({ params }: BlogDetailPageProps) => {
  // Find the blog post by slug (using title-based slug)
  const { slug } = await params
  const post = allPosts.find(p => createSlug(p.title) === slug)

  if (!post) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(' ').length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/blogs">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blogs
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <article className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header with Abstract Pattern */}
          <div className="relative h-64 md:h-80 overflow-hidden bg-slate-100 dark:bg-slate-800">
            {/* Abstract geometric pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-6 left-6 w-20 h-20 bg-blue-500 rounded-full"></div>
              <div className="absolute top-12 right-12 w-16 h-16 bg-purple-500 rounded-lg rotate-45"></div>
              <div className="absolute bottom-8 left-12 w-24 h-10 bg-pink-500 rounded-full"></div>
              <div className="absolute bottom-16 right-16 w-10 h-24 bg-green-500 rounded-lg"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-6 border-orange-500 rounded-full"></div>
              <div className="absolute top-20 left-1/3 w-14 h-14 bg-cyan-500 rounded-lg rotate-12"></div>
              <div className="absolute bottom-20 right-1/3 w-18 h-6 bg-yellow-500 rounded-full"></div>
            </div>
            
            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8">
              <div className="flex justify-between items-start">
                <div className="bg-white/90 dark:bg-slate-900/90 px-4 py-2 rounded-full">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {post.tags[0] || 'Blog'}
                  </span>
                </div>
              </div>
              
              <div>
                <h1 className="text-slate-800 dark:text-slate-200 font-bold text-3xl md:text-4xl line-clamp-3 mb-2 drop-shadow-sm leading-tight">
                  {post.title}
                </h1>
                <p className="text-slate-700 dark:text-slate-300 text-lg md:text-xl line-clamp-2 drop-shadow-sm">
                  {post.excerpt}
                </p>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-6 md:p-8">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Meta Information */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{calculateReadTime(post.content)} min read</span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-line">
                {post.content}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/blogs">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to All Blogs
                  </Button>
                </Link>
                <Button className="w-full sm:w-auto bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Share Article
                </Button>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPosts
              .filter(p => p.id !== post.id && p.tags.some(tag => post.tags.includes(tag)))
              .slice(0, 3)
              .map(relatedPost => (
                <Link key={relatedPost.id} href={`/blogs/${createSlug(relatedPost.title)}`}>
                  <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Header with Abstract Pattern */}
                    <div className="relative h-32 overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {/* Abstract geometric pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-2 left-2 w-8 h-8 bg-blue-500 rounded-full"></div>
                        <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-lg rotate-45"></div>
                        <div className="absolute bottom-2 left-4 w-10 h-4 bg-pink-500 rounded-full"></div>
                        <div className="absolute bottom-4 right-4 w-4 h-10 bg-green-500 rounded-lg"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-orange-500 rounded-full"></div>
                      </div>
                      
                      {/* Content overlay */}
                      <div className="absolute inset-0 flex flex-col justify-between p-3">
                        <div className="flex justify-between items-start">
                          <div className="bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded-full">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              {relatedPost.tags[0] || 'Blog'}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-sm line-clamp-2 drop-shadow-sm">
                            {relatedPost.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(relatedPost.date)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default BlogDetailPage

// Generate static params for all blog posts
export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: createSlug(post.title),
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const post = allPosts.find(p => createSlug(p.title) === slug)
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
    }
  }

  return {
    title: `${post.title} | AI Discovery Boards Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}