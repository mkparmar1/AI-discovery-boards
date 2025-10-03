import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserActivity from '@/models/UserActivity';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'trending', 'most-used', 'user-stats'
    const resourceType = searchParams.get('resourceType'); // 'tool', 'prompt', 'blog', 'research_paper'
    const timeframe = searchParams.get('timeframe') || '7d'; // '1d', '7d', '30d', '90d', 'all'
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');

    // Calculate date range based on timeframe
    let dateFilter: any = {};
    if (timeframe !== 'all') {
      const now = new Date();
      const days = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      dateFilter = { timestamp: { $gte: startDate } };
    }

    switch (type) {
      case 'trending':
        return await getTrendingResources(resourceType, dateFilter, limit);
      
      case 'most-used':
        return await getMostUsedResources(resourceType, dateFilter, limit);
      
      case 'user-stats':
        if (!userId) {
          return NextResponse.json({ error: 'userId required for user-stats' }, { status: 400 });
        }
        return await getUserStats(userId, dateFilter);
      
      case 'activity-timeline':
        return await getActivityTimeline(resourceType, dateFilter, userId);
      
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getTrendingResources(resourceType: string | null, dateFilter: any, limit: number) {
  const matchStage: any = { ...dateFilter };
  if (resourceType) {
    matchStage.resourceType = resourceType;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          resourceId: '$resourceId',
          resourceType: '$resourceType',
          resourceTitle: '$resourceTitle'
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        lastActivity: { $max: '$timestamp' },
        activities: { $push: '$activityType' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' },
        trendingScore: {
          $multiply: [
            '$count',
            { $size: '$uniqueUsers' },
            {
              $divide: [
                86400000, // 24 hours in milliseconds
                { $subtract: [new Date(), '$lastActivity'] }
              ]
            }
          ]
        }
      }
    },
    { $sort: { trendingScore: -1 } },
    { $limit: limit },
    {
      $project: {
        resourceId: '$_id.resourceId',
        resourceType: '$_id.resourceType',
        resourceTitle: '$_id.resourceTitle',
        count: 1,
        uniqueUserCount: 1,
        lastActivity: 1,
        trendingScore: 1,
        _id: 0
      }
    }
  ];

  const trending = await UserActivity.aggregate(pipeline as any);

  return NextResponse.json({
    success: true,
    data: trending,
    type: 'trending'
  });
}

async function getMostUsedResources(resourceType: string | null, dateFilter: any, limit: number) {
  const matchStage: any = { ...dateFilter };
  if (resourceType) {
    matchStage.resourceType = resourceType;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          resourceId: '$resourceId',
          resourceType: '$resourceType',
          resourceTitle: '$resourceTitle'
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        lastActivity: { $max: '$timestamp' },
        firstActivity: { $min: '$timestamp' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { count: -1, uniqueUserCount: -1 } },
    { $limit: limit },
    {
      $project: {
        resourceId: '$_id.resourceId',
        resourceType: '$_id.resourceType',
        resourceTitle: '$_id.resourceTitle',
        count: 1,
        uniqueUserCount: 1,
        lastActivity: 1,
        firstActivity: 1,
        _id: 0
      }
    }
  ];

  const mostUsed = await UserActivity.aggregate(pipeline as any);

  return NextResponse.json({
    success: true,
    data: mostUsed,
    type: 'most-used'
  });
}

async function getUserStats(userId: string, dateFilter: any) {
  const matchStage = { userId, ...dateFilter };

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          resourceType: '$resourceType',
          activityType: '$activityType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.resourceType',
        activities: {
          $push: {
            activityType: '$_id.activityType',
            count: '$count'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ];

  const userStats = await UserActivity.aggregate(pipeline);

  // Get total activities count
  const totalActivities = await UserActivity.countDocuments(matchStage);

  // Get most used resources by user
  const mostUsedPipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          resourceId: '$resourceId',
          resourceType: '$resourceType',
          resourceTitle: '$resourceTitle'
        },
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $project: {
        resourceId: '$_id.resourceId',
        resourceType: '$_id.resourceType',
        resourceTitle: '$_id.resourceTitle',
        count: 1,
        lastActivity: 1,
        _id: 0
      }
    }
  ];

  const mostUsedByUser = await UserActivity.aggregate(mostUsedPipeline as any);

  return NextResponse.json({
    success: true,
    data: {
      totalActivities,
      byResourceType: userStats,
      mostUsedResources: mostUsedByUser
    },
    type: 'user-stats'
  });
}

async function getActivityTimeline(resourceType: string | null, dateFilter: any, userId: string | null) {
  const matchStage: any = { ...dateFilter };
  if (resourceType) matchStage.resourceType = resourceType;
  if (userId) matchStage.userId = userId;

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          },
          resourceType: '$resourceType'
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { '_id.date': 1 } },
    {
      $project: {
        date: '$_id.date',
        resourceType: '$_id.resourceType',
        count: 1,
        uniqueUserCount: 1,
        _id: 0
      }
    }
  ];

  const timeline = await UserActivity.aggregate(pipeline as any);

  return NextResponse.json({
    success: true,
    data: timeline,
    type: 'activity-timeline'
  });
}