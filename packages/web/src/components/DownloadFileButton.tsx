import { Button } from "@/components/ui/button"
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

  return (
    <Button
      onClick={() => handleDownload(userFile.id)}
      disabled={isLoading}
      variant="default"
      className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-300"
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
      Download
    </Button>
  );
}