import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3310",
	withCredentials: true,
});

export default api;
