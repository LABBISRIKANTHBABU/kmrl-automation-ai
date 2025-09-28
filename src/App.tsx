import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import DepartmentUpload from "./components/DepartmentUpload";
import Reports from "./components/Reports";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-blue-600">🚊 KMRL AI Scheduler</h1>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Operations Control Centre
            </span>
          </div>
          <Authenticated>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Admin Portal</span>
              <SignOutButton />
            </div>
          </Authenticated>
        </div>
      </header>

      <main className="flex-1">
        <Authenticated>
          <AuthenticatedApp />
        </Authenticated>
        <Unauthenticated>
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md mx-auto p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
                <p className="text-gray-600">Sign in to access the AI-Driven Train Induction Scheduler</p>
              </div>
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const adminAccess = useQuery(api.admin.checkAdminAccess);
  const initializeAdmin = useMutation(api.admin.initializeAdmin);
  const initializeTrains = useMutation(api.trains.initializeTrains);
  const initializeDepartments = useMutation(api.departments.initializeDepartments);

  useEffect(() => {
    if (adminAccess === null) {
      initializeAdmin().catch(console.error);
    }
  }, [adminAccess, initializeAdmin]);

  useEffect(() => {
    // Initialize sample data
    initializeTrains().catch(console.error);
    initializeDepartments().catch(console.error);
  }, [initializeTrains, initializeDepartments]);

  if (adminAccess === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (adminAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have admin privileges to access this system.</p>
          <p className="text-sm text-gray-500 mt-2">Contact your system administrator for access.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "upload", name: "Department Upload", icon: "📤" },
    { id: "reports", name: "Reports", icon: "📋" },
    { id: "admin", name: "Admin Panel", icon: "⚙️" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border min-h-[70vh]">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "upload" && <DepartmentUpload />}
        {activeTab === "reports" && <Reports />}
        {activeTab === "admin" && <AdminPanel />}
      </div>
    </div>
  );
}
