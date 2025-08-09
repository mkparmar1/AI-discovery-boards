import { allUpdates } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, Sparkles, Megaphone } from 'lucide-react';

const categoryIcons = {
  'New Model': <Rocket className="h-5 w-5 text-accent-foreground" />,
  'Feature Update': <Sparkles className="h-5 w-5 text-accent-foreground" />,
  'Platform News': <Megaphone className="h-5 w-5 text-accent-foreground" />,
} as const;

export default function UpdatesPage() {
  // Sort updates by date in descending order
  const sortedUpdates = allUpdates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-balance font-headline">
          Latest Updates
        </h1>
        <p className="max-w-2xl text-muted-foreground md:text-xl text-balance">
          Stay informed about the latest AI model releases, feature updates, and news from across the industry.
        </p>
      </section>

      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-9 top-0 h-full w-0.5 bg-border" />

        <div className="space-y-12">
          {sortedUpdates.map((update) => (
            <div key={update.id} className="relative">
              <div className="absolute left-0 top-3 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-accent">
                {categoryIcons[update.category]}
              </div>
              <div className="ml-12">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                       <div>
                         <p className="text-sm text-muted-foreground">
                          {new Date(update.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <CardTitle className="text-xl font-headline mt-1">{update.title}</CardTitle>
                       </div>
                       <Badge variant="secondary" className="hidden sm:inline-flex">{update.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{update.content}</CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
