import { allPosts } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    id: post.id,
  }));
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const post = allPosts.find((p) => p.id === params.id);

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-8">
       <Button asChild variant="ghost" className="pl-0">
        <Link href="/blog">
          <ArrowLeft className="mr-2" />
          Back to Blog
        </Link>
      </Button>

      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          data-ai-hint={post.tags.slice(0, 2).join(' ')}
        />
      </div>

      <header className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <h1 className="text-4xl font-bold tracking-tighter font-headline text-balance">
          {post.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Published on {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </header>
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
      />
    </article>
  );
}
