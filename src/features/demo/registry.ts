import type { DemoDefinition, DemoId } from './types';
import { ROUTE_PLANNING_STATE, RoutePlanningDemo } from './route-planning';
import { WEATHER_STATE, WeatherDemo } from './weather';
import { RISK_STATE, RegionalRiskDemo } from './regional-risk';
import { GROUP_STATE, GroupDemo } from './group';
import { LEARNING_STATE, LearningDemo } from './learning';
import { CHECKIN_STATE, CheckinEscalationDemo } from './checkin-escalation';
import { SATELLITE_STATE, SatelliteDemo } from './satellite';

export const DEMO_REGISTRY: Record<DemoId, DemoDefinition> = {
  'route-planning': {
    id: 'route-planning',
    component: RoutePlanningDemo,
    state: ROUTE_PLANNING_STATE,
    titleKey: 'demo.route.title',
    summaryKey: 'demo.route.summary',
    productionKey: 'demo.route.productionNote',
  },
  weather: {
    id: 'weather',
    component: WeatherDemo,
    state: WEATHER_STATE,
    titleKey: 'demo.weather.title',
    summaryKey: 'demo.weather.summary',
    productionKey: 'demo.weather.productionNote',
  },
  'regional-risk': {
    id: 'regional-risk',
    component: RegionalRiskDemo,
    state: RISK_STATE,
    titleKey: 'demo.risk.title',
    summaryKey: 'demo.risk.summary',
    productionKey: 'demo.risk.productionNote',
  },
  group: {
    id: 'group',
    component: GroupDemo,
    state: GROUP_STATE,
    titleKey: 'demo.group.title',
    summaryKey: 'demo.group.summary',
    productionKey: 'demo.group.productionNote',
  },
  learning: {
    id: 'learning',
    component: LearningDemo,
    state: LEARNING_STATE,
    titleKey: 'demo.learning.title',
    summaryKey: 'demo.learning.summary',
    productionKey: 'demo.learning.productionNote',
  },
  'checkin-escalation': {
    id: 'checkin-escalation',
    component: CheckinEscalationDemo,
    state: CHECKIN_STATE,
    titleKey: 'demo.checkin.title',
    summaryKey: 'demo.checkin.summary',
    productionKey: 'demo.checkin.productionNote',
  },
  satellite: {
    id: 'satellite',
    component: SatelliteDemo,
    state: SATELLITE_STATE,
    titleKey: 'demo.satellite.title',
    summaryKey: 'demo.satellite.summary',
    productionKey: 'demo.satellite.productionNote',
  },
};

export function listDemoDefinitions(): DemoDefinition[] {
  return Object.values(DEMO_REGISTRY);
}

export function getDemoDefinition(id: string): DemoDefinition | null {
  return Object.prototype.hasOwnProperty.call(DEMO_REGISTRY, id)
    ? DEMO_REGISTRY[id as DemoId]
    : null;
}
