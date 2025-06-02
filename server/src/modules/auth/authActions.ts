import type { RequestHandler } from "express";

// Import access to data
import authRepository from "./authRepository";

// Gère l'inscription d'un nouvel utilisateur
const register: RequestHandler = async (req, res, next) => {
  try {
    const user = await authRepository.create(req.body);

    // Respond with the user in JSON format
    res.status(201).json(user);
  } catch (err) {
    // Pass any errors to the error-handling middleware
    console.error("Erreur lors de l'inscription:", err);
    res.status(400).json({ message: "Email ou pseudo invalide" });
  }
};

// Gère la connexion d'un utilisateur
const login: RequestHandler = async (req, res, next) => {
  try {
    if (req.body.user) {
      // Exclut le mot de passe de la réponse pour des raisons de sécurité
      const { password, ...safeUser } = req.body.user;
      res.status(200).json(safeUser);
    } else {
      res.status(401).json({ message: "Authentication failed" });
    }
  } catch (err) {
    next(err);
  }
};

// Récupère tous les utilisateurs
const browse: RequestHandler = async (req, res, next) => {
  try {
    const users = await authRepository.readAll();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// Récupère un utilisateur spécifique
const read: RequestHandler = async (req, res, next) => {
  try {
    const user = await authRepository.read(req.params.id);
    if (user) {
      // Exclut le mot de passe de la réponse pour des raisons de sécurité
      const { password, ...safeUser } = user;
      res.status(200).json(safeUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    next(err);
  }
};

// Modifie les informations d'un utilisateur
const editUser: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const { message, ...updateData } = req.body;

    // Gère le téléchargement d'une nouvelle image de profil
    if (req.file) {
      // Supprime l'ancienne image si elle existe et n'est pas une image par défaut
      const user = await authRepository.readById(userId);
      if (
        user?.profile_picture &&
        ![
          "cancel-img.png",
          "person_15439869.png",
          "default-event-img.png",
        ].includes(user.profile_picture)
      ) {
        const oldImagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "uploads",
          user.profile_picture,
        );
        fs.unlink(oldImagePath, (err: NodeJS.ErrnoException | null) => {
          if (err)
            console.error(
              "Erreur lors de la suppression de l'ancienne image :",
              err,
            );
        });
      }

      updateData.profile_picture = req.file.filename;
    }

    // Gère le cas où la date de naissance est une chaîne vide
    if (updateData.birthdate === "") {
      updateData.birthdate = undefined;
    }

    const updatedUser = await authRepository.update(userId, updateData);
    if (updatedUser) {
      res.status(200).json({
        message: "User updated successfully",
        profile_picture: updateData.profile_picture,
        ...updateData,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error updating user:", err);
    next(err);
  }
};

// Supprime un utilisateur
const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const deleted = await authRepository.delete(Number(req.params.id));
    if (deleted) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    next(err);
  }
};

// Récupère l'utilisateur actuellement connecté
const getCurrentUser: RequestHandler = async (req, res, next) => {
  try {
    const userEmail = req.user.email;
    const user = await authRepository.read(userEmail);
    if (user) {
      // Exclut le mot de passe de la réponse pour des raisons de sécurité
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (err) {
    next(err);
  }
};

const fs = require("node:fs");
const path = require("node:path");
// Supprime l'image de profil d'un utilisateur
const deleteProfilePicture: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);

    // Récupérer l'utilisateur
    const user = await authRepository.readById(userId);
    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    // Liste des images par défaut à ne pas supprimer
    const defaultImages = [
      "cancel-img.png",
      "person_15439869.png",
      "default-event-img.png",
    ];

    // Supprimer le fichier si ce n'est pas l'image par défaut
    if (user.profile_picture && user.profile_picture !== "cancel-img.png") {
      const filePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "uploads",
        user.profile_picture,
      );
      try {
        fs.unlinkSync(filePath); // Supprime physiquement le fichier
      } catch (err) {
        console.error("Erreur lors de la suppression du fichier :", err);
      }
    }

    // Mettre à jour le profil avec l'image par défaut
    await authRepository.update(userId, { profile_picture: "cancel-img.png" });

    res.status(200).json({ message: "Image supprimée avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression de l'image :", err);
    next(err);
  }
};

const getMyEvents: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Utilisateur non trouvé" });
      return;
    }

    const myEvents = await authRepository.getMyEvent(req.user.id);
    res.json(myEvents);
  } catch (error) {
    next(error);
  }
};

export default {
  browse,
  read,
  editUser,
  deleteUser,
  register,
  login,
  getCurrentUser,
  deleteProfilePicture,
  getMyEvents,
};
