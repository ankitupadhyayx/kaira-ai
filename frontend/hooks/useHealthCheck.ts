'use client';

import { useState, useEffect, useCallback } from 'react';
import { HealthService } from '../services/health.service';
import { HealthCheckStatus } from '../types';

export function useHealthCheck() {
  const [backendHealth, setBackendHealth] = useState<HealthCheckStatus | null>(null);
  const [aiServiceHealth, setAiServiceHealth] = useState<HealthCheckStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkServices = useCallback(async () => {
    setIsLoading(true);
    const [backend, ai] = await Promise.all([
      HealthService.getBackendHealth(),
      HealthService.getAiServiceHealth(),
    ]);
    setBackendHealth(backend);
    setAiServiceHealth(ai);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkServices();
  }, [checkServices]);

  return { backendHealth, aiServiceHealth, isLoading, refetch: checkServices };
}
