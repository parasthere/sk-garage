import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const appointments = await prisma.appointment.findMany({
      where: status ? { status } : undefined,
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        vehicle: { select: { id: true, make: true, model: true, plateNumber: true } },
        mechanic: { select: { id: true, name: true } },
      },
      orderBy: { appointmentDate: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Fetch Appointments Error:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { customerId, vehicleId, mechanicId, serviceType, appointmentDate, notes } = data;

    if (!customerId || !vehicleId || !serviceType || !appointmentDate) {
      return NextResponse.json({ error: "Customer, Vehicle, Service Type and Date are required" }, { status: 400 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        vehicleId,
        mechanicId: mechanicId || null,
        serviceType,
        appointmentDate: new Date(appointmentDate),
        notes,
        status: "SCHEDULED",
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Create Appointment Error:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, status, appointmentDate, mechanicId, notes } = data;

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updateData: any = {};
    if (status) updateData.status = status;
    if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
    if (mechanicId !== undefined) updateData.mechanicId = mechanicId || null;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Appointment Error:", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Appointment Error:", error);
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}
