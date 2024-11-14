/**
 * UserFile type.
 */
export interface UserFile {
  id: string;
  name: string;
  fileType: string;
  state: string;
  issueCount: number;
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

export type ListUserFilesResponse = BaseApiResponse<UserFile[]>;