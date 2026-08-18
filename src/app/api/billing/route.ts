import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          customer: true,
          jobCard: {
            include: {
              vehicle: true,
              mechanic: true,
            },
          },
          items: true,
          payments: { orderBy: { createdAt: "desc" } },
        },
      });
      return NextResponse.json(invoice);
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        jobCard: { select: { jobNumber: true, vehicle: { select: { make: true, model: true, plateNumber: true } } } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Fetch Invoices Error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action, jobCardId, customerId, items, discount = 0, taxRate = 18, paymentAmount, paymentMethod, notes } = data;

    // Action: RECORD_PAYMENT
    if (action === "RECORD_PAYMENT") {
      const { invoiceId } = data;
      if (!invoiceId || !paymentAmount || paymentAmount <= 0) {
        return NextResponse.json({ error: "Invoice ID and valid payment amount are required" }, { status: 400 });
      }

      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
      });
      if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

      await prisma.payment.create({
        data: {
          invoiceId,
          amount: parseFloat(paymentAmount),
          paymentMethod: paymentMethod || "CASH",
          notes,
        },
      });

      const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0) + parseFloat(paymentAmount);
      let newStatus = "PARTIAL";
      if (totalPaid >= invoice.grandTotal) {
        newStatus = "PAID";
      }

      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });

      return NextResponse.json(updatedInvoice);
    }

    // Action: CREATE_INVOICE (From Job Card or Custom Items)
    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    let invoiceItems: { type: string; description: string; quantity: number; unitPrice: number; totalPrice: number }[] = [];
    let subtotal = 0;

    if (jobCardId) {
      const jobCard = await prisma.jobCard.findUnique({
        where: { id: jobCardId },
        include: {
          services: { include: { service: true } },
          parts: { include: { sparePart: true } },
        },
      });

      if (jobCard) {
        // Add services
        for (const js of jobCard.services) {
          invoiceItems.push({
            type: "SERVICE",
            description: js.service.name,
            quantity: 1,
            unitPrice: js.price,
            totalPrice: js.price,
          });
          subtotal += js.price;
        }

        // Add parts
        for (const jp of jobCard.parts) {
          invoiceItems.push({
            type: "PART",
            description: jp.sparePart.name,
            quantity: jp.quantity,
            unitPrice: jp.unitPrice,
            totalPrice: jp.totalPrice,
          });
          subtotal += jp.totalPrice;
        }
      }
    } else if (items && Array.isArray(items)) {
      for (const item of items) {
        const itemTotal = item.quantity * item.unitPrice;
        invoiceItems.push({
          type: item.type || "SERVICE",
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: itemTotal,
        });
        subtotal += itemTotal;
      }
    }

    const calculatedTax = (subtotal * (parseFloat(taxRate) || 18)) / 100;
    const grandTotal = Math.max(0, subtotal + calculatedTax - parseFloat(discount));

    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-2026-${String(count + 101).padStart(4, "0")}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        jobCardId: jobCardId || null,
        customerId,
        subtotal,
        taxAmount: calculatedTax,
        discount: parseFloat(discount) || 0,
        grandTotal,
        status: "PENDING",
        dueDate,
        items: {
          create: invoiceItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Create Invoice Error:", error);
    return NextResponse.json({ error: "Failed to process billing transaction" }, { status: 500 });
  }
}
