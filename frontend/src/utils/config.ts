export const getBackendUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  return import.meta.env.VITE_BACKEND_URL || apiUrl.replace(/\/api(\/v\d+)?$/, "");
};

export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || "http://localhost:3000/api";
};
