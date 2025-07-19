import { File } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Eye, Link as LinkIcon, FileIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FileCardProps {
  file: File;
  onPreview: () => void;
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

export default function FileCard({ file, onPreview }: FileCardProps) {
  const { toast } = useToast();

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/file/${file.shareId}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getFileIcon(file.mimeType)}</span>
            <div>
              <h4 className="font-semibold text-gray-900 truncate">
                {file.originalName}
              </h4>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
          <span>{file.views} views</span>
        </div>

        <div className="flex space-x-2">
          <Button
            className="flex-1 bg-primary text-white hover:bg-blue-600"
            size="sm"
            onClick={handleCopyLink}
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPreview}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
