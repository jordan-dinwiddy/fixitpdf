import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetUserMessageBannersResponse, MessageBanner } from "fixitpdf-shared";
import { apiClient } from "../axios";

interface MutationContext {
  previousBanners?: MessageBanner[];
}

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

  const acknowledgeBannerMutation = useMutation<void, Error, string, MutationContext>({
    mutationFn: async (id) => {
      const response = await fetch(
        `/api/user/banners/${id}/ack`,
        { method: "POST" },
      );

      if (!response.ok) throw new Error("Failed to acknowledge banner");
    },
    onMutate: async (bannerId): Promise<MutationContext> => {
      // Optimistically update the query data
      await queryClient.cancelQueries({ queryKey: ["banners"] });

      const previousBanners = queryClient.getQueryData<MessageBanner[]>(["banners"]);

      queryClient.setQueryData<MessageBanner[]>(["banners"], (old?: MessageBanner[]) =>
        old ? old.map((banner) => banner.id === bannerId ? { ...banner, acked: true } : banner) : []
      );

      return { previousBanners };
    },
    // onError: (err, bannerId, context) => {
    //   // Rollback on error - except it really appears more buggy than helpful
    //   if (context?.previousBanners) {
    //     queryClient.setQueryData(["banners"], context.previousBanners);
    //   }
    // },
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