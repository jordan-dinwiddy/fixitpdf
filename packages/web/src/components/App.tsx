'use client'

import { PurchaseFileConfirmationDialog } from '@/components/PurchaseFileConfirmationDialog'
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
import { useGetUserInfo } from '@/lib/hooks/useGetUserInfo'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { useQueryClient } from "@tanstack/react-query"
import { CreateUserFileRequest, CreateUserFileResponse, CreateUserFileResponseData, PurchaseUserFileResponse, UserFile } from "fixitpdf-shared"
import { CreditCard, FileText, Loader2, LogOut, Upload, User } from 'lucide-react'
import { signOut, useSession } from "next-auth/react"
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import { useGetUserFiles } from '../lib/hooks/useGetUserFiles'
import { DeleteFileButton } from './DeleteFileButton'
import { DownloadFileButton } from "./DownloadFileButton"
import { FixFileButton } from './FixFileButton'
import { LoginOrSignupDialog } from './LoginOrSignupDialog'
import { PurchaseCreditsDialog } from './PurchaseCreditsDialog'

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
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const [fileToPurchase, setFileToPurchase] = useState<UserFile | null>(null);
  const [filesPollingEnabled, setFilesPollingEnabled] = useState(true);
  const [showLoginOrSignupDialog, setShowLoginOrSignupDialog] = useState(false);
  const [showPurchaseCreditsDialog, setShowPurchaseCreditsDialog] = useState(false);
  const { data: files, isLoading: isFilesLoading, isError: isFilesError } = useGetUserFiles({
    enabled: !!session && filesPollingEnabled,
    refreshInterval: 5000,
  });

  const { data: userInfo } = useGetUserInfo({
    enabled: !!session,
    refreshInterval: 30000,
  });


  /**
   * Delete a file and refresh.
   */
  const deleteFile = useCallback(async (fileId: string) => {
    await apiClient.delete(`/api/user/files/${fileId}`);

    queryClient.invalidateQueries({ queryKey: ['userFiles'] });

  }, [queryClient]);

  const optimisticFileCreation = useCallback((file: File) => {
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

    // User must be logged in to upload files
    if (!session) {
      setShowLoginOrSignupDialog(true);
      return;
    }

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
  }, [optimisticFileCreation, queryClient, session, setShowLoginOrSignupDialog]);

  const handleDropZoneClick = useCallback((event: React.MouseEvent) => {
    if (!session) {
      setShowLoginOrSignupDialog(true);
      event.preventDefault(); // Prevent opening file picker
    }
  }, [setShowLoginOrSignupDialog, session]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: !session,  // Disable click opening file picker if not logged in
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true
  });

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
    queryClient.invalidateQueries({ queryKey: ['userInfo'] });
    queryClient.invalidateQueries({ queryKey: ['userFiles'] });
    return true;
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <header className="flex items-center justify-between p-4">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white p-2">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <span className="text-xl font-bold text-white">FixItPDF</span>
        </div>

        {/* User info */}
        <div>

        </div>
        {sessionStatus === "loading" ? (
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        ) : session ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white">
              {userInfo ? (
                <span>
                  {userInfo?.creditBalance} credits available
                </span>
              ) : null}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 overflow-hidden">
                  {session.user?.image ? (
                    <img src={session.user?.image} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-800" />
                    </div>
                  )}


                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => setShowPurchaseCreditsDialog(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Buy Credits</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowLoginOrSignupDialog(true)} variant="outline" className="bg-white text-purple-600 hover:bg-purple-100">
              Sign In
            </Button>
            <Button onClick={() => setShowLoginOrSignupDialog(true)} className="bg-purple-700 text-white hover:bg-purple-800">
              Sign Up
            </Button>
          </div>
        )}

      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

        <div className="space-y-6">

          {/* Drag and Drop / Upload card */}
          <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center text-purple-700">Upload Your PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps({ onClick: handleDropZoneClick })}
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

          {/* File list card */}
          <Card className="transition-all duration-300 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-purple-700">Your Files ({files?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {isFilesLoading && (
                <div className="flex justify-center text-gray-500">
                  <Loader2 className="animate-spin h-8 w-8 mr-2" />
                </div>
              )}

              {isFilesError && <p className="text-center text-red-500">An error occurred while fetching files</p>}

              {!isFilesLoading && !isFilesError && (!files || files?.length === 0) && (
                <p className="text-center text-gray-500">No PDFs uploaded... yet</p>
              )}

              {!isFilesLoading && !isFilesError && files && files?.length > 0 && (
                <TooltipProvider>
                  <ul className="space-y-4">
                    {files.map((file) => (
                      <li key={file.id} className="flex items-center justify-between p-4 rounded-lg transition-all duration-300 border">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-6 w-6 text-gray-500" />
                          <span className="font-medium text-gray-700 text-sm">{file.name}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Status text */}
                          <div className="flex items-center space-x-2">
                            {file.state === 'uploading' && (
                              <span className="text-gray-500 flex items-center text-sm">
                                <Loader2 className="animate-spin h-4 w-4 mr-2 text-sm" />
                                Uploading...
                              </span>
                            )}
                            {file.state === 'processing' && (
                              <span className="text-blue-500 flex items-center text-sm">
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                Analyzing...
                              </span>
                            )}
                            {file.state === 'processed' && (
                              <span className="text-orange-500 text-sm">
                                {file.issueCount} {file.issueCount === 1 ? 'issue' : 'issues'} found
                              </span>
                            )}
                            {file.state === 'purchased' && (
                              <span className="text-green-500 text-sm">
                                {file.issueCount} {file.issueCount === 1 ? 'issue' : 'issues'} fixed!
                              </span>
                            )}
                            {file.state === 'processing_failed' && (
                              <span className="text-red-500 text-sm">
                                Unable to fix
                              </span>
                            )}
                          </div>


                          { /* File actions */}
                          <div className="flex items-center ">
                            {file.state === 'processed' && file.issueCount > 0 && (
                              <FixFileButton onClick={() => setFileToPurchase(file)} />
                            )}
                            {file.state === 'purchased' && (
                              <DownloadFileButton userFile={file} />
                            )}
                            <DeleteFileButton onClick={() => deleteFile(file.id)} />
                          </div>
                        </div>

                      </li>
                    ))}
                  </ul>
                </TooltipProvider>
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

      <LoginOrSignupDialog
        open={showLoginOrSignupDialog}
        onOpenChange={(open) => { setShowLoginOrSignupDialog(open) }}
        mode="login"
      />

      <PurchaseCreditsDialog
        open={showPurchaseCreditsDialog}
        onOpenChange={(open) => { setShowPurchaseCreditsDialog(open) }}
        />
    </div>
  )
}