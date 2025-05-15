import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Check, X, Maximize, Minimize } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DocumentData {
  id: number;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: string;
  feedback?: string;
}

interface PhotoVerificationProps {
  document?: DocumentData;
  isLoading: boolean;
}

export default function PhotoVerification({ 
  document, 
  isLoading 
}: PhotoVerificationProps) {
  const { toast } = useToast();
  const [zoomedPhoto, setZoomedPhoto] = useState(false);
  
  const updateDocumentStatusMutation = useMutation({
    mutationFn: async ({ id, status, feedback }: { id: number, status: string, feedback?: string }) => {
      const res = await apiRequest("PATCH", `/api/document/${id}`, { status, feedback });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Photo status updated",
        description: "The photo status has been updated successfully",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-submissions'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update photo status",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="h-5 w-32 bg-muted rounded mb-3"></div>
            <div className="border border-muted rounded-lg overflow-hidden h-80 bg-muted"></div>
            
            <div className="mt-4">
              <div className="h-4 w-40 bg-muted rounded mb-2"></div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Array(4).fill(null).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-4 w-16 bg-muted rounded"></div>
                    <div className="h-4 w-20 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="h-5 w-24 bg-muted rounded mb-3"></div>
            <div className="border border-muted rounded-lg p-4 bg-muted/50 space-y-4">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="flex">
                  <div className="h-5 w-5 bg-muted-foreground/20 rounded-full mr-2"></div>
                  <div className="h-4 w-full bg-muted-foreground/20 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <div className="h-10 w-24 bg-muted rounded"></div>
          <div className="h-10 w-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Photo Found</h3>
        <p className="text-muted-foreground max-w-md">
          The student has not uploaded a graduation photo yet. Please ask them to upload the required document.
        </p>
      </div>
    );
  }
  
  const handleApprove = () => {
    updateDocumentStatusMutation.mutate({
      id: document.id,
      status: "approved"
    });
  };
  
  const handleReject = () => {
    updateDocumentStatusMutation.mutate({
      id: document.id,
      status: "rejected",
      feedback: "Photo doesn't meet the guidelines. Please upload a clear graduation photo with proper attire."
    });
  };
  
  // Format file size in KB or MB
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Placeholder for actual photo, in a real implementation, this would be the URL to the photo
  const photoUrl = `https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500`;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-3">Graduation Photo</h3>
          <div className="border border-border rounded-lg overflow-hidden relative group">
            <img 
              src={photoUrl} 
              alt="Graduation photo" 
              className="w-full h-auto object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity bg-black/40 hover:bg-black/60 text-white"
              onClick={() => setZoomedPhoto(true)}
            >
              <Maximize className="h-4 w-4" />
              <span className="sr-only">Zoom photo</span>
            </Button>
          </div>
          
          <div className="mt-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Photo Details</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Format</dt>
                <dd>{document.mimeType.split('/')[1].toUpperCase()}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Size</dt>
                <dd>{formatFileSize(document.fileSize)}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Dimensions</dt>
                <dd>1200 x 1800 px</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">File Name</dt>
                <dd className="truncate max-w-[180px]">{document.fileName}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-3">Guidelines</h3>
          <div className="border border-border rounded-lg p-4 bg-muted/20">
            <ul className="space-y-3 text-sm">
              <li className="flex">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Formal graduation attire (toga, cap) visible</span>
              </li>
              <li className="flex">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Face clearly visible and centered</span>
              </li>
              <li className="flex">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Plain, solid background</span>
              </li>
              <li className="flex">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Appropriate lighting and sharp focus</span>
              </li>
              <li className="flex">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>Photo dimensions correct (3:4 ratio)</span>
              </li>
              <li className="flex">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span>File size under maximum limit (5 MB)</span>
              </li>
            </ul>
            
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Common Issues</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex">
                  <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <span>Blurry or poor quality images</span>
                </li>
                <li className="flex">
                  <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <span>Improper attire or casual clothing</span>
                </li>
                <li className="flex">
                  <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <span>Distracting backgrounds or objects</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button 
          variant="outline" 
          onClick={handleReject}
          disabled={updateDocumentStatusMutation.isPending}
        >
          <X className="mr-2 h-4 w-4 text-red-500" />
          Reject
        </Button>
        <Button 
          onClick={handleApprove}
          disabled={updateDocumentStatusMutation.isPending}
        >
          <Check className="mr-2 h-4 w-4" />
          Approve
        </Button>
      </div>
      
      {/* Photo zoom dialog */}
      <Dialog open={zoomedPhoto} onOpenChange={setZoomedPhoto}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative">
            <img 
              src={photoUrl} 
              alt="Graduation photo (zoomed)" 
              className="w-full h-auto"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white"
              onClick={() => setZoomedPhoto(false)}
            >
              <Minimize className="h-4 w-4" />
              <span className="sr-only">Close zoom</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
