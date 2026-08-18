import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const mechanics = await prisma.mechanic.findMany({
      include: {
        jobCards: {
          select: { id: true, status: true, actualCost: true, createdAt: true },
        },
        appointments: {
          select: { id: true, status: true, appointmentDate: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // Compute performance metrics from actual database records
    const enrichedMechanics = mechanics.map((m) => {
      const completedJobs = m.jobCards.filter(
        (jc) => jc.status === "COMPLETED" || jc.status === "DELIVERED"
      ).length;
      const totalRevenueGenerated = m.jobCards.reduce(
        (acc, jc) => acc + (jc.actualCost || 0),
        0
      );

      return {
        ...m,
        completedJobsCount: completedJobs,
        activeJobsCount: m.jobCards.filter((jc) => jc.status === "IN_PROGRESS").length,
        totalRevenueGenerated,
      };
    });

    return NextResponse.json(enrichedMechanics);
  } catch (error) {
    console.error("Fetch Mechanics Error:", error);
    return NextResponse.json({ error: "Failed to fetch mechanics" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, specialization, hourlyRate, status } = data;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, Email and Phone are required" }, { status: 400 });
    }

    const mechanic = await prisma.mechanic.create({
      data: {
        name,
        email,
        phone,
        specialization: specialization || "General Maintenance",
        hourlyRate: parseFloat(hourlyRate) || 450,
        status: status || "AVAILABLE",
      },
    });

    return NextResponse.json(mechanic, { status: 201 });
  } catch (error) {
    console.error("Create Mechanic Error:", error);
    return NextResponse.json({ error: "Failed to create mechanic" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, email, phone, specialization, hourlyRate, status } = data;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await prisma.mechanic.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        specialization,
        hourlyRate: parseFloat(hourlyRate),
        status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Mechanic Error:", error);
    return NextResponse.json({ error: "Failed to update mechanic" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.mechanic.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Mechanic Error:", error);
    return NextResponse.json({ error: "Failed to delete mechanic" }, { status: 500 });
  }
}
