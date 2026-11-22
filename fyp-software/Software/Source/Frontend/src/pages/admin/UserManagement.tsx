import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, UserCheck } from "lucide-react";
import { adminUsersList, adminApproveUser } from "@/lib/api";

const UserManagement = () => {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminUsersList,
  });

  const approveMutation = useMutation({
    mutationFn: adminApproveUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground">Manage platform users and approvals</p>
      </div>

      <div className="gradient-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Name", "Email", "Institution", "Role", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{u.fullName}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.institution || "-"}</td>
                    <td className="px-4 py-3 text-sm capitalize">{u.role}</td>
                    <td className="px-4 py-3">
                      {u.approved ? (
                        <span className="flex items-center gap-1 text-xs text-status-success"><CheckCircle2 className="h-3.5 w-3.5" />Approved</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-status-deploying"><XCircle className="h-3.5 w-3.5" />Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!u.approved && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-status-success hover:text-status-success"
                          onClick={() => approveMutation.mutate(Number(u.id))}
                          disabled={approveMutation.isPending}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && users.length === 0 && <div className="p-8 text-center text-muted-foreground">No users</div>}
      </div>
    </div>
  );
};

export default UserManagement;
