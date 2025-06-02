import { useEffect, useRef, useState } from "react";
import defaultVehicleImg from "../../../assets/images/pictures/defaultVehicleImg.png";
import { useAuth } from "../../../contexts/AuthContext";
import { useData } from "../../../contexts/DataContext";
import api from "../../../helpers/api";
import { errorToast, successToast } from "../../../services/toast";
import type { VehicleData } from "../../../types/vehicle";
import styles from "./Vehicle.module.css";

function Vehicle() {
  // État pour le véhicule actuellement sélectionné ou en cours d'édition
  const [currentVehicle, setCurrentVehicle] = useState<VehicleData>({
    id: -1,
    vehicle_picture: null,
    type: "voiture",
    status: "indisponible",
    location: "",
    coord: [], // Initialisé comme un tableau vide
    energy: "essence",
    user_id: 0,
    year: 0,
    brand: "",
    model: "",
  });

  // Utilisation des contextes pour accéder aux données globales
  const { vehicles, setVehicles } = useData();
  const { user } = useAuth();

  // États pour gérer la sélection multiple, la recherche, et l'affichage des erreurs
  const [selectedVehicles, setSelectedVehicles] = useState<Set<number>>(
    new Set(),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [vehicleType, setVehicleType] =
    useState<VehicleData["type"]>("voiture");
  const [vehicleEnergy, setVehicleEnergy] =
    useState<VehicleData["energy"]>("essence");
  const [vehicleStatus, setVehicleStatus] =
    useState<VehicleData["status"]>("indisponible");
  // Stockage de la photo avant envoi
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Référence pour gérer le clic en dehors de la modale
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get("/api/users/me/vehicles");
        setVehicles(response.data || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des véhicules:", error);
        setVehicles([]);
      }
    };
    fetchVehicles();
  }, [setVehicles]);

  // Fonction pour obtenir l'ID de l'utilisateur connecté
  const getCurrentUserId = () => {
    if (!user) {
      console.error("User not found in context");
      return null;
    }
    return user.id;
  };

  const MAX_FILE_SIZE = 1048576; // 1 Mo en octets

  // Gestion de l'upload de fichier
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert(
          "L'image est trop volumineuse. Veuillez choisir une image de moins de 1 Mo.",
        );
        return;
      }
      setSelectedFile(file);
      // Crée un URL local pour la prévisualisation
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewImage(localPreviewUrl);
    }
  };

  const validateForm = () => {
    const newErrors = [];

    if (!currentVehicle.brand.trim())
      newErrors.push("Veuillez renseigner la marque.");
    if (!currentVehicle.model.trim())
      newErrors.push("Veuillez renseigner le modèle.");
    if (!currentVehicle.year || Number.isNaN(Number(currentVehicle.year)))
      newErrors.push("Veuillez renseigner une année valide.");
    if (!currentVehicle.location.trim())
      newErrors.push("Veuillez renseigner une grande ville proche.");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Fonction pour ajouter ou mettre à jour un véhicule
  const addOrUpdateVehicle = async () => {
    if (!validateForm()) return;

    const vehicleData = {
      ...currentVehicle,
      type: vehicleType,
      energy: vehicleEnergy,
      status: vehicleStatus,
      user_id: getCurrentUserId(),
    };

    // Vérifie si l'adresse est remplie et récupérer les coordonnées
    if (vehicleData.location.trim()) {
      await getCity(vehicleData.location);
    }

    try {
      let response: { data: { vehicle: VehicleData } };
      if (currentVehicle.id !== -1) {
        response = await api.put(
          `/api/vehicles/${currentVehicle.id}`,
          vehicleData,
        );
      } else {
        response = await api.post("/api/vehicles", vehicleData);
      }
      const updatedVehicle = response.data.vehicle;

      // Mise à jour de l'image si un fichier a été sélectionné
      if (selectedFile) {
        const formData = new FormData();
        formData.append("vehicle_picture", selectedFile);
        const imageResponse = await api.put(
          `/api/vehicles/${updatedVehicle.id}/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        updatedVehicle.vehicle_picture = imageResponse.data.vehicle_picture;
      }

      // Création du marqueur associé au véhicule
      if (currentVehicle.id === -1 && currentVehicle.coord.length === 2) {
        const markerData = {
          lat: currentVehicle.coord[1], // Latitude
          lng: currentVehicle.coord[0], // Longitude
          label: `Type: ${vehicleType}, Date: ${new Date().toISOString().split("T")[0]}`,
          details: {
            eventType: vehicleType,
            date: new Date().toISOString().split("T")[0],
            address: currentVehicle.location,
            brand: currentVehicle.brand,
            model: currentVehicle.model,
            year: currentVehicle.year,
          },
          user_id: getCurrentUserId(),
        };

        await api.post("/api/markers", markerData);
      }

      // Rafraîchissement de la liste des véhicules
      const refreshResponse = await api.get("/api/users/me/vehicles");
      setVehicles(refreshResponse.data || []);

      // Réinitialisation du formulaire
      setCurrentVehicle({
        id: -1,
        vehicle_picture: null,
        type: "voiture",
        status: "indisponible",
        location: "",
        coord: [],
        energy: "essence",
        user_id: 0,
        year: 0,
        brand: "",
        model: "",
      });
      setSelectedFile(null);
      setPreviewImage(null);
      setIsModalOpen(false);
      successToast("Véhicule ajouté avec succès !");
    } catch (error) {
      errorToast("Erreur lors de l'ajout/modification du véhicule");
      console.error("Erreur lors de l'ajout/modification du véhicule:", error);
    }
  };

  // Gestion du clic sur un véhicule pour l'éditer
  const handleVehicleClick = (vehicle: VehicleData) => {
    setCurrentVehicle(vehicle);
    setPreviewImage(null);
    setIsModalOpen(true);
  };

  // Gestion du clic en dehors de la modale pour la fermer
  const handleOutsideClick = (
    event: React.MouseEvent | React.KeyboardEvent,
  ) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setIsModalOpen(false);
    }
  };

  // Suppression des véhicules sélectionnés
  const handleDeleteSelectedVehicle = async () => {
    try {
      for (const vehicleId of selectedVehicles) {
        await api.delete(`/api/vehicles/${vehicleId}`);
      }
      setVehicles((prevVehicles) =>
        prevVehicles.filter((vehicle) => !selectedVehicles.has(vehicle.id)),
      );
      setSelectedVehicles(new Set());
    } catch (error) {
      errorToast("Erreur lors de la suppression des véhicules");
      console.error("Erreur lors de la suppression des véhicules:", error);
    }
  };

  // Gestion de la sélection/désélection des véhicules
  const handleCheckboxChange = (vehicleId: number) => {
    setSelectedVehicles((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(vehicleId)) {
        newSelected.delete(vehicleId);
      } else {
        newSelected.add(vehicleId);
      }
      return newSelected;
    });
  };

  const getCity = async (location: string) => {
    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${location}&limit=1`,
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].geometry.coordinates;
        setCurrentVehicle((prev) => ({
          ...prev,
          coord: [longitude, latitude], // Mettre à jour coord
        }));
        return [longitude, latitude];
      }
      console.error("Aucune coordonnée trouvée pour cette adresse.");
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse :", error);
      return null;
    }
  };

  // Suppression de l'image d'un véhicule
  const handleImageDelete = async () => {
    if (
      currentVehicle &&
      window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")
    ) {
      try {
        await api.delete(`/api/vehicles/${currentVehicle.id}/vehicle-picture`);
        setCurrentVehicle({
          ...currentVehicle,
          vehicle_picture: null,
        });
      } catch (error) {
        console.error("Erreur lors de la suppression de l'image:", error);
      }
    }
  };

  return (
    <div className={styles.box}>
      <h2 className={styles.title}>Mes véhicules</h2>

      <div>
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className={styles.eventWrapper}>
            <button
              type="button"
              className={styles.event}
              onClick={() => handleVehicleClick(vehicle)}
            >
              <img
                className={styles.image}
                alt="pas d'image"
                src={
                  vehicle.vehicle_picture
                    ? `${import.meta.env.VITE_API_URL}${vehicle.vehicle_picture}`
                    : defaultVehicleImg
                }
                style={{ backgroundSize: "cover" }}
              />
              <div className={styles.vehicledetails}>
                <p>
                  <strong>Marque:&nbsp;</strong> {vehicle.brand}
                </p>
                <p>
                  <strong>Modèle:&nbsp;</strong> {vehicle.model}
                </p>
                <p>
                  <strong>Année:&nbsp;</strong> {vehicle.year}
                </p>
                <p className={styles.locationText}>
                  <strong>Ville:&nbsp;</strong> {vehicle.location.toUpperCase()}
                </p>
                <p>
                  <strong>Disponibilité:&nbsp;</strong>
                  {vehicle.status}
                </p>
              </div>
            </button>
            <input
              type="checkbox"
              checked={selectedVehicles.has(vehicle.id)}
              onChange={() => handleCheckboxChange(vehicle.id)}
              className={styles.checkbox}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.deleteButton}
        onClick={handleDeleteSelectedVehicle}
        disabled={selectedVehicles.size === 0}
      >
        Supprimer la sélection
      </button>

      <button
        type="button"
        className={styles.addButton}
        onClick={() => {
          setCurrentVehicle({
            id: -1,
            vehicle_picture: null,
            type: "voiture",
            status: "indisponible",
            location: "",
            coord: [],
            energy: "essence",
            user_id: 0,
            year: 0,
            brand: "",
            model: "",
          });
          setIsModalOpen(true);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="32"
          height="32"
        >
          <title>Ajouter un véhicule</title>
          <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {isModalOpen && (
        <dialog
          className={styles.modalOverlay}
          onClick={handleOutsideClick}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleOutsideClick(e);
          }}
          aria-labelledby="modal-title"
          open
        >
          <div className={styles.modalContent} ref={modalRef}>
            <h3>
              {currentVehicle.id !== -1
                ? "Modifier le véhicule"
                : "Ajouter un véhicule"}
            </h3>
            {errors.map((error) => (
              <p key={error} className={styles.errorMessage}>
                {error}
              </p>
            ))}

            {(previewImage || currentVehicle.vehicle_picture) && (
              <div className={styles.imageContainer}>
                <img
                  src={
                    previewImage
                      ? previewImage
                      : currentVehicle.vehicle_picture
                        ? `${import.meta.env.VITE_API_URL}${
                            currentVehicle.vehicle_picture
                          }`
                        : defaultVehicleImg
                  }
                  alt="Aperçu du véhicule"
                  className={styles.previewImage}
                  onClick={handleImageDelete}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsModalOpen(false);
                    }
                  }}
                  tabIndex={-1}
                />
              </div>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/svg"
              onChange={handleFileUpload}
              className={styles.input}
            />
            <select
              value={vehicleType}
              onChange={(e) =>
                setVehicleType(e.target.value as VehicleData["type"])
              }
              className={styles.input}
            >
              <option value="voiture">Voiture</option>
              <option value="moto">Moto</option>
            </select>
            <input
              type="text"
              value={currentVehicle.brand}
              placeholder="Marque"
              onChange={(e) =>
                setCurrentVehicle((prev) => ({
                  ...prev,
                  brand: e.target.value,
                }))
              }
              className={styles.input}
            />
            <input
              type="text"
              value={currentVehicle.model}
              placeholder="Modèle"
              onChange={(e) =>
                setCurrentVehicle((prev) => ({
                  ...prev,
                  model: e.target.value,
                }))
              }
              className={styles.input}
            />
            <select
              value={vehicleEnergy}
              onChange={(e) =>
                setVehicleEnergy(e.target.value as VehicleData["energy"])
              }
              className={styles.input}
            >
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="electrique">Électrique</option>
            </select>
            <input
              type="number"
              value={currentVehicle.year}
              placeholder="Année de naissance (e.g., 2005)"
              onChange={(e) =>
                setCurrentVehicle((prev) => ({
                  ...prev,
                  year: Number(e.target.value),
                }))
              }
              className={styles.input}
            />
            <input
              type="text"
              value={currentVehicle.location}
              placeholder="Grande ville la plus proche"
              onChange={(e) =>
                setCurrentVehicle((prev) => {
                  getCity(e.target.value);
                  return {
                    ...prev,
                    location: e.target.value,
                  };
                })
              }
              className={styles.input}
            />
            <select
              value={vehicleStatus}
              onChange={(e) =>
                setVehicleStatus(e.target.value as VehicleData["status"])
              }
              className={styles.input}
            >
              <option value="indisponible">Indisponible</option>
              <option value="vente">Vente</option>
              <option value="essai">Essai</option>
            </select>

            <div className={styles.modalButtons}>
              <button
                type="button"
                onClick={addOrUpdateVehicle}
                className={styles.largeButton}
              >
                {currentVehicle.id !== -1 ? "Modifier" : "Ajouter"}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.smallButton}
              >
                Annuler
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default Vehicle;
