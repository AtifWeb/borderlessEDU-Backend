import { JwtService } from "../services/JwtService.js";
import { Response } from "../utils/Response.js";

export const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.error(res, "Authorization token missing", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = JwtService._verifyToken(token);
    if (!payload) {
      return Response.error(res, "Invalid or expired token", 401);
    }

    req.user = payload;
    return next();
  } catch (err) {
    console.error("JWT Middleware Error:", err);
    return Response.error(res, "Invalid token", 401);
  }
};

export default verifyJWT;
