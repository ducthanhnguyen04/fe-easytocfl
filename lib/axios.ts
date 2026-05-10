import axios from 'axios';

const axiosClient = axios.create({
  baseURL: "http://localhost:3008/",
  withCredentials: true, // Để gửi cookie token cho middleware checkSingleDevice
});

axiosClient.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data?.message || err.message)
);

export default axiosClient;