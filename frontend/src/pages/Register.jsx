import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import styles from "../styles/auth.module.css";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const Register = () => {
    const errRef = useRef();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      address: "",
      phone: "",
    });

    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(formData.password));
    }, [formData.password]);

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(formData.email));
    }, [formData.email]);

    useEffect(() => {
        setErrMsg('');
    }, [formData.email, formData.password]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validPwd || !validEmail) {
            setErrMsg("Невірні дані");
            return;
        }

        try {
            await axios.post(`${API_URL}/api/register`, {
                name: formData.firstName,
                surname: formData.lastName,
                email: formData.email,
                password: formData.password,
                address: formData.address,
                phone: formData.phone,
            }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            navigate('/login');
            setFormData({
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              address: "",
              phone: "",
            });
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No response from server');
            } else if (err.response?.status === 400) {
                const errors = err.response.data.errors;
                setErrMsg(errors.join(', '));
            } else if (err.response?.status === 409) {
                setErrMsg('User with this email already exists');
            } else {
                setErrMsg('Registration failed');
            }
            errRef.current.focus();
        }
    };

    return (
        <section className={styles.section}>
            <p ref={errRef} className={errMsg ? styles.errmsg : styles.offscreen} aria-live="assertive">{errMsg}</p>
            <h1>Registration</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="firstName" className={styles.label}>Name:</label>
                <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    autoComplete="off"
                    onChange={handleChange}
                    value={formData.firstName}
                    required
                    className={styles.input}
                />

                <label htmlFor="lastName" className={styles.label}>Surname:</label>
                <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    autoComplete="off"
                    onChange={handleChange}
                    value={formData.lastName}
                    required
                    className={styles.input}
                />

                <label htmlFor="password" className={styles.label}>
                    Password:
                    <FontAwesomeIcon icon={faCheck} className={validPwd ? styles.valid : styles.hide} />
                    <FontAwesomeIcon icon={faTimes} className={validPwd || !formData.password ? styles.hide : styles.invalid} />
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    value={formData.password}
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
                    <FontAwesomeIcon icon={faTimes} className={validEmail || !formData.email ? styles.hide : styles.invalid} />
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    onChange={handleChange}
                    value={formData.email}
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
                    name="address"
                    onChange={handleChange}
                    value={formData.address}
                    required
                    className={styles.input}
                />

                <label htmlFor="phone" className={styles.label}>Phone number:</label>
                <input
                    type="text"
                    id="phone"
                    name="phone"
                    onChange={handleChange}
                    value={formData.phone}
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
    );
};

export default Register;