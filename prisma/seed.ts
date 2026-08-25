import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AetherGrid database...");

  // Create demo user
  const hashedPass = await bcrypt.hash("DemoPass123!", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@aethergrid.ai" },
    update: {},
    create: { name: "Demo User", email: "demo@aethergrid.ai", password: hashedPass, role: "USER" },
  });
  console.log("✅ Demo user created:", user.email);

  // Create admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@aethergrid.ai" },
    update: {},
    create: { name: "Admin", email: "admin@aethergrid.ai", password: hashedPass, role: "ADMIN" },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create device groups
  const groups = await Promise.all([
    prisma.deviceGroup.upsert({ where: { id: "grp_warehouse" }, update: {}, create: { id: "grp_warehouse", name: "Warehouse Fleet", description: "All warehouse IoT devices", color: "#00D4FF" } }),
    prisma.deviceGroup.upsert({ where: { id: "grp_production" }, update: {}, create: { id: "grp_production", name: "Production Line", description: "Manufacturing production devices", color: "#7C3AED" } }),
    prisma.deviceGroup.upsert({ where: { id: "grp_edge" }, update: {}, create: { id: "grp_edge", name: "Edge Compute", description: "Heavy compute edge nodes", color: "#10B981" } }),
  ]);
  console.log("✅ Device groups created");

  // Create devices
  const deviceData = [
    { name: "ESP32-Warehouse-A01", type: "ESP32" as const, status: "ONLINE" as const, location: "Warehouse A", firmwareVersion: "2.4.1", ipAddress: "192.168.10.20", groupId: groups[0].id },
    { name: "ESP32-Warehouse-A02", type: "ESP32" as const, status: "ONLINE" as const, location: "Warehouse A", firmwareVersion: "2.4.1", ipAddress: "192.168.10.21", groupId: groups[0].id },
    { name: "Jetson-CV-Edge-01", type: "NVIDIA_JETSON" as const, status: "ONLINE" as const, location: "Production Line 3", firmwareVersion: "3.0.0", ipAddress: "192.168.11.10", groupId: groups[2].id },
    { name: "RPi4-Gateway-Main", type: "RASPBERRY_PI" as const, status: "WARNING" as const, location: "Server Room", firmwareVersion: "2.1.0", ipAddress: "192.168.10.1", groupId: groups[1].id },
    { name: "STM32-TempSensor-01", type: "STM32" as const, status: "OFFLINE" as const, location: "Cold Storage", firmwareVersion: "1.5.2", ipAddress: "192.168.12.50" },
    { name: "Arduino-Actuator-01", type: "ARDUINO" as const, status: "ONLINE" as const, location: "Assembly Line", firmwareVersion: "1.2.0" },
    { name: "ESP8266-WiFiNode-01", type: "ESP8266" as const, status: "ONLINE" as const, location: "Lobby", firmwareVersion: "2.0.1", ipAddress: "192.168.10.30" },
    { name: "Jetson-Orin-Server", type: "NVIDIA_JETSON" as const, status: "ONLINE" as const, location: "Data Center", firmwareVersion: "4.0.0", ipAddress: "192.168.11.5", groupId: groups[2].id },
  ];

  for (const d of deviceData) {
    await prisma.device.upsert({
      where: { id: `dev_seed_${d.name}` },
      update: { status: d.status, lastSeen: new Date() },
      create: { id: `dev_seed_${d.name}`, ...d, userId: user.id, lastSeen: new Date(), tags: [], latitude: 12.9716 + Math.random() * 0.1, longitude: 77.5946 + Math.random() * 0.1 },
    });
  }
  console.log("✅ Devices created");

  // Create AI models
  const modelData = [
    { name: "YOLOv8 Edge Detector", version: "2.1.0", type: "OBJECT_DETECTION" as const, framework: "TFLITE" as const, status: "DEPLOYED" as const, accuracy: 94.2, size: 6400000, latency: 28.0, description: "Real-time object detection optimized for edge hardware", tags: ["production", "vision"] },
    { name: "Anomaly Sentinel", version: "1.3.2", type: "ANOMALY_DETECTION" as const, framework: "ONNX" as const, status: "DEPLOYED" as const, accuracy: 91.8, size: 12100000, latency: 12.0, description: "Industrial anomaly detection for time-series sensor data", tags: ["monitoring", "iot"] },
    { name: "NLP Intent Classifier", version: "3.0.0", type: "NLP" as const, framework: "PYTORCH" as const, status: "DEPLOYED" as const, accuracy: 88.5, size: 45200000, latency: 45.0, description: "Multi-class intent classification for edge NLP tasks", tags: ["nlp"] },
    { name: "TS Forecaster Pro", version: "1.0.1", type: "TIME_SERIES" as const, framework: "TENSORFLOW" as const, status: "TRAINING" as const, description: "LSTM-based time series forecasting model", tags: ["forecasting"] },
    { name: "MobileNet Classifier", version: "4.0.0", type: "CLASSIFICATION" as const, framework: "TFLITE" as const, status: "TRAINED" as const, accuracy: 92.1, size: 3200000, latency: 8.0, description: "Lightweight image classification for microcontrollers", tags: ["mobile", "edge"] },
  ];

  for (const m of modelData) {
    await prisma.aiModel.upsert({
      where: { id: `model_seed_${m.name}` },
      update: {},
      create: { id: `model_seed_${m.name}`, ...m, userId: user.id, tags: m.tags },
    });
  }
  console.log("✅ AI models created");

  // Create notifications
  const notifData = [
    { type: "DEVICE_ALERT" as const, title: "Device Offline", message: "ESP32-Warehouse-A03 has been offline for 15 minutes", read: false },
    { type: "MODEL_COMPLETE" as const, title: "Training Complete", message: "Model 'TS Forecaster Pro' training completed with 86.3% accuracy", read: false },
    { type: "DEPLOYMENT" as const, title: "Deployment Successful", message: "Object Detection API deployed to 128 devices", read: true },
    { type: "SYSTEM" as const, title: "System Update", message: "AetherGrid platform updated to v2.4.0 — check changelog", read: true },
    { type: "SECURITY" as const, title: "New Login Detected", message: "New login from Chrome on macOS in Chennai, India", read: false },
  ];

  for (const n of notifData) {
    await prisma.notification.create({ data: { ...n, userId: user.id } });
  }
  console.log("✅ Notifications created");

  // Sensor readings for devices
  const devicesList = await prisma.device.findMany({ where: { userId: user.id }, take: 3 });
  for (const device of devicesList) {
    for (let h = 0; h < 24; h++) {
      await prisma.sensorReading.createMany({
        data: [
          { deviceId: device.id, metric: "cpu_usage", value: 30 + Math.random() * 50, unit: "%", timestamp: new Date(Date.now() - h * 3600000) },
          { deviceId: device.id, metric: "memory_usage", value: 40 + Math.random() * 40, unit: "%", timestamp: new Date(Date.now() - h * 3600000) },
          { deviceId: device.id, metric: "temperature", value: 40 + Math.random() * 25, unit: "°C", timestamp: new Date(Date.now() - h * 3600000) },
        ],
      });
    }
  }
  console.log("✅ Sensor readings created");

  console.log("\n🚀 Database seeded successfully!");
  console.log("📧 Demo login: demo@aethergrid.ai / DemoPass123!");
  console.log("🔑 Admin login: admin@aethergrid.ai / DemoPass123!");
}

main().catch(e => { console.error("❌ Seed failed:", e); process.exit(1); }).finally(() => prisma.$disconnect());
