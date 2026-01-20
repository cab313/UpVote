import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { CommentWithReplies } from '@/lib/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/requests/[id]/comments
 * Fetch all comments for a feature request
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Fetch all comments for this request
    const comments = await prisma.comment.findMany({
      where: { requestId: id },
      orderBy: { createdAt: 'asc' },
    });

    // Organize into threaded structure
    const parentComments: CommentWithReplies[] = [];
    const repliesMap: Map<string, CommentWithReplies[]> = new Map();

    comments.forEach((comment) => {
      const transformed: CommentWithReplies = {
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        replies: [],
      };

      if (comment.parentId) {
        const existing = repliesMap.get(comment.parentId) || [];
        existing.push(transformed);
        repliesMap.set(comment.parentId, existing);
      } else {
        parentComments.push(transformed);
      }
    });

    // Attach replies to parent comments
    parentComments.forEach((comment) => {
      comment.replies = repliesMap.get(comment.id) || [];
    });

    return NextResponse.json({ comments: parentComments });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/requests/[id]/comments
 * Create a new comment
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, parentId } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Check if request exists
    const featureRequest = await prisma.featureRequest.findUnique({
      where: { id },
    });

    if (!featureRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // If parentId provided, verify it exists and is not already a reply
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }

      // Two-level threading: replies can't have replies
      if (parentComment.parentId) {
        return NextResponse.json(
          { error: 'Cannot reply to a reply' },
          { status: 400 }
        );
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        authorName: session.user.name || 'Anonymous',
        authorAvatar: session.user.image,
        requestId: id,
        parentId: parentId || null,
      },
    });

    // Update comment count
    await prisma.featureRequest.update({
      where: { id },
      data: { commentCount: { increment: 1 } },
    });

    return NextResponse.json({
      comment: {
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
