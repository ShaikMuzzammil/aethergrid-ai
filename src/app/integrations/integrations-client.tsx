"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const INTEGRATIONS = [
  { id: "aws", name: "AWS IoT Core", category: "Cloud", desc: "Bi-directional sync with AWS IoT device registry and shadow states.", connected: true, icon: "☁️", color: "orange" },
  { id: "azure", name: "Azure IoT Hub", category: "Cloud", desc: "Sync device telemetry and commands with Azure IoT Hub.", connected: false, icon: "🔷", color: "blue" },
  { id: "gcp", name: "Google Cloud IoT", category: "Cloud", desc: "Connect to GCP Pub/Sub for scalable message ingestion.", connected: false, icon: "🟡", color: "yellow" },
  { id: "slack", name: "Slack", category: "Communication", desc: "Send device alerts and deployment notifications to Slack channels.", connected: true, icon: "💬", color: "green" },
  { id: "discord", name: "Discord", category: "Communication", desc: "Receive real-time fleet updates in your Discord server.", connected: false, icon: "🎮", color: "violet" },
  { id: "pagerduty", name: "PagerDuty", category: "Incident", desc: "Automatically create incidents when critical device alerts fire.", connected: false, icon: "🚨", color: "red" },
  { id: "kafka", name: "Apache Kafka", category: "Streaming", desc: "Stream high-throughput sensor data to Kafka topics.", connected: false, icon: "📊", color: "cyan" },
  { id: "rabbitmq", name: "RabbitMQ", category: "Messaging", desc: "Route device commands and events through RabbitMQ exchanges.", connected: false, icon: "🐰", color: "orange" },
  { id: "grafana", name: "Grafana", category: "Analytics", desc: "Visualize AetherGrid metrics in Grafana dashboards.", connected: true, icon: "📈", color: "orange" },
  { id: "datadog", name: "Datadog", category: "Monitoring", desc: "Send device metrics and traces to Datadog for APM.", connected: false, icon: "🐶", color: "violet" },
  { id: "zapier", name: "Zapier", category: "Automation", desc: "Connect 5000+ apps with AetherGrid events via Zapier.", connected: false, icon: "⚡", color: "yellow" },
  { id: "prom", name: "Prometheus", category: "Monitoring", desc: "Scrape AetherGrid metrics with Prometheus and Alertmanager.", connected: true, icon: "🔥", color: "red" },
  { id: "jira", name: "Jira", category: "Project Mgmt", desc: "Auto-create tickets for device incidents and maintenance tasks.", connected: false, icon: "🔵", color: "blue" },
  { id: "github", name: "GitHub Actions", category: "CI/CD", desc: "Trigger deployments and model updates from GitHub workflows.", connected: false, icon: "🐙", color: "slate" },
  { id: "terraform", name: "Terraform", category: "IaC", desc: "Manage AetherGrid infrastructure as code with our Terraform provider.", connected: false, icon: "🏗️", color: "violet" },
  { id: "twilio", name: "Twilio SMS", category: "Communication", desc: "Send SMS alerts for critical device failures to on-call engineers.", connected: false, icon: "📱", color: "red" },
];

const CATEGORIES = ["All", "Cloud", "Communication", "Monitoring", "Streaming", "Analytics", "Automation", "CI/CD", "Incident", "Messaging", "Project Mgmt", "IaC"];

export function IntegrationsClient() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [connected, setConnected] = useState<Set<string>>(new Set(INTEGRATIONS.filter(i => i.connected).map(i => i.id)));
  const [connecting, setConnecting] = useState<string | null>(null);

  const filtered = INTEGRATIONS.filter(i =>
    (i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase())) &&
    (category === "All" || i.category === category)
  );

  async function toggleConnect(id: string) {
    setConnecting(id);
    await new Promise(r => setTimeout(r, 1000));
    setConnected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.success("Integration disconnected"); }
      else { next.add(id); toast.success("Integration connected successfully!"); }
      return next;
    });
    setConnecting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{INTEGRATIONS.length}+ integrations · {connected.size} connected</p></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ label: "Available", value: INTEGRATIONS.length, color: "text-foreground" }, { label: "Connected", value: connected.size, color: "text-green-400" }, { label: "Categories", value: CATEGORIES.length - 1, color: "text-cyan-400" }].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 glow-border text-center">
            <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search integrations..."
            className="w-full bg-muted/30 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", category === cat ? "bg-primary/15 text-primary border-primary/30" : "text-muted-foreground border-border/50 hover:border-border hover:text-foreground")}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((integration, i) => {
          const isConnected = connected.has(integration.id);
          const isConnecting = connecting === integration.id;
          return (
            <motion.div key={integration.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass rounded-xl p-5 glow-border hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center text-2xl">{integration.icon}</div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{integration.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/50 border border-border/50 text-muted-foreground">{integration.category}</span>
                  </div>
                </div>
                {isConnected && <div className="flex items-center gap-1 text-xs text-green-400"><div className="w-1.5 h-1.5 rounded-full bg-green-400" />Live</div>}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{integration.desc}</p>
              <div className="flex gap-2">
                <button onClick={() => toggleConnect(integration.id)} disabled={isConnecting}
                  className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all border",
                    isConnected ? "border-red-500/30 text-red-400 hover:bg-red-500/10" :
                      `border-${integration.color}-500/30 text-${integration.color}-400 hover:bg-${integration.color}-500/10 bg-${integration.color}-500/5`)}>
                  {isConnecting ? <RefreshCw className="w-3 h-3 animate-spin" /> : isConnected ? null : <Plus className="w-3 h-3" />}
                  {isConnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect"}
                </button>
                <button className="px-3 py-2 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:border-border text-xs transition-all flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Docs
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
