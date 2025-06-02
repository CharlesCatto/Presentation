import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Exterieur from "../../../assets/Logos/Exterieur.svg"; // Import du SVG extérieur
import RA from "../../../assets/Logos/RA.svg"; // Import du SVG RA
import RoadAddictLogo from "../../../assets/Logos/road-addict-NavBar.svg"; // Import du SVG pour la page Home
import MenuNavRoot from "../ComponentsNavRoot/MenuNavRoot";
import style from "../ComponentsNavRoot/MenuNavRoot.module.css";
import css from "./NavMobile.module.css";

/*Import des Icons de fermeture du MenuBurger*/
import Closebtn1 from "../../../assets/Icons/CloseBtn1.svg";
import Closebtn2 from "../../../assets/Icons/CloseBtn2.svg";
import Closebtn3 from "../../../assets/Icons/CloseBtn3.svg";

interface NavMobileProps {
  namePage: string;
}

function NavMobile(Props: NavMobileProps) {
  const { namePage } = Props;

  const [active, setActive] = useState(false); /*Open Close MenuBurger*/
  const [count, setCount] = useState(() => Math.floor(Math.random() * 4) + 1);

  useEffect(() => {
    setCount(() => Math.floor(Math.random() * 4) + 1);
  }, []);

  const funcActive = () => {
    setActive(!active);
  };

  return (
    <>
      <nav className={css.NavMobile}>
        {/*lvl 1*/}
        <div className={css.ContainerNavMobile}>
          {/*lvl 2*/}
          <div className={css.LogoNavMobile}>
            {/*lvl 3*/}
            <Link to="/" className={css.LinkLogoNavMobile}>
              {/*lvl 4*/}
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

          {/*lvl 2*/}
          <div className={css.NamePageNavMobile}>
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
        </div>

        {/*lvl 1*/}
        <div className={`${css.sideNav} ${active ? css.active : ""}`}>
          {/*lvl 2*/}
          <div className={css.logCloseBtn}>
            {/*lvl 3*/}
            {count === 1 && (
              <button
                className={css.closeBtnLog1}
                type="button"
                onClick={funcActive}
              >
                x
              </button>
            )}

            {/*lvl 3*/}
            {count === 2 && (
              <button
                className={css.closeBtnLog2}
                type="button"
                onClick={funcActive}
              >
                <img className={css.ImgCloseBtn} src={Closebtn1} alt="" />
              </button>
            )}

            {/*lvl 3*/}
            {count === 3 && (
              <button
                className={css.closeBtnLog2}
                type="button"
                onClick={funcActive}
              >
                <img className={css.ImgCloseBtn} src={Closebtn2} alt="" />
              </button>
            )}

            {/*lvl 3*/}
            {count === 4 && (
              <button
                className={css.closeBtnLog2}
                type="button"
                onClick={funcActive}
              >
                <img className={css.ImgCloseBtn} src={Closebtn3} alt="" />
              </button>
            )}
          </div>

          {/*Le style de ce composant est directement géré par le module CSS :
         MenuNavRoot.module.css*/}
          {/*lvl 2*/}
          <MenuNavRoot
            moduleMenuUl={style.MenuUlMobile}
            moduleMenuLi={style.MenuLiMobile}
            moduleMenuLink={style.MenuLinkMobile}
          />
        </div>

        {/*lvl 1*/}
        <button
          className={`${css.subSideNav} ${active ? css.active : ""}`}
          onClick={funcActive}
          type="button"
        />

        {/*lvl 1*/}
        <button type="button" className={css.openBtn} onClick={funcActive}>
          <span className={css.menuBurger}>
            <span />
            <span />
            <span />
          </span>
        </button>
      </nav>
    </>
  );
}
export default NavMobile;
