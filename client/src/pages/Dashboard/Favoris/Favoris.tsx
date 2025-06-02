import { useEffect, useRef, useState } from "react";
import defaultVehicleImg from "../../../assets/images/pictures/defaultVehicleImg.png";
import api from "../../../helpers/api";
import { errorToast, successToast } from "../../../services/toast";
import type { Marker, MarkerDetails } from "../../../types/marker";
import styles from "./Favoris.module.css";

interface FavoriteItem extends Marker {
  favoris_id: number;
  label: string;
}

const Favoris: React.FC = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("model");
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectedFavorites, setSelectedFavorites] = useState<number[]>([]);
  const lastScrollY = useRef(0);
  const advertRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!advertRef.current || !headerRef.current) return;

      const advertTop = advertRef.current.getBoundingClientRect().top;
      const headerHeight = headerRef.current.offsetHeight;
      const scrollY = window.scrollY;

      setIsSticky(advertTop < -headerHeight);
      setIsVisible(scrollY > lastScrollY.current || advertTop >= 0);
      lastScrollY.current = scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get("/api/users/me/favoris");
        // Adapter la réponse pour correspondre à FavoriteItem
        const formattedFavorites: FavoriteItem[] = response.data.map(
          (item: {
            favoris_id: number;
            id: number;
            lat: number;
            lng: number;
            user_id: number;
            label: string;
            details: MarkerDetails;
          }) => ({
            favoris_id: item.favoris_id,
            id: item.id,
            lat: item.lat,
            lng: item.lng,
            coord: [item.lat, item.lng],
            user_id: item.user_id,
            label: item.label,
            details: item.details,
          }),
        );

        setFavorites(formattedFavorites);
      } catch (error) {
        console.error("Erreur lors de la récupération des favoris:", error);
        errorToast("Erreur lors de la récupération des favoris.");
      }
    };

    fetchFavorites();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilter(event.target.value);
  };

  const toggleSelectFavorite = (id: number) => {
    setSelectedFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id],
    );
  };

  const deleteSelectedFavorites = async () => {
    try {
      // Créer un tableau de promesses pour toutes les suppressions
      const deletePromises = selectedFavorites.map(async (favorisId) => {
        try {
          await api.delete(`/api/favoris/${favorisId}`);
          return { success: true, id: favorisId };
        } catch (error) {
          console.error(
            `Erreur lors de la suppression du favori ${favorisId}:`,
            error,
          );
          return { success: false, id: favorisId };
        }
      });

      // Attendre que toutes les suppressions soient terminées
      const results = await Promise.all(deletePromises);

      // Vérifier si toutes les suppressions ont réussi
      const allSuccess = results.every((result) => result.success);

      if (allSuccess) {
        // Mettre à jour l'état local
        setFavorites((prev) =>
          prev.filter((fav) => !selectedFavorites.includes(fav.favoris_id)),
        );
        successToast("Favoris supprimés avec succès !");
        setSelectedFavorites([]);
      } else {
        errorToast("Certains favoris n'ont pas pu être supprimés");
      }
    } catch (error) {
      console.error("Erreur globale lors de la suppression:", error);
      errorToast("Erreur lors de la suppression des favoris");
    }
  };

  return (
    <div ref={advertRef} className={styles.container}>
      <div
        ref={headerRef}
        className={`${styles.stickyHeader} ${
          isSticky ? styles.fixed : ""
        } ${isVisible ? "" : styles.hidden}`}
      >
        <h2 className={styles.title}>Annonces Favorites</h2>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={handleSearch}
            className={styles.input}
          />
          <select
            value={selectedFilter}
            onChange={handleFilterChange}
            className={styles.dropdown}
          >
            <option value="eventType">Type</option>
            <option value="brand">Marque</option>
            <option value="model">Modèle</option>
            <option value="year">Année</option>
            <option value="address">Adresse</option>
          </select>

          <button type="button" className={styles.searchButton}>
            Rechercher
          </button>
          <button
            type="button"
            className={`${styles.deleteButton} ${
              selectedFavorites.length > 0 ? styles.active : ""
            }`}
            onClick={deleteSelectedFavorites}
            disabled={selectedFavorites.length === 0}
          >
            Supprimer la sélection
          </button>
        </div>
      </div>

      <div className={styles.favoriteList}>
        {favorites.length > 0 ? (
          favorites
            .filter(
              (fav) =>
                fav.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                fav.details?.[selectedFilter as keyof MarkerDetails]
                  ?.toString()
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()),
            )

            .map((fav) => (
              <div
                key={`${fav.favoris_id}-${fav.id}`}
                className={styles.advertCard}
              >
                <input
                  type="checkbox"
                  checked={selectedFavorites.includes(fav.favoris_id)} // Utilisez favoris_id ici
                  onChange={() => toggleSelectFavorite(fav.favoris_id)} // ici aussi nouveau système
                  className={styles.checkbox}
                />

                <img
                  src={defaultVehicleImg}
                  alt="miniature par défaut"
                  className={styles.picture}
                />

                <div className={styles.vehicledetails}>
                  <p>
                    <strong>Label:&nbsp;</strong> {fav.label}
                  </p>
                  <p>
                    <strong>Type:&nbsp;</strong> {fav.details?.eventType}
                  </p>
                  <p>
                    <strong>Marque:&nbsp;</strong> {fav.details?.brand}
                  </p>
                  <p>
                    <strong>Modèle:&nbsp;</strong> {fav.details?.model}
                  </p>
                  <p>
                    <strong>Année:&nbsp;</strong> {fav.details?.year}
                  </p>
                  <p className={styles.locationText}>
                    <strong>Adresse:&nbsp;</strong>{" "}
                    {fav.details?.address?.toUpperCase()}
                  </p>
                  <p>
                    <strong>Date:&nbsp;</strong> {fav.details?.date}
                  </p>
                </div>
              </div>
            ))
        ) : (
          <p>Aucun favori trouvé.</p>
        )}
      </div>
    </div>
  );
};

export default Favoris;
