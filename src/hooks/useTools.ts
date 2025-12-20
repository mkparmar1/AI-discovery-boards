import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { Tool } from '@/lib/data'

interface ApiResponse {
  success: boolean
  data: Tool[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasMore: boolean
  }
  meta?: {
    categories: string[]
    tags: string[]
    totalCount: number
  }
}

interface ToolsQueryParams {
  search?: string
  category?: string
  tags?: string
  limit?: number
}

interface UserInteraction {
  isLiked: boolean
  isBookmarked: boolean
}

// Fetch tools metadata (categories, tags, total count)
export const useToolsMetadata = () => {
  return useQuery({
    queryKey: ['tools', 'metadata'],
    queryFn: async (): Promise<ApiResponse['meta']> => {
      const response = await fetch('/api/tools?metaOnly=true')
      const data: ApiResponse = await response.json()
      if (!data.success) {
        throw new Error('Failed to fetch tools metadata')
      }
      return data.meta
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - metadata doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Fetch tools with infinite pagination and caching
export const useInfiniteTools = (params: ToolsQueryParams = {}) => {
  const { search, category, tags, limit = 20 } = params
  
  return useInfiniteQuery({
    queryKey: ['tools', 'infinite', { search, category, tags, limit }],
    queryFn: async ({ pageParam = 1 }): Promise<ApiResponse> => {
      const searchParams = new URLSearchParams()
      searchParams.set('limit', String(limit))
      searchParams.set('page', String(pageParam))
      
      if (search) searchParams.set('search', search)
      if (category && category !== 'all') searchParams.set('category', category)
      if (tags && tags !== 'all') searchParams.set('tags', tags)

      const response = await fetch(`/api/tools?${searchParams.toString()}`)
      const data: ApiResponse = await response.json()
      
      if (!data.success) {
        throw new Error('Failed to fetch tools')
      }
      
      return data
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch user interactions for specific tools
export const useUserInteractions = (userId: string | undefined, toolIds: string[]) => {
  return useQuery({
    queryKey: ['userInteractions', userId, toolIds.sort()],
    queryFn: async (): Promise<Record<string, UserInteraction>> => {
      if (!userId || toolIds.length === 0) {
        return {}
      }
      
      const response = await fetch(`/api/tools/interactions?userId=${userId}&toolIds=${toolIds.join(',')}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error('Failed to fetch user interactions')
      }
      
      return data.data
    },
    enabled: !!userId && toolIds.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
  })
}

// Helper hook to get all tools from infinite query
export const useAllToolsFromInfinite = (infiniteQuery: ReturnType<typeof useInfiniteTools>) => {
  const allTools = infiniteQuery.data?.pages.flatMap(page => page.data) ?? []
  const totalCount = infiniteQuery.data?.pages[0]?.pagination.totalCount ?? 0
  const hasNextPage = infiniteQuery.hasNextPage
  const isFetchingNextPage = infiniteQuery.isFetchingNextPage
  const fetchNextPage = infiniteQuery.fetchNextPage
  
  return {
    tools: allTools,
    totalCount,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading: infiniteQuery.isLoading,
    isError: infiniteQuery.isError,
    error: infiniteQuery.error,
  }
}