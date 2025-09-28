import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPanel() {
  const adminUsers = useQuery(api.admin.getAllAdminUsers);
  const currentAdmin = useQuery(api.admin.checkAdminAccess);
  const updateUserRole = useMutation(api.admin.updateUserRole);
  
  const [selectedRole, setSelectedRole] = useState<"admin" | "manager" | "operator">("operator");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  if (!currentAdmin) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have admin privileges to access this panel.</p>
        </div>
      </div>
    );
  }

  if (adminUsers === undefined) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleRoleUpdate = async (userId: string, role: "admin" | "manager" | "operator", department?: string) => {
    try {
      await updateUserRole({
        targetUserId: userId as any,
        role,
        department,
      });
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Role update error:", error);
      toast.error("Failed to update user role");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "text-red-700 bg-red-100";
      case "manager": return "text-blue-700 bg-blue-100";
      case "operator": return "text-green-700 bg-green-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  const departments = [
    "Rolling Stock",
    "Safety",
    "Operations", 
    "Human Resources",
    "Engineering",
    "Coordination"
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h2>
          <p className="text-gray-600">
            Manage user roles and system administration
          </p>
        </div>

        {/* Current Admin Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-blue-600 mr-3">👤</div>
            <div>
              <h3 className="font-semibold text-blue-900">Current Admin</h3>
              <p className="text-sm text-blue-700">
                Role: {currentAdmin.role} | Department: {currentAdmin.department || "All"}
              </p>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                {adminUsers?.length || 0}
              </div>
              <div className="ml-2 text-blue-600">👥</div>
            </div>
            <div className="text-sm text-blue-700">Total Users</div>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-red-600">
                {adminUsers?.filter(u => u.role === "admin").length || 0}
              </div>
              <div className="ml-2 text-red-600">🔑</div>
            </div>
            <div className="text-sm text-red-700">Admins</div>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                {adminUsers?.filter(u => u.role === "manager").length || 0}
              </div>
              <div className="ml-2 text-blue-600">📋</div>
            </div>
            <div className="text-sm text-blue-700">Managers</div>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                {adminUsers?.filter(u => u.role === "operator").length || 0}
              </div>
              <div className="ml-2 text-green-600">⚙️</div>
            </div>
            <div className="text-sm text-green-700">Operators</div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
          
          {adminUsers && adminUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.userId.slice(-8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.department || "All Departments"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {currentAdmin.role === "admin" && user.userId !== currentAdmin.userId && (
                          <div className="flex space-x-2">
                            <select
                              onChange={(e) => {
                                const newRole = e.target.value as "admin" | "manager" | "operator";
                                handleRoleUpdate(user.userId, newRole, user.department);
                              }}
                              className="text-xs px-2 py-1 border border-gray-300 rounded"
                              defaultValue={user.role}
                            >
                              <option value="operator">Operator</option>
                              <option value="manager">Manager</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No users found</p>
          )}
        </div>

        {/* System Information */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Department Structure</h4>
              <div className="space-y-2">
                {departments.map((dept) => (
                  <div key={dept} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-gray-700">{dept}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">System Status</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">AI Processing: Active</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">Database: Connected</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">File Storage: Available</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-700">Authentication: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
