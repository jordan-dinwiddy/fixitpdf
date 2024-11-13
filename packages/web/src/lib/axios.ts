import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "", // Define your base URL here or use an environment variable
  headers: {
    "Content-Type": "application/json",
  },
});

export { apiClient };