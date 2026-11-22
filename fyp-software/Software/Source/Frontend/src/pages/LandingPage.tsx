import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Radio, Cpu, Wifi, BarChart3, Upload, Shield, Globe, Zap,
  ThermometerSun, Lightbulb, Battery, Users, ArrowRight, ChevronDown,
  FlaskConical, MonitorSmartphone, Code2, Layers
} from "lucide-react";

const LandingPage = () => {
  const features = [
    { icon: Globe, title: "Remote Access", desc: "Program and manage 50+ IoT nodes from anywhere through our web-based interface — no physical proximity needed." },
    { icon: Upload, title: "OTA Deployment", desc: "Upload and deploy firmware over-the-air to any node or group of nodes with real-time progress tracking." },
    { icon: BarChart3, title: "Live Monitoring", desc: "Visualize real-time sensor data streams including temperature, humidity, and light readings with interactive charts." },
    { icon: Shield, title: "Secure Platform", desc: "Role-based access control with researcher and admin roles, ensuring safe multi-tenant experimentation." },
    { icon: FlaskConical, title: "Experiment Management", desc: "Create, configure, and manage experiments with custom firmware targeting specific node groups." },
    { icon: Code2, title: "Template Frameworks", desc: "Get started fast with pre-built programming templates available on every node for rapid prototyping." },
  ];

  const hardwareSpecs = [
    { icon: Cpu, label: "ESP-32 Microcontroller", desc: "Dual-core processor with built-in Wi-Fi & Bluetooth" },
    { icon: ThermometerSun, label: "Environmental Sensors", desc: "Temperature, humidity & LDR light sensor modules" },
    { icon: Lightbulb, label: "RGB LED Output", desc: "Visual feedback through programmable RGB LEDs" },
    { icon: Battery, label: "Rechargeable Batteries", desc: "Sustainable power with rechargeable battery systems" },
    { icon: Wifi, label: "Wireless Networking", desc: "Full mesh networking for distributed IoT experiments" },
    { icon: Layers, label: "Standardized Design", desc: "50+ identical nodes for consistent, reproducible results" },
  ];

  const phases = [
    { num: "01", title: "Design Experiment", desc: "Define your parameters, select target nodes, and upload custom firmware through the web interface." },
    { num: "02", title: "Deploy Remotely", desc: "Push your code OTA to selected nodes and monitor real-time deployment progress across the network." },
    { num: "03", title: "Collect & Analyze", desc: "Stream live sensor data, visualize results with interactive charts, and export findings for research." },
  ];

  const team = [
    { name: "Azka Ghani", id: "CS-22058" },
    { name: "Maryam Noman", id: "CS-22062" },
    { name: "Fiza Farzand", id: "CS-22066" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
              <Radio className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-foreground">IoT Testbed</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#hardware" className="hover:text-foreground transition-colors">Hardware</a>
            <a href="#team" className="hover:text-foreground transition-colors">Team</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-secondary/50 text-xs text-muted-foreground mb-6">
            <span className="h-2 w-2 rounded-full bg-status-online animate-pulse" />
            Supported by NCAI — 50+ Nodes Live
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Remote IoT Testbed{" "}
            <span className="text-primary">Platform</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Access 50+ sensor-equipped physical nodes for realistic, web-based IoT experimentation. 
            Deploy firmware, collect data, and validate your research — all remotely.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="gap-2 text-base px-8 h-12">
                Start Experimenting <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12">
                Learn More <ChevronDown className="h-4 w-4" />
              </Button>
            </a>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: "50+", label: "Physical Nodes" },
              { value: "3", label: "Sensor Types" },
              { value: "OTA", label: "Deployment" },
              { value: "24/7", label: "Remote Access" },
            ].map((stat) => (
              <div key={stat.label} className="gradient-card rounded-xl border border-border p-4">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Platform Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold">Everything You Need for IoT Research</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">A comprehensive platform replacing costly individual testbed setups with scalable, remotely accessible infrastructure.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="gradient-card rounded-xl border border-border p-6 hover:border-primary/30 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-primary transition-shadow">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 border-t border-border bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Workflow</p>
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Three simple steps from experiment design to actionable research insights.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {phases.map((p) => (
              <div key={p.num} className="relative">
                <span className="text-6xl font-black text-primary/10 absolute -top-4 -left-2">{p.num}</span>
                <div className="relative pt-10">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware */}
      <section id="hardware" className="py-20 md:py-28 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Infrastructure</p>
            <h2 className="text-3xl md:text-4xl font-bold">Hardware Specifications</h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">Each node is identically built for consistent, reproducible experimentation.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {hardwareSpecs.map((s) => (
              <div key={s.label} className="flex items-start gap-4 gradient-card rounded-xl border border-border p-5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{s.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="py-16 px-6 border-t border-border bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-6">Research Domains</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Internet of Things (IoT)", "Embedded Systems", "Wireless Sensor Networks (WSN)"].map((d) => (
              <span key={d} className="px-5 py-2.5 rounded-full border border-border bg-secondary/50 text-sm text-foreground">{d}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-20 md:py-28 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Project Team</p>
            <h2 className="text-3xl md:text-4xl font-bold">Meet the Team</h2>
            <p className="text-muted-foreground mt-4">Department of Computer & Information Systems Engineering</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {team.map((m) => (
              <div key={m.id} className="gradient-card rounded-xl border border-border p-6 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{m.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{m.id}</p>
              </div>
            ))}
          </div>
          <div className="gradient-card rounded-xl border border-border p-6 text-center max-w-sm mx-auto">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Supervised by</p>
            <h3 className="font-semibold text-foreground">Dr. Muhammad Khurram</h3>
            <p className="text-xs text-muted-foreground mt-1">Professor, CIS Department</p>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            Industrial Support: <span className="text-foreground">National Center of Artificial Intelligence (NCAI)</span>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-6 glow-primary">
            <MonitorSmartphone className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Experimenting?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Register as a researcher to access the testbed. No hardware setup required — just your code and curiosity.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="gap-2 px-8 h-12">
                Register Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 h-12">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <span>IoT Testbed Platform — CS-406 Final Year Design Project</span>
          </div>
          <p>© 2025–2026 Department of Computer & Information Systems Engineering</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
