import { Request, Response, NextFunction } from "express";
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
}
