import jwt from "jsonwebtoken";
import { SECURITY } from "../config/constants.js";

export class JwtService {
  static _generateToken(payload, expiresIn = SECURITY.JWT_EXPIRES_IN) {
    return jwt.sign(payload, SECURITY.JWT_SECRET, { expiresIn });
  }

  static _verifyToken(token) {
    try {
      return jwt.verify(token, SECURITY.JWT_SECRET);
    } catch (err) {
      return null;
    }
  }

  static _decodeToken(token) {
    return jwt.decode(token);
  }
}
