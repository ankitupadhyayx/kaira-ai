import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SYSTEM_CONSTANTS } from '../../shared/constants/system.constants';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      startTimeHighRes: bigint;
    }
  }
}

export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const incomingCorrelationId = req.header(SYSTEM_CONSTANTS.HEADER_CORRELATION_ID);
  const correlationId = incomingCorrelationId || uuidv4();

  req.correlationId = correlationId;
  req.startTimeHighRes = process.hrtime.bigint();

  res.setHeader(SYSTEM_CONSTANTS.HEADER_CORRELATION_ID, correlationId);
  next();
};
