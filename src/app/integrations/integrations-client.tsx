"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, X, Check, RefreshCw, Zap, Globe, ToggleLeft, ToggleRight, Settings } from "lucide-react";

const PROVIDER_ICONS: Record<string,string> = { slack:"🟢",github:"⚫",pagerduty:"🔴",datadog:"🐶",mqtt:"📡","aws-iot":"☁️",grafana:"🟠",jira:"🔵" };
const CAT_COLORS: Record<string,string> = { Communication:"text-green-400", DevOps:"text-slate-300", Incident:"text-red-400", Monitoring:"text-amber-400", IoT:"text-cyan-400", "Cloud IoT":"text-orange-400", Visualization:"text-purple-400", Project:"text-blue-400" };

interface Integration { provider:string; name:string; category:string; description:string; id?:string; status:string; lastSync?:string; }

export default function IntegrationsClient() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string|null>(null);
  const [configuring, setConfiguring] = useState<Integration|null>(null);
  const [configForm, setConfigForm] = useState<Record<string,string>>({});

  const CONFIG_FIELDS: Record<string, {key:string;label:string;placeholder:string;secret?:boolean}[]> = {
    slack: [{key:"webhookUrl",label:"Webhook URL",placeholder:"https://hooks.slack.com/services/..."},{key:"channel",label:"Channel",placeholder:"#alerts"}],
    github: [{key:"token",label:"Personal Access Token",placeholder:"ghp_...",secret:true},{key:"repo",label:"Repository",placeholder:"owner/repo"}],
    pagerduty: [{key:"routingKey",label:"Routing Key",placeholder:"xxx",secret:true}],
    datadog: [{key:"apiKey",label:"API Key",placeholder:"xxx",secret:true},{key:"site",label:"Site",placeholder:"datadoghq.com"}],
    mqtt: [{key:"brokerUrl",label:"Broker URL",placeholder:"mqtt://broker.example.com:1883"},{key:"username",label:"Username",placeholder:"user"},{key:"password",label:"Password",placeholder:"pass",secret:true}],
    "aws-iot": [{key:"endpoint",label:"IoT Endpoint",placeholder:"xxx.iot.region.amazonaws.com"},{key:"region",label:"Region",placeholder:"us-east-1"}],
    grafana: [{key:"url",label:"Grafana URL",placeholder:"https://grafana.yourcompany.com"},{key:"apiKey",label:"API Key",placeholder:"xxx",secret:true}],
    jira: [{key:"domain",label:"Domain",placeholder:"yourcompany.atlassian.net"},{key:"email",label:"Email",placeholder:"you@company.com"},{key:"token",label:"API Token",placeholder:"xxx",secret:true}],
  };

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations");
      const data = await res.json();
      setIntegrations(data.integrations||[]);
    } catch { toast.error("Failed to load integrations"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchIntegrations(); }, [fetchIntegrations]);

  const toggleConnect = async (integ:Integration) => {
    if (integ.status === "DISCONNECTED") {
      setConfiguring(integ);
      const fields = CONFIG_FIELDS[integ.provider]||[];
      setConfigForm(Object.fromEntries(fields.map(f=>[f.key,""])));
    } else {
      setSaving(integ.provider);
      try {
        await fetch("/api/integrations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:integ.provider,action:"disconnect"})});
        toast.success(`${integ.name} disconnected`);
        fetchIntegrations();
      } catch { toast.error("Failed to disconnect"); }
      finally { setSaving(null); }
    }
  };

  const handleConnect = async () => {
    if (!configuring) return;
    setSaving(configuring.provider);
    try {
      const res = await fetch("/api/integrations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({provider:configuring.provider,action:"connect",config:configForm})});
      if (!res.ok) throw new Error((await res.json()).error||"Failed");
      const d = await res.json();
      toast.success(d.message||`${configuring.name} connected!`);
      setConfiguring(null);
      fetchIntegrations();
    } catch (e:any) { toast.error(e.message||"Failed to connect"); }
    finally { setSaving(null); }
  };

  const connected = integrations.filter(i=>i.status==="CONNECTED").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Integrations</h1>
          <p className="text-sm text-muted-foreground mt-1">{connected} connected · {integrations.length - connected} available</p>
        </div>
        <button onClick={fetchIntegrations} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white border border-border/50 px-3 py-2 rounded-lg transition-all">
          <RefreshCw className="w-3.5 h-3.5"/> Refresh
        </button>
      </div>

      {/* Connected badges */}
      {connected > 0 && (
        <div className="flex flex-wrap gap-2">
          {integrations.filter(i=>i.status==="CONNECTED").map(i=>(
            <span key={i.provider} className="flex items-center gap-2 text-xs bg-green-400/10 border border-green-400/20 text-green-400 px-3 py-1.5 rounded-full">
              <span>{PROVIDER_ICONS[i.provider]||"🔌"}</span>
              {i.name}
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_,i)=><div key={i} className="glass rounded-2xl p-5 animate-pulse h-40"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {integrations.map(integ=>{
            const isConnected = integ.status==="CONNECTED";
            const isSaving = saving===integ.provider;
            return (
              <div key={integ.provider} className={`glass rounded-2xl p-5 glow-border transition-all ${isConnected?"border-green-400/30":""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{PROVIDER_ICONS[integ.provider]||"🔌"}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{integ.name}</h3>
                      <span className={`text-[9px] font-mono ${CAT_COLORS[integ.category]||"text-muted-foreground"}`}>{integ.category}</span>
                    </div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${isConnected?"bg-green-400 animate-pulse":"bg-muted"}`}/>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug mb-4">{integ.description}</p>
                {integ.lastSync && (
                  <p className="text-[9px] text-green-400 mb-3">Last sync: {new Date(integ.lastSync).toLocaleDateString()}</p>
                )}
                <button onClick={()=>toggleConnect(integ)} disabled={isSaving}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isConnected?"bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-400/20":
                    "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-400/20"
                  } disabled:opacity-50`}>
                  {isSaving ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin"/> : isConnected ? <><ToggleLeft className="w-3.5 h-3.5"/>Disconnect</> : <><Zap className="w-3.5 h-3.5"/>Connect</>}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Config Modal */}
      {configuring && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setConfiguring(null)}/>
          <div className="relative glass border border-border/50 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{PROVIDER_ICONS[configuring.provider]||"🔌"}</span>
                <div><h2 className="text-xl font-black text-white">Connect {configuring.name}</h2><p className="text-xs text-muted-foreground mt-0.5">{configuring.category}</p></div>
              </div>
              <button onClick={()=>setConfiguring(null)} className="p-2 hover:bg-muted/30 rounded-lg"><X className="w-4 h-4 text-muted-foreground"/></button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{configuring.description}</p>
              {(CONFIG_FIELDS[configuring.provider]||[]).map(f=>(
                <div key={f.key}>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{f.label}</label>
                  <input type={f.secret?"password":"text"} value={configForm[f.key]||""} onChange={e=>setConfigForm(p=>({...p,[f.key]:e.target.value}))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50"/>
                </div>
              ))}
              {(CONFIG_FIELDS[configuring.provider]||[]).length===0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">Click connect to authenticate via OAuth</div>
              )}
              <button onClick={handleConnect} disabled={saving!==null}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : <><Check className="w-4 h-4"/>Connect {configuring.name}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
