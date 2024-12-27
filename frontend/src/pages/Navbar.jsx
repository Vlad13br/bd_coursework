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

            setAuth({});
            sessionStorage.removeItem("auth");

            navigate("/", { replace: true });
        } catch (err) {
            console.error("Error during logout:", err.response?.data || err.message);
        }
    };

    return (
        <nav>
            <ul className="navbar">
                <li>
                    <Link to="/">Головна</Link>
                </li>

                {!auth?.email && (
                    <li>
                        <Link to="/login">Логін</Link>
                    </li>
                )}

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
