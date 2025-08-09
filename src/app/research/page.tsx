import { allResearchPapers } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ResearchPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-balance font-headline">
          Seminal AI Research
        </h1>
        <p className="max-w-2xl text-muted-foreground md:text-xl text-balance">
          A curated collection of influential papers that have shaped the field of Artificial Intelligence.
        </p>
      </section>

      <div className="space-y-6">
        {allResearchPapers.map((paper) => (
          <Card key={paper.id}>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl font-headline text-balance">
                      {paper.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {paper.authors.join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Published on {new Date(paper.publicationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Button asChild variant="ghost" size="icon" className="flex-shrink-0">
                  <Link href={paper.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink />
                    <span className="sr-only">Read Paper</span>
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{paper.excerpt}</CardDescription>
              <div className="flex flex-wrap gap-2 mt-4">
                {paper.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
