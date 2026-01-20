import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { FeatureRequestStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/requests/[id]
 * Fetch a single feature request by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    const featureRequest = await prisma.featureRequest.findUnique({
      where: { id },
      include: {
        votes: session?.user
          ? {
              where: { userId: session.user.id },
              select: { id: true },
            }
          : false,
      },
    });

    if (!featureRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      request: {
        ...featureRequest,
        createdAt: featureRequest.createdAt.toISOString(),
        updatedAt: featureRequest.updatedAt.toISOString(),
        hasVoted: session?.user ? featureRequest.votes && featureRequest.votes.length > 0 : false,
        votes: undefined,
      },
    });
  } catch (error) {
    console.error('Failed to fetch request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/requests/[id]
 * Update a feature request (admin only for status/pinned/notes)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
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
    const { status, isPinned, adminNotes } = body;

    // Check if this is an admin action
    const isAdminAction = status !== undefined || isPinned !== undefined || adminNotes !== undefined;

    if (isAdminAction && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Validate status if provided
    if (status && !Object.values(FeatureRequestStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData: {
      status?: FeatureRequestStatus;
      isPinned?: boolean;
      adminNotes?: string;
    } = {};

    if (status !== undefined) updateData.status = status;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updatedRequest = await prisma.featureRequest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      request: {
        ...updatedRequest,
        createdAt: updatedRequest.createdAt.toISOString(),
        updatedAt: updatedRequest.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to update request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/requests/[id]
 * Delete a feature request (admin only)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only admins can delete
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await prisma.featureRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete request:', error);
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}
