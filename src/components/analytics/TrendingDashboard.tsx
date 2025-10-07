'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Users, Clock, BarChart3, Loader2 } from 'lucide-react'

interface TrendingItem {
  resourceId: string
  resourceType: string
  resourceTitle: string
  count: number
  uniqueUserCount: number
  lastActivity: string
  trendingScore?: number
}

interface AnalyticsData {
  trending: TrendingItem[]
  mostUsed: TrendingItem[]
}

interface TrendingDashboardProps {
  timeframe?: '1d' | '7d' | '30d' | '90d'
  limit?: number
}

export default function TrendingDashboard({ timeframe = '7d', limit = 10 }: TrendingDashboardProps) {
  const [data, setData] = useState<AnalyticsData>({ trending: [], mostUsed: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)
  const [selectedResourceType, setSelectedResourceType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'trending' | 'most-used'>('trending')

  // useEffect moved below after fetchAnalytics declaration to satisfy TypeScript ordering

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch trending data
      const trendingParams = new URLSearchParams({
        type: 'trending',
        timeframe: selectedTimeframe,
        limit: limit.toString()
      })
      if (selectedResourceType !== 'all') {
        trendingParams.append('resourceType', selectedResourceType)
      }

      // Fetch most used data
      const mostUsedParams = new URLSearchParams({
        type: 'most-used',
        timeframe: selectedTimeframe,
        limit: limit.toString()
      })
      if (selectedResourceType !== 'all') {
        mostUsedParams.append('resourceType', selectedResourceType)
      }

      const [trendingResponse, mostUsedResponse] = await Promise.all([
        fetch(`/api/analytics?${trendingParams}`),
        fetch(`/api/analytics?${mostUsedParams}`)
      ])

      const trendingData = await trendingResponse.json()
      const mostUsedData = await mostUsedResponse.json()

      setData({
        trending: trendingData.success ? trendingData.data : [],
        mostUsed: mostUsedData.success ? mostUsedData.data : []
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setData({ trending: [], mostUsed: [] })
    } finally {
      setIsLoading(false)
    }
  }, [selectedTimeframe, selectedResourceType, limit])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return `${Math.floor(diffInDays / 7)}w ago`
  }

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'tool': return 'bg-blue-500/10 text-blue-600 border-blue-200'
      case 'prompt': return 'bg-purple-500/10 text-purple-600 border-purple-200'
      case 'blog': return 'bg-green-500/10 text-green-600 border-green-200'
      case 'research_paper': return 'bg-orange-500/10 text-orange-600 border-orange-200'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
    }
  }

  const renderItemList = (items: TrendingItem[], showTrendingScore = false) => (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={`${item.resourceType}-${item.resourceId}`} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground w-6">
                #{index + 1}
              </span>
              <Badge variant="outline" className={`text-xs ${getResourceTypeColor(item.resourceType)}`}>
                {item.resourceType}
              </Badge>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">
                {item.resourceTitle || `${item.resourceType} ${item.resourceId}`}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  {item.count} uses
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {item.uniqueUserCount} users
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(item.lastActivity)}
                </div>
              </div>
            </div>
          </div>
          
          {showTrendingScore && item.trendingScore && (
            <div className="flex items-center gap-1 text-xs font-medium text-primary">
              <TrendingUp className="h-3 w-3" />
              {Math.round(item.trendingScore)}
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track trending and most-used resources</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedResourceType}
            onChange={(e) => setSelectedResourceType(e.target.value)}
            className="px-3 py-1 text-sm border border-border rounded-md bg-background"
          >
            <option value="all">All Types</option>
            <option value="tool">Tools</option>
            <option value="prompt">Prompts</option>
            <option value="blog">Blogs</option>
            <option value="research_paper">Research Papers</option>
          </select>
          
          <select
            value={selectedTimeframe}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTimeframe(e.target.value as '1d' | '7d' | '30d' | '90d')}
            className="px-3 py-1 text-sm border border-border rounded-md bg-background"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="w-full">
        <div className="grid w-full grid-cols-2 gap-2 mb-6">
          <Button
            variant={activeTab === 'trending' ? 'default' : 'outline'}
            onClick={() => setActiveTab('trending')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Trending
          </Button>
          <Button
            variant={activeTab === 'most-used' ? 'default' : 'outline'}
            onClick={() => setActiveTab('most-used')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Most Used
          </Button>
        </div>
        
        {activeTab === 'trending' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending Resources
              </CardTitle>
              <CardDescription>
                Resources gaining popularity based on recent activity and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading trending data...</span>
                </div>
              ) : data.trending.length > 0 ? (
                renderItemList(data.trending, true)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No trending data available for the selected timeframe
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {activeTab === 'most-used' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Most Used Resources
              </CardTitle>
              <CardDescription>
                Resources with the highest usage count and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading usage data...</span>
                </div>
              ) : data.mostUsed.length > 0 ? (
                renderItemList(data.mostUsed)
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No usage data available for the selected timeframe
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}