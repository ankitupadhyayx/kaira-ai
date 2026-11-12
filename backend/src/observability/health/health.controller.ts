import { Router, Request, Response } from 'express';
import { HTTP_STATUS } from '../../shared/constants/http-status.constants';
import { ApiResponse } from '../../shared/types/common.types';

export const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'UP',
      service: 'enterprise-chatbot-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    },
    metadata: {
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId || 'none',
    },
  };
  res.status(HTTP_STATUS.OK).json(response);
});

healthRouter.get('/liveness', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({ status: 'alive' });
});

healthRouter.get('/readiness', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({ status: 'ready' });
});
