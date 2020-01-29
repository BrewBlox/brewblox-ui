export interface Service<ConfigT = any> {
  id: string;
  title: string;
  order: number;
  type: string;
  config: ConfigT;
  _rev?: string;
}
