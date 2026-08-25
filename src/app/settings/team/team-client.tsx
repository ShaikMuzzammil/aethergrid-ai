"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2, Mail, Shield, RefreshCw, X, Crown, Eye, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ROLES = ["OWNER", "ADMIN", "MEMBER", "VIEWER"] as const;
type Role = typeof ROLES[number];

const ROLE_COLORS: Record<Role, string> = {
  OWNER: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  ADMIN: "text-red-400 bg-red-400/10 border-red-400/20",
  MEMBER: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  VIEWER: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

const ROLE_PERMS: Record<Role, string[]> = {
  OWNER: ["Full access", "Billing", "Delete workspace", "Manage all members"],
  ADMIN: ["Manage devices & models", "Manage deployments", "Invite members", "View analytics"],
  MEMBER: ["Manage own devices", "Upload models", "View analytics", "Create exports"],
  VIEWER: ["View devices", "View analytics", "View models", "Read-only access"],
};

interface Member { id: string; name: string; email: string; role: Role; joinedAt: string; lastActive: string; avatar?: string; }

const MOCK_MEMBERS: Member[] = [
  { id: "m1", name: "Nova (You)", email: "nova@aethergrid.ai", role: "OWNER", joinedAt: "Jan 1, 2025", lastActive: "Now" },
  { id: "m2", name: "Sarah Chen", email: "sarah@acme.com", role: "ADMIN", joinedAt: "Jan 5, 2025", lastActive: "2h ago" },
  { id: "m3", name: "Marcus Webb", email: "marcus@acme.com", role: "MEMBER", joinedAt: "Jan 10, 2025", lastActive: "1d ago" },
  { id: "m4", name: "Priya Nair", email: "priya@acme.com", role: "MEMBER", joinedAt: "Jan 15, 2025", lastActive: "3d ago" },
  { id: "m5", name: "Tom Bradley", email: "tom@acme.com", role: "VIEWER", joinedAt: "Feb 1, 2025", lastActive: "1w ago" },
];

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [sending, setSending] = useState(false);

  async function handleInvite() {
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    toast.success(`Invitation sent to ${email}`);
    setSending(false); onClose();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-md glass rounded-2xl border border-border/60 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="font-bold text-foreground">Invite Team Member</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com"
                className="w-full bg-muted/30 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Role</label>
            <div className="space-y-2">
              {(["ADMIN", "MEMBER", "VIEWER"] as Role[]).map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={cn("w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all", role === r ? "border-primary/50 bg-primary/8" : "border-border/50 hover:border-border hover:bg-muted/20")}>
                  <div className={cn("w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-all", role === r ? "border-primary bg-primary" : "border-border")} />
                  <div className="flex-1">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", ROLE_COLORS[r])}>{r}</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ROLE_PERMS[r].slice(0, 2).map(p => <span key={p} className="text-[10px] text-muted-foreground">{p}</span>)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-6 border-t border-border/50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={handleInvite} disabled={sending || !email}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-2">
            {sending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {sending ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function TeamClient({ currentUser }: { currentUser: any }) {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()));

  function updateRole(id: string, role: Role) {
    setMembers(p => p.map(m => m.id === id ? { ...m, role } : m));
    toast.success("Role updated");
  }

  function removeMember(id: string) {
    setMembers(p => p.filter(m => m.id !== id));
    toast.success("Member removed");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <AnimatePresence>{showInvite && <InviteModal onClose={() => setShowInvite(false)} />}</AnimatePresence>

      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{members.length} members · Pro plan</p></div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          <Plus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ROLES.map(r => (
          <div key={r} className="glass rounded-xl p-4 glow-border text-center">
            <p className={cn("text-xl font-bold", ROLE_COLORS[r].split(" ")[0])}>{members.filter(m => m.role === r).length}</p>
            <p className="text-xs text-muted-foreground mt-1">{r}</p>
          </div>
        ))}
      </div>

      {/* Role permissions reference */}
      <div className="glass rounded-2xl p-5 glow-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">Role Permissions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ROLES.map(r => (
            <div key={r} className={cn("rounded-xl p-3 border", ROLE_COLORS[r].replace("text-", "border-").split(" ")[0] + "/20", "bg-muted/20")}>
              <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", ROLE_COLORS[r])}>{r}</span>
              <ul className="mt-2 space-y-1">
                {ROLE_PERMS[r].map(p => <li key={p} className="text-[10px] text-muted-foreground flex items-center gap-1">• {p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl glow-border overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Members</h3>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
            className="bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-all" />
        </div>
        <div className="divide-y divide-border/30">
          {filtered.map((member, i) => (
            <motion.div key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-600/30 border border-border flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {member.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  {member.name}
                  {member.role === "OWNER" && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                </p>
                <p className="text-xs text-muted-foreground">{member.email} · Last active {member.lastActive}</p>
              </div>
              <div className="flex items-center gap-3">
                {member.role !== "OWNER" ? (
                  <select value={member.role} onChange={e => updateRole(member.id, e.target.value as Role)}
                    className={cn("text-xs px-2 py-1 rounded-lg border bg-transparent cursor-pointer focus:outline-none", ROLE_COLORS[member.role])}>
                    {(["ADMIN", "MEMBER", "VIEWER"] as Role[]).map(r => <option key={r} value={r} className="bg-card text-foreground">{r}</option>)}
                  </select>
                ) : (
                  <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", ROLE_COLORS[member.role])}>OWNER</span>
                )}
                {member.role !== "OWNER" && (
                  <button onClick={() => removeMember(member.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
