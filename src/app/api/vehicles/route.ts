import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    const vehicles = await prisma.vehicle.findMany({
      where: query
        ? {
            OR: [
              { make: { contains: query } },
              { model: { contains: query } },
              { plateNumber: { contains: query } },
              { vin: { contains: query } },
            ],
          }
        : undefined,
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        jobCards: { take: 3, orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Fetch Vehicles Error:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { customerId, make, model, year, plateNumber, vin, color, fuelType, mileage } = data;

    if (!customerId || !make || !model || !plateNumber) {
      return NextResponse.json({ error: "Customer, Make, Model and Plate Number are required" }, { status: 400 });
    }

    const existing = await prisma.vehicle.findUnique({ where: { plateNumber } });
    if (existing) {
      return NextResponse.json({ error: "Vehicle with this License Plate already exists" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        customerId,
        make,
        model,
        year: parseInt(year) || 2023,
        plateNumber,
        vin,
        color,
        fuelType: fuelType || "PETROL",
        mileage: parseInt(mileage) || 0,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("Create Vehicle Error:", error);
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, make, model, year, plateNumber, vin, color, fuelType, mileage } = data;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        make,
        model,
        year: parseInt(year),
        plateNumber,
        vin,
        color,
        fuelType,
        mileage: parseInt(mileage),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Vehicle Error:", error);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Vehicle Error:", error);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
