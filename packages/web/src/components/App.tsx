'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiClient } from "@/lib/axios"
import { useQueryClient } from "@tanstack/react-query"
import { CreateUserFileRequest, CreateUserFileResponse, CreateUserFileResponseData, PurchaseUserFileResponse, UserFile } from "fixitpdf-shared"
import { CreditCard, Download, FileText, Loader, LogOut, Stethoscope, Upload, User } from 'lucide-react'
import { signIn, signOut, useSession } from "next-auth/react"
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import { useGetUserFiles } from '../lib/hooks/useGetUserFiles'
import { PurchaseFileConfirmationDialog } from '@/components/PurchaseFileConfirmationDialog';

interface RequestFileCreationResult {
  file: File,
  response: CreateUserFileResponseData,
};

const startFileProcessing = async (fileId: string): Promise<void> => {
  await apiClient.post(`/api/user/files/${fileId}/process`);
};

const requestFileCreation = async (file: File): Promise<RequestFileCreationResult> => {
  const createFileRequest: CreateUserFileRequest = {
    fileName: file.name,
    fileType: file.type,
  };

  const { data } = await apiClient.post<CreateUserFileResponse>("/api/user/files", createFileRequest);

  if (!data.success || !data.data) {
    throw new Error(data.error || "An error occurred while creating the file");
  }

  return {
    file,
    response: data.data,
  }
};

