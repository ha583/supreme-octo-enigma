import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { requireUser } from "@/app/lib/hooks";

export async function GET(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await requireUser();

    const review = await prisma.review.findFirst({
      where: {
        id: params.reviewId,
        organization: {
          userId: session.user?.id,
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const { clientName, clientCompany, clientAvatar, rating, testimonial, projectType } = body;

    // Verify review belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: params.reviewId,
        organization: {
          userId: session.user?.id,
        },
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updatedReview = await prisma.review.update({
      where: {
        id: params.reviewId,
      },
      data: {
        authorName: clientName,
        authorCompany: clientCompany, 
        authorLogo: clientAvatar,
        rating,
        content: testimonial,
        date: projectType, // Using date field for project type temporarily
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await requireUser();

    // Verify review belongs to user
    const existingReview = await prisma.review.findFirst({
      where: {
        id: params.reviewId,
        organization: {
          userId: session.user?.id,
        },
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    await prisma.review.delete({
      where: {
        id: params.reviewId,
      },
    });

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}