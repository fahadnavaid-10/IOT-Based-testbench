import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { deploymentsList } from "@/lib/api";

const statusColors: Record<string, string> = {
  success: "bg-status-success/10 text-status-success",
  deploying: "bg-status-deploying/10 text-status-deploying",
  failed: "bg-status-failed/10 text-status-failed",
};

type LogFilter = "all" | "success" | "failed" | "deploying";

const DeploymentLogs = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LogFilter>("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["deployments-list"],
    queryFn: deploymentsList,
  });

  const filtered = logs.filter(
    (l) =>
      (filter === "all" || l.status === filter) &&
      (l.experiment.toLowerCase().includes(search.toLowerCase()) || l.node.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Deployment Logs</h1>
        <p className="text-sm text-muted-foreground">Track all firmware deployment history</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
        </div>
        <div className="flex gap-1">
          {(["all", "success", "failed", "deploying"] as LogFilter[]).map((s) => (
            <Button key={s} variant={filter === s ? "default" : "ghost"} size="sm" className="capitalize" onClick={() => setFilter(s)}>{s}</Button>
          ))}
        </div>
      </div>

      <div className="gradient-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Experiment", "Node", "Firmware", "Time", "Status", "Error"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{log.experiment}</td>
                    <td className="px-4 py-3 text-sm font-mono text-xs text-foreground">{log.node}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{log.firmware}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{log.time ? new Date(log.time).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[log.status] ?? "bg-muted text-muted-foreground"}`}>{log.status}</span></td>
                    <td className="px-4 py-3 text-xs text-destructive max-w-[200px] truncate">{log.error || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No deployment logs found</div>}
      </div>
    </div>
  );
};

export default DeploymentLogs;
