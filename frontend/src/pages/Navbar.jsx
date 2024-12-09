import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../components/AuthProvider";
import "../styles/navbar.css";
import axios from "axios";

const Navbar = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();


    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:3001/api/logout",
                {},
                { withCredentials: true }
            );

            // Очищення стану автентифікації
            setAuth({});

            // Перенаправлення на головну сторінку
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Error during logout:", err);
        }
    };

    return (
        <nav>
            <ul className="navbar">
                {/* Головна сторінка */}
                <li>
                    <Link to="/">Головна</Link>
                </li>

                {/* Якщо користувач не авторизований */}
                {!auth?.email && (
                    <li>
                        <Link to="/login">Логін</Link>
                    </li>
                )}

                {/* Якщо користувач є адміністратором */}
                {auth?.role === "admin" && (
                    <>
                        <li>
                            <Link to="/admin">Адмінка</Link>
                        </li>
                        <li>
                            <button onClick={handleLogout}>Вихід</button>
                        </li>
                    </>
                )}

                {/* Якщо користувач авторизований, але не адміністратор */}
                {auth?.email && auth?.role !== "admin" && (
                    <>
                        <li>
                            <Link to="/profile">Профіль</Link>
                        </li>
                        <li>
                            <button onClick={handleLogout}>Вихід</button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
