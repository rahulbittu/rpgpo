// Contract: NavigationMapEntry + NavigationGap
export interface NavigationMapEntry {
  tab: string; panels: string[]; drilldowns: string[]; actions: string[]; reachable: boolean;
}
export interface NavigationGap {
  feature: string; expected_tab: string; issue: string; fix: string;
}
