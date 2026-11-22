import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Battery, Wifi, WifiOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { nodesList } from "@/lib/api";

type NodeFilter = "all" | "online" | "offline" | "reserved" | "idle";

const statusBadge: Record<string, { bg: string; dot: string; label: string }> = {
  online: { bg: "bg-status-online/10 text-status-online", dot: "bg-status-online", label: "Online" },
  idle: { bg: "bg-status-online/10 text-status-online", dot: "bg-status-online", label: "Idle" },
  offline: { bg: "bg-status-offline/10 text-status-offline", dot: "bg-status-offline", label: "Offline" },
  deploying: { bg: "bg-status-deploying/10 text-status-deploying", dot: "bg-status-deploying", label: "Deploying" },
  failed: { bg: "bg-status-failed/10 text-status-failed", dot: "bg-status-failed", label: "Failed" },
  reserved: { bg: "bg-primary/10 text-primary", dot: "bg-primary", label: "Reserved" },
  running: { bg: "bg-status-online/10 text-status-online", dot: "bg-status-online", label: "Running" },
};

const MonitorNodes = () => {
  const [filter, setFilter] = useState<NodeFilter>("all");
  const [search, setSearch] = useState("");

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["nodes"],
    queryFn: nodesList,
  });

  const filtered = nodes.filter(
    (n) => (filter === "all" || n.status === filter) && n.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Monitor Nodes</h1>
        <p className="text-sm text-muted-foreground">Real-time IoT node monitoring</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search nodes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", "idle", "online", "offline", "reserved"] as NodeFilter[]).map((s) => (
            <Button key={s} variant={filter === s ? "default" : "ghost"} size="sm" className="capitalize" onClick={() => setFilter(s)}>{s}</Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="gradient-card rounded-xl border border-border p-4 h-44 animate-pulse bg-secondary/20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((node) => {
            const badge = statusBadge[node.status] ?? statusBadge.offline;
            const battery = node.battery ?? 0;
            return (
              <div key={node.id} className="gradient-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {node.status === "online" || node.status === "idle" || node.status === "deploying" || node.status === "running" ? (
                      <Wifi className="h-4 w-4 text-status-online" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-status-offline" />
                    )}
                    <span className="text-sm font-bold text-foreground">{node.id}</span>
                  </div>
                  <span className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot} ${node.status === "online" || node.status === "idle" ? "animate-pulse-glow" : ""}`} />
                    {badge.label}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">IP</span><span className="font-mono text-foreground">{node.ip || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Firmware</span><span className="text-foreground">{node.firmware || "-"}</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Battery</span>
                    <div className="flex items-center gap-2">
                      <Battery className={`h-3.5 w-3.5 ${battery > 20 ? "text-status-online" : "text-destructive"}`} />
                      <Progress value={battery} className="w-16 h-1.5" />
                      <span className="text-foreground w-7 text-right">{battery}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Last Active</span><span className="text-foreground">{node.lastActive || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Experiment</span><span className="text-foreground truncate max-w-[120px]">{node.experiment || "-"}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!isLoading && filtered.length === 0 && <p className="text-sm text-muted-foreground">No nodes match your filters.</p>}
    </div>
  );
};

export default MonitorNodes;
