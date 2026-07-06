export type CategoryId = 'club' | 'national' | 'legend';

export interface Team {
  /** Stable unique id, e.g. "club-real-madrid" */
  id: string;
  /** Display name */
  name: string;
  /** Short code used on the badge, e.g. "RMA" */
  code: string;
  /** Optional country/region, mostly for clubs */
  region?: string;
  category: CategoryId;
}

export interface CategoryMeta {
  id: CategoryId;
  labelKey: string;
  accent: 'club' | 'national' | 'legend';
}

export interface SpinResult {
  id: string;
  teamId: string;
  teamName: string;
  teamCode: string;
  category: CategoryId;
  timestamp: number;
}

export interface WheelSlice {
  team: Team;
  angleStart: number;
  angleEnd: number;
  color: string;
}
