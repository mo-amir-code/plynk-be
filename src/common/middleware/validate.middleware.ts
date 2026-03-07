import { Request, Response, NextFunction } from "express";

export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      Object.assign(req, result);

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
