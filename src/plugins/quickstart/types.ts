export interface SparkQuickStartConfig {
  serviceId: string;
  arrangementId: string;
  dashboardId: string;

  prefix: string;
  dashboardTitle: string;
  groups: number[];
  names: Mapped<string>;
}
