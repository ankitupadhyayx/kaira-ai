export interface HealthCheckStatus {
  service: string;
  status: string;
  success?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
}
