import { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const storedAuth = sessionStorage.getItem("auth");
        return storedAuth ? JSON.parse(storedAuth) : {};
    });

    const isUpdating = useRef(false);

    const saveAuthToSession = (authData) => {
        if (Object.keys(authData).length > 0) {
            sessionStorage.setItem("auth", JSON.stringify(authData));
        } else {
            sessionStorage.removeItem("auth");
        }
    };

    const updateAuthStatus = async () => {
        console.log('Render')
        if (isUpdating.current) return;
        isUpdating.current = true;

        try {
            const response = await axios.get('http://localhost:3001/api/session', { withCredentials: true });
            if (response.data.user) {
                setAuth(response.data.user);
            } else {
                setAuth({});
            }
        } catch (err) {
            setAuth({});
        } finally {
            isUpdating.current = false;
        }
    };

    useEffect(() => {
        updateAuthStatus();
    }, []);

    useEffect(() => {
        saveAuthToSession(auth);
    }, [auth]);

    return (
        <AuthContext.Provider value={{ auth, setAuth, updateAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;