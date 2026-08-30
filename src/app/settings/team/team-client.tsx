"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Users, Plus, X, Check, RefreshCw, Trash2, Crown, Shield, User, Eye, Mail, ChevronDown } from "lucide-react";

const ROLE_ICONS: Record<string,any> = { OWNER:<Crown className="w-3.5 h-3.5 text-amber-400"/>, ADMIN:<Shield className="w-3.5 h-3.5 text-cyan-400"/>, MEMBER:<User className="w-3.5 h-3.5 text-slate-400"/>, VIEWER:<Eye className="w-3.5 h-3.5 text-muted-foreground"/> };
const ROLE_COLORS: Record<string,string> = { OWNER:"text-amber-400 bg-amber-400/10", ADMIN:"text-cyan-400 bg-cyan-400/10", MEMBER:"text-slate-300 bg-slate-400/10", VIEWER:"text-muted-foreground bg-muted/20" };
const ROLE_PERMS: Record<string,string> = { OWNER:"Full access + billing", ADMIN:"Manage devices, models, deployments", MEMBER:"Read/write devices and models", VIEWER:"Read-only access" };

export default function TeamClient() {
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [myRole, setMyRole] = useState("MEMBER");
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email:"", role:"MEMBER" });
  const [saving, setSaving] = useState(false);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      setTeam(data.team);
      setMembers(data.members||[]);
      setInvitations(data.invitations||[]);
      setMyRole(data.myRole||"MEMBER");
    } catch { toast.error("Failed to load team"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleInvite = async () => {
    if (!inviteForm.email) { toast.error("Email is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/team", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ action:"invite", email:inviteForm.email, role:inviteForm.role }),
      });
      if (!res.ok) throw new Error((await res.json()).error||"Failed");
      const data = await res.json();
      toast.success(`Invitation sent to ${inviteForm.email}!`);
      if (data.inviteUrl) toast.info(`Invite URL: ${data.inviteUrl}`, { duration: 8000 });
      setShowInvite(false);
      setInviteForm({ email:"", role:"MEMBER" });
      fetchTeam();
    } catch (e:any) { toast.error(e.message||"Failed to send invite"); }
    finally { setSaving(false); }
  };

  const updateRole = async (memberId:string, role:string) => {
    try {
      await fetch("/api/team",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"update_role",memberId,role})});
      toast.success("Role updated");
      fetchTeam();
    } catch { toast.error("Failed to update role"); }
  };

  const removeMember = async (memberId:string) => {
    try {
      await fetch("/api/team",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"remove",memberId})});
      toast.success("Member removed");
      fetchTeam();
    } catch { toast.error("Failed to remove member"); }
  };

  const canManage = myRole === "OWNER" || myRole === "ADMIN";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Team Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{members.length} member{members.length!==1?"s":""}{invitations.length>0?` · ${invitations.length} pending invite${invitations.length>1?"s":""}`:""}  · {team?.plan||"Free"} plan</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTeam} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white border border-border/50 px-3 py-2 rounded-lg transition-all">
            <RefreshCw className="w-3.5 h-3.5"/> Refresh
          </button>
          {canManage && (
            <button onClick={()=>setShowInvite(true)} className="flex items-center gap-2 text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-lg transition-all">
              <Plus className="w-3.5 h-3.5"/> Invite Member
            </button>
          )}
        </div>
      </div>

      {/* Role legend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(ROLE_PERMS).map(([role,desc])=>(
          <div key={role} className="glass rounded-xl p-3 border border-border/20">
            <div className="flex items-center gap-2 mb-1">
              {ROLE_ICONS[role]}
              <span className={`text-xs font-bold ${ROLE_COLORS[role].split(" ")[0]}`}>{role}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      {/* Members */}
      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_,i)=><div key={i} className="glass rounded-2xl p-4 animate-pulse h-16"/>)}</div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border/30 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400"/> Members ({members.length})</h2>
          </div>
          <div className="divide-y divide-border/20">
            {members.map((member:any)=>(
              <div key={member.id} className="flex items-center gap-4 p-4 hover:bg-muted/10 transition-all">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center text-sm font-black text-cyan-400 shrink-0">
                  {member.user?.name?.[0]?.toUpperCase()||member.user?.email?.[0]?.toUpperCase()||"?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{member.user?.name||"Unnamed"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{member.user?.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canManage && member.role !== "OWNER" ? (
                    <select value={member.role} onChange={e=>updateRole(member.id, e.target.value)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-lg border bg-transparent focus:outline-none cursor-pointer ${ROLE_COLORS[member.role]||""} border-current/20`}>
                      {["ADMIN","MEMBER","VIEWER"].map(r=><option key={r} value={r} className="bg-card text-white">{r}</option>)}
                    </select>
                  ) : (
                    <span className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg ${ROLE_COLORS[member.role]||""}`}>
                      {ROLE_ICONS[member.role]} {member.role}
                    </span>
                  )}
                  {canManage && member.role !== "OWNER" && (
                    <button onClick={()=>removeMember(member.id)} className="p-1.5 text-red-400/50 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                  )}
                </div>
              </div>
            ))}
            {members.length===0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">No team members yet</div>
            )}
          </div>
        </div>
      )}

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border/30">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Mail className="w-4 h-4 text-amber-400"/> Pending Invitations ({invitations.length})</h2>
          </div>
          <div className="divide-y divide-border/20">
            {invitations.map((inv:any)=>(
              <div key={inv.id} className="flex items-center gap-4 p-4">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-amber-400"/></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{inv.email}</p>
                  <p className="text-[10px] text-muted-foreground">Invited as {inv.role} · Expires {new Date(inv.expiresAt).toLocaleDateString()}</p>
                </div>
                <span className="text-[10px] bg-amber-400/10 text-amber-400 px-2 py-1 rounded-full font-mono">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setShowInvite(false)}/>
          <div className="relative glass border border-border/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-black text-white">Invite Team Member</h2><p className="text-xs text-muted-foreground mt-1">They'll receive an invitation email</p></div>
              <button onClick={()=>setShowInvite(false)} className="p-2 hover:bg-muted/30 rounded-lg"><X className="w-4 h-4 text-muted-foreground"/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email Address *</label>
                <input value={inviteForm.email} onChange={e=>setInviteForm(p=>({...p,email:e.target.value}))} placeholder="colleague@company.com" type="email"
                  className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Role</label>
                <div className="space-y-2">
                  {["ADMIN","MEMBER","VIEWER"].map(role=>(
                    <button key={role} onClick={()=>setInviteForm(p=>({...p,role}))}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${inviteForm.role===role?"border-cyan-400 bg-cyan-400/10":"border-border/30 hover:border-cyan-400/30"}`}>
                      <span className={inviteForm.role===role?"text-cyan-400":"text-muted-foreground"}>{ROLE_ICONS[role]}</span>
                      <div className="text-left">
                        <p className={`text-xs font-bold ${inviteForm.role===role?"text-white":"text-muted-foreground"}`}>{role}</p>
                        <p className="text-[10px] text-muted-foreground">{ROLE_PERMS[role]}</p>
                      </div>
                      {inviteForm.role===role && <Check className="w-4 h-4 text-cyan-400 ml-auto"/>}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleInvite} disabled={saving}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                {saving?<><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>Sending...</>:<><Mail className="w-4 h-4"/>Send Invitation</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
