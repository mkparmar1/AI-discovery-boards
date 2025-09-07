"use client"

import { useState, useMemo } from "react"
import type { Tool } from "@/lib/data"
import ToolCard from "@/components/tool-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect, type Option } from "@/components/ui/multi-select"
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface ToolListProps {
    tools: Tool[]
}

export default function ToolList({ tools }: ToolListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("popularity")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Get unique categories from tools
  const categoryOptions = useMemo(() => {
    const uniqueCategories = Array.from(new Set(tools.map(tool => tool.category)))
    return uniqueCategories.sort().map(category => ({
      label: category,
      value: category
    }))
  }, [tools])

  // Get unique tags from tools
  const tagOptions = useMemo(() => {
    const allTags = tools.flatMap(tool => tool.tags)
    const uniqueTags = Array.from(new Set(allTags))
    return uniqueTags.sort().map(tag => ({
      label: tag,
      value: tag
    }))
  }, [tools])

  const filteredAndSortedTools = useMemo(() => {
    let filtered = tools

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(tool => 
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(tool => selectedCategories.includes(tool.category))
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(tool => 
        tool.tags.some(tag => selectedTags.includes(tag))
      )
    }

    // Sort tools
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "popularity":
          return b.clickCount - a.clickCount
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    return sorted
  }, [tools, searchTerm, selectedCategories, selectedTags, sortBy])

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedTools.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTools = filteredAndSortedTools.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategories, selectedTags, sortBy])

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
        <div className="sticky top-0 z-20 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm -mx-6 px-6 py-4">
          {/* Main Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search AI tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm rounded-lg border border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 transition-colors duration-200 hover:border-gray-300 dark:hover:border-gray-600"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-3">
              <MultiSelect
                options={categoryOptions}
                selected={selectedCategories}
                onChange={setSelectedCategories}
                placeholder="Categories"
                className="min-w-[120px] h-10 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200"
              />
              <MultiSelect
                options={tagOptions}
                selected={selectedTags}
                onChange={setSelectedTags}
                placeholder="Tags"
                className="min-w-[100px] h-10 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200"
              />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px] h-10 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[90px] h-10 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategories([]);
                  setSelectedTags([]);
                  setSortBy('popularity');
                  setItemsPerPage(12);
                }}
                className="px-3 h-10 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg transition-colors duration-200 whitespace-nowrap"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          {(selectedCategories.length > 0 || selectedTags.length > 0 || searchTerm) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && (
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-800">
                  <span>Search: "{searchTerm}"</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedCategories.map(category => (
                <div key={category} className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm border border-green-200 dark:border-green-800">
                  <span>{category}</span>
                  <button
                    onClick={() => setSelectedCategories(prev => prev.filter(c => c !== category))}
                    className="ml-1 hover:bg-green-100 dark:hover:bg-green-800/30 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {selectedTags.map(tag => (
                <div key={tag} className="flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm border border-purple-200 dark:border-purple-800">
                  <span>{tag}</span>
                  <button
                    onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                    className="ml-1 hover:bg-purple-100 dark:hover:bg-purple-800/30 rounded-full p-0.5 transition-colors duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedTools.length)} of {filteredAndSortedTools.length} tools</span>
        {totalPages > 1 && (
          <span>Page {currentPage} of {totalPages}</span>
        )}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-3 mt-16 mb-8 py-8">
          <Button
            variant="outline"
            size="default"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-xl px-6 h-12 font-medium transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="default"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-12 h-12 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                    currentPage === pageNumber 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : ''
                  }`}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="default"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded-xl px-6 h-12 font-medium transition-all duration-200 hover:scale-105"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* No Results Message */}
      {filteredAndSortedTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tools found matching your criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("")
              setSelectedCategories([])
              setSelectedTags([])
              setSortBy("name")
              setCurrentPage(1)
            }}
            className="mt-4"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
}
