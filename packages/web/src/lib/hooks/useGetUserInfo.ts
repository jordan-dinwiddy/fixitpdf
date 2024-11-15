



import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GetUserInfoResponse, UserInfo } from 'fixitpdf-shared';
import { apiClient } from "../axios";

interface UseGetUserInfoParams {
  enabled: boolean;
  refreshInterval?: number;
}

/**
 * Retrieve all files belonging to the current user.
 * 
 * @returns 
 */
const fetchUserInfo = async (): Promise<UserInfo> => {
  const response = await apiClient.get<GetUserInfoResponse>('/api/user');

  if (!response.data || !response.data.success || !response.data.data) {
    throw new Error('Error retrieving user info');
  }

  return response.data.data;
};

/**
 * Retrieve user files..
 * 
 * @param params 
 * @returns 
 */
export const useGetUserInfo = (params: UseGetUserInfoParams): UseQueryResult<UserInfo, Error> => {
  const { enabled, refreshInterval } = params;

  return useQuery<UserInfo, Error>({
    queryKey: ['userInfo'],
    queryFn: fetchUserInfo,
    refetchInterval: refreshInterval,
    enabled,
  });
};



