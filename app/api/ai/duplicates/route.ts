import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { detectDuplicates } from '@/lib/llama';

/**
 * POST /api/ai/duplicates
 * Check for potential duplicate feature requests using AI
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
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Fetch recent requests to compare against (limit to avoid too much context)
    const existingRequests = await prisma.featureRequest.findMany({
      where: {
        mergedIntoId: null, // Only check non-merged requests
        status: { not: 'declined' }, // Skip declined requests
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        upvotes: true,
        commentCount: true,
        authorName: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        authorAvatar: true,
        summary: true,
        mergedFromIds: true,
        isPinned: true,
        adminNotes: true,
      },
      orderBy: { upvotes: 'desc' },
      take: 50, // Limit to top 50 requests
    });

    if (existingRequests.length === 0) {
      return NextResponse.json({ duplicates: [] });
    }

    // Detect duplicates using AI
    const duplicateIds = await detectDuplicates(
      { title, description },
      existingRequests.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
      }))
    );

    // Fetch full details of duplicate requests
    const duplicates = existingRequests
      .filter((r) => duplicateIds.includes(r.id))
      .map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));

    return NextResponse.json({ duplicates });
  } catch (error) {
    console.error('Failed to detect duplicates:', error);
    // Return empty array on error to not block submission
    return NextResponse.json({ duplicates: [] });
  }
}
