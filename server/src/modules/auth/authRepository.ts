import databaseClient from "../../../database/client";

import type { Result, Rows } from "../../../database/client";

type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  profile_picture: string;
  firstname: string;
  lastname: string;
  birthdate: string | Date | undefined;
  phone_number: number;
  sold: number;
  is_admin: boolean;
};

class AuthRepository {
  // The C of CRUD - Create operation

  async create(user: Omit<User, "id">) {
    // Execute the SQL INSERT query to add a new user to the "user" table
    const [result] = await databaseClient.query<Result>(
      "insert into user (profile_picture, username, firstname, lastname, email, password) values (?, ?, ?, ?, ?, ?)",
      [
        // Requête sécurisée avec paramètres préparés (protection anti-SQL injection)
        "person_15439869.png",
        user.username,
        user.firstname,
        user.lastname,
        user.email,
        user.password,
      ],
    );

    // Return the ID of the newly inserted user
    return result.insertId;
  }
  catch(error: unknown) {
    if (error instanceof Error) {
      // Rethrow l'erreur avec un message plus descriptif
      throw new Error(
        `Erreur lors de la création de l'utilisateur: ${error.message}`,
      );
    }
    throw error;
  }

  // The Rs of CRUD - Read operations

  async read(email: string) {
    // Execute the SQL SELECT query to retrieve a specific user by its ID
    const [rows] = await databaseClient.query<Rows>(
      "select * from user where email = ?",
      [email],
    );

    // Return the first row of the result, which represents the user
    return rows[0] as User;
  }

  async readById(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      "select * from user where id = ?",
      [id],
    );
    return rows[0] as User;
  }

  async readAll() {
    // Execute the SQL SELECT query to retrieve all users from the "user" table
    const [rows] = await databaseClient.query<Rows>("select * from user");

    // Return the array of users
    return rows as User[];
  }

  // The U of CRUD - Update operation
  async update(id: number, userUpdate: Partial<User>) {
    // Construit dynamiquement la requête SQL en fonction des champs à mettre à jour
    const updateFields = Object.entries(userUpdate)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _]) => `${key} = ?`)
      .join(", ");
    const updateValues = Object.entries(userUpdate)
      .filter(([_, value]) => value !== undefined)
      .map(([_, value]) => value);
    updateValues.push(id);

    const [result] = await databaseClient.query<Result>(
      `UPDATE user SET ${updateFields} WHERE id = ?`,
      updateValues,
    );
    return result.affectedRows > 0;
  }

  // The D of CRUD - Delete operation
  async delete(id: number) {
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM user WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }

  async getMyEvent(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM event WHERE user_id = ?",
      [id],
    );
    return rows;
  }
}

export default new AuthRepository();
