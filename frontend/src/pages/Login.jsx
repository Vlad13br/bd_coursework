import { useRef, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from '../styles/auth.module.css';
import AuthContext from '../components/AuthProvider';

const Login = () => {
    const { setAuth } = useContext(AuthContext);
    const emailRef = useRef();
    const errRef = useRef();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        emailRef.current.focus();
    }, []);

    useEffect(() => {
        setError('');
    }, [email, password]);

    const handleError = (err) => {
        if (!err?.response) {
            return 'No Server Response';
        } else if (err.response?.status === 400) {
            return 'Missing Email or Password';
        } else if (err.response?.status === 401) {
            return 'Unauthorized';
        } else {
            return 'Login Failed';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:3001/api/login",
                { email, password },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );

            const user = response.data.user;

            if (user) {
                setAuth(user);
                setEmail('');
                setPassword('');
                navigate("/");
            } else {
                setError('No user data received');
            }
        } catch (err) {
            const errorMessage = handleError(err);
            setError(errorMessage);
            errRef.current.focus();
        }
    };

    return (
        <section className={styles.section}>
            <p ref={errRef} className={error ? styles.errmsg : styles.offscreen} aria-live="assertive">{error}</p>
            <h1 className={styles.h1}>Sign In</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    ref={emailRef}
                    autoComplete="off"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                    className={styles.input}
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                    className={styles.input}
                />
                <button className={styles.button}>Sign In</button>
            </form>
            <p>
                Need an Account?<br />
                <span className={styles.line}>
                    <Link to="/register">Sign Up</Link>
                </span>
            </p>
        </section>
    );
};

export default Login;
