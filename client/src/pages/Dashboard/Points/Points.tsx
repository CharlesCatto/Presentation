import { useEffect, useState } from "react";
import { useData } from "../../../contexts/DataContext";
import api from "../../../helpers/api";
import { errorToast } from "../../../services/toast";
import styles from "./Points.module.css";

function Points() {
  const { currentUser, setCurrentUser } = useData();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // appel API
    const fetchUser = async () => {
      try {
        const response = await api.get("/api/users/me");
        setCurrentUser(response.data);
      } catch (error) {
        errorToast("Erreur lors de la récupération de l'utilisateur");
        console.error(
          "Erreur lors de la récupération de l'utilisateur:",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [setCurrentUser]);

  if (isLoading) {
    return <div className={styles.chargement}>Chargement...</div>;
  }

  if (!currentUser) {
    return (
      <div>Erreur: Impossible de charger les données de l'utilisateur</div>
    );
  }

  return (
    <div className={styles.pointsContainer}>
      <h2 className={styles.title}>Mes Points</h2>
      <div className={styles.pointsContent}>
        <div className={styles.pointsBox}>
          <p className={styles.pointsLabel}>Solde :</p>
          <p className={styles.pointsValue}>{currentUser.sold}</p>
        </div>
        <button type="button" className={styles.actionButton}>
          Faire un essai
        </button>
        <button type="button" className={styles.actionButton}>
          Trouver un événement
        </button>
        <button type="button" className={styles.actionButton}>
          Dépenser mes points
        </button>
      </div>
    </div>
  );
}

export default Points;
