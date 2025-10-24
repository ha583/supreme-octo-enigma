import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { requireUser } from "@/app/lib/hooks";

export async function GET(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = await requireUser();

    const service = await prisma.service.findFirst({
      where: {
        id: params.serviceId,
        organization: {
          userId: session.user?.id,
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const { name, description, logo, banner, pricePerHour, sampleWork } = body;

    // Verify service belongs to user
    const existingService = await prisma.service.findFirst({
      where: {
        id: params.serviceId,
        organization: {
          userId: session.user?.id,
        },
      },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const updatedService = await prisma.service.update({
      where: {
        id: params.serviceId,
      },
      data: {
        title: name,
        description,
        logo,
        banner,
        pricePerHour: pricePerHour || null,
        sampleWork: sampleWork || [],
      } as any,
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const session = await requireUser();

    // Verify service belongs to user
    const existingService = await prisma.service.findFirst({
      where: {
        id: params.serviceId,
        organization: {
          userId: session.user?.id,
        },
      },
    });

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await prisma.service.delete({
      where: {
        id: params.serviceId,
      },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}