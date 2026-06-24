
import { createContext, useContext, useState, useEffect } from "react";
import { showToast } from "../utils/toast";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await fetch("http://localhost:3008/auth/check", {
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("Auth error:", error);
                setUser(null);
                showToast("Mất kết nối tới server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo server backend đang chạy.", "error");
            } finally {
                setLoading(false);
            }
        };

        checkLogin();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);