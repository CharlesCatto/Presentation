import facebook from "../../assets/images/social/facebook.png";
import instagram from "../../assets/images/social/instagram.png";
import linkedin from "../../assets/images/social/linkedin.png";
import twitter from "../../assets/images/social/twitter.png";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.sectionFooter}>
      <section className={styles.footer}>
        <div className={styles.containerIcon}>
          <a href="_" aria-label="Instagram">
            <img
              src={instagram}
              alt="Icône Instagram"
              className={styles.socialIcon}
            />
          </a>
          <a href="_" aria-label="Facebook">
            <img
              src={facebook}
              alt="Icône Facebook"
              className={styles.socialIcon}
            />
          </a>
          <a href="_" aria-label="LinkedIn">
            <img
              src={linkedin}
              alt="Icône LinkedIn"
              className={styles.socialIcon}
            />
          </a>
          <a href="_" aria-label="Twitter">
            <img
              src={twitter}
              alt="Icône Twitter"
              className={styles.socialIcon}
            />
          </a>
        </div>
        <p className={styles.creators}>Mentions légales - Road-Addict @2025</p>
      </section>
    </footer>
  );
}

export default Footer;
