"use client";
import { useState } from "react";
import Link from "next/link";
import { Book, Terminal, Code, Cpu, Brain, Server, Zap, Webhook, ChevronRight, Copy, Check, ArrowLeft, Key, Globe } from "lucide-react";

const SECTIONS = [
  { id:"quickstart",    label:"Quick Start",       icon:<Zap className="w-4 h-4"/> },
  { id:"authentication",label:"Authentication",    icon:<Key className="w-4 h-4"/> },
  { id:"devices",       label:"Devices API",       icon:<Cpu className="w-4 h-4"/> },
  { id:"models",        label:"AI Models API",     icon:<Brain className="w-4 h-4"/> },
  { id:"deployments",   label:"Deployments API",   icon:<Server className="w-4 h-4"/> },
  { id:"webhooks",      label:"Webhooks",          icon:<Webhook className="w-4 h-4"/> },
  { id:"sdks",          label:"SDKs & Clients",    icon:<Code className="w-4 h-4"/> },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group my-3">
      <pre className="bg-black/70 border border-border/30 rounded-xl p-4 text-[11px] font-mono text-green-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
        <code>{code}</code>
      </pre>
      <button onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-white transition-all opacity-0 group-hover:opacity-100">
        {copied ? <Check className="w-3.5 h-3.5 text-green-400"/> : <Copy className="w-3.5 h-3.5"/>}
      </button>
    </div>
  );
}

