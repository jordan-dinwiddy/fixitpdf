'use client'

import { PurchaseCreditsModal } from '@/components/modals/PurchaseCreditsModal'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast'
import { apiClient } from "@/lib/axios"
import { useGetUserInfo } from '@/lib/hooks/useGetUserInfo'
import { useMessageBanners } from '@/lib/hooks/useMessageBanners'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useQueryClient } from "@tanstack/react-query"
import { CreateUserFileRequest, CreateUserFileResponse, CreateUserFileResponseData, PurchaseUserFileResponse, UserFile } from "fixitpdf-shared"
import { CheckCircle2, CreditCard, FileText, HelpCircle, Loader2, LogOut, Upload, User, XCircle } from 'lucide-react'
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { v4 as uuidv4 } from 'uuid'
import { useGetUserFiles } from '../lib/hooks/useGetUserFiles'
import { FileRow } from './FileRow'
import { InsufficientCreditsModal } from './modals/InsufficientCreditsModal'
import { LoginOrSignupModal } from './modals/LoginOrSignupModal'
import { PurchaseFileConfirmationModal } from './modals/PurchaseFileConfirmationModal'
import { WelcomeNewUserModal } from './modals/WelcomeNewUserModal'
import { Badge } from './ui/badge'
import { useTrackEvent } from '@/lib/hooks/useTrackEvent'

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

