import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, ArrowLeft, AlertCircle } from "lucide-react";
import { experimentCreate, deployStart, nodesAvailable } from "@/lib/api";

const CreateExperiment = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [firmware, setFirmware] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { data: availableNodes = [], isLoading: nodesLoading } = useQuery({
    queryKey: ["nodes-available"],
    queryFn: nodesAvailable,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("description", description.trim());
      if (startTime) form.append("startTime", startTime);
      if (endTime) form.append("endTime", endTime);
      selectedNodes.forEach((id) => form.append("nodeIds", id));
      if (firmware) form.append("firmware", firmware);
      return experimentCreate(form);
    },
    onSuccess: async (exp) => {
      try {
        await deployStart(exp.id);
        queryClient.invalidateQueries({ queryKey: ["experiments"] });
        queryClient.invalidateQueries({ queryKey: ["deployments-list"] });
        setShowConfirm(false);
        navigate("/dashboard/experiments/deploy", { state: { experimentId: exp.id } });
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : "Failed to start deployment");
      }
    },
    onError: (e) => {
      setSubmitError(e instanceof Error ? e.message : "Failed to create experiment");
    },
  });

  const toggleNode = (id: string) =>
    setSelectedNodes((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".bin")) {
        alert("Only .bin files allowed");
        return;
      }
      setFirmware(file);
    }
  };

  const handleDeploy = () => {
    setSubmitError("");
    createMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <Button variant="ghost" onClick={() => navigate("/dashboard/experiments")} className="text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" />Back to Experiments
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Experiment</h1>
        <p className="text-sm text-muted-foreground">Set up a new IoT experiment</p>
      </div>

      <div className="space-y-6">
        <div className="gradient-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Experiment Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Experiment Name</Label><Input placeholder="My Experiment" className="bg-secondary/50" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Start Date & Time</Label><Input type="datetime-local" className="bg-secondary/50" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
            <div className="sm:col-span-2 space-y-2"><Label>Description</Label><Textarea placeholder="Describe your experiment..." className="bg-secondary/50" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="space-y-2"><Label>End Date & Time</Label><Input type="datetime-local" className="bg-secondary/50" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
          </div>
        </div>

        <div className="gradient-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Upload Firmware</h3>
          <label className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-secondary/20 cursor-pointer transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{firmware ? `${firmware.name} (${(firmware.size / 1024).toFixed(1)} KB)` : "Click to upload .bin firmware (optional)"}</p>
            <input type="file" accept=".bin" className="hidden" onChange={handleFile} />
          </label>
        </div>

        <div className="gradient-card rounded-xl border border-border p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Select Nodes</h3>
          {nodesLoading ? (
            <p className="text-sm text-muted-foreground">Loading nodes...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableNodes.map((node) => {
                const canSelect = node.status === "idle";
                const selected = selectedNodes.includes(node.id);
                return (
                  <label
                    key={node.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer ${!canSelect ? "opacity-40 cursor-not-allowed border-border bg-secondary/10" : selected ? "border-primary/50 bg-primary/5" : "border-border bg-secondary/20 hover:border-primary/30"}`}
                  >
                    <Checkbox checked={selected} disabled={!canSelect} onCheckedChange={() => canSelect && toggleNode(node.id)} />
                    <div>
                      <p className="text-xs font-medium text-foreground">{node.id}</p>
                      <p className={`text-[10px] capitalize ${node.status === "idle" ? "text-status-online" : "text-status-offline"}`}>{node.status}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
          {availableNodes.length === 0 && !nodesLoading && <p className="text-sm text-muted-foreground">No available nodes. Try again later.</p>}
        </div>

        <Button onClick={() => setShowConfirm(true)} disabled={selectedNodes.length === 0 || !name.trim()} className="w-full sm:w-auto">Deploy Experiment</Button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="gradient-card rounded-xl border border-border p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-status-deploying/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-status-deploying" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Confirm Deployment</h3>
            </div>
            {submitError && <p className="text-sm text-destructive mb-2">{submitError}</p>}
            <p className="text-sm text-muted-foreground mb-4">You are about to deploy firmware to <strong className="text-foreground">{selectedNodes.length} nodes</strong>. This action will begin firmware upload immediately.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => { setShowConfirm(false); setSubmitError(""); }} disabled={createMutation.isPending}>Cancel</Button>
              <Button onClick={handleDeploy} disabled={createMutation.isPending}>{createMutation.isPending ? "Creating..." : "Confirm & Deploy"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExperiment;
