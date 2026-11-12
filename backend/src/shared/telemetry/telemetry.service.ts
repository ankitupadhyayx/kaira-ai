export class TelemetryService {
  public static startTimer(): bigint {
    return process.hrtime.bigint();
  }

  public static getElapsedMs(startTime: bigint): number {
    const endTime = process.hrtime.bigint();
    return Number(endTime - startTime) / 1_000_000;
  }
}
