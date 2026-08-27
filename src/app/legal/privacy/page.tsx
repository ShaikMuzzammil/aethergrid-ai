import Link from "next/link";
import { ArrowLeft, CircuitBoard } from "lucide-react";
export const metadata = { title: "Privacy Policy" };
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#060a14] px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-cyan-400 mb-8 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
            <CircuitBoard className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg gradient-text">AetherGrid AI</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: January 2025</p>
        <div className="glass rounded-2xl p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section><h2 className="text-lg font-bold text-white mb-3">1. Data We Collect</h2><p>We collect account information (name, email, hashed password), device telemetry you upload, and usage analytics. We never sell your data.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-3">2. How We Use Data</h2><p>To provide the Service, send important account emails, improve the Platform, and for security and fraud prevention.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-3">3. Data Storage</h2><p>Data is stored in encrypted Neon PostgreSQL databases. Passwords are hashed with bcrypt (12 rounds). We use TLS for all data in transit.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-3">4. Your Rights</h2><p>You can request data export or deletion at any time by emailing privacy@aethergrid.ai. We will respond within 30 days.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-3">5. Contact</h2><p>For privacy questions: privacy@aethergrid.ai</p></section>
        </div>
      </div>
    </div>
  );
}
