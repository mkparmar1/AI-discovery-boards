import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserActivity from '@/models/UserActivity';
import User from '@/models/User';
import { sendUserActionNotification } from '@/lib/telegram';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      userId,
      activityType,
      resourceType,
      resourceId,
      resourceTitle,
      metadata,
      sessionId
    } = body;

    // Validate required fields
    if (!userId || !activityType || !resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, activityType, resourceType, resourceId' },
        { status: 400 }
      );
    }

    // Validate enum values
    const validActivityTypes = ['tool_click', 'prompt_view', 'blog_view', 'research_paper_view', 'tool_use'];
    const validResourceTypes = ['tool', 'prompt', 'blog', 'research_paper'];

    if (!validActivityTypes.includes(activityType)) {
      return NextResponse.json(
        { error: 'Invalid activityType' },
        { status: 400 }
      );
    }

    if (!validResourceTypes.includes(resourceType)) {
      return NextResponse.json(
        { error: 'Invalid resourceType' },
        { status: 400 }
      );
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create activity record
    const activity = new UserActivity({
      userId,
      activityType,
      resourceType,
      resourceId,
      resourceTitle,
      metadata: {
        ...metadata,
        userAgent
      },
      sessionId,
      ipAddress,
      timestamp: new Date()
    });

    await activity.save();

    // Telegram notification for user action (important events)
    try {
      let user: any = null;
      if (typeof userId === 'string' && userId !== 'anonymous' && mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId).lean();
      }
      const actionLabel = activityType === 'tool_click'
        ? `Tool Click: ${resourceTitle || resourceId}`
        : activityType.replace(/_/g, ' ');
      await sendUserActionNotification(
        user ?? { _id: null, name: 'Anonymous' },
        request,
        actionLabel
      );
    } catch (notifyErr) {
      console.error('⚠️ Failed to send user action notification:', notifyErr);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Activity recorded successfully',
        activityId: activity._id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error recording user activity:', error);
    return NextResponse.json(
      { error: 'Failed to record activity' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const resourceType = searchParams.get('resourceType');
    const activityType = searchParams.get('activityType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query
    const query: any = {};
    if (userId) query.userId = userId;
    if (resourceType) query.resourceType = resourceType;
    if (activityType) query.activityType = activityType;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get activities with pagination
    const activities = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await UserActivity.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}