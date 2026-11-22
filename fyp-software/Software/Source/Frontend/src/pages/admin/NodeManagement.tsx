import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { nodesList, nodeCreate, nodeUpdate, nodeDelete } from "@/lib/api";
import type { NodeItem } from "@/lib/api";

const statusBadge: Record<string, string> = {
  idle: "bg-status-online/10 text-status-online",
  offline: "bg-status-offline/10 text-status-offline",
  reserved: "bg-primary/10 text-primary",
};

const NodeManagement = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<NodeItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    nodeId: "",
    macAddress: "",
    ip: "",
    status: "idle",
    firmware: "",
  });

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["nodes"],
    queryFn: nodesList,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        status: string;
        ipAddress: string;
        firmwareVersion: string;
        batteryLevel: number;
      }>;
    }) => nodeUpdate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
      setEditing(null);
    },
  });
  const createMutation = useMutation({
    mutationFn: (data: {
      nodeId: string;
      macAddress?: string;
      status?: string;
      ipAddress?: string;
      firmwareVersion?: string;
    }) => nodeCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nodes"] });
      setForm({
        nodeId: "",
        macAddress: "",
        ip: "",
        status: "idle",
        firmware: "",
      });
      setAdding(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: nodeDelete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nodes"] }),
  });

  const updateForm = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleAdd = () => {
    if (!form.nodeId.trim()) return;
    createMutation.mutate({
      nodeId: form.nodeId.trim().toUpperCase(),
      macAddress: form.macAddress.trim(),
      ipAddress: form.ip || undefined,
      status: form.status,
      firmwareVersion: form.firmware || undefined,
    });
  };

  const handleEdit = () => {
    if (!editing) return;
    updateMutation.mutate({
      id: editing.id,
      data: {
        ipAddress: editing.ip || undefined,
        firmwareVersion: editing.firmware || undefined,
        status: editing.status,
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Node Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Add, edit, and manage IoT nodes
          </p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Node
        </Button>
      </div>

      {(adding || editing) && (
        <div className="gradient-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              {editing ? "Edit Node" : "Add Node"}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setAdding(false);
                setEditing(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Node ID</Label>
              <Input
                value={editing ? editing.id : form.nodeId}
                onChange={(e) =>
                  editing
                    ? setEditing({ ...editing, id: e.target.value })
                    : updateForm("nodeId", e.target.value)
                }
                className="bg-secondary/50"
                disabled={!!editing}
                placeholder="NODE-013"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">MAC Address</Label>
              <Input
                value={editing ? (editing as any).mac_address : form.macAddress}
                onChange={(e) =>
                  editing
                    ? setEditing({
                        ...editing,
                        mac_address: e.target.value,
                      } as any)
                    : updateForm("macAddress", e.target.value)
                }
                className="bg-secondary/50"
                placeholder="EC:E3:34:C0:39:A8"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">IP Address</Label>
              <Input
                value={editing ? editing.ip : form.ip}
                onChange={(e) =>
                  editing
                    ? setEditing({ ...editing, ip: e.target.value })
                    : updateForm("ip", e.target.value)
                }
                className="bg-secondary/50"
                placeholder="192.168.1.113"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Firmware</Label>
              <Input
                value={editing ? editing.firmware : form.firmware}
                onChange={(e) =>
                  editing
                    ? setEditing({ ...editing, firmware: e.target.value })
                    : updateForm("firmware", e.target.value)
                }
                className="bg-secondary/50"
                placeholder="v2.3.1"
              />
            </div>
            {editing && (
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select
                  value={editing.status}
                  onValueChange={(v) => setEditing({ ...editing, status: v })}
                >
                  <SelectTrigger className="w-full bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "idle",
                      "offline",
                      "reserved",
                    ].map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <Button
            onClick={editing ? handleEdit : handleAdd}
            className="mt-4"
            disabled={updateMutation.isPending || createMutation.isPending}
          >
            {editing ? "Save Changes" : "Add Node"}
          </Button>
        </div>
      )}

      <div className="gradient-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Node ID",
                    "MAC Address",
                    "IP Address",
                    "Firmware",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodes.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-mono font-medium text-foreground">
                      {n.id}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                      {(n as any).mac_address || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                      {n.ip || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {n.firmware || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={n.status}
                        onValueChange={(v) =>
                          updateMutation.mutate({
                            id: n.id,
                            data: { status: v },
                          })
                        }
                      >
                        <SelectTrigger
                          className={`w-28 h-7 text-[11px] border-0 ${statusBadge[n.status] ?? "bg-muted"}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "idle",
                            "offline",
                            "reserved",
                          ].map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="capitalize"
                            >
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => setEditing(n)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            confirm("Delete this node?") &&
                            deleteMutation.mutate(n.id)
                          }
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && nodes.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No nodes. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeManagement;
