import { Link, useNavigate } from "react-router-dom";
import Exterieur from "../../../assets/Logos/Exterieur.svg"; // Import du SVG extérieur
import RA from "../../../assets/Logos/RA.svg"; // Import du SVG RA
import RoadAddictLogo from "../../../assets/Logos/road-addict-NavBar.svg"; // Import du SVG pour la page Home
import { useAuth } from "../../../contexts/AuthContext";
import css from "./NavPC.module.css";

interface NavPCProps {
  namePage: string;
}

function NavPC(Props: NavPCProps) {
  const { namePage } = Props;
  const { isAuthenticated, handleLogout } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (isAuthenticated()) {
      handleLogout();
      navigate("/home");
    } else {
      navigate("/connexion");
    }
  };

  return (
    <>
      <div className={css.CaleNavPC} />
      <nav className={css.NavPC}>
        <div className={css.ContainerLogNavPC}>
          <div className={css.LogoNavPC}>
            <Link to="/" className={css.LinkLogoNavPC}>
              {/* Conteneur pour les logos animés */}
              <div className={css.logoContainer}>
                <img
                  src={Exterieur}
                  alt="Exterieur"
                  className={css.exterieurImg}
                />
                <img src={RA} alt="RA" className={css.raImg} />
              </div>
            </Link>
          </div>

          <ul className={css.MenuUlPC}>
            <li className={css.MenuLiPC}>
              <Link to="/maps" className={css.MenuLinkPC}>
                Maps
              </Link>
            </li>

            <li className={css.SousNavLiPC}>
              <span className={css.SousNavSpanPC}>Nous ↓</span>

              <ul className={css.SousMenuUlPC}>
                <li className={css.SousMenuLiPC}>
                  <Link to="/contact" className={css.SousMenuLinkPC}>
                    Contact
                  </Link>
                </li>

                <li className={css.SousMenuLiPC}>
                  <Link to="/about" className={css.SousMenuLinkPC}>
                    A Propos
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <div className={css.NamePageNavPC}>
          {/* Afficher le SVG uniquement si namePage est "Home" */}
          {namePage === "Home" ? (
            <img
              src={RoadAddictLogo}
              alt="RoadAddict Logo"
              className={css.logoSvg}
            />
          ) : (
            <h1>{namePage}</h1>
          )}
        </div>

        <div className={css.ContainerLogNavPC}>
          <li className={css.MenuLiPC}>
            <Link to="/dashboard" className={css.MenuLinkPC}>
              Tableau de bord
            </Link>
          </li>

          <li className={`${css.SousNavLiPC} ${css.CompteMenu}`}>
            <span className={css.SousNavSpanPC}>Compte</span>
            <div className={css.SousMenuWrapper}>
              <ul className={css.SousMenuUlPC}>
                <li className={css.SousMenuLiPC}>
                  <Link to="/account" className={css.SousMenuLinkPC}>
                    Mon profil
                  </Link>
                </li>
                <li className={css.SousMenuLiPC}>
                  <button
                    type="button"
                    onClick={handleAuthAction}
                    className={`${css.SousMenuLinkPC} ${css.AuthButton} 
          ${isAuthenticated() ? css.logout : css.login}`}
                  >
                    {isAuthenticated() ? "Déconnexion" : "Connexion"}
                  </button>
                </li>
              </ul>
            </div>
          </li>
        </div>
      </nav>
    </>
  );
}

export default NavPC;