const uploadFileToS3 = async (requestFileCreationResult: RequestFileCreationResult): Promise<void> => {
  const { file, response: createFileResponse } = requestFileCreationResult;
  await apiClient.put(createFileResponse.uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
};


/**
 * The main thing. 
 * 
 * @returns 
 */
export default function App() {
  const { data: session } = useSession();
  const [fileToPurchase, setFileToPurchase] = useState<UserFile | null>(null);

  const [filesPollingEnabled, setFilesPollingEnabled] = useState(true);
  const { data: files, isLoading: isFilesLoading, isError: isFilesError } = useGetUserFiles({
    enabled: !!session && filesPollingEnabled,
    refreshInterval: 5000,
  });
  const queryClient = useQueryClient();

  /**
   * Delete a file and refresh.
   */
  const deleteFile = useCallback(async (fileId: string) => {
    await apiClient.delete(`/api/user/files/${fileId}`);

    queryClient.invalidateQueries({ queryKey: ['userFiles'] });

  }, [queryClient]);

  const optimisticFileCreation = useCallback((file: File) => {
    // Snapshot previous state for rollback
    const previousFiles = queryClient.getQueryData<UserFile[]>(['userFiles']);
    console.log('previousFiles', previousFiles);

    const newUserFile: UserFile = {
      id: uuidv4(),
      name: file.name,
      fileType: file.type,
      state: 'uploading',
      originalFileSizeBytes: null,
      processedFileSizeBytes: null,
      costInCredits: null,
      issueCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update cache
    queryClient.setQueryData<UserFile[]>(
      ['userFiles'],
      (old?: UserFile[]) => [newUserFile, ...(old || [])]
    );
  }, [queryClient]);

  /**
   * Handle file drop event.
   * 
   * Pay careful attention to the following:
   *  - Because we want the files list to be updated immediately, we pause live refresh and mutate local state first.
   *  - Once we know server state is updated, we re-enable live refresh.
   *  - We then trigger the upload process asynchronously.
   */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const promises: Promise<RequestFileCreationResult>[] = [];

    setFilesPollingEnabled(false);

    acceptedFiles.forEach(file => {
      // Immediately update the client cache
      optimisticFileCreation(file);

      // Request file creation and upload
      promises.push(requestFileCreation(file));
    });

    const fileCreationResults = await Promise.all(promises);

    setFilesPollingEnabled(true);

    // Kick off all uploads async without blocking.
    // TODO: Handle failures (because otherwise the file will get stuck in the 'uploading' state)
    fileCreationResults.forEach(async (fileCreationResult) => {
      await uploadFileToS3(fileCreationResult);
      await startFileProcessing(fileCreationResult.response.file.id);
      queryClient.invalidateQueries({ queryKey: ['userFiles'] });
    });
  }, [optimisticFileCreation, queryClient]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true
  });

  const handleDownload = useCallback((id: string) => {
    // Implement download logic here
    console.log(`Downloading file with id: ${id}`)
  }, []);

  const purchaseFile = useCallback(async (file: UserFile): Promise<boolean> => {
    console.log(`Purchasing file with id: ${file.id}`);

    const { data } = await apiClient.post<PurchaseUserFileResponse>(`/api/user/files/${file.id}/purchase`);

    if (!data.success) {
      console.error('Error purchasing file:', data.error);
      return false;
    }

    // Block for a few seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`File purchased: ${file.id}`);
    queryClient.invalidateQueries({ queryKey: ['userFiles'] });
    return true;
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <header className="bg-white/90 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-purple-600 mr-2" />
              <h1 className="text-3xl font-bold text-purple-700">FixItPDF</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-5 w-5" />
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{session.user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" onClick={() => signIn("google")}>
                  Log in
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center text-purple-700">Upload Your PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-purple-500 bg-purple-100 scale-105' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-purple-500 mb-4" />
                {
                  isDragActive ?
                    <p className="text-xl font-semibold text-purple-700">Drop the PDF files here ...</p> :
                    <p className="text-xl font-semibold text-gray-700">Drag &apos;n&apos; drop PDF files here, or click to select</p>
                }
                <p className="mt-2 text-sm text-gray-500">Supported files: PDF</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-purple-700">Your Files ({files?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isFilesLoading && (
                <div className="flex justify-center text-gray-500">
                  <Loader className="animate-spin h-8 w-8 mr-2" />
                </div>
              )}

              {isFilesError && <p className="text-center text-red-500">An error occurred while fetching files</p>}

              {!isFilesLoading && !isFilesError && files?.length === 0 && (
                <p className="text-center text-gray-500">No PDFs uploaded... yet</p>
              )}

              {!isFilesLoading && !isFilesError && files && files?.length > 0 && (
                <ul className="space-y-4">
                  {files.map((file) => (
                    <li key={file.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg transition-all duration-300 hover:bg-purple-100">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-purple-500" />
                        <span className="font-medium text-gray-700">{file.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {file.state === 'uploading' && (
                          <span className="text-gray-500 flex items-center">
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            Uploading...
                          </span>
                        )}
                        {file.state === 'processing' && (
                          <span className="text-blue-500 flex items-center">
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            Analyzing...
                          </span>
                        )}
                        {file.state === 'processed' && (
                          <>
                            <span className="text-orange-500">
                              Found {file.issueCount} {file.issueCount === 1 ? 'issue' : 'issues'} to fix
                            </span>

                            {file.issueCount > 0 && (
                              <Button
                                onClick={() => setFileToPurchase(file)}
                                variant="outline"
                                className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-300"
                              >
                                Fix!
                              </Button>
                            )}
                          </>
                        )}
                        {file.state === 'fixing' && (
                          <span className="text-blue-500 flex items-center">
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            Fixing...
                          </span>
                        )}
                        {file.state === 'purchased' && (
                          <>
                            <span className="text-green-500">
                              {file.issueCount} {file.issueCount === 1 ? 'issue' : 'issues'} resolved!
                            </span>
                            <Button
                              onClick={() => handleDownload(file.id)}
                              variant="outline"
                              className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-300"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => deleteFile(file.id)}
                          variant="outline"
                          className="bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-300"
                        >
                          X
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <PurchaseFileConfirmationDialog 
        open={!!fileToPurchase} 
        onOpenChange={() => { setFileToPurchase(null) }} 
        userFile={fileToPurchase} 
        onProceed={async () => { return fileToPurchase ? await purchaseFile(fileToPurchase) : false }}
      />
    </div>
  )
}