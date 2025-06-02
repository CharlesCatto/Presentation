import { useEffect, useState } from "react";
import Envelope from "../../assets/images/social/envelope.png";
import { useData } from "../../contexts/DataContext";
import api from "../../helpers/api";
import styles from "./accountComponent.module.css";

function accountComponent() {
  const { currentUser, setCurrentUser } = useData();
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true); // État pour gérer le chargement initial des données
  const [saveMessage, setSaveMessage] = useState<string | null>(null); // message de validation et erreurs de modification

  useEffect(() => {
    // appel API
    const fetchUser = async () => {
      try {
        const response = await api.get("/api/users/me");
        setCurrentUser(response.data);
      } catch (error) {
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

  const MAX_FILE_SIZE = 1048576; // 1 Mo en octets

  // Fonction pour uploader une image
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert(
          "L'image est trop volumineuse. Veuillez choisir une image de moins de 1 Mo.",
        );
        return;
      }

      setPreviewImage(file);
      // Pour l'aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string" && currentUser) {
          setCurrentUser({ ...currentUser, tempProfilePicture: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Formatage de la date pour l'affichage et l'envoi au serveur
  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveChanges = async () => {
    if (currentUser) {
      // Crée un nouvel objet FormData pour envoyer les données, y compris les fichiers
      const formData = new FormData();
      if (previewImage) {
        formData.append("profile_picture", previewImage);
      }
      formData.append("birthdate", formatDate(currentUser.birthdate));
      formData.append("phone_number", currentUser.phone_number || "");

      try {
        // Envoie une requête PUT au serveur pour mettre à jour les informations de l'utilisateur
        const response = await api.put(
          `/api/users/${currentUser.id}`,
          formData,
          {
            headers: {
              // Spécifie le type de contenu comme multipart/form-data pour permettre l'envoi de fichiers
              "Content-Type": "multipart/form-data",
            },
          },
        );
        if (response.status === 200) {
          setCurrentUser((prev) =>
            prev
              ? { ...prev, profile_picture: response.data.profile_picture }
              : null,
          );
          setSaveMessage("Changements enregistrés");
          setTimeout(() => setSaveMessage(null), 3000); // Message disparaît après 3 secondes
        } else {
          throw new Error("Erreur lors de la sauvegarde");
        }
      } catch (error) {
        setSaveMessage("Une erreur est survenue lors de la sauvegarde.");
        setTimeout(() => setSaveMessage(null), 3000);
      }
    }
  };

  if (isLoading) {
    return <div className={styles.chargement}>Chargement...</div>;
  }

  if (!currentUser) {
    return (
      <div>Erreur: Impossible de charger les données de l'utilisateur</div>
    );
  }

  // Gestion du changement du numéro de téléphone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Assure que le numéro commence toujours par +33
    if (!value.startsWith("+33")) {
      value = `+33${value.slice(2)}`;
    }

    // Limite la longueur à 12 caractères (+33 + 9 chiffres)
    value = value.slice(0, 12);

    // Ne garde que les chiffres après le +33
    value = `+33${value.slice(3).replace(/\D/g, "")}`;

    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        phone_number: value,
      });
    }
  };

  // Validation du numéro de téléphone
  const validatePhoneNumber = () => {
    if (currentUser?.phone_number) {
      const phoneRegex = /^\+33[1234567][0-9]{8}$/;
      if (!phoneRegex.test(currentUser.phone_number)) {
        setSaveMessage("Numéro de téléphone invalide");
        setTimeout(() => setSaveMessage(null), 3000);
      }
    }
  };

  return (
    <>
      <div className={styles.accountContainer}>
        <section className={styles.generalContainer}>
          <div className={styles.imgContainer}>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/svg"
              onChange={handleFileUpload}
              className={styles.input}
            />
            {(previewImage || currentUser.profile_picture) && (
              <div className={styles.imageContainer}>
                <img
                  src={
                    currentUser.tempProfilePicture ||
                    `${import.meta.env.VITE_API_URL}/uploads/${currentUser.profile_picture}`
                  }
                  alt="Avatar utilisateur"
                  className={styles.previewImage}
                />
              </div>
            )}
          </div>
          <span className={styles.idContainer}>
            <input type="text" value={currentUser.username || ""} readOnly />
            <button type="button">Changer le mot de passe</button>
          </span>
          <span className={styles.mailContainer || ""}>
            <img src={Envelope} alt="icon-mail" />
            <input type="text" value={currentUser.email || ""} readOnly />
          </span>
          <span className={styles.fieldContainer}>
            <p>Nom :</p>
            <input type="text" value={currentUser.lastname || ""} readOnly />
          </span>
          <span className={styles.fieldContainer}>
            <p>Prénom :</p>
            <input type="text" value={currentUser.firstname || ""} readOnly />
          </span>
          <span className={styles.fieldContainer}>
            <p>Date de naissance :</p>
            <input
              type="date"
              value={
                currentUser.birthdate ? formatDate(currentUser.birthdate) : ""
              }
              onChange={(e) => {
                setCurrentUser({ ...currentUser, birthdate: e.target.value });
              }}
            />
          </span>
          <span className={styles.fieldContainer}>
            <p>Téléphone :</p>
            <input
              type="tel"
              pattern="\+33[67][0-9]{8}"
              value={currentUser?.phone_number || "+33"}
              onChange={handlePhoneChange}
              onBlur={validatePhoneNumber}
            />
          </span>
          <button
            type="button"
            onClick={handleSaveChanges}
            className={styles.buttonValidate}
          >
            Valider les changements
          </button>
          {saveMessage && <p className={styles.saveMessage}>{saveMessage}</p>}
        </section>
      </div>
    </>
  );
}

export default accountComponent;
