import type { Result, Rows } from "../../../database/client";
import databaseClient from "../../../database/client";
import type { Marker } from "../../types";

class MarkerRepository {
  async createMarker(marker: Omit<Marker, "id">): Promise<number> {
    const query = `
      INSERT INTO marker (position, label, details, user_id)
      VALUES (ST_GeomFromText(?), ?, ?, ?)
    `;
    const values = [
      `POINT(${marker.lat} ${marker.lng})`,
      marker.label || null,
      marker.details ? JSON.stringify(marker.details) : null, // Ensure details is a valid JSON string
      marker.user_id,
    ];

    const [result] = await databaseClient.query<Result>(query, values);
    return result.insertId; // Return the ID of the newly created marker
  }

  async getMarkers(): Promise<Marker[]> {
    const query = `
      SELECT id, ST_X(position) AS lat, ST_Y(position) AS lng, label, details, user_id
      FROM marker
    `;
    const [rows] = await databaseClient.query<Rows>(query);

    return rows.map((row) => {
      // Ensure details is already an object
      const details =
        row.details && typeof row.details === "object" ? row.details : null;

      return {
        id: row.id,
        lat: row.lat,
        lng: row.lng,
        label: row.label,
        details,
        user_id: row.user_id,
      };
    });
  }

  async getMarkerById(id: number): Promise<Marker | null> {
    const query = `
      SELECT id, ST_X(position) AS lat, ST_Y(position) AS lng, label, details, user_id
      FROM marker
      WHERE id = ?
    `;
    const [rows] = await databaseClient.query<Rows>(query, [id]);

    if (rows.length === 0) return null;

    const row = rows[0];

    return {
      id: row.id,
      lat: row.lat,
      lng: row.lng,
      label: row.label,
      details: row.details,
      user_id: row.user_id,
    };
  }
  /**
   * Get the marker created by the current user
   */
  async getMyMarker(id: number) {
    /**
     * Create the query to fetch the markers and join table user for user details
     */
    const query = `
			SELECT marker.id, ST_X(marker.position) AS lat, ST_Y(marker.position) AS lng, marker.label, marker.details, marker.user_id, user.username, user.email
			FROM marker
			JOIN user ON marker.user_id = user.id
			WHERE user_id = ?
		
		`;
    const [rows] = await databaseClient.query<Rows>(query, [id]);

    /**
     * Return all markers created by the user
     */

    return rows.map((row) => {
      const details =
        row.details && typeof row.details === "object" ? row.details : null;
      return {
        id: row.id,
        lat: row.lat,
        lng: row.lng,
        label: row.label,
        details,
        user_id: row.user_id,
        username: row.username,
        email: row.email,
      };
    });
  }

  async updateMarker(marker: Marker): Promise<boolean> {
    const query = `
      UPDATE marker
      SET position = ST_GeomFromText(?), label = ?, details = ?, user_id = ?
      WHERE id = ?
    `;
    const values = [
      `POINT(${marker.lat} ${marker.lng})`,
      marker.label || null,
      marker.details ? JSON.stringify(marker.details) : null,
      marker.user_id,
      marker.id,
    ];

    const [result] = await databaseClient.query<Result>(query, values);
    return result.affectedRows > 0;
  }

  async deleteMarker(id: number): Promise<boolean> {
    const query = "DELETE FROM marker WHERE id = ?";
    const [result] = await databaseClient.query<Result>(query, [id]);
    return result.affectedRows > 0;
  }

  async searchMarkers(
    query?: string,
    criterion?: string,
    types?: string,
  ): Promise<Marker[]> {
    let sql = `
      SELECT id, ST_X(position) AS lat, ST_Y(position) AS lng, label, details, user_id
      FROM marker
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    // Filter by types (e.g., car, motorcycle, event)
    if (types) {
      const typeList = types.split(",");
      sql += ` AND JSON_UNQUOTE(JSON_EXTRACT(details, '$.eventType')) IN (${typeList
        .map(() => "?")
        .join(",")})`;
      params.push(...typeList);
    }

    // Search based on the selected criterion (only if query is provided and not empty)
    if (query && query.trim() !== "" && criterion) {
      // Validate criterion based on types
      if (types?.includes("event") && criterion !== "eventCategory") {
        throw new Error("Invalid criterion for event type");
      }
      if (
        (types?.includes("car") || types?.includes("motorcycle")) &&
        !["brand", "model", "year"].includes(criterion)
      ) {
        throw new Error("Invalid criterion for car or motorcycle type");
      }

      switch (criterion) {
        case "brand":
          sql +=
            " AND JSON_EXTRACT(details, '$.brand') IS NOT NULL AND JSON_UNQUOTE(JSON_EXTRACT(details, '$.brand')) LIKE ?";
          params.push(`%${query}%`);
          break;
        case "model":
          sql +=
            " AND JSON_EXTRACT(details, '$.model') IS NOT NULL AND JSON_UNQUOTE(JSON_EXTRACT(details, '$.model')) LIKE ?";
          params.push(`%${query}%`);
          break;
        case "year":
          sql +=
            " AND JSON_EXTRACT(details, '$.year') IS NOT NULL AND JSON_EXTRACT(details, '$.year') = ?";
          params.push(Number(query));
          break;
        case "eventCategory":
          sql +=
            " AND JSON_EXTRACT(details, '$.eventCategory') IS NOT NULL AND JSON_UNQUOTE(JSON_EXTRACT(details, '$.eventCategory')) LIKE ?";
          params.push(`%${query}%`);
          break;
        default:
          // Fallback to searching the label
          sql += " AND label LIKE ?";
          params.push(`%${query}%`);
          break;
      }
    }

    const [rows] = await databaseClient.query<Rows>(sql, params);

    return rows.map((row) => {
      return {
        id: row.id,
        lat: row.lat,
        lng: row.lng,
        label: row.label,
        details: row.details,
        user_id: row.user_id,
      };
    });
  }
}

export default new MarkerRepository();
