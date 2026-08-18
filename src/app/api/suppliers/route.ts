import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        parts: { select: { id: true, name: true, partNumber: true, stock: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Fetch Suppliers Error:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, contactPerson, email, phone, address } = data;

    if (!name || !phone) {
      return NextResponse.json({ error: "Supplier Name and Phone are required" }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: { name, contactPerson, email, phone, address },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Create Supplier Error:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, contactPerson, email, phone, address } = data;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await prisma.supplier.update({
      where: { id },
      data: { name, contactPerson, email, phone, address },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Supplier Error:", error);
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Supplier Error:", error);
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 });
  }
}
