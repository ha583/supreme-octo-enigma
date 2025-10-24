import { requireUser } from "@/app/lib/hooks";
import prisma from "@/app/lib/db";
import { projectSchema } from "@/app/lib/zodSchemas";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await requireUser();

    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        organization: {
          userId: session.user?.id as string,
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await requireUser();
    const formData = await request.formData();

    // Find project and verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        organization: {
          userId: session.user?.id as string,
        },
      },
      include: { organization: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      coverImage: formData.get("coverImage") as string || undefined,
      images: formData.get("images") as string || undefined,
      date: formData.get("date") as string || undefined,
      isPinned: formData.get("isPinned") === "on",
      isFeatured: formData.get("isFeatured") === "on",
      projectUrl: formData.get("projectUrl") as string || undefined,
      tags: formData.get("tags") as string || undefined,
    };

    const result = projectSchema.safeParse(rawData);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const tags = result.data.tags ? result.data.tags.split(",").map(t => t.trim()) : [];

    const images = result.data.images ? JSON.parse(result.data.images) : [];

    await prisma.project.update({
      where: { id: params.projectId },
      data: {
        title: result.data.title,
        description: result.data.description,
        coverImage: result.data.coverImage,
        images: images as any,
        date: result.data.date,
        isPinned: result.data.isPinned,
        isFeatured: result.data.isFeatured,
        projectUrl: result.data.projectUrl,
        tags: tags as any,
      },
    });

    revalidatePath(`/dashboard/portfolio/${project.organizationId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}