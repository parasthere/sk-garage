import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalRevenueResult = await prisma.invoice.aggregate({
      where: { status: { in: ["PAID", "PARTIAL"] } },
      _sum: { grandTotal: true },
    });

    const completedJobs = await prisma.jobCard.count({ where: { status: "COMPLETED" } });
    const pendingJobs = await prisma.jobCard.count({ where: { status: { in: ["IN_PROGRESS", "INSPECTION", "APPROVED"] } } });

    const topServices = await prisma.jobCardService.groupBy({
      by: ["serviceId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const mechanics = await prisma.mechanic.findMany({
      include: { jobCards: true },
    });

    const mechanicPerformance = mechanics.map((m) => ({
      name: m.name,
      completedJobs: m.jobCards.filter((j) => j.status === "COMPLETED" || j.status === "DELIVERED").length,
      revenue: m.jobCards.reduce((acc, j) => acc + (j.actualCost || 0), 0),
    }));

    return NextResponse.json({
      revenue: totalRevenueResult._sum.grandTotal || 0,
      completedJobs,
      pendingJobs,
      topServices,
      mechanicPerformance,
    });
  } catch (error) {
    console.error("Reports API Error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
