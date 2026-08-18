import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const garage = await prisma.garage.findFirst();
    return NextResponse.json(garage || {});
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const garage = await prisma.garage.findFirst();

    if (garage) {
      const updated = await prisma.garage.update({
        where: { id: garage.id },
        data: {
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          gstNumber: data.gstNumber,
        },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.garage.create({
        data: {
          name: data.name || "SK Car Garage",
          address: data.address || "Plot 45, Auto Tech Park",
          phone: data.phone || "+91 98765 43210",
          email: data.email || "service@skcargarage.com",
          gstNumber: data.gstNumber || "27AAACS1234F1Z5",
        },
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
