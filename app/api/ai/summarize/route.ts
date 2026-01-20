import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { summarizeRequest } from '@/lib/llama';

/**
 * POST /api/ai/summarize
 * Generate or regenerate AI summary for a feature request
 * Can be called on new submissions or by admins to regenerate
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
    const { requestId, title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Generate the summary
    const summary = await summarizeRequest(title, description);

    // If requestId is provided, update the existing request (admin only for regeneration)
    if (requestId) {
      if (!session.user.isAdmin) {
        return NextResponse.json(
          { error: 'Admin access required to regenerate summaries' },
          { status: 403 }
        );
      }

      await prisma.featureRequest.update({
        where: { id: requestId },
        data: { summary },
      });

      return NextResponse.json({ summary, updated: true });
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary. The AI service may be unavailable.' },
      { status: 500 }
    );
  }
}
