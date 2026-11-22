import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FlaskConical, Cpu, Wifi, Rocket, TrendingUp, Activity } from "lucide-react";
import { adminStats, deploymentsList } from "@/lib/api";

const statusStyles: Record<string, string> = {
  success: "bg-status-success/10 text-status-success",
  deploying: "bg-status-deploying/10 text-status-deploying",
  failed: "bg-status-failed/10 text-status-failed",
};

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: adminStats,
  });
  const { data: recentDeploys = [] } = useQuery({
    queryKey: ["deployments-list"],
    queryFn: deploymentsList,
  });

  const totalNodes = stats?.totalNodes ?? 0;
  const onlineNodes = stats?.onlineNodes ?? 0;
  const offlineNodes = stats?.offlineNodes ?? 0;
  const activeExperiments = stats?.activeExperiments ?? stats?.myActiveExperiments ?? 0;

  const statsCards = [
    { label: "Active Experiments", value: String(activeExperiments), icon: FlaskConical, change: "" },
    { label: "Assigned Nodes", value: String(stats?.assignedNodes ?? totalNodes), icon: Cpu, change: "" },
    { label: "Online Nodes", value: String(onlineNodes), icon: Wifi, live: true, change: totalNodes ? `${Math.round((onlineNodes / totalNodes) * 100)}% uptime` : "" },
    { label: "Total Nodes", value: String(totalNodes), icon: Rocket, change: offlineNodes ? `${offlineNodes} offline` : "" },
  ];

  const recent = recentDeploys.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your IoT testbed activity</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="gradient-card rounded-xl border border-border p-5 h-28 animate-pulse bg-secondary/20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((s) => (
            <div key={s.label} className="gradient-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                {s.live && <span className="h-2.5 w-2.5 rounded-full bg-status-online animate-pulse-glow" />}
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              {s.change && <p className="text-xs text-primary mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" />{s.change}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="gradient-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Recent Deployments</h3>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deployments yet</p>
            ) : (
              recent.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.experiment}</p>
                    <p className="text-xs text-muted-foreground">{d.node} • {d.time ? new Date(d.time).toLocaleString() : "-"}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[d.status] ?? "bg-muted text-muted-foreground"}`}>{d.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="gradient-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "New Experiment", icon: FlaskConical, to: "/dashboard/experiments/create" },
              { label: "Monitor Nodes", icon: Cpu, to: "/dashboard/nodes" },
              { label: "Sensor Data", icon: TrendingUp, to: "/dashboard/sensor-data" },
              { label: "Deploy Logs", icon: Rocket, to: "/dashboard/deployment-logs" },
            ].map((a) => (
              <Link key={a.label} to={a.to} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all cursor-pointer">
                <a.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-foreground">{a.label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-lg bg-secondary/30 border border-border">
            <p className="text-xs font-semibold text-foreground mb-3">Node Status Overview</p>
            <div className="space-y-2">
              {[
                { label: "Online", count: onlineNodes, total: totalNodes || 1, color: "bg-status-online" },
                { label: "Offline", count: offlineNodes, total: totalNodes || 1, color: "bg-status-offline" },
              ].map((n) => (
                <div key={n.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16">{n.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${n.color} transition-all`} style={{ width: `${(n.count / n.total) * 100}%` }} />
                  </div>
                  <span className="text-xs text-foreground w-6 text-right">{n.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
