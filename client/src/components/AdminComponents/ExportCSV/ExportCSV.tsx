import { MdFileDownload } from "react-icons/md";
import styles from "./ExportCSV.module.css";

type DataType = Record<string, string | number | boolean | null | undefined>;

interface ExportCSVProps {
  data: DataType[];
  fileName?: string;
}

function ExportCSV({ data, fileName = "export.csv" }: ExportCSVProps) {
  function downloadCSV() {
    // Obtenez la date actuelle au format souhaité
    const currentDate = new Date()
      .toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    // Construisez le nom de fichier avec la date
    const fullFileName = `${fileName}_${currentDate}.csv`;

    // Extrait les en-têtes (noms des colonnes) du premier objet de données
    const headers = Object.keys(data[0]);

    // Crée un tableau de lignes CSV
    const csvRows = [
      // La première ligne contient les en-têtes
      headers.join(","),
      // Les lignes suivantes contiennent les données
      ...data.map((row) => headers.map((header) => row[header]).join(",")),
    ];

    // Convertit le tableau de lignes en une seule chaîne CSV
    const csvString = csvRows.join("\n");

    // Crée un objet Blob (Binary Large Object) à partir de la chaîne CSV
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

    // Crée une URL pour le Blob
    const url = URL.createObjectURL(blob);

    // Crée un élément <a> (lien) invisible
    const link = document.createElement("a");
    link.href = url;
    link.download = fullFileName;

    // Simule un clic sur le lien pour déclencher le téléchargement
    link.click();

    // Libère l'URL créée pour le Blob
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={downloadCSV} className={styles.buttonCSV}>
      <MdFileDownload className={styles.icon} />
      <p className={styles.text}>CSV</p>
    </button>
  );
}

export default ExportCSV;
