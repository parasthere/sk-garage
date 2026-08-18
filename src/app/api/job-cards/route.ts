import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const jobCards = await prisma.jobCard.findMany({
      where: status ? { status } : undefined,
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        vehicle: { select: { id: true, make: true, model: true, plateNumber: true, mileage: true } },
        mechanic: { select: { id: true, name: true, hourlyRate: true } },
        services: { include: { service: true } },
        parts: { include: { sparePart: true } },
        invoice: { select: { id: true, invoiceNumber: true, status: true, grandTotal: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(jobCards);
  } catch (error) {
    console.error("Fetch Job Cards Error:", error);
    return NextResponse.json({ error: "Failed to fetch job cards" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { customerId, vehicleId, mechanicId, mileageIn, notes, estimatedCost } = data;

    if (!customerId || !vehicleId || !mileageIn) {
      return NextResponse.json({ error: "Customer, Vehicle, and Mileage In are required" }, { status: 400 });
    }

    const count = await prisma.jobCard.count();
    const jobNumber = `JC-2026-${String(count + 101).padStart(4, "0")}`;

    const jobCard = await prisma.jobCard.create({
      data: {
        jobNumber,
        customerId,
        vehicleId,
        mechanicId: mechanicId || null,
        mileageIn: parseInt(mileageIn),
        notes,
        estimatedCost: parseFloat(estimatedCost) || 0,
        status: "INSPECTION",
      },
      include: {
        customer: true,
        vehicle: true,
        mechanic: true,
      },
    });

    return NextResponse.json(jobCard, { status: 201 });
  } catch (error) {
    console.error("Create Job Card Error:", error);
    return NextResponse.json({ error: "Failed to create job card" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, action, status, mechanicId, mileageOut, notes, partId, quantity, serviceId } = data;

    if (!id) return NextResponse.json({ error: "Job Card ID is required" }, { status: 400 });

    const jobCard = await prisma.jobCard.findUnique({
      where: { id },
      include: { parts: true, services: true },
    });

    if (!jobCard) return NextResponse.json({ error: "Job Card not found" }, { status: 404 });

    // Handle Action: ADD_PART
    if (action === "ADD_PART") {
      if (!partId || !quantity || quantity <= 0) {
        return NextResponse.json({ error: "Spare Part ID and valid quantity required" }, { status: 400 });
      }

      const sparePart = await prisma.sparePart.findUnique({ where: { id: partId } });
      if (!sparePart) return NextResponse.json({ error: "Spare part not found" }, { status: 404 });

      // 1. Check stock
      if (sparePart.stock < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock! Requested: ${quantity}, Available: ${sparePart.stock}` },
          { status: 400 }
        );
      }

      // 2. Decrease stock & create transaction
      await prisma.sparePart.update({
        where: { id: partId },
        data: { stock: { decrement: quantity } },
      });

      await prisma.inventoryTransaction.create({
        data: {
          sparePartId: partId,
          type: "OUT",
          quantity,
          referenceId: jobCard.jobNumber,
          notes: `Added to Job Card ${jobCard.jobNumber}`,
        },
      });

      // 3. Add part to job card
      const partCost = sparePart.sellingPrice * quantity;
      await prisma.jobCardPart.create({
        data: {
          jobCardId: id,
          sparePartId: partId,
          quantity,
          unitPrice: sparePart.sellingPrice,
          totalPrice: partCost,
        },
      });

      // 4. Update actual cost
      const newActual = jobCard.actualCost + partCost;
      await prisma.jobCard.update({
        where: { id },
        data: { actualCost: newActual },
      });

      return NextResponse.json({ success: true, message: "Spare part added to job card" });
    }

    // Handle Action: ADD_SERVICE
    if (action === "ADD_SERVICE") {
      if (!serviceId) return NextResponse.json({ error: "Service ID required" }, { status: 400 });

      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

      await prisma.jobCardService.create({
        data: {
          jobCardId: id,
          serviceId,
          price: service.price,
        },
      });

      const newActual = jobCard.actualCost + service.price;
      await prisma.jobCard.update({
        where: { id },
        data: { actualCost: newActual },
      });

      return NextResponse.json({ success: true, message: "Service added to job card" });
    }

    // General Job Card Status / Mechanic Update
    const updateData: any = {};
    if (status) updateData.status = status;
    if (mechanicId !== undefined) updateData.mechanicId = mechanicId || null;
    if (mileageOut !== undefined) updateData.mileageOut = parseInt(mileageOut);
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.jobCard.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Job Card Error:", error);
    return NextResponse.json({ error: "Failed to update job card" }, { status: 500 });
  }
}
