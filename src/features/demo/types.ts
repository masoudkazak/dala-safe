import type { ComponentType } from 'react';
import type { FeatureState } from '../../domain/types';

export const DEMO_IDS = [
  'route-planning',
  'weather',
  'regional-risk',
  'group',
  'learning',
  'checkin-escalation',
  'satellite',
] as const;

export type DemoId = (typeof DEMO_IDS)[number];

export interface DemoDefinition {
  id: DemoId;
  component: ComponentType;
  state: FeatureState;
  titleKey: string;
  summaryKey: string;
  productionKey: string;
}

export function isDemoId(value: string): value is DemoId {
  return (DEMO_IDS as readonly string[]).includes(value);
}
