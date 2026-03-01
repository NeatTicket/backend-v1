import axiosInstance from "../../../lib/axios";

export const loginUser = async (credentials) => {
    const response = await axiosInstance.post("/auth/login", credentials);
    if (response.data.token) {
        localStorage.setItem("neatTicketToken", response.data.token);
    }
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
};

export const getProfile = async () => {
    const response = await axiosInstance.get("/profile");
    return response.data;
};

export const logoutUser = () => {
    localStorage.removeItem("neatTicketToken");
};
