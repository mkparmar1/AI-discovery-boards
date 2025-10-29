import { Tool } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Heart, Bookmark } from 'lucide-react'
import { trackToolClick } from '@/utils/activityTracker'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

interface ToolCardProps {
  tool: Tool
  viewMode?: 'grid' | 'list'
  isLiked?: boolean
  isBookmarked?: boolean
  onLikeToggle?: (toolId: string, isLiked: boolean) => void
  onBookmarkToggle?: (toolId: string, isBookmarked: boolean) => void
}

export default function ToolCard({ 
  tool, 
  viewMode = 'grid', 
  isLiked = false, 
  isBookmarked = false, 
  onLikeToggle, 
  onBookmarkToggle 
}: ToolCardProps) {
  const { user, isAuthenticated } = useAuth()
  const [isLiking, setIsLiking] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)

  const handleToolClick = async () => {
    try {
      await trackToolClick(
        tool.id,
        tool.title,
        tool.category,
        tool.tags
      );
    } catch (error) {
      console.error('Failed to track tool click:', error);
    }
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Allow function to work with mock authentication
    if ((!isAuthenticated && !user) || isLiking) return
    
    setIsLiking(true)
    try {
      const action = isLiked ? 'unlike' : 'like'
      const response = await fetch('/api/tools/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'test-user-123',
          toolId: tool.id,
          action
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }

      const result = await response.json()
      console.log('Like toggle response:', result)

      if (result.success) {
        onLikeToggle?.(tool.id, !isLiked)
      } else {
        console.error('Like toggle failed:', result.error)
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Allow function to work with mock authentication
    if ((!isAuthenticated && !user) || isBookmarking) return
    
    setIsBookmarking(true)
    try {
      const action = isBookmarked ? 'unbookmark' : 'bookmark'
      const response = await fetch('/api/tools/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'test-user-123',
          toolId: tool.id,
          action
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }

      const result = await response.json()
      console.log('Bookmark toggle response:', result)

      if (result.success) {
        onBookmarkToggle?.(tool.id, !isBookmarked)
      } else {
        console.error('Bookmark toggle failed:', result.error)
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    } finally {
      setIsBookmarking(false)
    }
  }
  if (viewMode === 'list') {
    return (
      <Card className="group relative overflow-hidden bg-card border border-border/50 hover:border-primary/30 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Like and Save Icons - Top Right */}
        {(isAuthenticated || true) && (
          <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLikeToggle}
              disabled={isLiking}
              className={`p-2.5 h-10 w-10 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border border-gray-200/50 hover:border-red-200 hover:shadow-lg transition-all duration-200 ${isLiked ? 'text-red-500 hover:text-red-600 border-red-200 bg-red-50/80' : 'text-gray-400 hover:text-red-500'}`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            
            {/* Bookmark Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkToggle}
              disabled={isBookmarking}
              className={`p-2.5 h-10 w-10 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border border-gray-200/50 hover:border-blue-200 hover:shadow-lg transition-all duration-200 ${isBookmarked ? 'text-blue-500 hover:text-blue-600 border-blue-200 bg-blue-50/80' : 'text-gray-400 hover:text-blue-500'}`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        )}

        <div className="flex items-center p-6">
          {/* Tool Icon */}
          <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4">
            <span className="text-white font-bold text-lg">
              {tool.title.charAt(0).toUpperCase()}
            </span>
          </div>
          
          {/* Tool Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                {tool.title}
              </h3>
              <Badge 
                variant="outline" 
                className="text-xs font-medium bg-primary/5 text-primary border-primary/20 flex-shrink-0"
              >
                {tool.category}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {tool.description}
            </p>
            
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1">
                {tool.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-muted/50 text-muted-foreground">
                    #{tag}
                  </Badge>
                ))}
              </div>
              
              <Badge 
                variant="secondary"
                className="text-xs font-medium bg-blue-500/90 text-white border-0 ml-auto flex-shrink-0"
              >
                {tool.clickCount.toLocaleString()} clicks
              </Badge>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="ml-4 flex items-center gap-2">
            {/* CTA Button */}
            <Button 
              className="bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300" 
              variant="outline"
              asChild
            >
              <a 
                href={tool.website} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleToolClick}
              >
                Visit Tool
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Grid view (default)
  return (
    <Card className="group relative overflow-hidden bg-card border border-border/50 hover:border-primary/30 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      {/* Like and Save Icons - Top Right */}
      {(isAuthenticated || true) && (
        <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLikeToggle}
            disabled={isLiking}
            className={`p-2.5 h-10 w-10 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border border-gray-200/50 hover:border-red-200 hover:shadow-lg transition-all duration-200 ${isLiked ? 'text-red-500 hover:text-red-600 border-red-200 bg-red-50/80' : 'text-gray-400 hover:text-red-500'}`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          
          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmarkToggle}
            disabled={isBookmarking}
            className={`p-2.5 h-10 w-10 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white shadow-md border border-gray-200/50 hover:border-blue-200 hover:shadow-lg transition-all duration-200 ${isBookmarked ? 'text-blue-500 hover:text-blue-600 border-blue-200 bg-blue-50/80' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-start mb-3">
          <Badge 
            variant="outline" 
            className="text-xs font-medium bg-primary/5 text-primary border-primary/20"
          >
            {tool.category}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {tool.title.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {tool.title}
          </CardTitle>
        </div>
        
        <CardDescription className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {tool.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {tool.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs bg-muted/50 text-muted-foreground hover:bg-muted transition-colors">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Click Count */}
        <div className="mb-4">
          <Badge 
            variant="secondary"
            className="text-xs font-medium bg-blue-500/90 text-white border-0"
          >
            {tool.clickCount.toLocaleString()} clicks
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto">
          {/* CTA Button */}
          <Button 
            className="w-full bg-white hover:bg-blue-50 text-blue-600 border-blue-300 dark:bg-transparent dark:border-border dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground font-medium transition-all duration-300 group-hover:shadow-lg" 
            variant="outline"
            asChild
          >
            <a 
              href={tool.website} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleToolClick}
            >
              Visit Tool
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}