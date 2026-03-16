import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../common/middleware/auth.middleware";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../common/utils/app-response";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { asyncHandler } from "../../common/utils/async-handler";

const authService = new AuthService();

export class AuthController {
  static register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.register(req.body);
      return sendResponse(res, HttpStatus.CREATED, "Account created", result);
    },
  );

  static login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.login(req.body);
      return sendResponse(res, HttpStatus.OK, "Login successful", result);
    },
  );

  static checkUsername = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { username } = req.params;
      const isAvailable = await authService.checkUsernameAvailability(username as string);
      return sendResponse(res, HttpStatus.OK, "Check result", { isAvailable });
    },
  );

  static claimUsername = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const { username } = req.body;
      const result = await authService.claimUsername(req.user!.id, username);
      return sendResponse(res, HttpStatus.OK, "Username claimed successfully", result);
    },
  );
}
