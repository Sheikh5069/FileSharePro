import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { File } from "@shared/schema";
import { Eye, Link as LinkIcon, Trash2, Search, HardDrive, Download, FileIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import FilePreviewModal from "./file-preview-modal";

interface Stats {
  totalFiles: number;
  totalViews: number;
  totalDownloads: number;
  totalSize: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "📋";
  return "📁";
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: files = [] } = useQuery<File[]>({
    queryKey: ["/api/files"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      await apiRequest("DELETE", `/api/admin/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "File deleted",
        description: "The file has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = async (shareId: string) => {
    const url = `${window.location.origin}/file/${shareId}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || 
      (filterType === "images" && file.mimeType.startsWith("image/")) ||
      (filterType === "documents" && (file.mimeType.includes("pdf") || file.mimeType.includes("document") || file.mimeType.includes("word"))) ||
      (filterType === "spreadsheets" && (file.mimeType.includes("excel") || file.mimeType.includes("spreadsheet")));
    
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileIcon className="text-primary text-2xl mr-4" />
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Files</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stats?.totalFiles || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Download className="text-success text-2xl mr-4" />
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Downloads</p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats?.totalDownloads || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <HardDrive className="text-warning text-2xl mr-4" />
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Storage Used</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats ? formatFileSize(stats.totalSize) : "0 Bytes"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="text-purple-500 text-2xl mr-4" />
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Views</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats?.totalViews || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Files Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Files</CardTitle>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="spreadsheets">Spreadsheets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{getFileIcon(file.mimeType)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.originalName}
                            </div>
                            <div className="text-sm text-gray-500">
                              /file/{file.shareId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.downloads}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewFile(file)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(file.shareId)}
                          >
                            <LinkIcon className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{file.originalName}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(file.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

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
