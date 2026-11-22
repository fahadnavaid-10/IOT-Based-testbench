import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Experiments from "@/pages/Experiments";
import CreateExperiment from "@/pages/CreateExperiment";
import DeploymentProgress from "@/pages/DeploymentProgress";
import MonitorNodes from "@/pages/MonitorNodes";
import SensorData from "@/pages/SensorData";
import DeploymentLogs from "@/pages/DeploymentLogs";
import UserManagement from "@/pages/admin/UserManagement";
import NodeManagement from "@/pages/admin/NodeManagement";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="experiments" element={<Experiments />} />
              <Route path="experiments/create" element={<CreateExperiment />} />
              <Route path="experiments/deploy" element={<DeploymentProgress />} />
              <Route path="nodes" element={<MonitorNodes />} />
              <Route path="sensor-data" element={<SensorData />} />
              <Route path="deployment-logs" element={<DeploymentLogs />} />
              <Route path="admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
              <Route path="admin/nodes" element={<ProtectedRoute requiredRole="admin"><NodeManagement /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
