import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const storedAuth = sessionStorage.getItem("auth");
        return storedAuth ? JSON.parse(storedAuth) : {};
    });


    const updateAuthStatus = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/session', { withCredentials: true });
            if (response.data.user) {
                setAuth(response.data.user);
            } else {
                setAuth({});
            }
        } catch (err) {
            console.error(err);
            setAuth({});
        }
    };

    useEffect(() => {
        updateAuthStatus(); // Перевіряємо статус авторизації при завантаженні
    }, []);

    useEffect(() => {
        if (Object.keys(auth).length > 0) {
            sessionStorage.setItem("auth", JSON.stringify(auth)); // Зберігаємо інформацію про користувача в sessionStorage
        } else {
            sessionStorage.removeItem("auth"); // Якщо користувач вийшов з системи, видаляємо збережені дані
        }
    }, [auth]);

    return (
        <AuthContext.Provider value={{ auth, setAuth, updateAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
