import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import { experimentsList, experimentDelete } from "@/lib/api";

type ExpStatus = "all" | "active" | "scheduled" | "completed";

const statusColors: Record<string, string> = {
  active: "bg-status-online/10 text-status-online",
  scheduled: "bg-status-deploying/10 text-status-deploying",
  completed: "bg-status-offline/10 text-muted-foreground",
};

const Experiments = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ExpStatus>("all");
  const [search, setSearch] = useState("");

  const { data: experiments = [], isLoading } = useQuery({
  queryKey: ["experiments"],
  queryFn: experimentsList,
  refetchInterval: 5000,
});

  const deleteMutation = useMutation({
    mutationFn: experimentDelete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experiments"] }),
  });

  const filtered = experiments.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Experiments</h1>
          <p className="text-sm text-muted-foreground">Manage your IoT experiments</p>
        </div>
        <Link to="/dashboard/experiments/create">
          <Button><Plus className="h-4 w-4 mr-2" />Create Experiment</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search experiments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "scheduled", "completed"] as ExpStatus[]).map((s) => (
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
                  {["Experiment", "Nodes", "Start", "End", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((exp) => {
                  const status = (exp.status || "scheduled").toLowerCase();
                  const show = filter === "all" || status === filter;
                  if (!show) return null;
                  return (
                    <tr key={exp.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{exp.name}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{exp.nodeIds?.length ?? 0}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{exp.startTime ? new Date(exp.startTime).toLocaleString() : "-"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{exp.endTime ? new Date(exp.endTime).toLocaleString() : "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[status]}`}>{status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => navigate("/dashboard/experiments/deploy", { state: { experimentId: exp.id } })}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => confirm("Delete this experiment?") && deleteMutation.mutate(exp.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && filtered.length === 0 && <div className="p-8 text-center text-muted-foreground">No experiments found</div>}
      </div>
    </div>
  );
};

export default Experiments;
