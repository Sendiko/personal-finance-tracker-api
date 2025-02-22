import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config";

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized",
    });
  }

  try {
    const secretKey = `${config.jwt}`;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({
      status: 401,
      message: "Unauthorized",
      error: err.message,
    });
  }
}

export default authenticateToken;
