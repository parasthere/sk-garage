import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Garage
  const garage = await prisma.garage.create({
    data: {
      name: "SK Car Garage",
      address: "Plot 45, Auto Tech Park, Phase II, Mumbai",
      phone: "+91 98765 43210",
      email: "service@skcargarage.com",
      gstNumber: "27AAACS1234F1Z5",
    },
  });

  // 2. Create Admin User
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "admin@skcar.com" },
    update: {},
    create: {
      email: "admin@skcar.com",
      name: "Garage Manager",
      passwordHash,
      role: "ADMIN",
      phone: "+91 98765 43210",
      garageId: garage.id,
    },
  });

  // 3. Create Mechanics
  const mechanicsData = [
    { name: "Vikram Singh", email: "vikram@skcar.com", phone: "+91 98111 22233", specialization: "Master Specialist", hourlyRate: 650, status: "AVAILABLE" },
    { name: "Amit Verma", email: "amit@skcar.com", phone: "+91 98222 33344", specialization: "Electrical & ECU Diagnostics", hourlyRate: 550, status: "BUSY" },
    { name: "Rajesh Kumar", email: "rajesh@skcar.com", phone: "+91 98333 44455", specialization: "Brakes & Suspension", hourlyRate: 480, status: "AVAILABLE" },
    { name: "Suresh Nair", email: "suresh@skcar.com", phone: "+91 98444 55566", specialization: "Engine & Transmission Overhaul", hourlyRate: 700, status: "AVAILABLE" },
  ];

  const mechanics = [];
  for (const m of mechanicsData) {
    const mech = await prisma.mechanic.upsert({
      where: { email: m.email },
      update: {},
      create: m,
    });
    mechanics.push(mech);
  }

  // 4. Create Customers & Vehicles
  const customer1 = await prisma.customer.upsert({
    where: { email: "rahul.sharma@example.com" },
    update: {},
    create: {
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "+91 99887 76655",
      address: "B-402, Green Meadows, Andheri West",
      city: "Mumbai",
      vehicles: {
        create: [
          {
            make: "BMW",
            model: "3 Series 320d",
            year: 2022,
            plateNumber: "MH-02-EE-8899",
            vin: "WBA3D51080K123456",
            color: "Alpine White",
            fuelType: "DIESEL",
            mileage: 28500,
          },
        ],
      },
    },
    include: { vehicles: true },
  });

  const customer2 = await prisma.customer.upsert({
    where: { email: "priya.patel@example.com" },
    update: {},
    create: {
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+91 98765 11223",
      address: "12, Silver Oaks Society, Bandra West",
      city: "Mumbai",
      vehicles: {
        create: [
          {
            make: "Audi",
            model: "A4 45 TFSI",
            year: 2023,
            plateNumber: "MH-01-AB-1234",
            vin: "WAUZZF4G8KN654321",
            color: "Mythos Black",
            fuelType: "PETROL",
            mileage: 14200,
          },
        ],
      },
    },
    include: { vehicles: true },
  });

  const customer3 = await prisma.customer.upsert({
    where: { email: "ananya.sen@example.com" },
    update: {},
    create: {
      name: "Ananya Sen",
      email: "ananya.sen@example.com",
      phone: "+91 97654 33221",
      address: "501, Horizon Towers, Powai",
      city: "Mumbai",
      vehicles: {
        create: [
          {
            make: "Mercedes-Benz",
            model: "C-Class C200",
            year: 2021,
            plateNumber: "MH-04-CZ-7700",
            vin: "WDD2050401R987654",
            color: "Iridium Silver",
            fuelType: "PETROL",
            mileage: 39100,
          },
        ],
      },
    },
    include: { vehicles: true },
  });

  // 5. Create Services Catalog
  const servicesData = [
    { name: "Full Engine Maintenance Service", description: "Complete engine tune-up, oil filter replacement, spark plug cleaning, and ECU scan.", price: 6500, estimatedMinutes: 180, category: "Engine" },
    { name: "Synthetic Engine Oil Change", description: "Premium 5W-40 full synthetic oil replacement including filter change.", price: 3800, estimatedMinutes: 60, category: "Periodic" },
    { name: "AC Gas Refill & Antimicrobial Sanitization", description: "R134a refrigerant charge, evaporator leak test, and cabin anti-bacterial fogging.", price: 2800, estimatedMinutes: 90, category: "AC" },
    { name: "3D Wheel Alignment & Balancing", description: "Computerized 4-wheel laser alignment and dynamic wheel balancing.", price: 1500, estimatedMinutes: 45, category: "Suspension" },
    { name: "Front Ceramic Brake Pad Replacement", description: "Removal of worn brake pads, rotor resurfacing, and fitting ceramic pads.", price: 4200, estimatedMinutes: 90, category: "Brake" },
    { name: "Transmission Fluid & Filter Service", description: "Automatic transmission fluid flush and replacement filter gasket installation.", price: 7500, estimatedMinutes: 120, category: "Engine" },
  ];

  for (const s of servicesData) {
    await prisma.service.create({ data: s });
  }

  // 6. Create Suppliers & Spare Parts
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "Bosch Automotive India",
      contactPerson: "Rajesh Mittal",
      email: "orders@bosch.co.in",
      phone: "+91 22 6677 8899",
      address: "MIDC Industrial Area, Pune",
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "Brembo & Liqui Moly Distro",
      contactPerson: "Karan Mehta",
      email: "sales@brembo-lm.in",
      phone: "+91 22 4433 2211",
      address: "Lower Parel, Mumbai",
    },
  });

  const sparePartsData = [
    { name: "Liqui Moly 5W-40 Synthetic Oil (5L)", partNumber: "LM-5W40-5L", category: "Fluids", costPrice: 2600, sellingPrice: 3800, stock: 24, minStock: 8, location: "Shelf A-1", supplierId: supplier2.id },
    { name: "Bosch Ceramic Brake Pads (Front)", partNumber: "BP-BOSCH-AUDI-01", category: "Brakes", costPrice: 2800, sellingPrice: 4200, stock: 12, minStock: 4, location: "Shelf B-3", supplierId: supplier1.id },
    { name: "Mann Engine Air Filter", partNumber: "AF-MANN-BMW-02", category: "Filters", costPrice: 950, sellingPrice: 1600, stock: 18, minStock: 5, location: "Shelf C-2", supplierId: supplier1.id },
    { name: "NGK Iridium Spark Plugs (Set of 4)", partNumber: "SP-NGK-IRI-4", category: "Ignition", costPrice: 1800, sellingPrice: 2900, stock: 3, minStock: 6, location: "Shelf A-4", supplierId: supplier1.id }, // Low Stock!
    { name: "R134a AC Refrigerant Can (1Kg)", partNumber: "AC-R134A-1KG", category: "AC Parts", costPrice: 850, sellingPrice: 1450, stock: 15, minStock: 5, location: "Rack D-1", supplierId: supplier2.id },
    { name: "Brembo Ventilated Brake Rotors (Pair)", partNumber: "BR-BREMBO-BENZ-2", category: "Brakes", costPrice: 7200, sellingPrice: 10500, stock: 6, minStock: 3, location: "Floor Bay 2", supplierId: supplier2.id },
  ];

  for (const sp of sparePartsData) {
    await prisma.sparePart.upsert({
      where: { partNumber: sp.partNumber },
      update: {},
      create: sp,
    });
  }

  // 7. Create Appointments
  await prisma.appointment.create({
    data: {
      customerId: customer1.id,
      vehicleId: customer1.vehicles[0].id,
      mechanicId: mechanics[0].id,
      serviceType: "Full Engine Maintenance Service",
      appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
      status: "CONFIRMED",
      notes: "Customer reported slight engine shuddering at idle.",
    },
  });

  await prisma.appointment.create({
    data: {
      customerId: customer2.id,
      vehicleId: customer2.vehicles[0].id,
      mechanicId: mechanics[1].id,
      serviceType: "Front Ceramic Brake Pad Replacement",
      appointmentDate: new Date(Date.now() + 172800000), // 2 days later
      status: "SCHEDULED",
      notes: "Squeaking sound when braking above 60km/h.",
    },
  });

  // 8. Create Job Cards & Invoices
  const jobCard1 = await prisma.jobCard.create({
    data: {
      jobNumber: "JC-2026-0801",
      customerId: customer1.id,
      vehicleId: customer1.vehicles[0].id,
      mechanicId: mechanics[0].id,
      status: "IN_PROGRESS",
      mileageIn: 28500,
      notes: "Replacing oil and checking front brake sensors.",
      estimatedCost: 8000,
      actualCost: 8000,
    },
  });

  const jobCard2 = await prisma.jobCard.create({
    data: {
      jobNumber: "JC-2026-0802",
      customerId: customer2.id,
      vehicleId: customer2.vehicles[0].id,
      mechanicId: mechanics[2].id,
      status: "COMPLETED",
      mileageIn: 14200,
      mileageOut: 14205,
      notes: "Full brake service completed. Tested on road.",
      estimatedCost: 12000,
      actualCost: 12400,
    },
  });

  // Create Invoice for completed JobCard2
  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0091",
      jobCardId: jobCard2.id,
      customerId: customer2.id,
      subtotal: 10500,
      taxAmount: 1890, // 18% GST
      discount: 390,
      grandTotal: 12000,
      status: "PAID",
      dueDate: new Date(),
      items: {
        create: [
          { type: "SERVICE", description: "Front Ceramic Brake Pad Replacement", quantity: 1, unitPrice: 4200, totalPrice: 4200 },
          { type: "PART", description: "Bosch Ceramic Brake Pads (Front)", quantity: 1, unitPrice: 4200, totalPrice: 4200 },
          { type: "LABOUR", description: "Brake Cleaning & Disc Resurfacing Labour", quantity: 1, unitPrice: 2100, totalPrice: 2100 },
        ],
      },
      payments: {
        create: [
          { amount: 12000, paymentMethod: "UPI", transactionRef: "UPI/623910293/PAY", notes: "GooglePay Payment Received" },
        ],
      },
    },
  });

  // 9. Add Notifications
  await prisma.notification.createMany({
    data: [
      { title: "Low Stock Alert", message: "NGK Iridium Spark Plugs (Set of 4) is down to 3 items (Min Stock: 6).", type: "WARNING" },
      { title: "New Appointment Booked", message: "Rahul Sharma booked BMW 3 Series service for tomorrow.", type: "INFO" },
      { title: "Payment Received", message: "Invoice INV-2026-0091 paid ₹12,000 via UPI.", type: "SUCCESS" },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
