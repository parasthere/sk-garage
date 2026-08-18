import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
    });
    const packages = await prisma.servicePackage.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ services, packages });
  } catch (error) {
    console.error("Fetch Services Error:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { type, name, description, price, estimatedMinutes, category } = data;

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    if (type === "PACKAGE") {
      const servicePackage = await prisma.servicePackage.create({
        data: {
          name,
          description,
          price: parseFloat(price),
        },
      });
      return NextResponse.json(servicePackage, { status: 201 });
    } else {
      const service = await prisma.service.create({
        data: {
          name,
          description,
          category: category || "General",
          price: parseFloat(price),
          estimatedMinutes: parseInt(estimatedMinutes) || 60,
        },
      });
      return NextResponse.json(service, { status: 201 });
    }
  } catch (error) {
    console.error("Create Service Error:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, description, price, estimatedMinutes, category } = data;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        category,
        price: parseFloat(price),
        estimatedMinutes: parseInt(estimatedMinutes),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Service Error:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Service Error:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
