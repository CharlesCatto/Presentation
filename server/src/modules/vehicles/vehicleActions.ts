import type { RequestHandler } from "express";
import markerRepository from "../marker/markerRepository";

type Vehicle = {
  id: number;
  vehicle_picture?: string | null;
  type: "moto" | "voiture";
  status: "vente" | "essai" | "indisponible";
  energy: "essence" | "diesel" | "electrique";
  user_id: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  model_id: number;
  year: number;
  brand: string;
  model: string;
};

// Import access to data
import vehicleRepository from "./vehicleRepository";

// The B of BREAD - Browse (Read All) operation
const browse: RequestHandler = async (req, res, next) => {
  try {
    // Fetch all vehicles
    const vehicles = await vehicleRepository.readAll();

    // Respond with the vehicles in JSON format
    res.json(vehicles);
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

// The R of BREAD - Read operation
const read: RequestHandler = async (req, res, next) => {
  try {
    // Fetch a specific vehicle based on the provided ID
    const vehicleId = Number(req.params.id);
    const vehicle = await vehicleRepository.getVehicleWithOwner(vehicleId);

    // If the vehicle is not found, respond with HTTP 404 (Not Found)
    // Otherwise, respond with the vehicle in JSON format
    if (vehicle == null) {
      res.sendStatus(404);
    } else {
      res.json(vehicle);
    }
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

// The E of BREAD - Edit (Update) operation
const editVehicle: RequestHandler = async (req, res, next) => {
  try {
    const vehicleId = Number.parseInt(req.params.id, 10);

    // Prépare les données de mise à jour
    const updatedVehicle: Partial<Vehicle> = {
      vehicle_picture: req.body.vehicle_picture,
      energy: req.body.energy,
      status: req.body.status,
      type: req.body.type,
      location: req.body.location,
      user_id: req.body.user_id,
      year: req.body.year,
      brand: req.body.brand,
      model: req.body.model,
    };

    const result = await vehicleRepository.update(vehicleId, updatedVehicle);

    if (result) {
      // Récupére l'événement mis à jour
      const updatedVehicle = await vehicleRepository.read(vehicleId);

      res.status(200).json({
        message: "Véhicule mis à jour avec succès",
        vehicle: updatedVehicle,
      });
    } else {
      res.status(404).json({ message: "Véhicule non trouvé" });
    }
  } catch (err) {
    next(err);
  }
};

// The A of BREAD - Add (Create) operation
const add: RequestHandler = async (req, res, next) => {
  try {
    // Extract the vehicle data from the request body
    const newVehicle = {
      vehicle_picture: req.body.vehicle_picture,
      energy: req.body.energy,
      status: req.body.status,
      type: req.body.type,
      location: req.body.location,
      latitude: req.body.coord[1],
      longitude: req.body.coord[0],
      user_id: req.user.id,
      year: req.body.year,
      brand: req.body.brand,
      model: req.body.model,
      isMap: req.body.isMap,
    };

    if (!newVehicle.isMap) {
      // add marker
      const marker = {
        lat: req.body.coord[1],
        lng: req.body.coord[0],
        label: `Type: ${req.body.type}, Date: ${req.body.date_start} to ${req.body.date_end}`,
        details: req.body.details,
        user_id: req.user.id,
      };

      await markerRepository.createMarker(marker);
    }

    console.info(newVehicle);
    // Create the vehicle
    const insertId = await vehicleRepository.create(newVehicle);

    // Récupérer le vehicule complet après sa création
    const createdVehicle =
      await vehicleRepository.getVehicleWithOwner(insertId);

    // Respond with HTTP 201 (Created) and the ID of the newly inserted vehicle
    res.status(201).json({
      message: "Véhicule créé avec succès! 🚗",
      vehicle: createdVehicle,
    });
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

// The D of BREAD - Delete operation
const fs = require("node:fs/promises");
const path = require("node:path");

const deleteVehicle: RequestHandler = async (req, res, next) => {
  try {
    const vehicleId = Number.parseInt(req.params.id, 10);

    // Récupère le véhicule avant de le supprimer
    const vehicle = await vehicleRepository.read(vehicleId);

    if (vehicle) {
      // Si le véhicule a une image, on la supprime
      if (vehicle.vehicle_picture) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "uploads",
          "vehicles",
          path.basename(vehicle.vehicle_picture),
        );
        await fs.unlink(imagePath).catch((err: NodeJS.ErrnoException) => {
          console.error("Erreur lors de la suppression de l'image:", err);
        });
      }

      // Supprime le véhicule de la base de données
      const result = await vehicleRepository.delete(vehicleId);

      if (result) {
        res
          .status(200)
          .json({ message: "Véhicule et image associée supprimé 💥" });
      } else {
        res.status(404).json({ message: "Véhicule non trouvé 👀" });
      }
    } else {
      res.status(404).json({ message: "Véhicule non trouvé 👀" });
    }
  } catch (err) {
    next(err);
  }
};

// Récupère les véhicules de l'utilisateur connecté
const readUserVehicles: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const vehicles = await vehicleRepository.readAllByUserId(userId);
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
};

// Action pour l'upload d'image
const uploadVehicleImage: RequestHandler = async (req, res, next) => {
  try {
    const vehicleId = Number(req.params.id);
    // Vérifie si un fichier a été uploadé
    if (!req.file) {
      res.status(400).json({ message: "Aucun fichier n'a été uploadé." });
      return;
    }
    // Récupère le véhicule existant
    const vehicle = await vehicleRepository.read(vehicleId);

    // Si le véhicule a déjà une image, on la supprime
    if (vehicle?.vehicle_picture) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "uploads",
        "vehicles",
        path.basename(vehicle.vehicle_picture),
      );
      await fs.unlink(oldImagePath).catch((err: NodeJS.ErrnoException) => {
        console.error(
          "Erreur lors de la suppression de l'ancienne image:",
          err,
        );
      });
    }

    // Construit le chemin de la nouvelle image
    const imagePath = `/uploads/vehicles/${req.file.filename}`;
    // Met à jour l'événement avec le nouveau chemin d'image
    const result = await vehicleRepository.update(vehicleId, {
      vehicle_picture: imagePath,
    });

    if (result) {
      res.status(200).json({
        message: "Image uploadée avec succès",
        vehicle_picture: imagePath,
      });
    } else {
      res.status(404).json({ message: "Véhicule non trouvé" });
    }
  } catch (err) {
    next(err);
  }
};

//Action pour la suppression de l'image
const deleteVehiclePicture: RequestHandler = async (req, res, next) => {
  try {
    const vehicleId = Number(req.params.id);
    // Récupère le véhicule
    const vehicle = await vehicleRepository.read(vehicleId);

    if (vehicle?.vehicle_picture) {
      // Construit le chemin complet de l'image
      const imagePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "uploads",
        "vehicles",
        path.basename(vehicle.vehicle_picture),
      );

      // Supprime le fichier physiquement
      await fs.unlink(imagePath).catch((err: NodeJS.ErrnoException) => {
        console.error("Erreur lors de la suppression du fichier:", err);
      });

      // Met à jour le véhicule pour supprimer la référence à l'image
      await vehicleRepository.update(vehicleId, { vehicle_picture: null });

      res.status(200).json({ message: "Image supprimée avec succès" });
    } else {
      res.status(404).json({ message: "Véhicule ou image non trouvé" });
    }
  } catch (err) {
    next(err);
  }
};

export default {
  browse,
  read,
  editVehicle,
  add,
  deleteVehicle,
  readUserVehicles,
  uploadVehicleImage,
  deleteVehiclePicture,
};
