import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Prompt from '@/models/Prompt'
import { aiPrompts } from '@/lib/data'

export async function GET(request: NextRequest) {
  // Extract query params early so we can reuse them in fallback
  const { searchParams } = new URL(request.url)
  const promptId = searchParams.get('promptId')
  const lookup = searchParams.get('lookup') === 'true'

  // Check if this is a metadata-only request
  const metaOnly = searchParams.get('metaOnly') === 'true'

  if (promptId || lookup || metaOnly) {
    try {
      await connectDB()

      if (promptId) {
        const prompt = await Prompt.findOne({ id: promptId })
        if (!prompt) {
          return NextResponse.json(
            { success: false, error: 'Prompt not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            id: prompt.id,
            title: prompt.title,
            prompt: prompt.prompt,
            category: prompt.category,
            tags: prompt.tags,
            description: prompt.description,
            useCase: prompt.useCase,
            difficulty: prompt.difficulty,
            createdAt: prompt.createdAt ? prompt.createdAt.toISOString().split('T')[0] : ''
          }
        })
      }

      if (lookup) {
        const prompts = await Prompt.find({})
          .sort({ title: 1 })
          .select({ id: 1, title: 1, _id: 0 })
        return NextResponse.json({
          success: true,
          data: prompts
        })
      }
    } catch (error) {
      console.error('ƒ?O Error fetching prompt lookup/details:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch prompt info' },
        { status: 500 }
      )
    }
  }

  if (metaOnly) {
    try {
      // Get unique categories and tags from database
      const [categories, tags] = await Promise.all([
        Prompt.distinct('category'),
        Prompt.distinct('tags')
      ])

      // Flatten tags array and get unique values
      const flatTags = tags.flat().filter((tag, index, arr) => arr.indexOf(tag) === index)

      return NextResponse.json({
        success: true,
        categories: categories.sort(),
        tags: flatTags.sort(),
        totalCount: await Prompt.countDocuments()
      })
    } catch (error) {
      console.error('❌ Error fetching metadata (falling back to static):', error)
      
      // Fallback to static data
      const categories = [...new Set(aiPrompts.map(p => p.category))].sort()
      const tags = [...new Set(aiPrompts.flatMap(p => p.tags))].sort()
      
      return NextResponse.json({
        success: true,
        categories,
        tags,
        totalCount: aiPrompts.length,
        source: 'static'
      })
    }
  }

  // Pagination parameters
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  // Filter parameters
  const category = searchParams.get('category')
  const difficulty = searchParams.get('difficulty')
  const search = searchParams.get('search')
  const tags = searchParams.get('tags')?.split(',').filter(Boolean)

  try {
    await connectDB()

    // Build query
    const query: any = {}

    if (category) {
      query.category = { $regex: category, $options: 'i' }
    }

    if (difficulty) {
      query.difficulty = difficulty
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { prompt: { $regex: search, $options: 'i' } }
      ]
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags.map(tag => new RegExp(tag, 'i')) }
    }

    // Execute query with pagination
    const [prompts, totalCount] = await Promise.all([
      Prompt.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Prompt.countDocuments(query)
    ])

    // Transform prompts to match frontend interface
    const transformedPrompts = prompts.map(prompt => {
      const createdAtStr = prompt && (prompt as any).createdAt
        ? new Date((prompt as any).createdAt).toISOString().split('T')[0]
        : ''
      return {
        id: (prompt as any).id,
        title: (prompt as any).title,
        prompt: (prompt as any).prompt,
        category: (prompt as any).category,
        tags: (prompt as any).tags,
        description: (prompt as any).description,
        useCase: (prompt as any).useCase,
        difficulty: (prompt as any).difficulty,
        createdAt: createdAtStr // Format as YYYY-MM-DD, safe if missing
      }
    })

    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      success: true,
      data: transformedPrompts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore
      }
    })

  } catch (error) {
    console.error('❌ Error fetching prompts (falling back to static):', error)

    // Fallback to static prompts when DB is unavailable
    const matchesFilters = (p: typeof aiPrompts[number]) => {
      const categoryMatch = category ? new RegExp(category, 'i').test(p.category) : true
      const difficultyMatch = difficulty ? p.difficulty === difficulty : true
      const searchMatch = search ? (
        new RegExp(search, 'i').test(p.title) ||
        new RegExp(search, 'i').test(p.description) ||
        new RegExp(search, 'i').test(p.prompt)
      ) : true
      const tagsMatch = (tags && tags.length > 0)
        ? tags.some(t => p.tags.some(pt => new RegExp(t, 'i').test(pt)))
        : true
      return categoryMatch && difficultyMatch && searchMatch && tagsMatch
    }

    const filtered = aiPrompts
      .filter(matchesFilters)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    const sliced = filtered.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      data: sliced,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore
      },
      source: 'static'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { id, title, prompt, category, tags, description, useCase, difficulty } = body

    if (id) {
      const existingPrompt = await Prompt.findOne({ id })

      if (existingPrompt) {
        const updateFields: Record<string, unknown> = {}
        if (title) updateFields.title = title
        if (prompt) updateFields.prompt = prompt
        if (category) updateFields.category = category
        if (Array.isArray(tags) && tags.length > 0) updateFields.tags = tags
        if (description) updateFields.description = description
        if (useCase) updateFields.useCase = useCase
        if (difficulty) updateFields.difficulty = difficulty

        if (Object.keys(updateFields).length === 0) {
          return NextResponse.json(
            { success: false, error: 'No fields provided to update' },
            { status: 400 }
          )
        }

        const updatedPrompt = await Prompt.findOneAndUpdate(
          { id },
          { $set: updateFields },
          { new: true, runValidators: true }
        )

        return NextResponse.json({
          success: true,
          message: 'Prompt updated successfully',
          data: updatedPrompt
        })
      }
    }

    // Validate required fields for create
    if (!title || !prompt || !category || !description || !useCase || !difficulty) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let nextId = id
    if (!nextId) {
      const lastPrompt = await Prompt.findOne().sort({ id: -1 }).lean()
      nextId = lastPrompt && !Array.isArray(lastPrompt) && (lastPrompt as any).id 
        ? (parseInt((lastPrompt as any).id) + 1).toString() 
        : '1'
    }

    // Create new prompt
    const newPrompt = new Prompt({
      id: nextId,
      title,
      prompt,
      category,
      tags: tags || [],
      description,
      useCase,
      difficulty
    })

    await newPrompt.save()

    return NextResponse.json({
      success: true,
      message: 'Prompt created successfully',
      data: {
        id: newPrompt.id,
        title: newPrompt.title,
        prompt: newPrompt.prompt,
        category: newPrompt.category,
        tags: newPrompt.tags,
        description: newPrompt.description,
        useCase: newPrompt.useCase,
        difficulty: newPrompt.difficulty,
        createdAt: newPrompt.createdAt ? newPrompt.createdAt.toISOString().split('T')[0] : ''
      }
    })

  } catch (error) {
    console.error('❌ Error creating prompt:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create prompt',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const promptId = searchParams.get('promptId')

    if (!promptId) {
      return NextResponse.json(
        { success: false, error: 'Prompt ID is required' },
        { status: 400 }
      )
    }

    const result = await Prompt.deleteOne({ id: promptId })
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully'
    })
  } catch (error) {
    console.error('ƒ?O Error deleting prompt:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete prompt' },
      { status: 500 }
    )
  }
}
