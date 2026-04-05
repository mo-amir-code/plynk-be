import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../common/middleware/auth.middleware";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../common/utils/app-response";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { asyncHandler } from "../../common/utils/async-handler";
import { AppError } from "../../common/utils/app-error";
import { setAuthCookie } from "../../common/utils/auth-cookie";

const authService = new AuthService();

export class AuthController {
  static register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.register(req.body);
      setAuthCookie(res, result.token);
      return sendResponse(res, HttpStatus.CREATED, "Account created", result);
    },
  );

  static login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await authService.login(req.body);
      setAuthCookie(res, result.token);
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
      setAuthCookie(res, result.token);
      return sendResponse(res, HttpStatus.OK, "Username claimed successfully", result);
    },
  );

  static googleAuth = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const url = authService.getGoogleAuthUrl();
      res.redirect(url);
    }
  );

  static googleCallback = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { code } = req.query;
      if (!code) {
        throw new AppError(HttpStatus.BAD_REQUEST, "Google Auth Code is missing");
      }
      
      const result = await authService.handleGoogleCallback(code as string);
      setAuthCookie(res, result.token);
      
      const frontendUrl = process.env.FRONTEND_URL;
      res.redirect(`${frontendUrl}/auth/callback?token=${result.token}`);
    }
  );

  static forgotPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      await authService.forgotPassword(req.body);
      return sendResponse(res, HttpStatus.OK, "If an account with that email exists, we have sent a reset link.");
    }
  );

  static resetPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      await authService.resetPassword(req.body);
      return sendResponse(res, HttpStatus.OK, "Password has been reset successfully.");
    }
  );
}
