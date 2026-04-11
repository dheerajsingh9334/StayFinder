import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../services/api";

type FavoriteItem = {
  id: string;
  property: { id: string };
};

export const useFavorites = () => {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      try {
        const res = await api.get("/favorite/my?limit=100");
        const items: FavoriteItem[] = res.data?.myFavorites || [];
        const favSet = new Set<string>();
        items.forEach((item) => {
          if (item?.property?.id) favSet.add(item.property.id);
        });
        return favSet;
      } catch (e) {
        return new Set<string>();
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ propertyId, isFavorite }: { propertyId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        return await api.delete(`/favorite/remove/${propertyId}`);
      } else {
        return await api.post(`/favorite/add/${propertyId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};
