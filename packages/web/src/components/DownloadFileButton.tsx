import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { apiClient } from "@/lib/axios"
import { UserFile, UserFileDownloadResponse } from "fixitpdf-shared"
import { Download, Loader2 } from 'lucide-react'
import { useState } from "react"


interface DownloadFileButtonProps {
  userFile: UserFile
}

/**
 * Trigger the download. 
 * @param url 
 */
const triggerFileDownload = (url: string) => {
  // Trigger the file download
  const link = document.createElement('a');
  link.href = url;
  link.download = 'test.pdf';
  link.click();
};

/**
 * Generate the download URL for a given file. 
 * 
 * @param fileId 
 * @returns downloadUrl (only if download is allowed)
 */
const generateDownloadUrl = async (fileId: string): Promise<string> => {
  const { data } = await apiClient.post<UserFileDownloadResponse>(`/api/user/files/${fileId}/download`);

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data?.downloadUrl || '';
};

/**
 * Renders a button to download a file.
 * 
 * @param param0 
 * @returns 
 */
export const DownloadFileButton: React.FC<DownloadFileButtonProps> = ({ userFile }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async (fileId: string) => {
    setIsLoading(true);

    try {
      const downloadUrl = await generateDownloadUrl(fileId);

      triggerFileDownload(downloadUrl);
    } catch (error) {
      console.error('Error generating download URL:', error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  // For Tooltips to work, we need to wrap the component in a TooltipProvider at a higher level
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => handleDownload(userFile.id)}
          disabled={isLoading}
          variant="ghost"
          size="icon"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Download</p>
      </TooltipContent>
    </Tooltip>
  );
}