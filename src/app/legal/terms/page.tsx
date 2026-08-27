import Link from "next/link";
import { ArrowLeft, CircuitBoard } from "lucide-react";
export const metadata = { title: "Terms of Service" };
export default function TermsPage() {
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
        <h1 className="text-3xl font-black text-white mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: January 2025</p>
        <div className="glass rounded-2xl p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section><h2 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h2><p>By accessing or using AetherGrid AI (&ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree, do not use the Platform.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-3">2. Use of the Platform</h2><p>You may use the Platform for lawful purposes only. You are responsible for all activity under your account. You must not misuse the Platform for unlawful data collection, harassment, or interference with other users.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-3">3. API & Data</h2><p>Our API is provided &ldquo;as-is&rdquo;. We reserve the right to throttle or revoke API access for abuse. You own your data; we process it only to provide the Service.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-3">4. Limitation of Liability</h2><p>To the maximum extent permitted by law, AetherGrid AI shall not be liable for any indirect, incidental, or consequential damages arising from use of the Platform.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-3">5. Changes</h2><p>We may update these terms at any time. Continued use after changes constitutes acceptance.</p></section>
        </div>
      </div>
    </div>
  );
}
