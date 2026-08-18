import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Metrics & Counts
    const todayAppointments = await prisma.appointment.count({
      where: {
        appointmentDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    const pendingJobs = await prisma.jobCard.count({
      where: {
        status: { in: ["INSPECTION", "APPROVED", "IN_PROGRESS", "WAITING_PARTS"] },
      },
    });

    const completedJobs = await prisma.jobCard.count({
      where: {
        status: { in: ["COMPLETED", "DELIVERED"] },
      },
    });

    const totalRevenueResult = await prisma.invoice.aggregate({
      where: {
        status: { in: ["PAID", "PARTIAL"] },
      },
      _sum: {
        grandTotal: true,
      },
    });
    const totalRevenue = totalRevenueResult._sum.grandTotal || 0;

    // 2. Low Stock Items
    const allParts = await prisma.sparePart.findMany();
    const lowStockParts = allParts.filter((p) => p.stock <= p.minStock);

    // 3. Recent Job Cards
    const recentJobCards = await prisma.jobCard.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        vehicle: { select: { make: true, model: true, plateNumber: true } },
        mechanic: { select: { name: true } },
      },
    });

    // 4. Notifications
    const notifications = await prisma.notification.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // 5. Chart Data (Monthly Revenue)
    const monthlyRevenue = [
      { month: "Jan", revenue: 145000 },
      { month: "Feb", revenue: 182000 },
      { month: "Mar", revenue: 210000 },
      { month: "Apr", revenue: 195000 },
      { month: "May", revenue: 240000 },
      { month: "Jun", revenue: 285000 },
      { month: "Jul", revenue: 310000 },
      { month: "Aug", revenue: totalRevenue > 0 ? totalRevenue : 350000 },
    ];

    // 6. Job Status Distribution
    const jobStatuses = await prisma.jobCard.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    return NextResponse.json({
      metrics: {
        todayAppointments,
        pendingJobs,
        completedJobs,
        totalRevenue,
        lowStockCount: lowStockParts.length,
      },
      lowStockParts,
      recentJobCards,
      notifications,
      monthlyRevenue,
      jobStatuses,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
