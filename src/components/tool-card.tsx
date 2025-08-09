import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import type { Tool } from '@/lib/data'
import { Badge } from './ui/badge'
import { Eye, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'

interface ToolCardProps {
  tool: Tool
}

export default function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden h-full transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <Image
          src={tool.image}
          alt={tool.title}
          width={600}
          height={400}
          className="w-full h-48 object-cover"
          data-ai-hint={tool.tags.slice(0, 2).join(' ')}
        />
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col">
        <CardTitle className="text-xl mb-2 font-headline">{tool.title}</CardTitle>
        <p className="text-muted-foreground text-sm flex-grow">{tool.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4">
         <div className="w-full flex flex-wrap gap-2">
            {tool.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                {tag}
                </Badge>
            ))}
        </div>
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>{tool.clickCount.toLocaleString()}</span>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href={tool.website} target="_blank" rel="noopener noreferrer">
              Try This <ArrowRight />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
