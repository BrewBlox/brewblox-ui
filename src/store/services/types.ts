export interface Service {
  id: string;
  title: string;
  order: number;
  type: string;
  config: Record<string, any>;
  _rev?: string;
}
