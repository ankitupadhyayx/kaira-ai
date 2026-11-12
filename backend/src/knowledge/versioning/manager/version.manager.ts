import { VersionType } from '../types/versioning.types';

export class VersionManager {
  public bumpVersion(currentVersion: string, bumpType: VersionType): string {
    const parts = currentVersion.split('.').map((p) => parseInt(p, 10) || 0);
    let major = parts[0] || 1;
    let minor = parts[1] || 0;
    let patch = parts[2] || 0;

    switch (bumpType) {
      case 'MAJOR':
        major += 1;
        minor = 0;
        patch = 0;
        break;
      case 'MINOR':
        minor += 1;
        patch = 0;
        break;
      case 'PATCH':
      case 'HOTFIX':
        patch += 1;
        break;
    }

    return `${major}.${minor}.${patch}`;
  }

  public compareVersions(v1: string, v2: string): number {
    const p1 = v1.split('.').map((p) => parseInt(p, 10) || 0);
    const p2 = v2.split('.').map((p) => parseInt(p, 10) || 0);

    for (let i = 0; i < 3; i++) {
      const num1 = p1[i] || 0;
      const num2 = p2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }
}
