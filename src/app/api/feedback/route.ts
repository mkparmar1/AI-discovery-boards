import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Feedback from '@/models/Feedback'
import { sendFeedbackNotification, getRequestContext } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { name, email, type, message, pageUrl } = body as {
      name?: string
      email?: string
      type?: 'bug' | 'idea' | 'other'
      message?: string
      pageUrl?: string
    }

    if (!type || !['bug', 'idea', 'other'].includes(type)) {
      return NextResponse.json({ error: 'Feedback type must be bug, idea, or other' }, { status: 400 })
    }
    if (!message || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
    }

    // Optional email validation if provided
    if (email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ error: 'Provide a valid email address' }, { status: 400 })
      }
    }

    const ctx = getRequestContext(request)

    const feedback = await Feedback.create({
      name: name?.trim() || undefined,
      email: email?.trim() || undefined,
      type,
      message: message.trim(),
      pageUrl: pageUrl?.trim() || undefined,
      ipAddress: ctx.ipAddress,
      userAgent: request.headers.get('user-agent') || undefined,
      status: 'new'
    })

    await sendFeedbackNotification({
      name: feedback.name || null,
      email: feedback.email || null,
      type: feedback.type,
      message: feedback.message,
      pageUrl: feedback.pageUrl || null
    }, request)

    return NextResponse.json({ ok: true, id: feedback._id })
  } catch (error: any) {
    console.error('Feedback submission error:', error?.message || error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}