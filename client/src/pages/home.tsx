import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { File } from "@shared/schema";
import UploadZone from "@/components/upload-zone";
import FileCard from "@/components/file-card";
import FilePreviewModal from "@/components/file-preview-modal";
import { Cloud, Shield, Zap, LinkIcon } from "lucide-react";

export default function Home() {
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const { data: files = [], refetch } = useQuery<File[]>({
    queryKey: ["/api/files"],
  });

  const recentFiles = files.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Cloud className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-gray-900">FileShare Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Files
              </Link>
              <Link
                href="/admin"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Share Files Securely
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload and share your files with anyone. Supports JPG, PDF, Excel, and more formats with high-quality preservation.
            </p>
          </div>

          <UploadZone onUploadComplete={refetch} />
        </div>

        {/* Recent Uploads */}
        {recentFiles.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Uploads</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onPreview={() => setPreviewFile(file)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="text-primary text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Secure & Private
            </h3>
            <p className="text-gray-600">
              Your files are encrypted and secure. Anonymous uploads with no personal data exposure.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="text-success text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              High Quality
            </h3>
            <p className="text-gray-600">
              Preserve original file quality with fast upload and download speeds for all formats.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="text-warning text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Easy Sharing
            </h3>
            <p className="text-gray-600">
              Generate shareable links instantly. No registration required for downloads.
            </p>
          </div>
        </div>
      </main>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
