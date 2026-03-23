import { api } from "./api";

export const favoritesService = {
  // Get all user favorites
  getFavorites: () => api.get("/favorite/my"),

  // Add to favorites
  addFavorite: (propertyId: string) => api.post(`/favorite/add/${propertyId}`),

  // Remove from favorites
  removeFavorite: (propertyId: string) =>
    api.delete(`/favorite/remove/${propertyId}`),
};
