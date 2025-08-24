import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Shield } from "lucide-react";

export default function AdminUserManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const { toast } = useToast();

  const { data: adminUsers = [], isLoading } = useQuery({
    queryKey: ["/api/admin/admin-users"],
  });

  const createAdminMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/admin-users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admin-users"] });
      toast({ title: "Admin user created successfully" });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create admin user", variant: "destructive" });
    },
  });

  const updateAdminMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/admin/admin-users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admin-users"] });
      toast({ title: "Admin user updated successfully" });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update admin user", variant: "destructive" });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/admin-users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admin-users"] });
      toast({ title: "Admin user deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete admin user", variant: "destructive" });
    },
  });

  const handleSubmit = (formData: FormData) => {
    const userData = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role") || "admin",
    };

    if (selectedAdmin) {
      updateAdminMutation.mutate({ id: selectedAdmin.id, ...userData });
    } else {
      createAdminMutation.mutate(userData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-400" />
            Admin Users
          </h2>
          <p className="text-gray-400">Manage administrative users with system access</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => { 
                setSelectedAdmin(null); 
                setDialogOpen(true); 
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Admin User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedAdmin ? "Edit Admin User" : "Create Admin User"}
              </DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={selectedAdmin?.username || ""}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={selectedAdmin?.email || ""}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              {!selectedAdmin && (
                <div>
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="role" className="text-gray-300">Role</Label>
                <select
                  id="role"
                  name="role"
                  defaultValue={selectedAdmin?.role || "admin"}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md px-3 py-2"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                >
                  {selectedAdmin ? "Update" : "Create"} Admin
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Username</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Last Login</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400">
                      Loading admin users...
                    </TableCell>
                  </TableRow>
                ) : adminUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400">
                      No admin users found
                    </TableCell>
                  </TableRow>
                ) : (
                  adminUsers.map((admin: any) => (
                    <TableRow key={admin.id} className="border-gray-700">
                      <TableCell className="text-white font-medium">{admin.username}</TableCell>
                      <TableCell className="text-gray-300">{admin.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            admin.role === 'super_admin' ? 'text-purple-400 border-purple-400' :
                            admin.role === 'admin' ? 'text-red-400 border-red-400' :
                            'text-yellow-400 border-yellow-400'
                          }
                        >
                          {admin.role === 'super_admin' ? 'Super Admin' : 
                           admin.role === 'admin' ? 'Admin' : 'Moderator'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="text-green-400 border-green-400"
                        >
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setDialogOpen(true);
                            }}
                            className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAdminMutation.mutate(admin.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}