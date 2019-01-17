import { GraphConfig } from "@/components/Graph/state";

export interface Session {
  id: string;
  name: string;
  hidden: boolean;
  start: number | null;
  end: number | null;
  graphCfg: GraphConfig;
  notes: string;
}

export interface SessionViewConfig {
  sessions: Session[];
}
