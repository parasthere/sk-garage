import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // LOW_STOCK, OUT_OF_STOCK

    const parts = await prisma.sparePart.findMany({
      include: {
        supplier: { select: { id: true, name: true } },
        history: { take: 5, orderBy: { createdAt: "desc" } },
      },
      orderBy: { name: "asc" },
    });

    let filteredParts = parts;
    if (filter === "LOW_STOCK") {
      filteredParts = parts.filter((p) => p.stock <= p.minStock && p.stock > 0);
    } else if (filter === "OUT_OF_STOCK") {
      filteredParts = parts.filter((p) => p.stock === 0);
    }

    return NextResponse.json(filteredParts);
  } catch (error) {
    console.error("Fetch Inventory Error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, partNumber, category, costPrice, sellingPrice, stock, minStock, location, supplierId } = data;

    if (!name || !partNumber || !costPrice || !sellingPrice) {
      return NextResponse.json({ error: "Name, Part Number, Cost Price and Selling Price are required" }, { status: 400 });
    }

    const existing = await prisma.sparePart.findUnique({ where: { partNumber } });
    if (existing) {
      return NextResponse.json({ error: "Part Number already exists" }, { status: 400 });
    }

    const newStock = parseInt(stock) || 0;

    const sparePart = await prisma.sparePart.create({
      data: {
        name,
        partNumber,
        category: category || "General Parts",
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: newStock,
        minStock: parseInt(minStock) || 5,
        location: location || "Shelf A-1",
        supplierId: supplierId || null,
        history: newStock > 0 ? {
          create: {
            type: "IN",
            quantity: newStock,
            notes: "Initial stock created",
          }
        } : undefined,
      },
    });

    return NextResponse.json(sparePart, { status: 201 });
  } catch (error) {
    console.error("Create Inventory Error:", error);
    return NextResponse.json({ error: "Failed to create spare part" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, partNumber, category, costPrice, sellingPrice, stock, minStock, location, supplierId, stockAdjustmentReason } = data;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const currentPart = await prisma.sparePart.findUnique({ where: { id } });
    if (!currentPart) return NextResponse.json({ error: "Part not found" }, { status: 404 });

    const targetStock = parseInt(stock);
    const stockDifference = targetStock - currentPart.stock;

    const updated = await prisma.sparePart.update({
      where: { id },
      data: {
        name,
        partNumber,
        category,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: targetStock,
        minStock: parseInt(minStock),
        location,
        supplierId: supplierId || null,
      },
    });

    // Record stock transaction log if stock changed
    if (stockDifference !== 0) {
      await prisma.inventoryTransaction.create({
        data: {
          sparePartId: id,
          type: stockDifference > 0 ? "IN" : "OUT",
          quantity: Math.abs(stockDifference),
          notes: stockAdjustmentReason || (stockDifference > 0 ? "Manual Stock Restock" : "Manual Stock Reduction"),
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Inventory Error:", error);
    return NextResponse.json({ error: "Failed to update spare part" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.sparePart.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Inventory Error:", error);
    return NextResponse.json({ error: "Failed to delete spare part" }, { status: 500 });
  }
}
