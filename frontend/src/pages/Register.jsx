import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/auth.module.css";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
    const errRef = useRef();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(password));
    }, [password]);

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(email));
    }, [email]);

    useEffect(() => {
        setErrMsg('');
    }, [email, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValidForm = PWD_REGEX.test(password) && EMAIL_REGEX.test(email);
        if (!isValidForm) {
            setErrMsg("Invalid data");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/api/register", {
                name: firstName,
                surname: lastName,
                email,
                password,
                address,
                phone,
            }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            console.log(response.data);
            setSuccess(true);
            navigate('/login');
            setFirstName('');
            setLastName('');
            setEmail('');
            setPassword('');
            setAddress('');
            setPhone('');
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No response from server');
            } else if (err.response?.status === 400) {
                setErrMsg('Invalid data, please check your input');
            } else if (err.response?.status === 409) {
                setErrMsg('User with this email already exists');
            } else {
                setErrMsg('Registration failed');
            }
            errRef.current.focus();
        }
    };

    return (
        <>
            {success ? (
                <section className={styles.section}>
                    <h1>Success!</h1>
                    <p>
                        <Link to="/login" className={styles.line}>Login</Link>
                    </p>
                </section>
            ) : (
                <section className={styles.section}>
                    <p ref={errRef} className={errMsg ? styles.errmsg : styles.offscreen} aria-live="assertive">{errMsg}</p>
                    <h1>Registration</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="firstName" className={styles.label}>Name:</label>
                        <input
                            type="text"
                            id="firstName"
                            autoComplete="off"
                            onChange={(e) => setFirstName(e.target.value)}
                            value={firstName}
                            required
                            className={styles.input}
                        />

                        <label htmlFor="lastName" className={styles.label}>Surname:</label>
                        <input
                            type="text"
                            id="lastName"
                            autoComplete="off"
                            onChange={(e) => setLastName(e.target.value)}
                            value={lastName}
                            required
                            className={styles.input}
                        />

                        <label htmlFor="password" className={styles.label}>
                            Password:
                            <FontAwesomeIcon icon={faCheck} className={validPwd ? styles.valid : styles.hide} />
                            <FontAwesomeIcon icon={faTimes} className={validPwd || !password ? styles.hide : styles.invalid} />
                        </label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                            aria-invalid={validPwd ? "false" : "true"}
                            aria-describedby="pwdnote"
                            onFocus={() => setPwdFocus(true)}
                            onBlur={() => setPwdFocus(false)}
                            className={styles.input}
                        />
                        <p id="pwdnote" className={pwdFocus && !validPwd ? styles.instructions : styles.offscreen}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            8 to 24 characters.<br />
                            Must contain uppercase and lowercase letters, a number, and a special character.<br />
                            Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                        </p>

                        <label htmlFor="email" className={styles.label}>
                            Email:
                            <FontAwesomeIcon icon={faCheck} className={validEmail ? styles.valid : styles.hide} />
                            <FontAwesomeIcon icon={faTimes} className={validEmail || !email ? styles.hide : styles.invalid} />
                        </label>
                        <input
                            type="email"
                            id="email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                            aria-invalid={validEmail ? "false" : "true"}
                            aria-describedby="emailnote"
                            onFocus={() => setEmailFocus(true)}
                            onBlur={() => setEmailFocus(false)}
                            className={styles.input}
                        />
                        <p id="emailnote" className={emailFocus && !validEmail ? styles.instructions : styles.offscreen}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Please enter a valid email address.
                        </p>

                        <label htmlFor="address" className={styles.label}>Address:</label>
                        <input
                            type="text"
                            id="address"
                            onChange={(e) => setAddress(e.target.value)}
                            value={address}
                            required
                            className={styles.input}
                        />

                        <label htmlFor="phone" className={styles.label}>Phone number:</label>
                        <input
                            type="text"
                            id="phone"
                            onChange={(e) => setPhone(e.target.value)}
                            value={phone}
                            required
                            className={styles.input}
                        />

                        <button disabled={!validPwd || !validEmail} className={styles.button}>Register</button>
                    </form>
                    <p>
                        Already registered?<br />
                        <span className={styles.line}>
                            <Link to="/login" className={styles.line}>Login</Link>
                        </span>
                    </p>
                </section>
            )}
        </>
    );
};

export default Register;
