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

export interface PurchaseOption {
  id: string
  priceId: string;  // Stripe price ID
  credits: number
  price: number
  tagline: string
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

export interface UserInfo {
  id: string;
  email: string;
  creditBalance: number;
}

export interface CreateCheckoutSessionsRequest {
  priceId: string;
}

export interface MessageBanner {
  id: string;
  acked: boolean;
};

export type GetUserInfoResponse = BaseApiResponse<UserInfo>;

export type CreateUserFileResponse = BaseApiResponse<CreateUserFileResponseData>;

export type DeleteUserFileResponse = BaseApiResponse<void>;

export type ListUserFilesResponse = BaseApiResponse<UserFile[]>;

export type PurchaseUserFileResponse = BaseApiResponse<void>;

export type ProcessUserFileResponse = BaseApiResponse<void>;

/**
 * A MessageBanner is a notice that is typically broadcast to users and they can acknowledge it once
 * to dismiss it and not seen it again.
 */
export type GetUserMessageBannersResponse = BaseApiResponse<MessageBanner[]>;

export interface CreateCheckoutSessionsResponseData {
  url: string;
};

export type CreateCheckoutSessionsResponse = BaseApiResponse<CreateCheckoutSessionsResponseData>;

export interface UserFileDownloadResponseData {
  downloadUrl: string;
}

export type UserFileDownloadResponse = BaseApiResponse<UserFileDownloadResponseData>;

export type AckUserMessageBannerResponse = BaseApiResponse<void>;