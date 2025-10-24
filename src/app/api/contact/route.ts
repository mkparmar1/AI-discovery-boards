import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Contact from '@/models/Contact'
import { sendContactNotification, getRequestContext } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, email, subject, message } = body || {}

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter your name (min 2 characters).' }, { status: 400 })
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters long.' }, { status: 400 })
    }

    const ctx = getRequestContext(request)

    // Create and save contact entry
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || '').trim() || undefined,
      message: message.trim(),
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      status: 'new'
    })

    await contact.save()

    // Notify via Telegram
    try {
      await sendContactNotification({ name, email, subject, message }, request)
    } catch (notifyErr) {
      console.error('⚠️ Failed to send contact notification:', notifyErr)
    }

    return NextResponse.json({ success: true, message: 'Thanks! Your message has been received.' }, { status: 201 })
  } catch (error) {
    console.error('❌ Error handling contact submission:', error)
    return NextResponse.json({ error: 'Failed to submit your message. Please try again later.' }, { status: 500 })
  }
}