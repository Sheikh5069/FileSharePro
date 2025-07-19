import { File } from "@shared/schema";
import { X, Download, Link as LinkIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FilePreviewModalProps {
  file: File;
  onClose: () => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "📋";
  return "📁";
}

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const { toast } = useToast();
  const isImage = file.mimeType.startsWith("image/");

  const handleDownload = () => {
    window.open(`/api/download/${file.shareId}`, "_blank");
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/file/${file.shareId}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{file.originalName}</DialogTitle>
        </DialogHeader>
        
        <div className="text-center">
          {isImage ? (
            <img
              src={`/api/preview/${file.shareId}`}
              alt={file.originalName}
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
            />
          ) : (
            <div className="py-12">
              <span className="text-6xl">{getFileIcon(file.mimeType)}</span>
              <p className="text-gray-500 mt-4">
                Preview not available for this file type. Click download to view the file.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-center space-x-4">
            <Button onClick={handleDownload} className="bg-primary hover:bg-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
