import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = (session.user as any).id;
  try {
    const job = await prisma.exportJob.findFirst({ where: { id: params.id, userId: uid } });
    if (!job) return NextResponse.json({ error: "Export not found" }, { status: 404 });
    if (job.status !== "COMPLETED") return NextResponse.json({ error: "Export not ready" }, { status: 400 });

    let csvData = "";
    if (job.dataType === "devices") {
      const devices = await prisma.device.findMany({ where: { userId: uid } });
      csvData = "id,name,type,status,location,ipAddress,firmwareVersion,lastSeen\n" +
        devices.map(d => `${d.id},"${d.name}",${d.type},${d.status},"${d.location || ""}","${d.ipAddress || ""}","${d.firmwareVersion || ""}","${d.lastSeen || ""}"`).join("\n");
    } else if (job.dataType === "models") {
      const models = await prisma.aiModel.findMany({ where: { userId: uid } });
      csvData = "id,name,version,type,framework,status,accuracy,latency\n" +
        models.map(m => `${m.id},"${m.name}","${m.version}",${m.type},${m.framework},${m.status},${m.accuracy || ""},${m.latency || ""}`).join("\n");
    } else if (job.dataType === "deployments") {
      const deps = await prisma.deployment.findMany({ where: { userId: uid } });
      csvData = "id,name,type,status,region,replicas,url\n" +
        deps.map(d => `${d.id},"${d.name}",${d.type},${d.status},"${d.region || ""}",${d.replicas},"${d.url || ""}"`).join("\n");
    }

    const filename = `${job.name.toLowerCase().replace(/\s+/g, "-")}.csv`;
    return new NextResponse(csvData, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${filename}"` },
    });
  } catch { return NextResponse.json({ error: "Download failed" }, { status: 500 }); }
}
