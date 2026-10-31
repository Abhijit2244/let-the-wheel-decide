export type SpinResultType = "random" | "manual";

export interface SpinHistoryEntry {
  id: string;
  wheelId: string;
  wheelName: string;
  winner: string;
  type: SpinResultType;
  choiceCount: number;
  createdAt: string;
}

export interface SpinHistoryState {
  enabled: boolean;
  entries: SpinHistoryEntry[];
}
