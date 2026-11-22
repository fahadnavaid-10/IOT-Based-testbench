import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { deployStatus, deployStart } from "@/lib/api";

interface NodeDeploy {
  id: string;
  progress: number;
  status: string;
  error?: string | null;
  updatedAt?: string | null;
}

const DeploymentProgress = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const experimentId = (location.state as { experimentId?: number })?.experimentId as number | undefined;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["deploy-status", experimentId],
    queryFn: () => deployStatus(experimentId!),
    enabled: !!experimentId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "in_progress" || status === "pending" ? 2000 : false;
    },
  });

  const handleStartDeploy = () => {
    if (!experimentId) return;
    deployStart(experimentId).then(() => refetch()).catch(() => {});
  };

  const nodes: NodeDeploy[] = data?.nodes ?? [];
  const icon = (s: string) =>
    s === "success" ? <CheckCircle2 className="h-5 w-5 text-status-success" /> :
    s === "failed" ? <XCircle className="h-5 w-5 text-status-failed" /> :
    <Loader2 className="h-5 w-5 text-primary animate-spin" />;

  if (!experimentId) {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard/experiments")} className="text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Experiments
        </Button>
        <p className="text-muted-foreground">No deployment selected. Create an experiment and deploy to see progress.</p>
      </div>
    );
  }

  if (isLoading && nodes.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <div className="h-8 w-48 bg-secondary/30 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="gradient-card rounded-xl border border-border p-5 h-24 animate-pulse bg-secondary/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <Button variant="ghost" onClick={() => navigate("/dashboard/experiments")} className="text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />Back to Experiments
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Deployment Progress</h1>
        <p className="text-sm text-muted-foreground">Real-time firmware upload status</p>
      </div>

      {data?.status === "not_started" && (
        <Button onClick={handleStartDeploy}>Start deployment</Button>
      )}
      <div className="space-y-4">
        {nodes.length === 0 && data?.status !== "not_started" && <p className="text-muted-foreground">No nodes in this deployment yet.</p>}
        {nodes.map((n) => (
          <div key={n.id} className={`gradient-card rounded-xl border p-5 transition-colors ${n.status === "success" ? "border-status-success/30" : n.status === "failed" ? "border-status-failed/30" : "border-border"}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {icon(n.status)}
                <div>
                  <p className="text-sm font-semibold text-foreground">{n.id}</p>
                  <p className="text-xs text-muted-foreground capitalize">{n.status}</p>
                </div>
              </div>
              <span className="text-sm font-mono text-foreground">{Math.round(n.progress)}%</span>
            </div>
            <Progress value={n.progress} className="h-2" />
            {n.error && <p className="text-xs text-destructive mt-2">{n.error}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeploymentProgress;
