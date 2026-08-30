import { PrismaClient, DeviceType, DeviceStatus, ModelStatus, MLFramework, ModelType, DeploymentStatus, DeploymentType, AlertSeverity, AlertType, AutomationCategory, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AetherGrid AI database...");

  // ─── Demo User ─────────────────────────────────────────────────────────────
  const hashedPass = await bcrypt.hash("DemoPass123!", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@aethergrid.ai" },
    update: { name: "Demo User" },
    create: {
      name: "Demo User",
      email: "demo@aethergrid.ai",
      password: hashedPass,
      role: "USER",
      bio: "Edge AI enthusiast and IoT developer",
      timezone: "America/New_York",
      theme: "dark",
    },
  });
  console.log("✅ Demo user:", demoUser.email);

  // ─── Devices ───────────────────────────────────────────────────────────────
  const deviceList = [
    { id:"dev01", name:"ESP32-Warehouse-A01", type:DeviceType.ESP32,         status:DeviceStatus.ONLINE,       fw:"3.1.2", ip:"192.168.1.101", loc:"Warehouse A, Bay 1",  lat:37.77, lng:-122.42, cpu:42, mem:61, temp:38.5, tags:["warehouse","sensor"] },
    { id:"dev02", name:"Jetson-CV-Edge-02",   type:DeviceType.NVIDIA_JETSON,  status:DeviceStatus.ONLINE,       fw:"5.0.1", ip:"10.0.1.22",    loc:"Factory Floor B",    lat:40.71, lng:-74.01,  cpu:78, mem:65, temp:52.1, tags:["cv","edge","gpu"] },
    { id:"dev03", name:"RPi4-Gateway-03",     type:DeviceType.RASPBERRY_PI,   status:DeviceStatus.WARNING,      fw:"4.2.1", ip:"192.168.2.50", loc:"Server Room 3",      lat:51.51, lng:-0.13,   cpu:87, mem:72, temp:61.3, tags:["gateway","hub"] },
    { id:"dev04", name:"STM32-TempSens-04",   type:DeviceType.STM32,          status:DeviceStatus.ONLINE,       fw:"2.0.0", ip:"192.168.1.104",loc:"Cold Storage D",      lat:48.86, lng:2.35,    cpu:15, mem:22, temp:4.2,  tags:["temperature","cold-chain"] },
    { id:"dev05", name:"ESP8266-HVAC-05",     type:DeviceType.ESP8266,        status:DeviceStatus.ONLINE,       fw:"2.8.0", ip:"10.0.2.55",    loc:"HVAC Unit 1",        lat:35.68, lng:139.65,  cpu:28, mem:45, temp:24.8, tags:["hvac","climate"] },
    { id:"dev06", name:"Arduino-Irrigation-06",type:DeviceType.ARDUINO,       status:DeviceStatus.OFFLINE,      fw:"1.5.0", ip:"192.168.3.6",  loc:"Farm Zone F",        lat:-33.87,lng:151.21,  cpu:0,  mem:0,  temp:null, tags:["farm","irrigation"] },
    { id:"dev07", name:"RISCV-SecurityCam-07",type:DeviceType.RISCV,          status:DeviceStatus.ONLINE,       fw:"3.9.2", ip:"10.1.0.7",     loc:"Security Post G",    lat:22.40, lng:114.11,  cpu:55, mem:68, temp:45.0, tags:["security","camera"] },
    { id:"dev08", name:"Custom-Robot-Arm-08", type:DeviceType.CUSTOM,         status:DeviceStatus.MAINTENANCE,  fw:"7.2.3", ip:"192.168.10.8", loc:"Assembly Line 2",    lat:52.52, lng:13.40,   cpu:0,  mem:0,  temp:28.0, tags:["robotics","automation"] },
    { id:"dev09", name:"ESP32-Loader-B09",    type:DeviceType.ESP32,          status:DeviceStatus.ONLINE,       fw:"3.1.2", ip:"192.168.1.109",loc:"Warehouse B, Bay 3",  lat:37.78, lng:-122.41, cpu:35, mem:49, temp:36.2, tags:["warehouse","loader"] },
    { id:"dev10", name:"Jetson-Nano-Inf-10",  type:DeviceType.NVIDIA_JETSON,  status:DeviceStatus.ONLINE,       fw:"4.6.1", ip:"10.0.1.110",   loc:"Inference Node Alpha",lat:40.73,lng:-73.94,  cpu:82, mem:71, temp:54.7, tags:["inference","gpu"] },
    { id:"dev11", name:"RPi3-Sensor-11",      type:DeviceType.RASPBERRY_PI,   status:DeviceStatus.ERROR,        fw:"3.5.0", ip:"192.168.4.11", loc:"Outdoor Station 11", lat:55.76, lng:37.62,   cpu:0,  mem:0,  temp:-2.1, tags:["outdoor","weather"] },
    { id:"dev12", name:"STM32-MotorCtrl-12",  type:DeviceType.STM32,          status:DeviceStatus.ONLINE,       fw:"2.1.3", ip:"192.168.1.112",loc:"Motor Room 12",       lat:19.08, lng:72.88,   cpu:22, mem:31, temp:41.5, tags:["motor","control"] },
  ];

  for (const d of deviceList) {
    await prisma.device.upsert({
      where: { id: d.id },
      update: { status: d.status, cpu: d.cpu, memory: d.mem, lastSeen: d.status === DeviceStatus.ONLINE ? new Date() : new Date(Date.now() - 3 * 3600000) },
      create: {
        id: d.id, name: d.name, type: d.type, status: d.status,
        firmwareVersion: d.fw, ipAddress: d.ip, location: d.loc,
        latitude: d.lat, longitude: d.lng, cpu: d.cpu, memory: d.mem,
        temperature: d.temp, tags: d.tags, userId: demoUser.id,
        lastSeen: d.status === DeviceStatus.ONLINE ? new Date() : new Date(Date.now() - 3 * 3600000),
      },
    });
  }
  console.log("✅ Devices seeded:", deviceList.length);

  // ─── Sensor readings (last 24 h, online devices only) ──────────────────────
  const onlineIds = deviceList.filter(d => d.status === DeviceStatus.ONLINE).slice(0, 4).map(d => d.id);
  for (const devId of onlineIds) {
    const dev = deviceList.find(d => d.id === devId)!;
    const rows = [];
    for (let h = 23; h >= 0; h--) {
      const ts = new Date(Date.now() - h * 3600000);
      rows.push(
        { deviceId: devId, metric: "cpu",         value: Math.round(Math.max(5,  Math.min(99, dev.cpu  + (Math.random() - 0.5) * 20))), unit: "%",  timestamp: ts },
        { deviceId: devId, metric: "memory",      value: Math.round(Math.max(10, Math.min(99, dev.mem  + (Math.random() - 0.5) * 15))), unit: "%",  timestamp: ts },
        { deviceId: devId, metric: "temperature", value: parseFloat((dev.temp !== null ? dev.temp! + (Math.random() - 0.5) * 4 : 40).toFixed(1)), unit: "°C", timestamp: ts },
      );
    }
    await prisma.sensorReading.createMany({ data: rows, skipDuplicates: true });
  }

  // ─── Device alerts ─────────────────────────────────────────────────────────
  await prisma.deviceAlert.createMany({
    skipDuplicates: true,
    data: [
      { id:"alert01", deviceId:"dev03", type:AlertType.PERFORMANCE,  severity:AlertSeverity.HIGH,     message:"CPU above 85% for 15 minutes", resolved:false },
      { id:"alert02", deviceId:"dev11", type:AlertType.CONNECTIVITY,  severity:AlertSeverity.CRITICAL, message:"Device unreachable for 3 hours", resolved:false },
      { id:"alert03", deviceId:"dev02", type:AlertType.HARDWARE,      severity:AlertSeverity.MEDIUM,   message:"GPU temp approaching threshold (54.7°C)", resolved:false },
    ],
  });

  // ─── AI Models ─────────────────────────────────────────────────────────────
  const modelList = [
    { id:"mdl01", name:"YOLOv8 Edge Detector",   version:"2.1.0", type:ModelType.OBJECT_DETECTION,  fw:MLFramework.TFLITE,      desc:"Real-time object detection for edge. Supports 80 COCO classes.",      acc:94.2,  sz:6553600,  lat:28, status:ModelStatus.DEPLOYED, tags:["vision","edge","realtime"] },
    { id:"mdl02", name:"Anomaly Sentinel",        version:"1.3.2", type:ModelType.ANOMALY_DETECTION, fw:MLFramework.ONNX,        desc:"Unsupervised anomaly detection for sensor telemetry.",                 acc:91.8,  sz:12384563, lat:12, status:ModelStatus.DEPLOYED, tags:["anomaly","telemetry"] },
    { id:"mdl03", name:"NLP Intent Classifier",   version:"3.0.0", type:ModelType.NLP,               fw:MLFramework.PYTORCH,     desc:"Distilled BERT for command intent classification in edge voice systems.",acc:88.5, sz:46137344, lat:45, status:ModelStatus.DEPLOYED, tags:["nlp","bert","voice"] },
    { id:"mdl04", name:"TS Forecaster Pro",       version:"1.0.1", type:ModelType.TIME_SERIES,       fw:MLFramework.TENSORFLOW,  desc:"LSTM-based time series forecasting for predictive maintenance.",       acc:86.3,  sz:9000000,  lat:65, status:ModelStatus.TRAINING, tags:["forecasting","maintenance"] },
    { id:"mdl05", name:"MobileNet Classifier",    version:"4.0.0", type:ModelType.CLASSIFICATION,    fw:MLFramework.TFLITE,      desc:"Lightweight image classification for ultra-low latency inference.",     acc:92.1,  sz:3276800,  lat:8,  status:ModelStatus.TRAINED,  tags:["classification","mobile"] },
    { id:"mdl06", name:"Recommendation Engine",   version:"2.0.0", type:ModelType.RECOMMENDATION,    fw:MLFramework.ONNX,        desc:"Collaborative filtering for edge-personalized recommendations.",        acc:null,  sz:23068672, lat:null, status:ModelStatus.DRAFT, tags:["recommendation"] },
  ];
  for (const m of modelList) {
    await prisma.aiModel.upsert({
      where: { id: m.id },
      update: { status: m.status },
      create: { id:m.id, name:m.name, version:m.version, type:m.type, framework:m.fw, description:m.desc, accuracy:m.acc, size:m.sz, latency:m.lat, status:m.status, tags:m.tags, userId:demoUser.id },
    });
  }
  await prisma.trainingJob.upsert({
    where:  { id: "trj01" },
    update: { progress: 67 },
    create: { id:"trj01", modelId:"mdl04", name:"Training Run #1", status:"RUNNING", progress:67, epochs:100, batchSize:32, learningRate:0.001, startedAt:new Date(Date.now() - 90 * 60000) },
  });
  console.log("✅ AI Models seeded:", modelList.length);

  // ─── Deployments ───────────────────────────────────────────────────────────
  const deployList = [
    { id:"dpl01", name:"Object Detection API",   type:DeploymentType.API_SERVICE,       status:DeploymentStatus.RUNNING,   modelId:"mdl01", url:"https://od-api.aethergrid.ai", region:"us-east-1",      replicas:3, cpu:45, mem:52, req:1293, err:0.1  },
    { id:"dpl02", name:"Anomaly Monitor",        type:DeploymentType.MODEL_SERVING,     status:DeploymentStatus.UPDATING,  modelId:"mdl02", url:null,                           region:"ap-southeast-1", replicas:2, cpu:72, mem:75, req:530,  err:0.92 },
    { id:"dpl03", name:"NLP Classifier Service", type:DeploymentType.MODEL_SERVING,     status:DeploymentStatus.RUNNING,   modelId:"mdl03", url:"https://nlp.aethergrid.ai",  region:"eu-west-1",      replicas:2, cpu:43, mem:44, req:926,  err:0.0  },
    { id:"dpl04", name:"Sensor Aggregator",      type:DeploymentType.DATA_PIPELINE,     status:DeploymentStatus.RUNNING,   modelId:null,    url:null,                           region:"eu-west-1",      replicas:1, cpu:50, mem:46, req:922,  err:0.05 },
    { id:"dpl05", name:"Edge Inference Server",  type:DeploymentType.EDGE_FUNCTION,     status:DeploymentStatus.RUNNING,   modelId:"mdl05", url:"https://edge.aethergrid.ai", region:"us-west-2",      replicas:5, cpu:35, mem:41, req:1233, err:0.44 },
    { id:"dpl06", name:"Data Pipeline v2",       type:DeploymentType.DATA_PIPELINE,     status:DeploymentStatus.RUNNING,   modelId:null,    url:null,                           region:"us-east-1",      replicas:1, cpu:43, mem:29, req:1390, err:0.0  },
  ];
  for (const d of deployList) {
    await prisma.deployment.upsert({
      where: { id: d.id },
      update: { cpuUsage: d.cpu + Math.random()*5, memoryUsage: d.mem + Math.random()*5, reqPerMin: Math.round(d.req + Math.random()*50-25) },
      create: { id:d.id, name:d.name, type:d.type, status:d.status, modelId:d.modelId, url:d.url, region:d.region, replicas:d.replicas, cpuUsage:d.cpu, memoryUsage:d.mem, reqPerMin:d.req, errorRate:d.err, cpuLimit:"2000m", memoryLimit:"4Gi", userId:demoUser.id },
    });
  }
  console.log("✅ Deployments seeded:", deployList.length);

  // ─── Automations ───────────────────────────────────────────────────────────
  const autoList = [
    { id:"aut01", name:"High CPU Alert",       desc:"Notify team when device CPU exceeds 85%",        cat:AutomationCategory.MONITORING,   active:true,  trigType:"threshold",    trigCfg:{metric:"cpu",operator:">",value:85},     actType:"notification",     actCfg:{channel:"slack",message:"Device {{device.name}} CPU is {{device.cpu}}%"}, runs:142 },
    { id:"aut02", name:"Auto Firmware Update", desc:"Schedule OTA update for outdated firmware",       cat:AutomationCategory.MAINTENANCE,  active:true,  trigType:"version_check",trigCfg:{versionBelow:"2.4.0"},                    actType:"ota_update",        actCfg:{scheduleIn:"24h",firmwareChannel:"stable"}, runs:67 },
    { id:"aut03", name:"Anomaly to Webhook",   desc:"Forward anomaly detections to external systems",  cat:AutomationCategory.INTEGRATION,  active:false, trigType:"model_inference",trigCfg:{modelId:"mdl02",confidenceAbove:0.9},  actType:"webhook",           actCfg:{url:"https://hooks.example.com/anomaly",method:"POST"}, runs:891 },
    { id:"aut04", name:"Device Offline Alert", desc:"Alert team when critical device goes offline",    cat:AutomationCategory.MONITORING,   active:true,  trigType:"device_offline",trigCfg:{offlineMinutes:10},                     actType:"multi",             actCfg:{actions:["email","create_incident"]}, runs:23 },
    { id:"aut05", name:"Scale on High Load",   desc:"Auto-scale deployment replicas under high traffic",cat:AutomationCategory.SCALING,    active:true,  trigType:"metric",       trigCfg:{metric:"req_per_min",operator:">",value:5000}, actType:"scale_deployment",actCfg:{addReplicas:2,maxReplicas:10}, runs:8 },
    { id:"aut06", name:"Daily Export Report",  desc:"Generate and email fleet status report every morning",cat:AutomationCategory.REPORTING,active:true, trigType:"schedule",     trigCfg:{cron:"0 8 * * *",timezone:"UTC"},       actType:"export_and_email",  actCfg:{format:"CSV",recipients:["team@company.com"]}, runs:30 },
  ];
  for (const a of autoList) {
    await prisma.automation.upsert({
      where: { id: a.id },
      update: { runCount: a.runs },
      create: { id:a.id, name:a.name, description:a.desc, category:a.cat, active:a.active, triggerType:a.trigType, triggerConfig:a.trigCfg, actionType:a.actType, actionConfig:a.actCfg, runCount:a.runs, userId:demoUser.id, lastRun:new Date(Date.now()-Math.random()*86400000) },
    });
  }
  console.log("✅ Automations seeded");

  // ─── API Keys ──────────────────────────────────────────────────────────────
  await prisma.apiKey.upsert({
    where: { key: "ag_live_demo000000000000000000000000000000000000000001" },
    update: {},
    create: { id:"key01", name:"Production Key", key:"ag_live_demo000000000000000000000000000000000000000001", prefix:"ag_live_", userId:demoUser.id, permissions:["devices:read","devices:write","models:read","deployments:read"], lastUsed:new Date(Date.now()-1800000) },
  });
  await prisma.apiKey.upsert({
    where: { key: "ag_test_demo000000000000000000000000000000000000000002" },
    update: {},
    create: { id:"key02", name:"Development Key", key:"ag_test_demo000000000000000000000000000000000000000002", prefix:"ag_test_", userId:demoUser.id, permissions:["devices:read","models:read"], lastUsed:new Date(Date.now()-7200000) },
  });

  // ─── Webhook ───────────────────────────────────────────────────────────────
  await prisma.webhook.upsert({
    where: { id: "wh01" },
    update: {},
    create: { id:"wh01", name:"Production Alerts", url:"https://hooks.slack.com/services/T00/B00/demo", events:["device.alert","alert.triggered","deployment.failed"], secret:"whsec_demo_secret_for_aethergrid_ai_v5", active:true, userId:demoUser.id },
  });

  // ─── Notifications ─────────────────────────────────────────────────────────
  const notifs = [
    { id:"ntf01", type:NotificationType.DEVICE_ALERT,   title:"High CPU Warning",    message:"RPi4-Gateway-03 CPU at 87% for 15 minutes",                   read:false },
    { id:"ntf02", type:NotificationType.MODEL_COMPLETE, title:"Training Complete",   message:"MobileNet Classifier v4.0.0 training completed successfully", read:false },
    { id:"ntf03", type:NotificationType.DEPLOYMENT,     title:"Deployment Updated",  message:"Anomaly Monitor is now updating to v2.1",                     read:true  },
    { id:"ntf04", type:NotificationType.SECURITY,       title:"Security Scan",       message:"Weekly security scan completed — no threats detected",        read:true  },
    { id:"ntf05", type:NotificationType.SYSTEM,         title:"Platform Updated",    message:"AetherGrid platform updated to v5.0.0",                       read:true  },
  ];
  for (const n of notifs) {
    await prisma.notification.upsert({ where: { id: n.id }, update: {}, create: { ...n, userId: demoUser.id } });
  }

  // ─── Team ──────────────────────────────────────────────────────────────────
  const team = await prisma.team.upsert({
    where: { slug: "demo-team" },
    update: {},
    create: { id:"team01", name:"Demo Team", slug:"demo-team", description:"Default team for demo account", plan:"pro" },
  });
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: demoUser.id } },
    update: {},
    create: { id:"tmb01", teamId:team.id, userId:demoUser.id, role:"OWNER" },
  });

  console.log("✅ All seed data created!");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Demo Login: demo@aethergrid.ai");
  console.log("  Password:   DemoPass123!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch(e => { console.error("❌ Seed failed:", e); process.exit(1); }).finally(() => prisma.$disconnect());
