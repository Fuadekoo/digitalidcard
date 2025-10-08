import { PrismaClient, Role, userStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed process...");

  // --- Clean up existing data ---
  console.log("🧹 Cleaning existing data...");
  await prisma.order.deleteMany();
  await prisma.citizen.deleteMany();
  await prisma.user.deleteMany();
  await prisma.station.deleteMany();
  console.log("✅ Cleaned existing data.");

  // --- Create Stations ---
  console.log("🏢 Creating stations...");
  const station1 = await prisma.station.create({
    data: {
      code: "ADD001",
      afanOromoName: "Finfinnee",
      amharicName: "አዲስ አበባ",
      stationAdminName: "Ato Alemayehu Bekele",
      stampPhoto: "stamp_addis_ababa.png",
      signPhoto: "sign_addis_ababa.png",
    },
  });

  const station2 = await prisma.station.create({
    data: {
      code: "DIR002",
      afanOromoName: "Dire Dawa",
      amharicName: "ድሬ ዳዋ",
      stationAdminName: "Ato Mohammed Hassan",
      stampPhoto: "stamp_dire_dawa.png",
      signPhoto: "sign_dire_dawa.png",
    },
  });

  const station3 = await prisma.station.create({
    data: {
      code: "BAH003",
      afanOromoName: "Bahir Dar",
      amharicName: "ባሕር ዳር",
      stationAdminName: "Wro Tsehay Tadesse",
      stampPhoto: "stamp_bahir_dar.png",
      signPhoto: "sign_bahir_dar.png",
    },
  });

  const station4 = await prisma.station.create({
    data: {
      code: "MEK004",
      afanOromoName: "Mekelle",
      amharicName: "መቀሌ",
      stationAdminName: "Ato Gebremedhin Tesfaye",
      stampPhoto: "stamp_mekelle.png",
      signPhoto: "sign_mekelle.png",
    },
  });

  console.log("✅ Created stations:", {
    station1,
    station2,
    station3,
    station4,
  });

  // --- Create Users ---
  console.log("👥 Creating users...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      username: "superadmin",
      phone: "0911111111",
      password: hashedPassword,
      role: "superAdmin",
      status: userStatus.ACTIVE,
      isAdmin: true,
      isActive: true,
    },
  });

  // Super Printer
  const superPrinter = await prisma.user.create({
    data: {
      username: "superprinter",
      phone: "0922222222",
      password: hashedPassword,
      role: "superPrinter",
      status: userStatus.ACTIVE,
      isAdmin: false,
      isActive: true,
    },
  });

  // Station Admins
  const stationAdmin1 = await prisma.user.create({
    data: {
      username: "stationadmin1",
      phone: "0933333333",
      password: hashedPassword,
      role: "stationAdmin",
      stationId: station1.id,
      status: userStatus.ACTIVE,
      isAdmin: true,
      isActive: true,
    },
  });

  const stationAdmin2 = await prisma.user.create({
    data: {
      username: "stationadmin2",
      phone: "0944444444",
      password: hashedPassword,
      role: "stationAdmin",
      stationId: station2.id,
      status: userStatus.ACTIVE,
      isAdmin: true,
      isActive: true,
    },
  });

  // Station Registrars
  const stationRegistrar1 = await prisma.user.create({
    data: {
      username: "registrar1",
      phone: "0955555555",
      password: hashedPassword,
      role: "stationRegistrar",
      stationId: station1.id,
      status: userStatus.ACTIVE,
      isAdmin: false,
      isActive: true,
    },
  });

  const stationRegistrar2 = await prisma.user.create({
    data: {
      username: "registrar2",
      phone: "0966666666",
      password: hashedPassword,
      role: "stationRegistrar",
      stationId: station2.id,
      status: userStatus.ACTIVE,
      isAdmin: false,
      isActive: true,
    },
  });

  // Station Printers
  const stationPrinter1 = await prisma.user.create({
    data: {
      username: "printer1",
      phone: "0977777777",
      password: hashedPassword,
      role: "stationPrinter",
      stationId: station1.id,
      status: userStatus.ACTIVE,
      isAdmin: false,
      isActive: true,
    },
  });

  const stationPrinter2 = await prisma.user.create({
    data: {
      username: "printer2",
      phone: "0988888888",
      password: hashedPassword,
      role: "stationPrinter",
      stationId: station2.id,
      status: userStatus.ACTIVE,
      isAdmin: false,
      isActive: true,
    },
  });

  // Developer
  const developer = await prisma.user.create({
    data: {
      username: "developer",
      phone: "0999999999",
      password: hashedPassword,
      role: "developer",
      status: userStatus.ACTIVE,
      isAdmin: false,
      isActive: true,
    },
  });

  console.log("✅ Created users:", {
    superAdmin,
    superPrinter,
    stationAdmin1,
    stationAdmin2,
    stationRegistrar1,
    stationRegistrar2,
    stationPrinter1,
    stationPrinter2,
    developer,
  });

  // --- Create Citizens ---
  console.log("👤 Creating citizens...");
  const citizen1 = await prisma.citizen.create({
    data: {
      registralNo: "REG001",
      profilePhoto: "profile_001.jpg",
      stationId: station1.id,
      firstName: "Alemayehu",
      middleName: "Bekele",
      lastName: "Tesfaye",
      gender: "Male",
      placeOfBirth: "Addis Ababa",
      dateOfBirth: new Date("1990-05-15"),
      occupation: "Engineer",
      phone: "0912345678",
      emergencyContact: "Kebede Tesfaye",
      relationship: "Father",
      emergencyPhone: "0918765432",
    },
  });

  const citizen2 = await prisma.citizen.create({
    data: {
      registralNo: "REG002",
      profilePhoto: "profile_002.jpg",
      stationId: station1.id,
      firstName: "Tsehay",
      middleName: "Tadesse",
      lastName: "Gebremedhin",
      gender: "Female",
      placeOfBirth: "Bahir Dar",
      dateOfBirth: new Date("1985-12-03"),
      occupation: "Teacher",
      phone: "0923456789",
      emergencyContact: "Tadesse Gebremedhin",
      relationship: "Husband",
      emergencyPhone: "0928765432",
    },
  });

  const citizen3 = await prisma.citizen.create({
    data: {
      registralNo: "REG003",
      profilePhoto: "profile_003.jpg",
      stationId: station2.id,
      firstName: "Mohammed",
      middleName: "Hassan",
      lastName: "Ahmed",
      gender: "Male",
      placeOfBirth: "Dire Dawa",
      dateOfBirth: new Date("1992-08-20"),
      occupation: "Business Owner",
      phone: "0934567890",
      emergencyContact: "Hassan Ahmed",
      relationship: "Brother",
      emergencyPhone: "0938765432",
    },
  });

  const citizen4 = await prisma.citizen.create({
    data: {
      registralNo: "REG004",
      profilePhoto: "profile_004.jpg",
      stationId: station3.id,
      firstName: "Gebremedhin",
      middleName: "Tesfaye",
      lastName: "Wolde",
      gender: "Male",
      placeOfBirth: "Mekelle",
      dateOfBirth: new Date("1988-03-10"),
      occupation: "Doctor",
      phone: "0945678901",
      emergencyContact: "Tesfaye Wolde",
      relationship: "Father",
      emergencyPhone: "0948765432",
    },
  });

  const citizen5 = await prisma.citizen.create({
    data: {
      registralNo: "REG005",
      profilePhoto: "profile_005.jpg",
      stationId: station1.id,
      firstName: "Selam",
      middleName: "Gebremedhin",
      lastName: "Tesfaye",
      gender: "Female",
      placeOfBirth: "Addis Ababa",
      dateOfBirth: new Date("1995-11-25"),
      occupation: "Student",
      phone: "0956789012",
      emergencyContact: "Gebremedhin Tesfaye",
      relationship: "Father",
      emergencyPhone: "0958765432",
    },
  });

  console.log("✅ Created citizens:", {
    citizen1,
    citizen2,
    citizen3,
    citizen4,
    citizen5,
  });

  // --- Create Orders ---
  console.log("📋 Creating orders...");
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD001",
      citizenId: citizen1.id,
      orderType: "New ID Card",
      orderStatus: "PENDING",
      paymentMethod: "Bank Transfer",
      paymentReference: "TXN001",
      paymentProof: "payment_proof_001.jpg",
      amount: 50,
      stationId: station1.id,
      registrarId: stationRegistrar1.id,
      printerId: stationPrinter1.id,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD002",
      citizenId: citizen2.id,
      orderType: "ID Card Renewal",
      orderStatus: "APPROVED",
      paymentMethod: "Mobile Payment",
      paymentReference: "TXN002",
      paymentProof: "payment_proof_002.jpg",
      amount: 30,
      stationId: station1.id,
      registrarId: stationRegistrar1.id,
      printerId: stationPrinter1.id,
    },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: "ORD003",
      citizenId: citizen3.id,
      orderType: "ID Card Replacement",
      orderStatus: "PENDING",
      paymentMethod: "Cash",
      paymentReference: "TXN003",
      amount: 75,
      stationId: station2.id,
      registrarId: stationRegistrar2.id,
      printerId: stationPrinter2.id,
    },
  });

  const order4 = await prisma.order.create({
    data: {
      orderNumber: "ORD004",
      citizenId: citizen4.id,
      orderType: "New ID Card",
      orderStatus: "REJECTED",
      paymentMethod: "Bank Transfer",
      paymentReference: "TXN004",
      paymentProof: "payment_proof_004.jpg",
      amount: 50,
      stationId: station3.id,
      registrarId: stationRegistrar1.id,
      printerId: stationPrinter1.id,
    },
  });

  const order5 = await prisma.order.create({
    data: {
      orderNumber: "ORD005",
      citizenId: citizen5.id,
      orderType: "ID Card Renewal",
      orderStatus: "APPROVED",
      paymentMethod: "Mobile Payment",
      paymentReference: "TXN005",
      paymentProof: "payment_proof_005.jpg",
      amount: 30,
      stationId: station1.id,
      registrarId: stationRegistrar1.id,
      printerId: stationPrinter1.id,
    },
  });

  console.log("✅ Created orders:", {
    order1,
    order2,
    order3,
    order4,
    order5,
  });

  console.log("🎉 Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- Stations: 4`);
  console.log(
    `- Users: 9 (1 Super Admin, 1 Super Printer, 2 Station Admins, 2 Registrars, 2 Printers, 1 Developer)`
  );
  console.log(`- Citizens: 5`);
  console.log(`- Orders: 5`);
  console.log("\n🔑 Default login credentials:");
  console.log("Username: superadmin, Password: password123");
  console.log("Username: stationadmin1, Password: password123");
  console.log("Username: registrar1, Password: password123");
  console.log("Username: printer1, Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
