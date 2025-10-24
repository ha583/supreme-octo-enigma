import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { requireUser } from "@/app/lib/hooks";

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await requireUser();

    const client = await prisma.client.findFirst({
      where: {
        id: params.clientId,
        organization: {
          userId: session.user?.id,
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const { name, company, email, phone, avatar, notes } = body;

    // Verify client belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.clientId,
        organization: {
          userId: session.user?.id,
        },
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const updatedClient = await prisma.client.update({
      where: {
        id: params.clientId,
      },
      data: {
        name,
        logo: avatar, // Store avatar as logo in database
        ...(company && { company }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(notes && { notes }),
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await requireUser();

    // Verify client belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.clientId,
        organization: {
          userId: session.user?.id,
        },
      },
    });

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    await prisma.client.delete({
      where: {
        id: params.clientId,
      },
    });

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}