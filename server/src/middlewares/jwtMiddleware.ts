import jwt from "jsonwebtoken";
import "dotenv/config";

// Ici, je créer dans ma variable d'environnement un mdp pour mon encodage de mon token
const APP_SECRET = process.env.APP_SECRET as string;
/**
 * Je créer un token grâce au package jsonwebtoken.
 */
const createToken = (payload: object) => {
  return jwt.sign(payload, APP_SECRET, { expiresIn: "8h" });
};
/**
 * Je vais vérifier mon token
 */
const verifyToken = (token: string) => {
  return jwt.verify(token, APP_SECRET);
};
export default { createToken, verifyToken };
