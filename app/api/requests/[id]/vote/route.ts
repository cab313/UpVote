import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/requests/[id]/vote
 * Toggle vote on a feature request
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

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_requestId: {
          userId: session.user.id,
          requestId: id,
        },
      },
    });

    if (existingVote) {
      // Remove vote
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });

      const updatedRequest = await prisma.featureRequest.update({
        where: { id },
        data: { upvotes: { decrement: 1 } },
      });

      return NextResponse.json({
        voted: false,
        upvotes: updatedRequest.upvotes,
      });
    } else {
      // Add vote
      await prisma.vote.create({
        data: {
          userId: session.user.id,
          requestId: id,
        },
      });

      const updatedRequest = await prisma.featureRequest.update({
        where: { id },
        data: { upvotes: { increment: 1 } },
      });

      return NextResponse.json({
        voted: true,
        upvotes: updatedRequest.upvotes,
      });
    }
  } catch (error) {
    console.error('Failed to toggle vote:', error);
    return NextResponse.json(
      { error: 'Failed to toggle vote' },
      { status: 500 }
    );
  }
}
