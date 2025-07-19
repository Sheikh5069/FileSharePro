import { Link } from "wouter";
import { Cloud, ArrowLeft } from "lucide-react";
import AdminDashboard from "@/components/admin-dashboard";

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Cloud className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-gray-900">FileShare Pro - Admin</h1>
            </div>
            <Link
              href="/"
              className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard />
      </main>
    </div>
  );
}
