import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../helpers/api";
import { errorToast, successToast } from "../../services/toast";
import styles from "./Connexion.module.css";
import eyeClosed from "../../assets/Icons/eye-slash.svg";
import eye from "../../assets/Icons/eye.svg";

// Mock des icônes pour les tests
// const eyeClosed = "eye-closed";
// const eye = "eye";

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
  };
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
  };
}

type PasswordStrength = "weak" | "medium" | "strong";

function Connexion() {
  const [isLogin, setIsLogin] = useState(true);
  const [register, setRegister] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstname: "",
    lastname: "",
  });

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength>("weak");
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const checkPasswordStrength = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strengthScore = [
      hasMinLength,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
    ].filter(Boolean).length;

    if (strengthScore >= 4) return "strong";
    if (strengthScore >= 2) return "medium";
    return "weak";
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegister((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (isLogin) {
      setLogin((prev) => ({ ...prev, [name]: value }));
    } else {
      handlePasswordChange(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      if (
        !/^[\w.]+@[\w.]{1,253}(\.[a-zA-Z]{2,63})+$/.test(
          isLogin ? login.email : register.email,
        )
      ) {
        errorToast("Email invalide");
        setErrorMessage("Format d'email incorrect (ex: exemple@domaine.com)");
        return;
      }

      if (!isLogin) {
        if (passwordStrength === "weak") {
          errorToast("Le mot de passe est trop faible");
          setErrorMessage(
            "Le mot de passe doit contenir 8 caractères, une majuscule, un chiffre et un caractère spécial",
          );
          return;
        }

        if (register.password !== register.confirmPassword) {
          errorToast("Les mots de passe ne correspondent pas");
          setErrorMessage("Les mots de passe ne correspondent pas");
          return;
        }
      }

      if (isLogin) {
        const response = await api.post<LoginResponse>("/api/login", login);
        handleLogin(response.data.user);
        successToast(`Bienvenue, ${response.data.user.username} !`);
        setTimeout(() => navigate("/home"), 2000);
      } else {
        await api.post<RegisterResponse>("/api/register", register);
        const loginResponse = await api.post<LoginResponse>("/api/login", {
          email: register.email,
          password: register.password,
        });
        handleLogin(loginResponse.data.user);
        setWelcomeMessage(`Bienvenue, ${loginResponse.data.user.username} !`);
        successToast("Compte créé avec succès !");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      setErrorMessage("Erreur d'authentification");
      errorToast("Email ou mot de passe incorrect");
      console.error("Erreur:", error);
    }
  };

  const toggleForm = () => setIsLogin(!isLogin);
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const passwordsMatch =
    register.password === register.confirmPassword && register.password !== "";

  const PasswordStrengthIndicator = () => (
    <div className={styles.PasswordStrength}>
      <span>Complexité :</span>
      <div className={styles.StrengthBar}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={styles.StrengthSegment}
            style={{
              backgroundColor:
                passwordStrength === "strong" && i <= 3
                  ? "#4CAF50"
                  : passwordStrength === "medium" && i <= 2
                    ? "#FFC107"
                    : i <= 1
                      ? "#F44336"
                      : "#E0E0E0",
            }}
          />
        ))}
      </div>
      <span>
        {passwordStrength === "strong"
          ? "Fort"
          : passwordStrength === "medium"
            ? "Moyen"
            : "Faible"}
      </span>
    </div>
  );

  return (
    <div className={styles.Connexion}>
      {welcomeMessage && (
        <div className={styles.WelcomeMessage}>{welcomeMessage}</div>
      )}
      {errorMessage && (
        <div className={styles.ErrorMessage}>{errorMessage}</div>
      )}

      {isLogin ? (
        <div>
          <h2>Connexion</h2>
          <form onSubmit={handleSubmit} data-testid="login-form">
            <div>
              <label htmlFor="login-email">Email :</label>
              <input
                type="email"
                id="login-email"
                name="email"
                required
                value={login.email}
                onChange={handleChange}
                autoComplete="email"
                data-testid="login-email"
              />
            </div>
            <div>
              <label htmlFor="login-password">Mot de passe :</label>
              <div className={styles.pwdLook}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  name="password"
                  value={login.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className={styles.inputClass}
                  data-testid="login-password"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className={styles.eyes}
                  data-testid="toggle-password-visibility"
                >
                  <img
                    src={showPassword ? eyeClosed : eye}
                    alt="Toggle password visibility"
                  />
                </button>
              </div>
            </div>
            <button
              type="submit"
              className={styles.submit}
              data-testid="login-submit"
            >
              Se connecter
            </button>
          </form>
          <p>
            Pas encore de compte ?{" "}
            <button
              type="button"
              onClick={toggleForm}
              className={styles.toggleForm}
              data-testid="toggle-to-register"
            >
              S'inscrire
            </button>
          </p>
        </div>
      ) : (
        <div>
          <h2>Inscription</h2>
          <form onSubmit={handleSubmit} data-testid="register-form">
            <div>
              <label htmlFor="register-lastname">Nom :</label>
              <input
                type="text"
                id="register-lastname"
                name="lastname"
                required
                value={register.lastname}
                onChange={handleChange}
                autoComplete="family-name"
                data-testid="register-lastname"
              />
            </div>
            <div>
              <label htmlFor="register-firstname">Prénom :</label>
              <input
                type="text"
                id="register-firstname"
                name="firstname"
                required
                value={register.firstname}
                onChange={handleChange}
                autoComplete="given-name"
                data-testid="register-firstname"
              />
            </div>
            <div>
              <label htmlFor="register-username">Pseudo :</label>
              <input
                type="text"
                id="register-username"
                name="username"
                required
                value={register.username}
                onChange={handleChange}
                autoComplete="username"
                data-testid="register-username"
              />
            </div>
            <div>
              <label htmlFor="register-email">Email :</label>
              <input
                // type="email"
                // id="register-email"
                // name="email"
                // required
                // value={register.email}
                // onChange={handleChange}
                // autoComplete="email"
                // data-testid="register-email"
                type="email"
                value={register.email}
                onChange={(e) => {
                  const email = e.target.value;
                  setRegister({ ...register, email });

                  // Validation manuelle + message custom
                  if (!/^[\w.]+@[\w.]{1,253}(\.[a-zA-Z]{2,63})+$/.test(email)) {
                    e.target.setCustomValidity("Format: exemple@domaine.com");
                  } else {
                    e.target.setCustomValidity("");
                  }
                }}
                required
              />
            </div>
            <div>
              <label htmlFor="register-password">Mot de passe :</label>
              <input
                type={showPassword ? "text" : "password"}
                id="register-password"
                name="password"
                required
                value={register.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`${styles.inputClass2} ${
                  passwordsMatch
                    ? styles.PasswordMatch
                    : styles.PasswordMismatch
                }`}
                data-testid="register-password"
              />
              {register.password && <PasswordStrengthIndicator />}
            </div>
            <div>
              <label htmlFor="register-confirm-password">
                Confirmer le mot de passe :
              </label>
              <div className={styles.pwdLook}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="register-confirm-password"
                  name="confirmPassword"
                  required
                  value={register.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className={`${styles.inputClass} ${
                    passwordsMatch
                      ? styles.PasswordMatch
                      : styles.PasswordMismatch
                  }`}
                  data-testid="register-confirm-password"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className={styles.eyes}
                  data-testid="toggle-password-visibility"
                >
                  <img
                    src={showPassword ? eyeClosed : eye}
                    alt="Toggle password visibility"
                  />
                </button>
              </div>
            </div>
            <button
              type="submit"
              className={styles.submit}
              data-testid="register-submit"
            >
              S'inscrire
            </button>
          </form>
          <p>
            Déjà un compte ?{" "}
            <button
              type="button"
              onClick={toggleForm}
              className={styles.toggleForm}
              data-testid="toggle-to-login"
            >
              Se connecter
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

export default Connexion;
