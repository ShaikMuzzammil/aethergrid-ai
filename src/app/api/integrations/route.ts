import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const INTEGRATION_CATALOG = [
  { provider: "slack", name: "Slack", category: "Communication", description: "Send alerts and reports to Slack channels" },
  { provider: "github", name: "GitHub", category: "DevOps", description: "Trigger CI/CD pipelines on model deployments" },
  { provider: "pagerduty", name: "PagerDuty", category: "Incident", description: "Create incidents for critical device alerts" },
  { provider: "datadog", name: "Datadog", category: "Monitoring", description: "Forward telemetry to Datadog dashboards" },
  { provider: "mqtt", name: "MQTT Broker", category: "IoT", description: "Connect to any MQTT broker for real-time data" },
  { provider: "aws-iot", name: "AWS IoT Core", category: "Cloud IoT", description: "Bridge devices with AWS IoT Core" },
  { provider: "grafana", name: "Grafana", category: "Visualization", description: "Push metrics to Grafana for custom dashboards" },
  { provider: "jira", name: "Jira", category: "Project", description: "Create Jira tickets for maintenance tasks" },
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const userIntegrations = await prisma.integration.findMany({ where: { userId: uid } });
    const result = INTEGRATION_CATALOG.map(cat => {
      const existing = userIntegrations.find(i => i.provider === cat.provider);
      return { ...cat, id: existing?.id || null, status: existing?.status || "DISCONNECTED", lastSync: existing?.lastSync || null, config: existing?.config || null };
    });
    return NextResponse.json({ integrations: result });
  } catch { return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const body = await req.json();
    const { provider, action, config } = body;
    const catalogItem = INTEGRATION_CATALOG.find(c => c.provider === provider);
    if (!catalogItem) return NextResponse.json({ error: "Unknown provider" }, { status: 400 });

    if (action === "connect") {
      const integration = await prisma.integration.upsert({
        where: { id: `${uid}-${provider}` },
        update: { status: "CONNECTED", config: config || {}, lastSync: new Date() },
        create: { id: `${uid}-${provider}`, name: catalogItem.name, provider, status: "CONNECTED", config: config || {}, userId: uid, lastSync: new Date() },
      });
      return NextResponse.json({ integration, message: `${catalogItem.name} connected successfully` });
    } else if (action === "disconnect") {
      await prisma.integration.updateMany({ where: { userId: uid, provider }, data: { status: "DISCONNECTED", lastSync: null } });
      return NextResponse.json({ message: `${catalogItem.name} disconnected` });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch { return NextResponse.json({ error: "Failed to update integration" }, { status: 500 }); }
}
