import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Radio, CheckCircle2, AlertCircle } from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", institution: "", researchPurpose: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (Object.values(form).some((v) => !v)) { setError("All fields are required"); return; }
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) setSuccess(true);
    else setError(result.error ?? "Registration failed");
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md gradient-card rounded-xl border border-border p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-status-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-7 w-7 text-status-success" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Registration Submitted</h2>
          <p className="text-sm text-muted-foreground mb-6">Your account is pending admin approval. You'll receive an email once approved.</p>
          <Link to="/login"><Button className="w-full">Back to Login</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
            <Radio className="h-7 w-7 text-primary" />
          </div>
        </div>

        <div className="gradient-card rounded-xl border border-border p-8">
          <h2 className="text-lg font-semibold text-foreground mb-1">Create Account</h2>
          <p className="text-sm text-muted-foreground mb-6">Register as a researcher</p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Dr. John Doe" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@university.edu" value={form.email} onChange={(e) => update("email", e.target.value)} className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••••" value={form.password} onChange={(e) => update("password", e.target.value)} className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Institution</Label><Input placeholder="MIT, Stanford..." value={form.institution} onChange={(e) => update("institution", e.target.value)} className="bg-secondary/50" /></div>
            <div className="space-y-2"><Label>Research Purpose</Label><Textarea placeholder="Describe your research..." value={form.researchPurpose} onChange={(e) => update("researchPurpose", e.target.value)} className="bg-secondary/50 min-h-[80px]" /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
