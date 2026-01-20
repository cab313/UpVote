import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string; commentId: string }>;
}

/**
 * PATCH /api/requests/[id]/comments/[commentId]
 * Edit a comment (only by author)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id, commentId } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Verify the comment belongs to this request
    if (comment.requestId !== id) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Only the author can edit their comment
    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
    });

    return NextResponse.json({
      comment: {
        ...updatedComment,
        createdAt: updatedComment.createdAt.toISOString(),
        updatedAt: updatedComment.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to update comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/requests/[id]/comments/[commentId]
 * Delete a comment (by author or admin)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id, commentId } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Verify the comment belongs to this request
    if (comment.requestId !== id) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Only author or admin can delete
    if (comment.authorId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Count how many comments will be deleted (parent + replies)
    let deleteCount = 1;

    // If this is a parent comment, delete its replies too
    if (!comment.parentId) {
      const replyCount = await prisma.comment.count({
        where: { parentId: commentId },
      });
      deleteCount += replyCount;

      // Delete replies first
      await prisma.comment.deleteMany({
        where: { parentId: commentId },
      });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Update comment count
    await prisma.featureRequest.update({
      where: { id },
      data: { commentCount: { decrement: deleteCount } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
