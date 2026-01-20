import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { summarizeRequest } from '@/lib/llama';
import { SortOption } from '@/lib/types';

/**
 * GET /api/requests
 * Fetch all feature requests with optional sorting and search
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sort = (searchParams.get('sort') as SortOption) || 'trending';
    const search = searchParams.get('search') || '';

    // Build the where clause for search
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { tags: { has: search } },
          ],
          mergedIntoId: null, // Exclude merged requests
        }
      : { mergedIntoId: null };

    // Build the orderBy clause based on sort option
    let orderBy: object[];
    switch (sort) {
      case 'most_voted':
        orderBy = [{ isPinned: 'desc' }, { upvotes: 'desc' }];
        break;
      case 'newest':
        orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'oldest':
        orderBy = [{ isPinned: 'desc' }, { createdAt: 'asc' }];
        break;
      case 'trending':
      default:
        // Trending: combination of recency and votes
        orderBy = [{ isPinned: 'desc' }, { upvotes: 'desc' }, { createdAt: 'desc' }];
    }

    const requests = await prisma.featureRequest.findMany({
      where,
      orderBy,
      include: {
        votes: session?.user
          ? {
              where: { userId: session.user.id },
              select: { id: true },
            }
          : false,
      },
    });

    // Transform to include hasVoted flag
    const transformedRequests = requests.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      hasVoted: session?.user ? r.votes && r.votes.length > 0 : false,
      votes: undefined, // Remove the votes array from response
    }));

    return NextResponse.json({ requests: transformedRequests });
  } catch (error) {
    console.error('Failed to fetch requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/requests
 * Create a new feature request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, tags, mergeWithId } = body;

    // Validate required fields
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: 'Title must be 100 characters or less' },
        { status: 400 }
      );
    }

    // If merging with an existing request
    if (mergeWithId) {
      const targetRequest = await prisma.featureRequest.findUnique({
        where: { id: mergeWithId },
      });

      if (!targetRequest) {
        return NextResponse.json(
          { error: 'Target request not found' },
          { status: 404 }
        );
      }

      // Add vote to target request if user hasn't voted
      const existingVote = await prisma.vote.findUnique({
        where: {
          userId_requestId: {
            userId: session.user.id,
            requestId: mergeWithId,
          },
        },
      });

      if (!existingVote) {
        await prisma.vote.create({
          data: {
            userId: session.user.id,
            requestId: mergeWithId,
          },
        });

        await prisma.featureRequest.update({
          where: { id: mergeWithId },
          data: { upvotes: { increment: 1 } },
        });
      }

      return NextResponse.json({
        merged: true,
        request: {
          ...targetRequest,
          createdAt: targetRequest.createdAt.toISOString(),
          updatedAt: targetRequest.updatedAt.toISOString(),
        },
      });
    }

    // Generate AI summary
    let summary = '';
    try {
      summary = await summarizeRequest(title.trim(), description.trim());
    } catch (error) {
      console.error('Failed to generate summary:', error);
      summary = `Feature request: ${title.trim()}`;
    }

    // Create the new request
    const newRequest = await prisma.featureRequest.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        summary,
        tags: tags || [],
        authorId: session.user.id,
        authorName: session.user.name || 'Anonymous',
        authorAvatar: session.user.image,
        upvotes: 1,
      },
    });

    // Auto-vote for the creator
    await prisma.vote.create({
      data: {
        userId: session.user.id,
        requestId: newRequest.id,
      },
    });

    return NextResponse.json({
      request: {
        ...newRequest,
        createdAt: newRequest.createdAt.toISOString(),
        updatedAt: newRequest.updatedAt.toISOString(),
        hasVoted: true,
      },
    });
  } catch (error) {
    console.error('Failed to create request:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
