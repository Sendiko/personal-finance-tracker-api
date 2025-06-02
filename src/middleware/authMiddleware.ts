import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config";
import User from "../user/User";

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

  const user = User.findOne({ where: { token: token } });

  if (!user) {
    return res.status(401).json({
      status: 401,
      message: "Your account has logged in from another device.",
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
