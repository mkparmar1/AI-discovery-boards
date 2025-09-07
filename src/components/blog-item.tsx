import type { Post } from '@/lib/data'
import { format, parseISO } from 'date-fns'
// import Image from 'next/image'
import Link from 'next/link'

interface BlogItemProps {
  post: Post
}

export default function BlogItem({ post }: BlogItemProps) {
  return (
    <Link href={`/blog/${post.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
      {/* <div className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={post.tags.slice(0, 2).join(' ')}
        />
      </div> */}
      <div className="flex-1">
        <h3 className="font-semibold mb-1 text-sm group-hover:text-primary transition-colors">{post.title}</h3>
        <time className="text-xs text-muted-foreground/80">
          {format(parseISO(post.date), 'MMMM d, yyyy')}
        </time>
      </div>
    </Link>
  )
}
