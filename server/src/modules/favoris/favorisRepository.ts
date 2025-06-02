import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { RowDataPacket, ResultSetHeader } from "../../../database/client";

interface MarkerDetails {
  eventType: string;
  date: string;
  brand: string;
  model: string;
  year: number;
  address: string;
}

interface FavoriteItem {
  favoris_id: number;
  id: number;
  lat: number;
  lng: number;
  coord: [number, number];
  user_id: number;
  label: string;
  details: MarkerDetails;
}

interface FavorisRow extends RowDataPacket {
  favoris_id: number;
  id: number;
  lat: number;
  lng: number;
  user_id: number;
  label: string;
  details: string;
}

type Favoris = {
  id: number;
  user_id: number;
  marker_id: number;
};

// Fonction de validation des détails
function validateMarkerDetails(data: unknown): MarkerDetails {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid details format");
  }

  const details = data as Record<string, unknown>;

  return {
    eventType:
      typeof details.eventType === "string" ? details.eventType : "Inconnu",
    date: typeof details.date === "string" ? details.date : "Inconnue",
    brand: typeof details.brand === "string" ? details.brand : "Inconnue",
    model: typeof details.model === "string" ? details.model : "Inconnu",
    year: typeof details.year === "number" ? details.year : 0,
    address: typeof details.address === "string" ? details.address : "Inconnue",
  };
}

class FavorisRepository {
  async addFavoris(userId: number, markerId: number): Promise<number> {
    try {
      const [markerRows] = await databaseClient.query<RowDataPacket[]>(
        "SELECT id FROM marker WHERE id = ?",
        [markerId],
      );

      if (markerRows.length === 0) {
        throw new Error("Le marqueur spécifié n'existe pas");
      }

      const [result] = await databaseClient.query<ResultSetHeader>(
        "INSERT INTO favoris (user_id, marker_id) VALUES (?, ?)",
        [userId, markerId],
      );

      return result.insertId;
    } catch (error: unknown) {
      console.error("Erreur dans addFavoris:", error);

      // Gestion type-safe des erreurs MySQL
      if (error instanceof Error && "code" in error) {
        const mysqlError = error as { code: string; errno?: number };
        if (mysqlError.code === "ER_DUP_ENTRY" || mysqlError.errno === 1062) {
          throw new Error("Ce marqueur est déjà dans vos favoris");
        }
      }

      throw error;
    }
  }

  async deleteFavoris(id: number, userId: number): Promise<boolean> {
    try {
      const [result] = await databaseClient.query<Result>(
        "DELETE FROM favoris WHERE id = ? AND user_id = ?",
        [id, userId],
      );

      console.info("DELETE query result:", result);

      return result.affectedRows > 0;
    } catch (error: unknown) {
      console.error("Erreur lors de la suppression du favori:", error);
      throw new Error("Impossible de supprimer le favori.");
    }
  }

  async getUserFavoris(userId: number): Promise<FavoriteItem[]> {
    try {
      const [rows] = await databaseClient.query<FavorisRow[]>(
        `SELECT
          f.id AS favoris_id,
          m.id,
          ST_X(m.position) AS lat,
          ST_Y(m.position) AS lng,
          m.user_id,
          m.label,
          COALESCE(m.details, '{}') AS details
        FROM favoris f
        INNER JOIN marker m ON f.marker_id = m.id
        WHERE f.user_id = ?`,
        [userId],
      );

      if (!Array.isArray(rows)) {
        throw new Error("La requête n'a pas retourné de tableau");
      }

      return rows.map((row) => {
        try {
          // Parse les détails et valide leur structure
          const parsedDetails =
            typeof row.details === "string"
              ? JSON.parse(row.details)
              : row.details;

          const details = validateMarkerDetails(parsedDetails);

          return {
            favoris_id: row.favoris_id,
            id: row.id,
            lat: row.lat,
            lng: row.lng,
            coord: [row.lat, row.lng],
            user_id: row.user_id,
            label: row.label,
            details,
          };
        } catch (error) {
          console.error("Erreur de traitement des données du marqueur:", error);
          // Retourne des valeurs par défaut en cas d'erreur
          return {
            favoris_id: row.favoris_id,
            id: row.id,
            lat: row.lat,
            lng: row.lng,
            coord: [row.lat, row.lng],
            user_id: row.user_id,
            label: row.label,
            details: {
              eventType: "Inconnu",
              date: "Inconnue",
              brand: "Inconnue",
              model: "Inconnu",
              year: 0,
              address: "Inconnue",
            },
          };
        }
      });
    } catch (error) {
      console.error("Erreur SQL:", error);
      throw new Error("Erreur lors de la récupération des favoris");
    }
  }
  async checkExistingFavorite(
    userId: number,
    markerId: number,
  ): Promise<{ id: number } | null> {
    try {
      const [rows] = await databaseClient.query<RowDataPacket[]>(
        "SELECT id FROM favoris WHERE user_id = ? AND marker_id = ? LIMIT 1",
        [userId, markerId],
      );

      return rows.length > 0 ? { id: rows[0].id } : null;
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du favori existant:",
        error,
      );
      throw error;
    }
  }

  async getFavorisById(id: number): Promise<Favoris | undefined> {
    try {
      const [rows] = await databaseClient.query<Rows>(
        "SELECT * FROM favoris WHERE id = ?",
        [id],
      );
      return (rows as Favoris[])[0];
    } catch (error: unknown) {
      console.error("Erreur lors de la récupération du favori par ID:", error);
      throw new Error("Impossible de récupérer le favori par ID.");
    }
  }
}

export default new FavorisRepository();
