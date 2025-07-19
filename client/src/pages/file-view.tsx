import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { File } from "@shared/schema";
import { Cloud, Download, Eye, ArrowLeft, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "📷";
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "📋";
  return "📁";
}

export default function FileView() {
  const { shareId } = useParams<{ shareId: string }>();

  const { data: file, isLoading, error } = useQuery<File>({
    queryKey: ["/api/files", shareId],
    enabled: !!shareId,
  });

  const handleDownload = () => {
    if (file) {
      window.open(`/api/download/${file.shareId}`, "_blank");
    }
  };

  const handleCopyLink = async () => {
    if (file) {
      const url = `${window.location.origin}/file/${file.shareId}`;
      await navigator.clipboard.writeText(url);
      // Toast would show here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">File Not Found</h1>
            <p className="text-gray-600 mb-6">
              The file you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isImage = file.mimeType.startsWith("image/");

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* File Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-4">{getFileIcon(file.mimeType)}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{file.originalName}</h1>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {file.views} views
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {file.mimeType}
                </Badge>
              </div>
            </div>

            {/* File Preview */}
            <div className="p-6">
              {isImage ? (
                <div className="text-center">
                  <img
                    src={`/api/preview/${file.shareId}`}
                    alt={file.originalName}
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl">{getFileIcon(file.mimeType)}</span>
                  <p className="text-gray-500 mt-4">
                    Preview not available for this file type. Click download to view the file.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-8">
                <Button onClick={handleDownload} size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Download File
                </Button>
                <Button variant="outline" onClick={handleCopyLink} size="lg">
                  <Cloud className="w-5 h-5 mr-2" />
                  Copy Share Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
