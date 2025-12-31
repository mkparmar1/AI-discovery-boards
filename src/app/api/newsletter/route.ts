import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { sendNewsletterSubscriptionNotification, getRequestContext } from '@/lib/telegram'

// Newsletter model (if you want to store subscriptions in DB)
// For now, we'll just send to Telegram
// You can add a Newsletter model later if needed

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email } = body || {}

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Get request context for Telegram notification
    const ctx = getRequestContext(request)

    // Send notification to Telegram
    try {
      await sendNewsletterSubscriptionNotification(normalizedEmail, request)
    } catch (notifyErr) {
      console.error('⚠️ Failed to send newsletter subscription notification:', notifyErr)
      // Don't fail the request if Telegram fails, but log it
    }

    // TODO: Optionally save to database here
    // const newsletter = new Newsletter({ email: normalizedEmail, ... })
    // await newsletter.save()

    return NextResponse.json(
      {
        success: true,
        message: '🎉 Successfully subscribed! Check your email for updates.'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error handling newsletter subscription:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process subscription. Please try again later.'
      },
      { status: 500 }
    )
  }
}

