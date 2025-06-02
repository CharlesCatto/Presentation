import styles from "./NotFound.module.css";

function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.background} />
      <h1 className={styles.title}>404 - Page non trouvée</h1>
      <p className={styles.description}>Oops! L'itinéraire n'existe pas.</p>
      <a href="/" className={styles.link}>
        Retour sur la page Accueil
      </a>
    </div>
  );
}

export default NotFound;
