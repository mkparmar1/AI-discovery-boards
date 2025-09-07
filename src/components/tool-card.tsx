import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import type { Tool } from '@/lib/data'
import { Badge } from './ui/badge'
import { Eye, ArrowRight, Star } from 'lucide-react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface ToolCardProps {
  tool: Tool
}

export default function ToolCard({ tool }: ToolCardProps) {
  // Generate a random rating between 4.0 and 5.0 for demo purposes
  const rating = (4.0 + Math.random()).toFixed(1)
  
  // Generate gradient based on tool name for consistent colors
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-teal-500 to-cyan-600',
    'from-indigo-500 to-purple-600',
    'from-rose-500 to-orange-600',
    'from-emerald-500 to-teal-600'
  ]
  const gradientIndex = tool.title.charCodeAt(0) % gradients.length
  const gradient = gradients[gradientIndex]
  
  return (
    <TooltipProvider>
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] overflow-hidden h-full group">
      <CardContent className="p-6">
        {/* Header with Logo and Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300`}>
              <span className="text-white font-bold text-lg">
                {tool.title.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {tool.title}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
              {tool.description}
            </p>
          </div>
        </div>

        {/* Category Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 rounded-full px-3 py-1 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 cursor-help"
              >
                {tool.category}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Category: {tool.category}</p>
            </TooltipContent>
          </Tooltip>
          {tool.tags.slice(0, 2).map((tag) => (
            <Tooltip key={tag}>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-full px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 cursor-help"
                >
                  {tag}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tag: {tag}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {tool.tags.length > 2 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-500 rounded-full px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-help"
                >
                  +{tool.tags.length - 2}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Additional tags: {tool.tags.slice(2).join(', ')}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Rating and Users */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 transition-colors duration-200 ${
                  i < Math.floor(parseFloat(rating)) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300 dark:text-gray-600'
                }`} 
              />
            ))}
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">{rating}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Eye className="w-4 h-4" />
            <span className="font-medium">{tool.clickCount.toLocaleString('en-US')} users</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          asChild 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] group-hover:shadow-xl"
        >
          <Link href={tool.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
            Try This
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}
