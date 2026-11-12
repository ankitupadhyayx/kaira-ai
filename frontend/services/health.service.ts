import { backendClient, aiServiceClient } from './api';
import { HealthCheckStatus } from '../types';

export class HealthService {
  public static async getBackendHealth(): Promise<HealthCheckStatus> {
    try {
      const response = await backendClient.get<HealthCheckStatus>('/health');
      return response.data;
    } catch (error) {
      return {
        service: 'backend',
        status: 'unhealthy',
        success: false,
      };
    }
  }

  public static async getAiServiceHealth(): Promise<HealthCheckStatus> {
    try {
      const response = await aiServiceClient.get<HealthCheckStatus>('/health');
      return response.data;
    } catch (error) {
      return {
        service: 'ai-service',
        status: 'unhealthy',
      };
    }
  }
}