function Ep({ method, path, desc }: { method:string; path:string; desc:string }) {
  const colors: Record<string,string> = { GET:"text-green-400 bg-green-400/10", POST:"text-blue-400 bg-blue-400/10", PATCH:"text-amber-400 bg-amber-400/10", DELETE:"text-red-400 bg-red-400/10" };
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/10 rounded-xl border border-border/20 mb-2">
      <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded shrink-0 ${colors[method]}`}>{method}</span>
      <div><code className="text-xs font-mono text-white">{path}</code><p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p></div>
    </div>
  );
}

const CONTENT: Record<string, React.ReactNode> = {
  quickstart: (
    <div className="space-y-5">
      <div><h1 className="text-3xl font-black text-white mb-2">Quick Start</h1><p className="text-muted-foreground">Get up and running with AetherGrid AI in minutes.</p></div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">1. Get your API key</h2><p className="text-sm text-muted-foreground mb-3">Go to <Link href="/settings/api-keys" className="text-cyan-400 hover:underline">Settings → API Keys</Link> and create a new key.</p><CodeBlock code={`export AETHERGRID_API_KEY="ag_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`}/></div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">2. List your devices</h2><CodeBlock code={`curl https://your-project.vercel.app/api/devices \\\n  -H "Authorization: Bearer $AETHERGRID_API_KEY"\n\n# Returns\n{ "devices": [...], "total": 12 }`}/></div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">3. Register a device</h2><CodeBlock code={`curl -X POST https://your-project.vercel.app/api/devices \\\n  -H "Authorization: Bearer $AETHERGRID_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "name": "ESP32-Sensor-01",\n    "type": "ESP32",\n    "location": "Warehouse A",\n    "firmwareVersion": "3.1.2",\n    "tags": ["production","sensor"]\n  }'`}/></div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">4. Deploy an AI model</h2><CodeBlock code={`# Create the model\ncurl -X POST /api/ai-models \\\n  -H "Authorization: Bearer $KEY" \\\n  -d '{"name":"My Model","type":"OBJECT_DETECTION","framework":"TFLITE"}'\n\n# Deploy it\ncurl -X POST /api/deployments \\\n  -H "Authorization: Bearer $KEY" \\\n  -d '{"name":"Edge API","type":"MODEL_SERVING","modelId":"<id>","region":"us-east-1"}'`}/></div>
    </div>
  ),
  authentication: (
    <div className="space-y-5">
      <div><h1 className="text-3xl font-black text-white mb-2">Authentication</h1><p className="text-muted-foreground">All API requests require a valid API key in the Authorization header.</p></div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Bearer Token</h2><CodeBlock code={`Authorization: Bearer ag_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}/></div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Key Prefixes</h2>
        <div className="space-y-2">
          {[{p:"ag_live_",e:"Production",d:"Live data, rate-limited to 1,000 req/min"},{p:"ag_test_",e:"Development",d:"Sandbox environment, no rate limits"}].map((k,i)=>(
            <div key={i} className="p-3 bg-muted/10 rounded-xl border border-border/20">
              <div className="flex items-center gap-2 mb-1"><code className="text-xs font-mono text-cyan-400">{k.p}...</code><span className="text-[10px] bg-muted/40 text-muted-foreground px-2 py-0.5 rounded">{k.e}</span></div>
              <p className="text-xs text-muted-foreground">{k.d}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Permission Scopes</h2>
        <div className="grid grid-cols-2 gap-1.5">
          {["devices:read","devices:write","models:read","models:write","deployments:read","deployments:write","analytics:read","webhooks:write","team:read","team:write"].map(p=>(
            <code key={p} className="text-[10px] font-mono bg-black/40 text-cyan-400 border border-cyan-400/20 px-2 py-1 rounded">{p}</code>
          ))}
        </div>
      </div>
    </div>
  ),
  devices: (
    <div className="space-y-5">
      <div><h1 className="text-3xl font-black text-white mb-2">Devices API</h1><p className="text-muted-foreground">Register and manage your IoT device fleet.</p></div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Endpoints</h2>
        <Ep method="GET"    path="/api/devices"                  desc="List devices. Query: ?status=ONLINE&type=ESP32&limit=50"/>
        <Ep method="POST"   path="/api/devices"                  desc="Register a new device"/>
        <Ep method="GET"    path="/api/devices/:id"              desc="Get device with telemetry history"/>
        <Ep method="PATCH"  path="/api/devices/:id"              desc="Update device metadata"/>
        <Ep method="DELETE" path="/api/devices/:id"              desc="Deregister a device"/>
        <Ep method="POST"   path="/api/devices/:id/commands"     desc="Send a command (reboot, ping, update_firmware)"/>
      </div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Register Device Body</h2>
        <CodeBlock code={`{\n  "name": "ESP32-Warehouse-01",   // required\n  "type": "ESP32",                // required\n  // Types: ESP32|ESP8266|RASPBERRY_PI|NVIDIA_JETSON|STM32|RISCV|ARDUINO|CUSTOM\n  "firmwareVersion": "3.1.2",\n  "ipAddress": "192.168.1.101",\n  "macAddress": "AA:BB:CC:DD:EE:FF",\n  "location": "Warehouse A, Bay 1",\n  "latitude": 37.7749,\n  "longitude": -122.4194,\n  "tags": ["production","sensor"]\n}`}/>
      </div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Send Command</h2>
        <CodeBlock code={`POST /api/devices/{id}/commands\n\n{\n  "command": "reboot",   // ping|reboot|update_firmware|restart_service\n  "payload": {}\n}`}/>
      </div>
    </div>
  ),
  models: (
    <div className="space-y-5">
      <div><h1 className="text-3xl font-black text-white mb-2">AI Models API</h1><p className="text-muted-foreground">Manage the full ML model lifecycle.</p></div>
      <div className="glass rounded-2xl p-5">
        <Ep method="GET"    path="/api/ai-models"      desc="List models. Query: ?status=DEPLOYED&limit=50"/>
        <Ep method="POST"   path="/api/ai-models"      desc="Register a new model"/>
        <Ep method="PATCH"  path="/api/ai-models/:id"  desc="Update model or trigger status transition"/>
        <Ep method="DELETE" path="/api/ai-models/:id"  desc="Delete a model"/>
      </div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Create Model</h2>
        <CodeBlock code={`{\n  "name": "YOLOv8 Edge Detector",\n  "version": "2.1.0",\n  "type": "OBJECT_DETECTION",\n  // Types: OBJECT_DETECTION|CLASSIFICATION|ANOMALY_DETECTION|NLP|TIME_SERIES|RECOMMENDATION|GENERATIVE\n  "framework": "TFLITE",\n  // Frameworks: TENSORFLOW|PYTORCH|ONNX|TFLITE|OPENVINO|CUSTOM\n  "accuracy": 94.2,\n  "latency": 28,\n  "tags": ["vision","edge"]\n}`}/>
      </div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Status Transitions</h2>
        <CodeBlock code={`PATCH /api/ai-models/{id}\n{ "status": "DEPLOYED" }\n\n// Valid: DRAFT → TRAINING → TRAINED → DEPLOYED → ARCHIVED`}/>
      </div>
    </div>
  ),
  deployments: (
    <div className="space-y-5">
      <div><h1 className="text-3xl font-black text-white mb-2">Deployments API</h1><p className="text-muted-foreground">Deploy models and services to your edge infrastructure.</p></div>
      <div className="glass rounded-2xl p-5">
        <Ep method="GET"    path="/api/deployments"      desc="List all deployments"/>
        <Ep method="POST"   path="/api/deployments"      desc="Create a new deployment"/>
        <Ep method="PATCH"  path="/api/deployments/:id"  desc="Update config or change status (start/stop)"/>
        <Ep method="DELETE" path="/api/deployments/:id"  desc="Delete a deployment"/>
      </div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Create Deployment</h2>
        <CodeBlock code={`{\n  "name": "Object Detection API",\n  "type": "MODEL_SERVING",\n  // Types: API_SERVICE|MODEL_SERVING|WEB_APP|DATA_PIPELINE|EDGE_FUNCTION|BACKGROUND_WORKER\n  "modelId": "model_xxx",   // optional\n  "region": "us-east-1",\n  "replicas": 3,\n  "cpuLimit": "2000m",\n  "memoryLimit": "4Gi"\n}`}/>
      </div>
    </div>
  ),
  webhooks: (
    <div className="space-y-5">
      <div><h1 className="text-3xl font-black text-white mb-2">Webhooks</h1><p className="text-muted-foreground">Receive real-time event notifications at your endpoints.</p></div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Event Types</h2>
        <div className="grid grid-cols-2 gap-1.5">
          {["device.online","device.offline","device.alert","alert.triggered","model.deployed","model.trained","deployment.success","deployment.failed","export.completed","team.invite"].map(e=>(
            <code key={e} className="text-[10px] font-mono bg-black/40 text-green-400 border border-green-400/20 px-2 py-1 rounded">{e}</code>
          ))}
        </div>
      </div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Signature Verification (Node.js)</h2>
        <CodeBlock code={`const crypto = require("crypto");\n\nfunction verify(payload, signature, secret) {\n  const expected = "sha256=" +\n    crypto.createHmac("sha256", secret)\n          .update(payload)\n          .digest("hex");\n  return expected === signature;\n}\n\napp.post("/webhook", (req, res) => {\n  const sig = req.headers["x-aethergrid-signature"];\n  if (!verify(JSON.stringify(req.body), sig, process.env.WEBHOOK_SECRET))\n    return res.status(401).end();\n  console.log(req.body.event, req.body.data);\n  res.json({ ok: true });\n});`}/>
      </div>
    </div>
  ),
  sdks: (
    <div className="space-y-5">
      <div><h1 className="text-3xl font-black text-white mb-2">SDKs & Clients</h1><p className="text-muted-foreground">Official SDKs and community clients.</p></div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Python</h2>
        <CodeBlock code={`pip install aethergrid-py\n\nfrom aethergrid import AetherGrid\nclient = AetherGrid(api_key="ag_live_xxx")\n\ndevices = client.devices.list(status="ONLINE")\nclient.devices.command("dev_id", "reboot")\ndeployment = client.deployments.create(\n    name="Edge API", type="MODEL_SERVING",\n    model_id="mdl_id", region="us-east-1"\n)`}/>
      </div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">Node.js / TypeScript</h2>
        <CodeBlock code={`npm install @aethergrid/sdk\n\nimport { AetherGrid } from "@aethergrid/sdk";\nconst client = new AetherGrid({ apiKey: "ag_live_xxx" });\n\nconst { devices } = await client.devices.list({ status: "ONLINE" });\nconst device = await client.devices.register({\n  name: "ESP32-01", type: "ESP32", location: "Warehouse A"\n});\nclient.devices.stream(device.id, (reading) => {\n  console.log(reading.metric, reading.value);\n});`}/>
      </div>
      <div className="glass rounded-2xl p-5"><h2 className="text-base font-bold text-white mb-3">ESP32 (Arduino)</h2>
        <CodeBlock code={`#include <WiFi.h>\n#include <HTTPClient.h>\n\nconst char* API_KEY = "ag_live_xxx";\nconst char* DEVICE_ID = "dev_id";\n\nvoid sendTelemetry(float cpu, float mem, float temp) {\n  HTTPClient http;\n  http.begin("https://your.vercel.app/api/devices/"\n             + String(DEVICE_ID) + "/telemetry");\n  http.addHeader("Authorization", "Bearer " + String(API_KEY));\n  http.addHeader("Content-Type", "application/json");\n  String body = "{\"cpu\":"+String(cpu)+\n    ",\"memory\":"+String(mem)+\n    ",\"temperature\":"+String(temp)+"}";\n  http.POST(body);\n  http.end();\n}`}/>
      </div>
    </div>
  ),
};

export default function DocsPage() {
  const [active, setActive] = useState("quickstart");
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-56 shrink-0 border-r border-border/30 p-4 space-y-1 hidden lg:block">
        <div className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2 px-3">Documentation</div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${active===s.id ? "bg-cyan-500/15 text-cyan-400 border border-cyan-400/30" : "text-muted-foreground hover:text-white hover:bg-muted/30"}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-3xl">
        {CONTENT[active]}
      </div>
    </div>
  );
}
