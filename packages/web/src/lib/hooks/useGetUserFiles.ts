



import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from "../axios";
import { ListUserFilesResponse, UserFile } from 'fixitpdf-shared';

interface UseGetUserFilesParams {
  enabled: boolean;
  refreshInterval?: number;
}

/**
 * Retrieve all files belonging to the current user.
 * 
 * @returns 
 */
const fetchUserFiles = async (): Promise<UserFile[]> => {
  const response = await apiClient.get<ListUserFilesResponse>('/api/user/files');
  return response.data.data || [];
};

/**
 * Retrieve user files..
 * 
 * @param params 
 * @returns 
 */
export const useGetUserFiles = (params: UseGetUserFilesParams): UseQueryResult<UserFile[], Error> => {
  const { enabled, refreshInterval } = params;

  return useQuery<UserFile[], Error>({
    queryKey: ['userFiles'],
    queryFn: fetchUserFiles,
    refetchInterval: refreshInterval,
    enabled,
  });
};



