import express from "express";

const router = express.Router();

/* ************************************************************************* */
// Define Your API Routes Here
/* ************************************************************************* */

// Define item-related routes
import itemActions from "./modules/item/itemActions";

router.get("/api/items", itemActions.browse);
router.get("/api/items/:id", itemActions.read);
router.post("/api/items", itemActions.add);

/** login / register /logout */
import authMiddleware from "./middlewares/authMiddleware";
import authActions from "./modules/auth/authActions";
import markerRepository from "./modules/marker/markerRepository";

router.post("/api/register", authMiddleware.hashPwd, authActions.register);
router.post("/api/login", authMiddleware.verifyPwd, authActions.login);
router.get("/api/logout", authMiddleware.logout);
router.get("/api/check", authMiddleware.checkToken); // pour vérifier le token

/* ************************************************************************* */

/** users */
router.get(
  "/api/users/me",
  authMiddleware.checkToken,
  authActions.getCurrentUser,
); //recupère l'utilisateur connecté
router.get(
  "/api/users/me/events",
  authMiddleware.checkToken,
  authActions.getMyEvents,
); //recupère l'utilisateur connecté

router.get("/api/users", authActions.browse); //recupère tous les utilisateurs authMiddleware.checkToken // DWWM
router.get("/api/users/:id", authActions.read); //recupère un seul utilisateur
router.put(
  "/api/users/:id",
  authMiddleware.checkToken,
  authMiddleware.uploads.single("profile_picture"),
  authActions.editUser,
); // pour modifier un utilisateur
router.delete(
  "/api/users/:id",
  authMiddleware.checkToken,
  authActions.deleteUser,
); // pour supprimer un utilisateur
router.delete(
  "/api/users/:id/profile-picture",
  authMiddleware.checkToken,
  authActions.deleteProfilePicture,
); // pour supprimer une photo de profil

/* ************************************************************************* */

/** events */
import eventActions from "./modules/event/eventActions";

router.get("/api/events", eventActions.browse); //recupère tous les événements

router.get("/api/events/:id", eventActions.read); //recupère un seul événement
router.get(
  "/api/users/me/events",
  authMiddleware.checkToken,
  eventActions.getUserEvents, // Pour récupérer les événements de l'utilisateur connecté
);
router.post("/api/events", authMiddleware.checkToken, eventActions.add); // pour ajouter un événement
router.put(
  "/api/events/:id",
  authMiddleware.checkToken,
  eventActions.editEvent,
); // pour modifier un événement
router.put(
  "/api/events/:id/upload",
  authMiddleware.checkToken,
  authMiddleware.uploads.single("event_picture"),
  eventActions.uploadEventImage, // pour télécharger une image
);
router.delete(
  "/api/events/:id",
  authMiddleware.checkToken,
  eventActions.deleteEvent,
); // pour supprimer un événement
router.delete(
  "/api/event/:id/event-picture",
  authMiddleware.checkToken,
  eventActions.deleteEventPicture,
); // pour supprimer une photo d'événement

/* ************************************************************************* */

/** vehicules */
import vehicleActions from "./modules/vehicles/vehicleActions";

router.get("/api/vehicles", vehicleActions.browse); //recupère tous les véhicles
router.get("/api/vehicles/:id", vehicleActions.read); //recupère un seul véhicle
router.get(
  "/api/users/me/vehicles",
  authMiddleware.checkToken,
  vehicleActions.readUserVehicles, // Pour récupérer les véhicles de l'utilisateur connecté
);
router.post("/api/vehicles", authMiddleware.checkToken, vehicleActions.add); // pour ajouter un véhicle
router.put(
  "/api/vehicles/:id",
  authMiddleware.checkToken,
  vehicleActions.editVehicle,
); // pour modifier un véhicle
router.put(
  "/api/vehicles/:id/upload",
  authMiddleware.checkToken,
  authMiddleware.uploads.single("vehicle_picture"),
  vehicleActions.uploadVehicleImage, // pour télécharger une image
);
router.delete(
  "/api/vehicles/:id",
  authMiddleware.checkToken,
  vehicleActions.deleteVehicle,
);

router.delete(
  "/api/vehicle/:id/vehicle-picture",
  authMiddleware.checkToken,
  vehicleActions.deleteVehiclePicture,
); // pour supprimer une photo de véhicule

/* ************************************************************************* */
/** markers */
import markerActions from "./modules/marker/markerActions";

// Marker-related routes

router.get("/api/markers", markerActions.browse); // Fetch all markers
router.post("/api/markers", authMiddleware.checkToken, markerActions.add); // Add markers
router.put(
  "/api/markers/:id(\\d+)",
  authMiddleware.checkToken,
  markerActions.edit,
); // Edit a marker
router.delete(
  "/api/markers/:id(\\d+)",
  authMiddleware.checkToken,
  markerActions.remove,
); // Delete a marker
// In your router.ts or wherever the route is defined
router.get("/api/markers/search", async (req, res, next) => {
  try {
    console.info("Request Query Parameters:", req.query);

    const { query, criterion, types } = req.query;

    // Ensure query is a string or undefined
    const queryParam = typeof query === "string" ? query : undefined;
    const criterionParam =
      typeof criterion === "string" ? criterion : undefined;
    const typesParam = typeof types === "string" ? types : undefined;

    console.info("Extracted Parameters in Route Handler:", {
      query: queryParam,
      criterion: criterionParam,
      types: typesParam,
    });

    const markers = await markerRepository.searchMarkers(
      queryParam,
      criterionParam,
      typesParam,
    );

    res.json(markers);
  } catch (err) {
    console.error("Error in /api/markers/search route:", err);
    next(err);
  }
});
router.get("/api/markers/:id(\\d+)", markerActions.read);

/* ************************************************************************* */
/** Favoris */
import favorisActions from "./modules/favoris/favorisActions";

router.post(
  "/api/favoris",
  authMiddleware.checkToken,
  favorisActions.addFavoris,
); // Ajouter   un véhicule en favoris
router.delete(
  "/api/favoris/:id",
  authMiddleware.checkToken,
  favorisActions.deleteFavoris,
); // Supprimer un favoris
router.get(
  "/api/users/me/favoris",
  authMiddleware.checkToken,
  favorisActions.getUserFavoris,
); // Récupérer les favoris de l'utilisateur connecté

export default router;
