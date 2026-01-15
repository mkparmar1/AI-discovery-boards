'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  title: string
  columns: Column<T>[]
  fetchData: (params: {
    page: number
    limit: number
    search?: string
    status?: string
    category?: string
  }) => Promise<{
    data: T[]
    pagination: {
      page: number
      limit: number
      totalCount: number
      totalPages: number
      hasMore: boolean
    }
  }>
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onCreate?: () => void
  statusFilter?: boolean
  categoryFilter?: boolean
  getStatus?: (item: T) => string
  getCategory?: (item: T) => string
}

export default function DataTable<T extends { _id: string }>({
  title,
  columns,
  fetchData,
  onEdit,
  onDelete,
  onCreate,
  statusFilter = false,
  categoryFilter = false,
  getStatus,
  getCategory
}: DataTableProps<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [search, setSearch] = useState('')
  const [statusFilterValue, setStatusFilterValue] = useState<string>('')
  const [categoryFilterValue, setCategoryFilterValue] = useState<string>('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasMore: false
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await fetchData({
        page,
        limit,
        search: search || undefined,
        status: statusFilterValue || undefined,
        category: categoryFilterValue || undefined
      })
      setData(result.data)
      setPagination(result.pagination)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, limit, search, statusFilterValue, categoryFilterValue])

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when changing limit
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDelete = async (item: T) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (onDelete) {
        await onDelete(item)
        loadData()
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {statusFilter && (
              <select
                value={statusFilterValue}
                onChange={(e) => {
                  setStatusFilterValue(e.target.value)
                  setPage(1)
                }}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="archived">Archived</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            )}
            {categoryFilter && (
              <Input
                placeholder="Category filter"
                value={categoryFilterValue}
                onChange={(e) => {
                  setCategoryFilterValue(e.target.value)
                  setPage(1)
                }}
                className="w-48"
              />
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No data found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      {columns.map((col) => (
                        <th
                          key={String(col.key)}
                          className={`text-left p-4 font-medium text-sm ${
                            col.key === 'image' || col.key === 'Preview' ? 'w-20' : ''
                          }`}
                        >
                          {col.header}
                        </th>
                      ))}
                      {(onEdit || onDelete) && (
                        <th className="text-right p-4 font-medium text-sm w-24">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-muted/50">
                        {columns.map((col) => (
                          <td 
                            key={String(col.key)} 
                            className={`p-4 text-sm ${
                              col.key === 'image' || col.key === 'Preview' ? 'w-20' : ''
                            }`}
                          >
                            {col.render
                              ? col.render(item)
                              : String(item[col.key as keyof T] || '')}
                          </td>
                        ))}
                        {(onEdit || onDelete) && (
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              {onEdit && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEdit(item)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {onDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(item)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.totalCount)} of {pagination.totalCount} results
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows per page:</span>
                    <select
                      value={limit}
                      onChange={(e) => handleLimitChange(Number(e.target.value))}
                      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={500}>500</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center px-4 text-sm">
                    Page {page} of {pagination.totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={!pagination.hasMore}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