const buildTempUserFile = (file: File): UserFile => {
  return {
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
}

interface ToastMessage {
  success: boolean;
  message: string;
}

/**
 * The main thing. 
 * 
 * @returns 
 */
export default function App() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast()

  const { data: session, status: sessionStatus } = useSession();
  const [fileToPurchase, setFileToPurchase] = useState<UserFile | null>(null);
  const [filesPollingEnabled, setFilesPollingEnabled] = useState(true);
  const [showLoginOrSignupModal, setShowLoginOrSignupModal] = useState(false);
  const [showPurchaseCreditsModal, setShowPurchaseCreditsModal] = useState(false);
  const [showInsufficientCreditsModal, setShowInsufficientCreditsModal] = useState(false);
  const { data: files, isLoading: isFilesLoading, isError: isFilesError } = useGetUserFiles({
    enabled: !!session && filesPollingEnabled,
    refreshInterval: 5000,
  });

  const { data: userInfo } = useGetUserInfo({
    enabled: !!session,
    refreshInterval: 30000,
  });

  const { isBannerVisible, ackBanner } = useMessageBanners({ enabled: !!session });

  const trackEvent = useTrackEvent();
  
  const showSignInOrSignUp = useCallback(() => {
    setShowLoginOrSignupModal(true);

    trackEvent({
      action: 'shown-signin-signup',
      category: 'auth',
      label: 'Shown Signin Signup',
    });
  }, [trackEvent]);

  const showToast = useCallback((ToastMessage: ToastMessage) => {
    toast({
      description: (
        <div className="flex items-center gap-2">
          {ToastMessage.success ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-700" />
          )}
          <span className={`${ToastMessage.success ? "text-green-600" : "text-red-700"} font-semibold`}>
            {ToastMessage.message}
          </span>
        </div>
      ),
      className: "border-none",
    });
  }, [toast]);

  // Support the ?payment=success|failure query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const paymentStatus = queryParams.get("payment");

    if (paymentStatus) {
      if (paymentStatus === "success") {
        showToast({
          success: true,
          message: "Payment successful! Your credits have been added to your account.",
        });
      } else if (paymentStatus === "cancelled") {
        setShowPurchaseCreditsModal(true);
      }

      // Remove the 'payment' query parameter
      queryParams.delete("payment");
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
      router.replace(newUrl);
    }
  }, [router, showToast]);

  const optimisticFileCreation = useCallback((file: File) => {
    const newUserFile: UserFile = buildTempUserFile(file);

    // Optimistically update cache
    queryClient.setQueryData<UserFile[]>(
      ['userFiles'],
      (old?: UserFile[]) => [newUserFile, ...(old || [])]
    );
  }, [queryClient]);

  /**
   * Delete a file and refresh.
   */
  const deleteFile = useCallback(async (file: UserFile) => {
    await apiClient.delete(`/api/user/files/${file.id}`);
    queryClient.invalidateQueries({ queryKey: ['userFiles'] });

    trackEvent({
      action: 'delete-file',
      category: 'files',
      label: 'Delete File',
    });
  }, [queryClient, trackEvent]);

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

    trackEvent({
      action: 'dropzone-dropped-file',
      category: 'files',
      label: 'Dropzone Drop File',
    });

    // User must be logged in to upload files
    if (!session) {
      showSignInOrSignUp();
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
  }, [optimisticFileCreation, queryClient, session, showSignInOrSignUp, trackEvent]);

  const handleDropZoneClick = useCallback((event: React.MouseEvent) => {
    trackEvent({
      action: 'dropzone-clicked',
      category: 'files',
      label: 'Dropzone Clicked',
    });

    if (!session) {
      showSignInOrSignUp();
      event.preventDefault(); // Prevent opening file picker
    }
  }, [showSignInOrSignUp, session, trackEvent]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: !session,  // Disable click opening file picker if not logged in
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true
  });

  const purchaseFile = useCallback(async (file: UserFile): Promise<boolean> => {
    const { data } = await apiClient.post<PurchaseUserFileResponse>(`/api/user/files/${file.id}/purchase`);

    if (!data.success) {
      showToast({
        success: false,
        message: `Unable to fix file. Please try again.`,
      });
      console.error('Error purchasing file:', data.error);
      return false;
    }

    // Block for a few seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    queryClient.invalidateQueries({ queryKey: ['userInfo'] });    // To update credit balance
    queryClient.invalidateQueries({ queryKey: ['userFiles'] });

    trackEvent({
      action: 'purchased-file',
      category: 'files',
      label: 'Purchase File',
    });

    showToast({
      success: true,
      message: `${file.issueCount} issues fixed! Your file is ready for download.`,
    });

    return true;
  }, [queryClient, showToast, trackEvent]);

  const handleFileFix = useCallback(async (file: UserFile) => {
    const creditBalance = userInfo?.creditBalance || 0;

    if (creditBalance >= file.costInCredits!) {
      setFileToPurchase(file);

      trackEvent({
        action: 'prompted-purchase-file',
        category: 'files',
        label: 'Prompted Purchase File',
      });
    } else {
      setShowInsufficientCreditsModal(true);

      trackEvent({
        action: 'shown-insufficient-credits',
        category: 'files',
        label: 'Shown Insufficient Credits',
      });
    }
  }, [userInfo, trackEvent]);

  // When user clicks on the Buy Credits button
  const handleBuyCredits = useCallback(() => {
    setShowPurchaseCreditsModal(true);

    trackEvent({
      action: 'clicked-buy-credits',
      category: 'credits',
      label: 'Clicked Buy Credits',
    });
  }, [trackEvent]);

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
            {userInfo ? (
              <Badge
                variant="secondary"
                className="text-sm rounded-2xl truncate cursor-pointer bg-white hover:bg-white backdrop-blur-sm font-semibold"
                onClick={handleBuyCredits}
              >
                {userInfo?.creditBalance} credits
              </Badge>
            ) : null}
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
                <DropdownMenuItem className="cursor-pointer" onClick={handleBuyCredits}>
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
            <Button
              onClick={showSignInOrSignUp}
              variant="ghost"
              className="bg-white text-purple-600 hover:shadow-lg hover:text-purple-600 hover:bg-white">
              Sign In
            </Button>
          </div>
        )}

      </header>

      <main className="max-w-7xl mx-auto py-6 px-2 sm:px-6">

        <div className="space-y-6">

          {/* Drag and Drop / Upload card */}
          <Card className="border-none shadow-xl transition-all duration-300 rounded-xl sm:hover:shadow-2xl ">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center justify-between text-3xl text-purple-700">
                Upload Your PDF
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-5 h-5 text-purple-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload corrupted PDFs for instant repair</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>
                This tool will attempt to fix and restore your corrupted PDF files (including lost annotations).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 p-4 sm:p-6 sm:pt-0">
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
                    <p className="text-xl font-semibold text-gray-800">Drag and drop PDF files here, or click to select</p>
                }
                <p className="mt-2 text-sm text-gray-500">Supported files: PDF</p>
              </div>
            </CardContent>
          </Card>

          {/* File list card */}
          <Card className="border-none shadow-xl transition-all duration-300 rounded-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Your Files
                <Badge variant="secondary">{files?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-4 sm:p-6 sm:pt-0">
              {isFilesLoading && (
                <div className="flex justify-center text-gray-500">
                  <Loader2 className="animate-spin h-8 w-8 mr-2" />
                </div>
              )}

              {isFilesError && <p className="text-center text-red-500">An error occurred while fetching files</p>}

              {!isFilesLoading && !isFilesError && (!files || files?.length === 0) && (
                <p className="text-center text-gray-500 py-8">No PDFs uploaded yet</p>
              )}

              {!isFilesLoading && !isFilesError && files && files?.length > 0 && (
                <ul className="space-y-4">
                  {files.map(file => <FileRow key={file.id} file={file} onDelete={deleteFile} onFix={handleFileFix} />)}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <PurchaseFileConfirmationModal
        open={!!fileToPurchase}
        onOpenChange={() => { setFileToPurchase(null) }}
        userFile={fileToPurchase}
        onProceed={async () => { return fileToPurchase ? await purchaseFile(fileToPurchase) : false }}
      />

      <LoginOrSignupModal
        open={showLoginOrSignupModal}
        onOpenChange={(open) => { setShowLoginOrSignupModal(open) }}
        mode="login"
      />

      <PurchaseCreditsModal
        open={showPurchaseCreditsModal}
        onOpenChange={(open) => { setShowPurchaseCreditsModal(open) }}
      />

      <InsufficientCreditsModal
        open={showInsufficientCreditsModal}
        onOpenChange={(open) => { setShowInsufficientCreditsModal(open) }}
        onProceed={() => { setShowInsufficientCreditsModal(false); setShowPurchaseCreditsModal(true) }} />

      <WelcomeNewUserModal
        open={isBannerVisible('welcome_new_user')}
        onProceed={() => ackBanner('welcome_new_user')} />
    </div>
  )
}