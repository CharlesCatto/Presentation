import type { RequestHandler } from "express";
import favorisRepository from "./favorisRepository";

const addFavoris: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = req.user.id;
    const { markerId } = req.body;

    if (!markerId) {
      res.status(400).json({ message: "L'ID du marqueur est requis." });
      return;
    }

    // Utilisez directement le repository pour vérifier l'existence
    const existingFavorite = await favorisRepository.checkExistingFavorite(
      userId,
      markerId,
    );

    if (existingFavorite) {
      res.status(200).json({
        message: "Ce marqueur est déjà dans vos favoris",
        id: existingFavorite.id,
      });
      return;
    }

    const insertId = await favorisRepository.addFavoris(userId, markerId);

    res.status(201).json({
      message: "Marqueur ajouté aux favoris avec succès.",
      id: insertId,
    });
  } catch (error: unknown) {
    console.error("Erreur lors de l'ajout du favori:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Erreur serveur",
    });
  }
};

const deleteFavoris: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = req.user.id;
    const favorisId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(favorisId)) {
      res.status(400).json({ message: "ID de favori invalide." });
      return;
    }

    // Ajoutez un log pour vérifier
    console.info(
      `Tentative de suppression: favorisId=${favorisId}, userId=${userId}`,
    );

    const result = await favorisRepository.deleteFavoris(favorisId, userId);

    if (result) {
      console.info("Suppression réussie");
      res.status(200).json({ message: "Favori supprimé avec succès." });
    } else {
      console.info("Suppression échouée - favori non trouvé ou non autorisé");
      res.status(404).json({ message: "Favori non trouvé ou non autorisé." });
    }
  } catch (error: unknown) {
    console.error("Erreur lors de la suppression du favori:", error);
    next(error);
  }
};

const getUserFavoris: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favoris = await favorisRepository.getUserFavoris(userId);
    res.status(200).json(favoris);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Erreur serveur",
    });
  }
};

export default {
  addFavoris,
  deleteFavoris,
  getUserFavoris,
};
