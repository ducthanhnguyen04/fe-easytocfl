
import { createContext, useContext, useState, useEffect } from "react";
import { showToast } from "../utils/toast";
import beUrl from "../api-url/api-backend";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await fetch(`${beUrl}/auth/check`, {
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

    // Heartbeat to track user daily study time (streak)
    useEffect(() => {
        if (!user) return;

        let isWindowFocused = true;

        const handleFocus = () => { isWindowFocused = true; };
        const handleBlur = () => { isWindowFocused = false; };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        const interval = setInterval(async () => {
            if (!isWindowFocused) return;

            try {
                const getLocalDateString = () => {
                    const d = new Date();
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const date = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${date}`;
                };

                const localDate = getLocalDateString();
                const res = await fetch(`${beUrl}/users/streak-heartbeat`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        duration: 30,
                        localDate
                    }),
                    credentials: "include",
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(prev => {
                        if (!prev) return prev;
                        if (prev.streakCount === data.streakCount && prev.studyTimeToday === data.studyTimeToday) {
                            return prev;
                        }

                        // Check if the streak has just been completed today
                        const wasCompletedJustNow = prev.lastStudyDate !== localDate && data.lastStudyDate === localDate;
                        if (wasCompletedJustNow) {
                            showToast(`🔥 Tuyệt vời! Bạn đã hoàn thành chuỗi học tập ${data.streakCount} ngày!`, 'success');
                        }

                        return {
                            ...prev,
                            streakCount: data.streakCount,
                            studyTimeToday: data.studyTimeToday,
                            lastStudyDate: data.lastStudyDate,
                        };
                    });
                }
            } catch (err) {
                console.error("Heartbeat sync error:", err);
            }
        }, 30000);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, [user?.id]);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);