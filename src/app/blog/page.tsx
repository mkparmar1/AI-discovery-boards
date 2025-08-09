import { allPosts } from "@/lib/data"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

export default function BlogPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-balance font-headline">
          The AIDiscoveryBoard Blog
        </h1>
        <p className="max-w-2xl text-muted-foreground md:text-xl text-balance">
          Our latest articles, insights, and tutorials on the world of Artificial Intelligence.
        </p>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allPosts.map((post) => (
          <div key={post.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col group">
            <Link href={`/blog/${post.id}`} className="block mb-4 overflow-hidden rounded-md">
              <Image
                src={post.image}
                alt={post.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={post.tags.slice(0, 2).join(' ')}
              />
            </Link>
            <div className="flex flex-wrap gap-2 mb-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <h3 className="font-semibold text-lg mb-2 font-headline">
              <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                {post.title}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">{post.excerpt}</p>
            <div className="flex justify-between items-center mt-auto">
              <time className="text-xs text-muted-foreground/80">
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/blog/${post.id}`}>
                  Read More <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
