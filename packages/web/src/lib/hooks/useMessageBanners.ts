import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetUserMessageBannersResponse, MessageBanner } from "fixitpdf-shared";
import { apiClient } from "../axios";

const fetchUserMessageBanners = async (): Promise<MessageBanner[]> => {
  const response = await apiClient.get<GetUserMessageBannersResponse>('/api/user/banners');

  if (!response.data || !response.data.success || !response.data.data) {
    throw new Error('Error retrieving user info');
  }

  return response.data.data;
};

export const useMessageBanners = () => {
  const queryClient = useQueryClient();

  const { data: banners, isLoading, error } = useQuery<MessageBanner[], Error>({
    queryKey: ["banners"],
    queryFn: fetchUserMessageBanners,
  });

  const acknowledgeBannerMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await fetch(
        `/api/user/banners/${id}/ack`,
        { method: "POST" },
      );

      if (!response.ok) throw new Error("Failed to acknowledge banner");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  return {
    banners,
    isBannerVisible: (id: string) => banners?.some((b) => b.id === id && !b.acked) || false,
    ackBanner: acknowledgeBannerMutation.mutate,
    isLoading,
    error,
  }
};