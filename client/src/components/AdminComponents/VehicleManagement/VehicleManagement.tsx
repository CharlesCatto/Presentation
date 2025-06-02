import { useEffect, useRef, useState } from "react";
import { SlArrowDown } from "react-icons/sl";
import { SlArrowUp } from "react-icons/sl";
import ExportCSV from "../ExportCSV/ExportCSV";
import styles from "./VehicleManagement.module.css";

type Vehicle = {
  id: number;
  model: string;
  brand: string;
  vehicle_picture: string | null;
  type: "moto" | "voiture";
  status: "vente" | "essai" | "indisponible";
  energy: "essence" | "diesel" | "electrique";
  user: string;
  location: string;
};

function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<Event["type"] | "">("");
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    // Appel API ici
    const mockvehicles: Vehicle[] = [
      {
        id: 1,
        model: "Skyline r34 GT-R 1970",
        brand: "Nissan",
        vehicle_picture:
          "https://abcmoteur.fr/wp-content/uploads/2012/07/skyline-c10-gtr-1970.jpg",
        type: "voiture",
        status: "essai",
        energy: "essence",
        user: "Sasuke-du-38",
        location: "Grenoble",
      },
      {
        id: 2,
        model: "8 - XR750 1970",
        brand: "Harley Davidson",
        vehicle_picture:
          "https://cdn.shopify.com/s/files/1/0059/3379/3362/files/harley-davidson-xr750.webp?v=1715107648",
        type: "moto",
        status: "vente",
        energy: "essence",
        user: "Johnny l'Hallyday",
        location: "Marseille",
      },
    ];
    setVehicles(mockvehicles);
    setFilteredVehicles(mockvehicles);
  }, []);

  // Fonction pour l'expension du tableau
  function toggleTableExpansion() {
    setIsTableExpanded(!isTableExpanded);
  }

  // Fonction pour la barre de recherche
  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.model.toLowerCase().includes(searchTerm) ||
        vehicle.brand.toLowerCase().includes(searchTerm) ||
        vehicle.location.toLowerCase().includes(searchTerm) ||
        vehicle.user.toLowerCase().includes(searchTerm),
    );
    setFilteredVehicles(filtered);
  }

  // Fonction pour trier les événements par type
  function handleFilterChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const newFilterType = event.target.value as Event["type"] | "";
    setFilterType(newFilterType);

    if (newFilterType === "" || newFilterType === "type") {
      setFilteredVehicles(vehicles);
    } else {
      const filtered = vehicles.filter(
        (vehicle) => vehicle.type === newFilterType,
      );
      setFilteredVehicles(filtered);
    }
  }

  // Fonction pour réinitialiser la recherche
  function handleResetSearch() {
    setSearchTerm("");
    setFilterType("");
    setFilteredVehicles(vehicles);
  }

  // Gestion des modales pour éditer un événement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  function handleEditVehicle(id: number) {
    // Logique pour éditer un véhicule
    const vehiculeToEdit = vehicles.find((vehicle) => vehicle.id === id);
    if (vehiculeToEdit) {
      setCurrentVehicle(vehiculeToEdit);
      setIsModalOpen(true);
    }
  }

  // Gestion du clic en dehors de la modale
  const handleOutsideClick = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setIsModalOpen(false);
    }
  };

  const updateVehicle = () => {
    if (currentVehicle) {
      const updatedVehicles = vehicles.map((vehicle) =>
        vehicle.id === currentVehicle.id ? currentVehicle : vehicle,
      );
      setVehicles(updatedVehicles);
      setFilteredVehicles(updatedVehicles);
    }
    setIsModalOpen(false);
    setCurrentVehicle(null);
  };

  function handleDeleteVehicle(id: number) {
    // Logique pour supprimer un véhicule
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      const updatedVehicles = vehicles.filter((vehicle) => vehicle.id !== id);
      setVehicles(updatedVehicles);
      setFilteredVehicles(updatedVehicles);
    }
  }

  // Fonction pour uploader une image
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPreviewImage(reader.result);
          if (currentVehicle) {
            setCurrentVehicle({
              ...currentVehicle,
              vehicle_picture: reader.result,
            });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  //supression de l'image
  const handleImageDelete = () => {
    const confirmMessage = "Êtes-vous sûr de vouloir supprimer cette image ?";

    if (window.confirm(confirmMessage)) {
      if (currentVehicle) {
        setCurrentVehicle({
          ...currentVehicle,
          vehicle_picture: null,
        });
        setPreviewImage(null);
      }
    }
  };

  // Calcule le nombre total d'événements filtrés
  const totalVehicles = filteredVehicles.length;

  return (
    <div className={styles.vehicleManagementContainer}>
      <h2>Gestion des véhicules</h2>

      <div className={styles.tableHeader}>
        <p className={styles.eventCounter}>Total : {totalVehicles}</p>
        <ExportCSV data={filteredVehicles} fileName="data_véhicules.csv" />
        <button
          type="button"
          onClick={toggleTableExpansion}
          className={styles.expandButton}
        >
          {isTableExpanded ? <SlArrowUp /> : <SlArrowDown />}
        </button>
      </div>

      {isTableExpanded && (
        <>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchBar}
            />
            {searchTerm && ( // Le bouton n'apparaît que si un terme de recherche existe
              <button
                type="button"
                onClick={handleResetSearch}
                className={styles.resetButton}
              >
                ↩ Réinitialiser
              </button>
            )}
            <select
              name="typeVehicle"
              className={styles.selectButton}
              value={filterType}
              onChange={handleFilterChange}
            >
              <option value="type">Type</option>
              <option value="moto">Moto</option>
              <option value="voiture">Voiture</option>
            </select>
          </div>
          <table className={styles.tableContainer}>
            <thead>
              <tr>
                <th className={styles.tableContainer}>Model</th>
                <th className={styles.tableContainer}>Marque</th>
                <th className={styles.tableContainer}>Type</th>
                <th className={styles.tableContainer}>Propriétaire</th>
                <th className={styles.tableContainer}>localisation</th>
                <th className={styles.tableContainer}> </th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((Vehicle) => (
                <tr key={Vehicle.id}>
                  <td>{Vehicle.model}</td>
                  <td>{Vehicle.brand}</td>
                  <td>{Vehicle.type}</td>
                  <td>{Vehicle.user}</td>
                  <td>{Vehicle.location}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        handleEditVehicle(Vehicle.id);
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteVehicle(Vehicle.id);
                      }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={handleOutsideClick}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsModalOpen(false);
            }
          }}
          tabIndex={-1}
        >
          <div className={styles.modalContent} ref={modalRef}>
            <h3>Modifier le véhicule</h3>
            {currentVehicle && (
              <>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileUpload}
                  className={styles.input}
                />
                {(previewImage || currentVehicle.vehicle_picture) && (
                  <div className={styles.imageContainer}>
                    <img
                      src={previewImage || currentVehicle.vehicle_picture || ""}
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
                  type="text"
                  value={currentVehicle.brand}
                  onChange={(e) =>
                    setCurrentVehicle({
                      ...currentVehicle,
                      brand: e.target.value,
                    })
                  }
                  className={styles.input}
                />
                <input
                  type="text"
                  value={currentVehicle.model}
                  onChange={(e) =>
                    setCurrentVehicle({
                      ...currentVehicle,
                      model: e.target.value,
                    })
                  }
                  className={styles.input}
                />
                <select
                  value={currentVehicle.type}
                  onChange={(e) =>
                    setCurrentVehicle({
                      ...currentVehicle,
                      type: e.target.value as Vehicle["type"],
                    })
                  }
                  className={styles.input}
                >
                  <option value="moto">Moto</option>
                  <option value="voiture">Voiture</option>
                </select>
                <select
                  value={currentVehicle.status}
                  onChange={(e) =>
                    setCurrentVehicle({
                      ...currentVehicle,
                      status: e.target.value as Vehicle["status"],
                    })
                  }
                  className={styles.input}
                >
                  <option value="vente">Vente</option>
                  <option value="essai">Essai</option>
                  <option value="indisponible">Indisponible</option>
                </select>
                <select
                  value={currentVehicle.energy}
                  onChange={(e) =>
                    setCurrentVehicle({
                      ...currentVehicle,
                      energy: e.target.value as Vehicle["energy"],
                    })
                  }
                  className={styles.input}
                >
                  <option value="essence">Essence</option>
                  <option value="diesel">Diesel</option>
                  <option value="electrique">Electrique</option>
                </select>
                <input
                  type="text"
                  value={currentVehicle.user}
                  onChange={(e) =>
                    setCurrentVehicle({
                      ...currentVehicle,
                      user: e.target.value,
                    })
                  }
                  className={styles.input}
                />
                <input
                  type="text"
                  value={currentVehicle.location}
                  onChange={(e) =>
                    setCurrentVehicle({
                      ...currentVehicle,
                      location: e.target.value,
                    })
                  }
                  className={styles.input}
                />
                <div className={styles.modalButtons}>
                  <button
                    type="button"
                    onClick={updateVehicle}
                    className={styles.largeButton}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className={styles.smallButton}
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleManagement;
