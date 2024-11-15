/**
 * UserFile type.
 */
export interface UserFile {
  id: string;
  name: string;
  fileType: string;
  state: string;
  issueCount: number;

  // These fields are populated by processor. Until then they're null;
  originalFileSizeBytes: number | null;
  processedFileSizeBytes?: number | null;
  costInCredits?: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface BaseApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Request payload to POST /api/user/files
 */
export interface CreateUserFileRequest {
  fileName: string;
  fileType: string;
}

export interface CreateUserFileResponseData { 
  file: UserFile;
  uploadUrl: string;
}

export type CreateUserFileResponse = BaseApiResponse<CreateUserFileResponseData>;

export type DeleteUserFileResponse = BaseApiResponse<void>;

export type ListUserFilesResponse = BaseApiResponse<UserFile[]>;

export type PurchaseUserFileResponse = BaseApiResponse<void>;

export type ProcessUserFileResponse = BaseApiResponse<void>;

export interface UserFileDownloadResponseData {
  downloadUrl: string;
}

export type UserFileDownloadResponse = BaseApiResponse<UserFileDownloadResponseData>;