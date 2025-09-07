import { allPosts } from "@/lib/data"
import BlogList from "@/components/blog-list"

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
      <BlogList posts={allPosts} />
    </div>
  )
}
