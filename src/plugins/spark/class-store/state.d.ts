import { ActionContext } from "vuex";
import { RootState } from "@/store/state";

export interface SparkClassState {
  mapped: {
    [id: string]: string;
  };
  listed: string[];
}

export type SparkClassContext = ActionContext<SparkClassState, RootState>;
