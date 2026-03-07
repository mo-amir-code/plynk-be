import { Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { AuthRequest } from "../../common/middleware/auth.middleware";
import { sendResponse } from "../../common/utils/app-response";
import { HttpStatus } from "../../common/enums/http-status.enum";
import { asyncHandler } from "../../common/utils/async-handler";

const userService = new UserService();

export class UserController {
  static getMe = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const result = await userService.getMe(req.user!.id);
      return sendResponse(
        res,
        HttpStatus.OK,
        "User fetched successfully",
        result,
      );
    },
  );
}
