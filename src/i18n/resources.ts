import type { Language } from '../domain/types';
import enCommon from '../locales/en/common.json';
import enTrips from '../locales/en/trips.json';
import enChecklist from '../locales/en/checklist.json';
import enSafety from '../locales/en/safety.json';
import enSharing from '../locales/en/sharing.json';
import enEmergency from '../locales/en/emergency.json';
import enGpx from '../locales/en/gpx.json';
import enData from '../locales/en/data.json';
import enDemo from '../locales/en/demo.json';
import enTour from '../locales/en/tour.json';
import kkCommon from '../locales/kk/common.json';
import kkTrips from '../locales/kk/trips.json';
import kkChecklist from '../locales/kk/checklist.json';
import kkSafety from '../locales/kk/safety.json';
import kkSharing from '../locales/kk/sharing.json';
import kkEmergency from '../locales/kk/emergency.json';
import kkGpx from '../locales/kk/gpx.json';
import kkData from '../locales/kk/data.json';
import kkDemo from '../locales/kk/demo.json';
import kkTour from '../locales/kk/tour.json';
import ruCommon from '../locales/ru/common.json';
import ruTrips from '../locales/ru/trips.json';
import ruChecklist from '../locales/ru/checklist.json';
import ruSafety from '../locales/ru/safety.json';
import ruSharing from '../locales/ru/sharing.json';
import ruEmergency from '../locales/ru/emergency.json';
import ruGpx from '../locales/ru/gpx.json';
import ruData from '../locales/ru/data.json';
import ruDemo from '../locales/ru/demo.json';
import ruTour from '../locales/ru/tour.json';

export type Namespace =
  | 'common'
  | 'trips'
  | 'checklist'
  | 'safety'
  | 'sharing'
  | 'emergency'
  | 'gpx'
  | 'data'
  | 'demo'
  | 'tour';

export type NamespaceResources = Record<string, string>;
export type LanguageResources = Record<Namespace, NamespaceResources>;

export const RESOURCES: Record<Language, LanguageResources> = {
  en: {
    common: enCommon,
    trips: enTrips,
    checklist: enChecklist,
    safety: enSafety,
    sharing: enSharing,
    emergency: enEmergency,
    gpx: enGpx,
    data: enData,
    demo: enDemo,
    tour: enTour,
  },
  kk: {
    common: kkCommon,
    trips: kkTrips,
    checklist: kkChecklist,
    safety: kkSafety,
    sharing: kkSharing,
    emergency: kkEmergency,
    gpx: kkGpx,
    data: kkData,
    demo: kkDemo,
    tour: kkTour,
  },
  ru: {
    common: ruCommon,
    trips: ruTrips,
    checklist: ruChecklist,
    safety: ruSafety,
    sharing: ruSharing,
    emergency: ruEmergency,
    gpx: ruGpx,
    data: ruData,
    demo: ruDemo,
    tour: ruTour,
  },
};

export const NAMESPACES = Object.keys(RESOURCES.en) as Namespace[];
