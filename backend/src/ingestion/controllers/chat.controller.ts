import { Router, Request, Response } from 'express';
import { HTTP_STATUS } from '../../shared/constants/http-status.constants';
import { MasterOrchestrator } from '../../arbitration/master.orchestrator';
import { ResponseBuilder } from '../../conversation/response-builder/response.builder';
import { greetingSessionManager } from '../../engines/greeting/session-awareness/greeting.session.manager';

export const chatRouter = Router();

const orchestrator = new MasterOrchestrator();
const responseBuilder = new ResponseBuilder();

chatRouter.post('/', async (req: Request, res: Response) => {
  const { message, sessionId, reset } = req.body || {};
  const rawInput = typeof message === 'string' ? message : '';
  const activeSessionId = sessionId || 'anonymous-session';

  if (reset === true || rawInput.toLowerCase() === '/reset' || rawInput.toLowerCase() === 'clear chat') {
    greetingSessionManager.clearSession(activeSessionId);
  }

  // 1. Process request asynchronously through Master Orchestrator
  const pipelineResult = await orchestrator.processRequestAsync(rawInput, activeSessionId);

  // 2. Build standardized Enterprise Response
  const response = responseBuilder.buildResponse(pipelineResult.composedResponse || pipelineResult.winningEngineResult, req.correlationId || 'none');
  response.metadata.executionTimeMs = pipelineResult.totalLatencyMs;

  res.status(HTTP_STATUS.OK).json(response);
});
