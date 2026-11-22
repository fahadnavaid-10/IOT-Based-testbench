import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Download, RefreshCw } from "lucide-react";
import { nodesList, sensorDataGet } from "@/lib/api";

const tooltipStyle = {
  contentStyle: { backgroundColor: "hsl(220 35% 10%)", border: "1px solid hsl(220 25% 18%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210 40% 93%)" },
  labelStyle: { color: "hsl(215 20% 55%)" },
};

function parseTimestamp(timestamp: string | null): Date | null {
  if (!timestamp) return null;
  const str = !timestamp.endsWith("Z") && !timestamp.includes("+") ? timestamp + "Z" : timestamp;
  return new Date(str);
}

function toChartData(rows: { timestamp: string | null; temperature: number | null; humidity: number | null; light: number | null }[]) {
  return rows.map((r) => {
    const d = parseTimestamp(r.timestamp);
    return {
      time: d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "",
      temperature: r.temperature ?? 0,
      humidity: r.humidity ?? 0,
      light: r.light ?? 0,
    };
  });
}

function exportCSV(rows: { timestamp: string | null; temperature: number | null; humidity: number | null; light: number | null }[], nodeId: string) {
  const headers = "timestamp,temperature,humidity,light\n";
  const body = rows.map((r) => {
    const d = parseTimestamp(r.timestamp);
    const localTime = d ? d.toLocaleString() : "";
    return `${localTime},${r.temperature ?? ""},${r.humidity ?? ""},${r.light ?? ""}`;
  }).join("\n");
  const blob = new Blob([headers + body], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `sensor-data-${nodeId}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const SensorData = () => {
  const [node, setNode] = useState("NODE-001");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const { data: nodes = [] } = useQuery({ queryKey: ["nodes"], queryFn: nodesList });
  const nodeIds = useMemo(() => nodes.map((n) => n.id).filter(Boolean), [nodes]);
  const defaultNode = nodeIds.length ? nodeIds[0] : "NODE-001";
  const currentNode = nodeIds.includes(node) ? node : defaultNode;
  useEffect(() => {
    if (nodeIds.length && !nodeIds.includes(node)) setNode(defaultNode);
  }, [nodeIds, node, defaultNode]);

  const { data: rawData = [], refetch, isLoading } = useQuery({
    queryKey: ["sensor-data", currentNode, from, to],
    queryFn: () => sensorDataGet(currentNode, { from: from || undefined, to: to || undefined, limit: 100 }),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  const data = useMemo(() => toChartData(rawData), [rawData]);
  const avgTemp = data.length ? (data.reduce((a, d) => a + d.temperature, 0) / data.length).toFixed(1) : "-";
  const avgHum = data.length ? (data.reduce((a, d) => a + d.humidity, 0) / data.length).toFixed(1) : "-";
  const avgLight = data.length ? (data.reduce((a, d) => a + d.light, 0) / data.length).toFixed(0) : "-";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sensor Data</h1>
          <p className="text-sm text-muted-foreground">Real-time sensor readings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCSV(rawData, currentNode)}>
            <Download className="h-3.5 w-3.5 mr-2" />Export CSV
          </Button>
          <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />Auto-refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label className="text-xs">Node</Label>
          <Select value={currentNode} onValueChange={setNode}>
            <SelectTrigger className="w-40 bg-secondary/50"><SelectValue /></SelectTrigger>
            <SelectContent>
              {nodeIds.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label className="text-xs">From</Label><Input type="date" className="w-40 bg-secondary/50" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="space-y-2"><Label className="text-xs">To</Label><Input type="date" className="w-40 bg-secondary/50" value={to} onChange={(e) => setTo(e.target.value)} /></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Avg Temperature", value: `${avgTemp}°C`, color: "text-primary" },
          { label: "Avg Humidity", value: `${avgHum}%`, color: "text-status-online" },
          { label: "Avg Light", value: `${avgLight} lx`, color: "text-status-deploying" },
        ].map((a) => (
          <div key={a.label} className="gradient-card rounded-xl border border-border p-4 text-center">
            <p className={`text-xl font-bold ${a.color}`}>{a.value}</p>
            <p className="text-xs text-muted-foreground">{a.label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="h-64 bg-secondary/20 rounded-xl animate-pulse" />
      ) : data.length === 0 ? (
        <p className="text-muted-foreground">No sensor data for this node in the selected range.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="gradient-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Temperature (°C)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 25% 18%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="temperature" stroke="hsl(190 80% 50%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="gradient-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Humidity (%)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 25% 18%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="humidity" stroke="hsl(142 72% 45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="gradient-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Light Intensity (lux)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 25% 18%)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="light" stroke="hsl(32 95% 55%)" fill="hsl(32 95% 55% / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default SensorData;
