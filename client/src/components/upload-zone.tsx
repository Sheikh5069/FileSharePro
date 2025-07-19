import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { Cloud, Upload, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UploadFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  result?: any;
}

interface UploadZoneProps {
  onUploadComplete: () => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json();
    },
    onSuccess: (data, file) => {
      setUploadFiles(prev =>
        prev.map(uf =>
          uf.file === file
            ? { ...uf, status: "complete", progress: 100, result: data }
            : uf
        )
      );
      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      });
      onUploadComplete();
    },
    onError: (error, file) => {
      setUploadFiles(prev =>
        prev.map(uf =>
          uf.file === file ? { ...uf, status: "error", progress: 0 } : uf
        )
      );
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploadFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: "pending" as const,
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);

    // Start uploads
    newUploadFiles.forEach(uploadFile => {
      setUploadFiles(prev =>
        prev.map(uf =>
          uf.file === uploadFile.file
            ? { ...uf, status: "uploading", progress: 50 }
            : uf
        )
      );
      uploadMutation.mutate(uploadFile.file);
    });
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "application/zip": [".zip"],
      "application/x-rar-compressed": [".rar"],
      "text/plain": [".txt"],
      "text/csv": [".csv"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true,
  });

  const removeFile = (fileToRemove: File) => {
    setUploadFiles(prev => prev.filter(uf => uf.file !== fileToRemove));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const copyShareLink = async (shareId: string) => {
    const url = `${window.location.origin}/file/${shareId}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  return (
    <div>
      {/* Upload Drop Zone */}
      <div
        {...getRootProps()}
        className={`bg-white rounded-xl shadow-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-blue-50"
            : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        <div className="max-w-md mx-auto">
          <Cloud className="text-4xl text-gray-400 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isDragActive
              ? "Drop files here..."
              : "Drop files here or click to upload"}
          </h3>
          <p className="text-gray-500 mb-6">
            Supports JPG, PNG, PDF, DOC, XLS, PPT and more (Max 100MB per file)
          </p>
          <Button
            type="button"
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Choose Files
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            {uploadFiles.some(uf => uf.status === "uploading")
              ? "Uploading Files..."
              : "Upload Results"}
          </h4>
          <div className="space-y-4">
            {uploadFiles.map((uploadFile, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b last:border-b-0"
              >
                <div className="flex items-center flex-1">
                  <div className="mr-3">
                    {uploadFile.status === "complete" && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {uploadFile.status === "uploading" && (
                      <Upload className="w-5 h-5 text-blue-500" />
                    )}
                    {uploadFile.status === "error" && (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                    {uploadFile.status === "pending" && (
                      <Cloud className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {uploadFile.status === "uploading" && (
                    <div className="flex items-center space-x-2">
                      <Progress value={uploadFile.progress} className="w-32" />
                      <span className="text-sm text-gray-600">
                        {uploadFile.progress}%
                      </span>
                    </div>
                  )}

                  {uploadFile.status === "complete" && uploadFile.result && (
                    <Button
                      size="sm"
                      onClick={() => copyShareLink(uploadFile.result.shareId)}
                    >
                      Copy Link
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadFile.file)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
