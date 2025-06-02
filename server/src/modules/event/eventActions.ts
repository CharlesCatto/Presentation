import type { RequestHandler } from "express";

type Event = {
  id: number;
  title: string;
  event_picture?: string | null;
  type:
    | "salon"
    | "course"
    | "musée"
    | "vente aux enchères"
    | "roadtrip"
    | "rassemblement"
    | "autre";
  date_start: string | Date;
  date_end: string | Date;
  location: {
    x: number;
    y: number;
  };
  address: string;
  description: string;
  link?: string | null;
  user_id: number;
  creator_username?: string;
};

import markerRepository from "../marker/markerRepository";
// Import access to data
import eventRepository from "./eventRepository";

// The B of BREAD - Browse (Read All) operation
const browse: RequestHandler = async (req, res, next) => {
  try {
    // Fetch all events
    const events = await eventRepository.readAll();

    // Respond with the events in JSON format
    res.json(events);
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

// The R of BREAD - Read operation
const read: RequestHandler = async (req, res, next) => {
  try {
    // Fetch a specific event based on the provided ID
    const eventId = Number(req.params.id);
    const event = await eventRepository.getEventWithCreator(eventId);

    // If the event is not found, respond with HTTP 404 (Not Found)
    // Otherwise, respond with the event in JSON format
    if (event == null) {
      res.sendStatus(404);
    } else {
      res.json(event);
    }
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

// Modifie un événement existant
const editEvent: RequestHandler = async (req, res, next) => {
  try {
    const eventId = Number.parseInt(req.params.id, 10);

    // Prépare les données de mise à jour
    const eventUpdateData: Partial<Event> = {
      title: req.body.title,
      event_picture: req.body.event_picture,
      type: req.body.type,
      date_start: req.body.date_start,
      date_end: req.body.date_end,
      address: req.body.address,
      description: req.body.description,
      link: req.body.link,
      user_id: req.body.user_id,
    };

    // Ajoute la location seulement si elle est présente dans req.body
    if (req.body.location) {
      eventUpdateData.location = {
        x: Number.parseFloat(req.body.location.x),
        y: Number.parseFloat(req.body.location.y),
      };
    }

    // Filtre les champs undefined pour ne pas écraser les données existantes
    const filteredUpdateData = Object.fromEntries(
      Object.entries(eventUpdateData).filter(([_, v]) => v !== undefined),
    );

    const result = await eventRepository.update(eventId, filteredUpdateData);

    if (result) {
      // Récupére l'événement mis à jour
      const updatedEvent = await eventRepository.read(eventId);

      res.status(200).json({
        message: "Événement mis à jour avec succès",
        event: updatedEvent,
      });
    } else {
      res.status(404).json({ message: "Événement non trouvé" });
    }
  } catch (err) {
    next(err);
  }
};

// The A of BREAD - Add (Create) operation
const add: RequestHandler = async (req, res, next) => {
  try {
    // Extract the event data from the request body
    const newEvent = {
      title: req.body.title,
      type: req.body.type,
      event_picture: req.body.event_picture,
      date_start: req.body.date_start,
      date_end: req.body.date_end,
      location: {
        x: req.body.location.x,
        y: req.body.location.y,
      },
      address: req.body.address,
      description: req.body.description,
      link: req.body.link,
      user_id: req.user.id,
    };

    //Si j'envoi un event depuis la map, je ne veux pas recter un marker
    if (!req.body.isMap) {
      // J'ajoute un marqueur pour l'événement
      const marker = {
        lat: req.body.location.x,
        lng: req.body.location.y,
        label: `Type: ${req.body.type}, Date: ${req.body.date_start} to ${req.body.date_end}`,
        details: req.body.details,
        user_id: req.user.id,
      };

      await markerRepository.createMarker(marker);
    }

    // Create the event
    const insertId = await eventRepository.create(newEvent);
    // Create the marker

    // Récupérer l'événement complet après sa création
    const createdEvent = await eventRepository.getEventWithCreator(insertId);

    // Respond with HTTP 201 (Created) and the ID of the newly inserted event
    res.status(201).json({
      message: "Événement créé, en route ! 🚗",
      event: createdEvent,
    });
  } catch (err) {
    // Pass any errors to the error-handling middleware
    next(err);
  }
};

// Supprime un événement
const deleteEvent: RequestHandler = async (req, res, next) => {
  try {
    const eventId = Number.parseInt(req.params.id, 10);

    // Récupère l'événement avant de le supprimer
    const event = await eventRepository.read(eventId);

    if (event) {
      // Si l'événement a une image, on la supprime
      if (event.event_picture) {
        const imagePath = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "uploads",
          "events",
          path.basename(event.event_picture),
        );
        await fs.unlink(imagePath).catch((err: NodeJS.ErrnoException) => {
          console.error("Erreur lors de la suppression de l'image:", err);
        });
      }

      // Supprime l'événement de la base de données
      const result = await eventRepository.delete(eventId);

      if (result) {
        res.status(200).json({
          message: "Événement et image associée supprimés 💥",
        });
      } else {
        res.status(404).json({ message: "Événement non trouvé 👀" });
      }
    } else {
      res.status(404).json({ message: "Événement non trouvé 👀" });
    }
  } catch (err) {
    next(err);
  }
};

// Récupère les événements d'un utilisateur
const getUserEvents: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const events = await eventRepository.readAllByUserId(userId);
    res.json(events);
  } catch (err) {
    next(err);
  }
};

// Action pour l'upload d'image
const uploadEventImage: RequestHandler = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    // Vérifie si un fichier a été uploadé
    if (!req.file) {
      res.status(400).json({ message: "Aucun fichier n'a été uploadé." });
      return;
    }
    // Récupère l'événement existant
    const event = await eventRepository.read(eventId);

    // Si l'événement a déjà une image, on la supprime
    if (event?.event_picture) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "uploads",
        "events",
        path.basename(event.event_picture),
      );
      await fs.unlink(oldImagePath).catch((err: NodeJS.ErrnoException) => {
        console.error(
          "Erreur lors de la suppression de l'ancienne image:",
          err,
        );
      });
    }

    // Construit le chemin de la nouvelle image
    const imagePath = `/uploads/events/${req.file.filename}`;
    // Met à jour l'événement avec le nouveau chemin d'image
    const result = await eventRepository.update(eventId, {
      event_picture: imagePath,
    });

    if (result) {
      res.status(200).json({
        message: "Image uploadée avec succès",
        event_picture: imagePath,
      });
    } else {
      res.status(404).json({ message: "Événement non trouvé" });
    }
  } catch (err) {
    next(err);
  }
};

const fs = require("node:fs/promises");
const path = require("node:path");
//Action pour la suppression de l'image
const deleteEventPicture: RequestHandler = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    // Récupère l'événement
    const event = await eventRepository.read(eventId);

    if (event?.event_picture) {
      // Construit le chemin complet de l'image
      const imagePath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "uploads",
        "events",
        path.basename(event.event_picture),
      );

      // Supprime le fichier physiquement
      await fs.unlink(imagePath).catch((err: NodeJS.ErrnoException) => {
        console.error("Erreur lors de la suppression du fichier:", err);
      });

      // Met à jour l'événement pour supprimer la référence à l'image
      await eventRepository.update(eventId, { event_picture: null });

      res.status(200).json({ message: "Image supprimée avec succès" });
    } else {
      res.status(404).json({ message: "Événement ou image non trouvé" });
    }
  } catch (err) {
    next(err);
  }
};

export default {
  browse,
  read,
  editEvent,
  add,
  deleteEvent,
  getUserEvents,
  uploadEventImage,
  deleteEventPicture,
};
