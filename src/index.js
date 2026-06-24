import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import { showToast } from './utils/toast';
import './utils/toast.css';

import { AuthProvider } from "./context/authContext";

// Global Axios response interceptor for connection failure (server offline)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If there is no response from the server, it indicates a network/connection failure
    if (!error.response) {
      showToast(
        "Mất kết nối tới server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo server backend đang chạy.",
        "error"
      );
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

