import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";

export type Vehicle = {
  id: number;
  vehicle_picture?: string | null;
  type: "moto" | "voiture";
  status: "vente" | "essai" | "indisponible";
  energy: "essence" | "diesel" | "electrique";
  user_id: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  year: number;
  brand: string;
  model: string;
};

class VehicleRepository {
  // The C of CRUD - Create operation
  async create(vehicle: Omit<Vehicle, "id">) {
    // Execute the SQL INSERT query to add a new vehicle to the "vehicle" table
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO vehicle (type, status, energy, vehicle_picture, user_id, location, latitude, longitude, year, brand, model) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        vehicle.type,
        vehicle.status,
        vehicle.energy,
        vehicle.vehicle_picture,
        vehicle.user_id,
        vehicle.location,
        vehicle.latitude,
        vehicle.longitude,
        vehicle.year,
        vehicle.brand,
        vehicle.model,
      ],
    );

    // Return the ID of the newly inserted vehicle
    return result.insertId;
  }

  // The Rs of CRUD - Read operations
  async read(id: number) {
    // Execute the SQL SELECT query to retrieve a specific vehicle by its ID
    const [rows] = await databaseClient.query<Rows>(
      `SELECT v.*, u.username as owner_username 
      FROM vehicle v
      JOIN user u ON v.user_id = u.id
      WHERE v.id = ?`,
      [id],
    );

    // Return the first row of the result, which represents the vehicle
    return rows[0] as Vehicle & { owner_username: string };
  }

  async readAll() {
    // Execute the SQL SELECT query to retrieve all vehicles from the "vehicle" table
    const [rows] = await databaseClient.query<Rows>(`
      SELECT v.*, u.username as owner_username 
      FROM vehicle v
      JOIN user u ON v.user_id = u.id
    `);

    // Return the array of vehicles
    return rows as (Vehicle & { owner_username: string })[];
  }

  // The U of CRUD - Update operation
  async update(id: number, vehicleUpdate: Partial<Vehicle>) {
    // Filter out undefined values and the location field
    let updateFields = Object.entries(vehicleUpdate)
      .filter(([key, value]) => value !== undefined && key !== "location")
      .map(([key, _]) => `${key} = ?`)
      .join(", ");

    // Filter out undefined values
    const updateValues = Object.entries(vehicleUpdate)
      .filter(([key, value]) => value !== undefined && key !== "location")
      .map(([_, value]) => value);

    if (vehicleUpdate.vehicle_picture !== undefined) {
      updateFields += ", vehicle_picture = ?";
      updateValues.push(vehicleUpdate.vehicle_picture);
    }

    updateValues.push(id);

    // Execute the SQL UPDATE query to modify the vehicle in the "vehicle" table
    const [result] = await databaseClient.query<Result>(
      `UPDATE vehicle SET ${updateFields} WHERE id = ?`,
      updateValues,
    );

    return result.affectedRows > 0;
  }

  // The D of CRUD - Delete operation
  async delete(id: number) {
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM vehicle WHERE id = ?",
      [id],
    );

    return result.affectedRows > 0;
  }

  // Custom method to get an vehicle with the owner's username
  async getVehicleWithOwner(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      `
      SELECT v.*, u.username as owner_username
      FROM vehicle v
      JOIN user u ON v.user_id = u.id
      WHERE v.id = ?
    `,
      [id],
    );
    return rows[0] as Vehicle & { owner_username: string };
  }

  // Custom method to get all vehicles owned by a specific user
  async readAllByUserId(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT v.*, u.username as owner_username
      FROM vehicle v
      JOIN user u ON v.user_id = u.id
      WHERE v.user_id = ?`,
      [userId],
    );
    return rows as (Vehicle & { owner_username: string })[];
  }
}

export default new VehicleRepository();
