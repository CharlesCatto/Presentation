import type { LeafletMouseEvent } from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvent,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./leaflet.css";
import DatePicker from "react-datepicker";
import styles from "./Map.module.css";
import "react-datepicker/dist/react-datepicker.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import React from "react";
import MarkerClusterGroup from "react-leaflet-cluster"; // Import MarkerClusterGroup
import pinMapIcon from "../../assets/images/svg/pinMap.svg";
import NavRoot from "../../components/NavRoot/NavRoot"; // Import NavRoot
import { useAuth } from "../../contexts/AuthContext";
import api from "../../helpers/api";
import { errorToast, infoToast, successToast } from "../../services/toast";
import type { Marker as MarkerType } from "../../types/marker";
import axios from "axios";

const customIcon = new L.Icon({
  iconUrl: pinMapIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapsProps {
  center?: [number, number];
  zoom?: number;
}
interface ThemeColors {
  tertiary: string;
  light: string;
  secondary?: string;
}

interface Cluster {
  getChildCount: () => number;
}

const createClusterCustomIcon = (cluster: Cluster): L.DivIcon => {
  const themeColors: ThemeColors = {
    tertiary: "#001524",
    light: "#FFF",
  };

  return L.divIcon({
    html: `<div style="background-color: ${themeColors.tertiary}; color: ${
      themeColors.light
    }; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);">${cluster.getChildCount()}</div>`,
    className: "custom-cluster-icon",
    iconSize: L.point(40, 40, true),
  });
};

const formatPopupHeaderDate = (dateString?: string, isSingleDay = false) => {
  if (!dateString) return "Date non spécifiée";

  if (dateString.includes(" to ")) {
    const [startDate, endDate] = dateString.split(" to ");
    return `Du ${getDayLabel(startDate)} au ${getDayLabel(endDate)}`;
  }

  if (isSingleDay) {
    const day = getDayLabel(dateString).split(" ")[0];
    return `Tous les ${day}`;
  }

  return getDayLabel(dateString);
};

const translateEventType = (eventType: string) => {
  switch (eventType) {
    case "car":
      return "voiture";
    case "motorcycle":
      return "moto";
    case "event":
      return "événement";
    default:
      return eventType; // Si le type n'est pas reconnu, retourner la valeur d'origine
  }
};

const getFormattedDate = (dateString?: string, isSingleDay = false) => {
  if (!dateString) return "Date non spécifiée";

  try {
    if (dateString.includes(" to ")) {
      const [startDate, endDate] = dateString.split(" to ");
      return `Du ${getDayLabel(startDate)} au ${getDayLabel(endDate)}`;
    }

    if (isSingleDay) {
      const day = getDayLabel(dateString).split(" ")[0];
      return `Tous les ${day}`;
    }

    return getDayLabel(dateString);
  } catch (error) {
    console.error("Erreur de formatage de date:", error);
    return "Format de date invalide";
  }
};

// Fonction pour afficher la date de manière lisible en français
const getDayLabel = (dateString: string) => {
  const days = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];

  const months = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString; // Si invalide, garder tel quel

  // Ajuster la logique pour que le jour de la semaine corresponde au bon jour
  const dayIndex = (date.getDay() + 1) % 7; // Ajouter 1 et utiliser le modulo pour éviter le décalage
  const day = date.getDate(); // Jour du mois
  const monthIndex = date.getMonth(); // Mois
  const year = date.getFullYear(); // Année

  // Formater la date de manière lisible
  return `${days[dayIndex]} ${day} ${months[monthIndex]} ${year}`;
};
function Maps({ center = [48.85837, 2.294481], zoom = 13 }: MapsProps) {
  const { user } = useAuth();
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [newMarkerPosition, setNewMarkerPosition] = useState<
    [number, number] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [eventType, setEventType] = useState<
    "voiture" | "moto" | "event" | null
  >(null);
  const [date, setDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<number | null>(null);
  const [eventCategory, setEventCategory] = useState<string>("");
  const [isRange, setIsRange] = useState(false);

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchCriterion, setSearchCriterion] = useState<
    "brand" | "model" | "year" | "eventCategory"
  >("brand");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const icons = [
    { type: "voiture", icon: "🚗" },
    { type: "moto", icon: "🏍️" },
    { type: "event", icon: "🎉" },
  ];

  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    try {
      const url = "http://localhost:3310/api/markers/search";
      const params = new URLSearchParams();

      if (searchQuery) {
        params.append("criterion", searchCriterion);
        params.append("query", searchQuery);
      }

      if (activeFilters.length > 0) {
        params.append("types", activeFilters.join(","));
      }
      console.info("Fetching markers with parameters:", params.toString());
      const response = await fetch(`${url}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch markers: ${response.statusText}`);
      }

      const data = await response.json();
      console.info("Received markers data:", data);
      setMarkers(data);
    } catch (error) {
      console.error("Failed to fetch markers:", error);
      errorToast(
        "Invalid search criteria. Please check your filters and try again.",
      );
    }
  };

  const handleCriterionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchCriterion(
      e.target.value as "brand" | "model" | "year" | "eventCategory",
    );
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = () => {
    fetchMarkers();
  };

  const handleFilterToggle = (type: string) => {
    setActiveFilters(
      (prevFilters) =>
        prevFilters.includes(type)
          ? prevFilters.filter((filter) => filter !== type) // Désactiver le filtre
          : [...prevFilters, type], // Activer le filtre
    );
  };

  const filteredMarkers = markers.filter((marker) => {
    if (!marker.details) return false; // Exclure les marqueurs sans détails

    // Si aucun filtre n'est actif, afficher tous les marqueurs
    if (activeFilters.length === 0) return true;

    // Vérifier si le type de marqueur correspond à l'un des filtres actifs
    const markerEventType = marker.details.eventType?.toLowerCase();
    return activeFilters.some(
      (filter) => filter.toLowerCase() === markerEventType,
    );
  });

  // const getSearchCriteria = () => {
  //   if (activeFilters.includes("car") || activeFilters.includes("motorcycle")) {
  //     return [
  //       { value: "brand", label: "Brand" },
  //       { value: "model", label: "Model" },
  //       { value: "year", label: "Year" },
  //     ];
  //   }
  //   if (activeFilters.includes("event")) {
  //     return [{ value: "eventCategory", label: "Event Category" }];
  //   }
  //   // Retourner des critères par défaut si aucun filtre n'est actif
  //   return [
  //     { value: "brand", label: "Brand" },
  //     { value: "model", label: "Model" },
  //     { value: "year", label: "Year" },
  //     { value: "eventCategory", label: "Event Category" },
  //   ];
  // };
  const getSearchCriteria = () => {
    if (activeFilters.includes("car") || activeFilters.includes("motorcycle")) {
      return [
        { value: "brand", label: "Marque" },
        { value: "model", label: "Modèle" },
        { value: "year", label: "Année" },
      ];
    }
    if (activeFilters.includes("event")) {
      return [{ value: "eventCategory", label: "Catégorie d'événement" }];
    }
    // Retourner des critères par défaut si aucun filtre n'est actif
    return [
      { value: "brand", label: "Marque" },
      { value: "model", label: "Modèle" },
      { value: "year", label: "Année" },
      { value: "eventCategory", label: "Catégorie d'événement" },
    ];
  };

  const renderSearchBar = () => {
    const criteria = getSearchCriteria();

    return (
      <div className={styles.searchBar}>
        <select
          className={styles.dropdown}
          value={searchCriterion}
          onChange={handleCriterionChange}
        >
          {criteria.map((criterion) => (
            <option key={criterion.value} value={criterion.value}>
              {criterion.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          className={styles.search}
          placeholder={`Rechercher par ${searchCriterion}`}
          value={searchQuery}
          onChange={handleSearchQueryChange}
        />
        <button
          type="button"
          className={styles.searchButton}
          onClick={handleSearchSubmit}
        >
          Recherche
        </button>
      </div>
    );
  };

  const handleAddMarkerButtonClick = () => {
    if (!user) {
      infoToast("Vous devez être connecté pour ajouter un marqueur.");
      return;
    }
    setIsAddingMarker((prev) => !prev);
  };

  const handleMapClick = (e: LeafletMouseEvent) => {
    if (!user) {
      infoToast("Vous devez être connecté pour ajouter un marqueur.");
      return;
    }
    if (isAddingMarker) {
      const { lat, lng } = e.latlng;
      setNewMarkerPosition([lat, lng]);
      setIsModalOpen(true);
      setIsAddingMarker(false);
    }
  };

  const handleModalSubmit = async () => {
    if (!eventType || (!date && !startDate && !endDate)) {
      infoToast("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const formatDate = (date: Date | null) =>
        date ? date.toISOString().split("T")[0] : "";

      const formattedDate = isRange
        ? `${formatDate(startDate)} to ${formatDate(endDate)}`
        : formatDate(date);

      const latitude = newMarkerPosition?.[0] || 0;
      const longitude = newMarkerPosition?.[1] || 0;

      let address = "Adresse inconnue";
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/reverse/?lat=${latitude}&lon=${longitude}`,
        );
        const data = await response.json();
        if (data.features.length > 0) {
          address = data.features[0].properties.label;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'adresse :", error);
      }

      const newMarkerData = {
        lat: latitude,
        lng: longitude,
        label: `Type: ${eventType}, Date: ${formattedDate}`,
        details: {
          eventType,
          date: formattedDate,
          address,
          isSingleDay: !isRange,
          ...(eventType === "voiture" || eventType === "moto"
            ? { brand, model, year }
            : { type: eventCategory, duration: formattedDate }),
        },
        user_id: user?.id || "",
      };
      console.info("New Marker Data:", newMarkerData);

      // Ici je poste une 1ère fois
      const addMarker = await api.post("/api/markers", newMarkerData);

      if (addMarker.status !== 201) {
        console.error("Échec de l'enregistrement du marker");
        errorToast("Échec de l'enregistrement du marker. Veuillez réessayer.");
        return;
      }

      switch (eventType) {
        case "event":
          // je poste une 2eme fois le marker
          await api.post("/api/events", {
            title: `Événement: ${eventCategory}`,
            type: "Salon",
            date_start: formatDate(startDate) || formatDate(date), // Utiliser date si startDate est vide
            date_end: formatDate(endDate) || formatDate(date), // Utiliser date si endDate est vide
            address,
            location: {
              x: newMarkerPosition?.[0] || 0,
              y: newMarkerPosition?.[1] || 0,
              address,
            },
            user_id: user?.id || "",
            isMap: true,
          });
          break;
        case "voiture":
        case "moto":
          await api.post("/api/vehicles", {
            type: eventType,
            status: "indisponible",
            energy: "essence",
            brand,
            model,
            year,
            coord: [newMarkerPosition?.[0] || 0, newMarkerPosition?.[1] || 0],
            location: address,
            user_id: user?.id || "",
            isMap: true,
          });
          break;
        default:
          console.error("Type d'événement invalide :", eventType);
          return;
      }

      const data: MarkerType = addMarker.data;
      console.info("Marker enregistré avec succès :", data);

      if (!data.lat || !data.lng) {
        throw new Error("Données du marker invalides reçues depuis le serveur");
      }

      setMarkers((prevMarkers) => [...prevMarkers, data]);

      setIsModalOpen(false);
      setNewMarkerPosition(null);
      setEventType(null);
      setDate(null);
      setStartDate(null);
      setEndDate(null);
      setBrand("");
      setModel("");
      setYear(null);
      setEventCategory("");
      successToast("Marker enregistré avec succès !");
    } catch (error) {
      console.error("Échec de l'enregistrement du marker :", error);
      errorToast("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const handleFavoriteClick = async (marker: MarkerType) => {
    // Vérifier si le marqueur appartient à l'utilisateur connecté
    if (user && marker.user_id === user.id) {
      infoToast("Ce véhicule vous appartient !");
      return;
    }

    try {
      const response = await api.post("/api/favoris", { markerId: marker.id });

      if (response.data.message === "Ce marqueur est déjà dans vos favoris") {
        successToast(response.data.message);
      } else {
        successToast("Marqueur ajouté aux favoris");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        errorToast(
          error.response?.data?.message || "Erreur lors de l'ajout aux favoris",
        );
      } else if (error instanceof Error) {
        errorToast(error.message);
      } else {
        errorToast("Erreur inconnue lors de l'ajout aux favoris");
      }
      console.error("Erreur:", error);
    }
  };

  return (
    <div className={styles.outerContainer}>
      <NavRoot namePage="Map" />
      <div className={styles.innerContainer}>
        {user && ( // Afficher le bouton uniquement si l'utilisateur est connecté
          <button
            type="button"
            className={styles.icon}
            style={{
              position: "absolute",
              top: "27%",
              right: "20px",
              zIndex: 1000,
            }}
            onClick={handleAddMarkerButtonClick}
          >
            {isAddingMarker ? "❌" : "📍"}
          </button>
        )}

        {renderSearchBar()}

        <IconsContainer
          icons={icons}
          activeFilters={activeFilters}
          onFilterToggle={handleFilterToggle}
        />

        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          className={styles.maps}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onClick={handleMapClick} />

          {/* Wrap markers in MarkerClusterGroup */}
          <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
            {filteredMarkers.map((marker) => {
              if (
                typeof marker.lat !== "number" ||
                typeof marker.lng !== "number"
              ) {
                console.error("Invalid marker data:", marker);
                return null;
              }

              console.info({ marker });

              return (
                <Marker
                  key={marker.id}
                  position={[marker.lat, marker.lng]}
                  icon={customIcon}
                >
                  <Popup>
                    <div
                      style={{
                        backgroundColor: "white",
                      }}
                    >
                      {/* Ajout du bouton pour ajouter aux favoris ici */}
                      {marker.label && (
                        <strong
                          style={{
                            color: "var(--primary-color)",
                            fontSize: "18px",
                            display: "block",
                            marginBottom: "15px",
                            borderBottom: "2px solid var(--primary-color)",
                            paddingBottom: "8px",
                          }}
                        >
                          Type: {marker.details?.eventType || "Type inconnu"},
                          Date:{" "}
                          {formatPopupHeaderDate(
                            marker.details?.date,
                            marker.details?.isSingleDay,
                          )}
                        </strong>
                      )}

                      {marker.details && (
                        <div
                          style={{
                            backgroundColor: "rgba(248, 249, 250, 0.8)",
                            color: "var(--secondary-color)",
                            padding: "15px",
                            borderRadius: "10px",
                            fontSize: "15px",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(0, 0, 0, 0.03)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <p
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <strong
                              style={{
                                backgroundColor: "var(--primary-color)",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "14px",
                              }}
                            >
                              Type
                            </strong>
                            {translateEventType(marker.details.eventType)}
                          </p>

                          <p
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <strong
                              style={{
                                backgroundColor: "var(--primary-color)",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "14px",
                              }}
                            >
                              Date
                            </strong>

                            {getFormattedDate(
                              marker.details?.date,
                              marker.details?.isSingleDay,
                            )}
                          </p>

                          {marker.details.brand && (
                            <p
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <strong
                                style={{
                                  backgroundColor: "var(--primary-color)",
                                  color: "white",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                }}
                              >
                                Marque
                              </strong>
                              {marker.details.brand}
                            </p>
                          )}

                          {marker.details.model && (
                            <p
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <strong
                                style={{
                                  backgroundColor: "var(--primary-color)",
                                  color: "white",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                }}
                              >
                                Modèle
                              </strong>
                              {marker.details.model}
                            </p>
                          )}

                          {marker.details.year && (
                            <p
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <strong
                                style={{
                                  backgroundColor: "var(--primary-color)",
                                  color: "white",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                }}
                              >
                                Année
                              </strong>
                              {marker.details.year}
                            </p>
                          )}

                          {marker.details.eventCategory && (
                            <p
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <strong
                                style={{
                                  backgroundColor: "var(--primary-color)",
                                  color: "white",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                }}
                              >
                                Catégorie
                              </strong>
                              {marker.details.eventCategory}
                            </p>
                          )}

                          {marker.details.duration && (
                            <p
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <strong
                                style={{
                                  backgroundColor: "var(--primary-color)",
                                  color: "white",
                                  padding: "4px 8px",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                }}
                              >
                                Durée
                              </strong>
                              {marker.details?.duration
                                ? getFormattedDate(
                                    marker.details.duration,
                                    marker.details.isSingleDay,
                                  )
                                : "Non spécifiée"}
                            </p>
                          )}
                          {marker.details &&
                            (marker.details.eventType === "voiture" ||
                              marker.details.eventType === "moto") &&
                            user?.id !== marker.user_id && (
                              <button
                                type="button"
                                onClick={() => handleFavoriteClick(marker)}
                                style={{
                                  backgroundColor: "var(--primary-color)",
                                  color: "white",
                                  padding: "8px 16px",
                                  borderRadius: "4px",
                                  border: "none",
                                  cursor: "pointer",
                                  marginTop: "10px",
                                  fontSize: "14px",
                                }}
                              >
                                Ajouter aux favoris
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {newMarkerPosition && (
              <Marker position={newMarkerPosition} icon={customIcon}>
                <Popup>New Marker</Popup>
              </Marker>
            )}
          </MarkerClusterGroup>

          <AdjustZoomControls />
        </MapContainer>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Ajouter un point d'intérêt</h3>

            <select
              value={eventType || ""}
              onChange={(e) =>
                setEventType(e.target.value as "voiture" | "moto" | "event")
              }
              className={styles.modalInput}
            >
              <option value="" disabled>
                Sélectionner un type
              </option>
              <option value="voiture">Voiture</option>
              <option value="moto">Moto</option>
              <option value="event">Événement</option>
            </select>

            <div>
              <label>
                <input
                  type="radio"
                  checked={!isRange}
                  onChange={() => setIsRange(false)}
                />
                Jour récurrent
              </label>
              <label>
                <input
                  type="radio"
                  checked={isRange}
                  onChange={() => setIsRange(true)}
                />
                Durée
              </label>
            </div>

            {isRange ? (
              <div>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
                  className={styles.modalInput}
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || undefined}
                  placeholderText="End Date"
                  className={styles.modalInput}
                />
              </div>
            ) : (
              <DatePicker
                selected={date}
                onChange={(date: Date | null) => setDate(date)}
                placeholderText="Select Date"
                className={styles.modalInput}
              />
            )}
            {eventType === "voiture" && (
              <>
                <input
                  type="text"
                  placeholder="Marque"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className={styles.modalInput}
                />
                <input
                  type="text"
                  placeholder="Modèle"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={styles.modalInput}
                />
                <input
                  type="number"
                  placeholder="Année de fabrication"
                  value={year || ""}
                  onChange={(e) => setYear(Number.parseInt(e.target.value, 10))}
                  className={styles.modalInput}
                />
              </>
            )}

            {eventType === "moto" && (
              <>
                <input
                  type="text"
                  placeholder="Marque"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className={styles.modalInput}
                />
                <input
                  type="text"
                  placeholder="Modèle"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={styles.modalInput}
                />
                <input
                  type="number"
                  placeholder="Année de fabrication"
                  value={year || ""}
                  onChange={(e) => setYear(Number.parseInt(e.target.value, 10))}
                  className={styles.modalInput}
                />
              </>
            )}

            {eventType === "event" && (
              <input
                type="text"
                placeholder="Type d'événement (ex: Rassemblement, Exposition, Rallye)"
                value={eventCategory}
                onChange={(e) => setEventCategory(e.target.value)}
                className={styles.modalInput}
              />
            )}

            {/* Modal Buttons */}
            <div className={styles.modalButtons}>
              <button
                type="button"
                className={`${styles.deleteButton} ${styles.cancel}`}
                onClick={() => {
                  setIsModalOpen(false);
                  setEventType(null);
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleModalSubmit}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Create a component to handle map clicks
const MapClickHandler = ({
  onClick,
}: {
  onClick: (e: LeafletMouseEvent) => void;
}) => {
  useMapEvent("click", onClick);
  return null;
};

interface IconsContainerProps {
  icons: { type: string; icon: string }[];
  activeFilters: string[];
  onFilterToggle: (type: string) => void;
}

function IconsContainer({
  icons,
  activeFilters,
  onFilterToggle,
}: IconsContainerProps) {
  return (
    <div className={styles.iconsContainer}>
      {icons.map(({ type, icon }) => (
        <button
          key={type}
          className={`${styles.icon} ${
            activeFilters.includes(type) ? styles.active : ""
          }`}
          onClick={() => onFilterToggle(type)}
          type="button"
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

function AdjustZoomControls() {
  const map = useMap();

  React.useEffect(() => {
    map.zoomControl.setPosition("bottomright");
  }, [map]);

  return null;
}

export default Maps;
