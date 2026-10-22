import type { EmergencyContact, LocalizedText, PhrasebookEntry, ReviewStatus } from '../../domain/types';

export const EMERGENCY_LAST_VERIFIED = '2026-10-20';

const REVIEW_REQUIRED: ReviewStatus = 'human-review-required';

const EGOV_112_URL = 'https://egov.kz/cms/kk/articles/emergency_number_112';
const ALMATY_109_URL = 'https://almaty109.kz/';
const MOUNTAIN_GUIDANCE_URL =
  'https://www.gov.kz/uploads/2024/9/17/bf797a6b4a7d013127673e11c05b760d_original.3189117.pdf';
const AVALANCHE_GUIDANCE_URL = 'https://www.gov.kz/memleket/entities/emer/press/news/details/973538?lang=ru';

export const PRIMARY_CONTACT_ID = 'contact-112';

export type EmergencyContactScope = 'national' | 'almaty-city';

export interface EmergencyContactRecord extends EmergencyContact {
  scope: EmergencyContactScope;
}

/**
 * Only contacts listed in docs/safety-sources.md §4 are included.
 * Excluded on purpose:
 * - ROSO duty phone: verified in the register, but outside the required MVP set.
 * - Almaty rescue landline: single-source, release blocked until corroborated.
 * - Volunteer, satellite, SMS, mesh and response-time claims: unverified.
 */
export const EMERGENCY_CONTACTS: EmergencyContactRecord[] = [
  {
    id: PRIMARY_CONTACT_ID,
    number: '112',
    scope: 'national',
    label: {
      kk: '112 — бірыңғай шұғыл нөмір',
      ru: '112 — единый номер экстренных служб',
      en: '112 — unified emergency number',
    },
    description: {
      kk: 'Өмірге қауіп төнген кезде бірінші кезекте 112 нөміріне қоңырау шалыңыз. Не болғанын, нақты орныңызды және атыңызды айтыңыз. Тұтқаны бірінші қоймаңыз және қайта қоңырауға желіні бос ұстаңыз. Табиғатта байланыс кепілдендірілмейді.',
      ru: 'При угрозе жизни звоните 112 в первую очередь. Сообщите, что произошло, точное местоположение и своё имя. Не кладите трубку первым и держите линию свободной для обратного звонка. Связь на природе не гарантируется.',
      en: 'Call 112 first in a life-threatening emergency. Say what happened, your exact location and your name. Do not hang up first and keep the line free for a callback. Coverage outdoors is not guaranteed.',
    },
    sourceUrl: EGOV_112_URL,
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'contact-101',
    number: '101',
    scope: 'national',
    label: {
      kk: '101 — өрт сөндіру қызметі',
      ru: '101 — пожарная служба',
      en: '101 — fire and rescue service',
    },
    description: {
      kk: 'Өрт сөндіру және құтқару қызметі. Қай қызмет қажет екенін білмесеңіз, 112 нөміріне қоңырау шалыңыз.',
      ru: 'Пожарная и спасательная служба. Если вы не уверены, какая служба нужна, звоните 112.',
      en: 'Fire and rescue service. If you are unsure which service you need, call 112.',
    },
    sourceUrl: EGOV_112_URL,
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'contact-102',
    number: '102',
    scope: 'national',
    label: {
      kk: '102 — полиция',
      ru: '102 — полиция',
      en: '102 — police',
    },
    description: {
      kk: 'Полиция қызметі. Өмірге қауіп төнген жағдайда 112 нөміріне қоңырау шалыңыз.',
      ru: 'Служба полиции. При угрозе жизни звоните 112.',
      en: 'Police service. In a life-threatening situation, call 112.',
    },
    sourceUrl: EGOV_112_URL,
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'contact-103',
    number: '103',
    scope: 'national',
    label: {
      kk: '103 — жедел медициналық көмек',
      ru: '103 — скорая медицинская помощь',
      en: '103 — emergency medical assistance',
    },
    description: {
      kk: 'Жедел медициналық көмек. Жағдай өмірге қауіп төндірсе, 112 нөміріне қоңырау шалыңыз.',
      ru: 'Скорая медицинская помощь. Если состояние угрожает жизни, звоните 112.',
      en: 'Emergency medical assistance. If the situation is life-threatening, call 112.',
    },
    sourceUrl: EGOV_112_URL,
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'contact-104',
    number: '104',
    scope: 'national',
    label: {
      kk: '104 — авариялық газ қызметі',
      ru: '104 — аварийная газовая служба',
      en: '104 — emergency gas service',
    },
    description: {
      kk: 'Авариялық газ қызметі. Өмірге қауіп төнген жағдайда 112 нөміріне қоңырау шалыңыз.',
      ru: 'Аварийная газовая служба. При угрозе жизни звоните 112.',
      en: 'Emergency gas service. In a life-threatening emergency, call 112.',
    },
    sourceUrl: EGOV_112_URL,
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'contact-109',
    number: '109',
    scope: 'almaty-city',
    label: {
      kk: '109 — Алматы қаласының құтқару қызметі',
      ru: '109 — служба спасения города Алматы',
      en: '109 — Almaty City Rescue Service',
    },
    description: {
      kk: 'Тек Алматы қаласы бойынша құтқару қызметінің диспетчері. Бұл республикалық тау құтқару нөмірі емес. 2026 жылдың сәуірінен бастап 109 нөмірі Open Almaty қалалық байланыс орталығының функциясын да атқарады. Өмірге қауіп төнген жағдайда 112 нөміріне қоңырау шалыңыз.',
      ru: 'Диспетчер службы спасения только для города Алматы. Это не республиканский номер горноспасательной службы. С апреля 2026 года номер 109 также выполняет функцию городского контакт-центра Open Almaty. При угрозе жизни звоните 112.',
      en: 'Rescue service dispatch for Almaty city only. This is not a national mountain-rescue number. Since April 2026 the same number also serves as the Open Almaty municipal contact center. In a life-threatening emergency, call 112.',
    },
    sourceUrl: ALMATY_109_URL,
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
];

export interface EmergencyGuidanceItem {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
  sourceUrl: string;
  publisher: string;
  lastVerified: string;
  reviewStatus: ReviewStatus;
}

/**
 * Wording is limited to SAFE-001, SAFE-020 and SAFE-021 in docs/safety-sources.md.
 * No response times, rescue locations, hut counts or integration claims are included.
 */
export const EMERGENCY_GUIDANCE: EmergencyGuidanceItem[] = [
  {
    id: 'guidance-plan',
    title: {
      kk: 'Маршрутты және қайту уақытын айтыңыз',
      ru: 'Сообщите маршрут и время возвращения',
      en: 'Tell someone your route and return time',
    },
    body: {
      kk: 'Жолға шықпас бұрын сенімді адамға маршрутыңызды және күтілетін қайту уақытыңызды айтыңыз.',
      ru: 'Перед выходом сообщите доверенному человеку свой маршрут и ожидаемое время возвращения.',
      en: 'Before you leave, tell a trusted person your route and expected return time.',
    },
    sourceUrl: MOUNTAIN_GUIDANCE_URL,
    publisher: 'Almaty akimat / visitalmaty (gov.kz)',
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'guidance-weather',
    title: {
      kk: 'Ауа райын және қар көшкіні ескертулерін тексеріңіз',
      ru: 'Проверьте погоду и предупреждения о лавинах',
      en: 'Check weather and avalanche warnings',
    },
    body: {
      kk: 'Қар көшкіні қаупі жоғары кезде сапардан бас тартыңыз, белгіленген жолдарды ұстаныңыз және дауыл туралы ескерту кезінде сыртқа шықпаңыз.',
      ru: 'При повышенной лавинной опасности воздержитесь от поездок, придерживайтесь обозначенных троп и не выходите наружу при штормовом предупреждении.',
      en: 'Avoid trips during heightened avalanche threat, use marked trails, and do not go out during a storm warning.',
    },
    sourceUrl: AVALANCHE_GUIDANCE_URL,
    publisher: 'Ministry of Emergency Situations (MChS)',
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'guidance-group',
    title: {
      kk: 'Кемінде екі адаммен жүріңіз',
      ru: 'Путешествуйте группой не менее двух человек',
      en: 'Travel in a group of at least two',
    },
    body: {
      kk: 'Кемінде екі адамнан тұратын топпен жүріңіз.',
      ru: 'Отправляйтесь группой как минимум из двух человек.',
      en: 'Travel with a group of at least two people.',
    },
    sourceUrl: MOUNTAIN_GUIDANCE_URL,
    publisher: 'Almaty akimat / visitalmaty (gov.kz)',
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'guidance-gear',
    title: {
      kk: 'Қажетті жабдықты алыңыз',
      ru: 'Возьмите необходимое снаряжение',
      en: 'Carry essential equipment',
    },
    body: {
      kk: 'Карта, компас, фонарь, дәрі қобдишасы, тамақ, су және жылы киім алыңыз. Сумен қамтамасыз ету мәселесін алдын ала жоспарлаңыз.',
      ru: 'Возьмите карту, компас, фонарь, аптечку, еду, воду и тёплую одежду. Продумайте водоснабжение заранее.',
      en: 'Carry a map, compass, flashlight, first-aid kit, food, water and warm layers. Plan water treatment in advance.',
    },
    sourceUrl: MOUNTAIN_GUIDANCE_URL,
    publisher: 'Almaty akimat / visitalmaty (gov.kz)',
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'guidance-trails',
    title: {
      kk: 'Белгіленген жолдарды және саябақ ережелерін ұстаныңыз',
      ru: 'Придерживайтесь обозначенных троп и правил парка',
      en: 'Use marked trails and follow park rules',
    },
    body: {
      kk: 'Белгіленген жолдарды ұстаныңыз, табиғи саябақ ережелерін орындаңыз және қауіпті учаскелерден аулақ болыңыз.',
      ru: 'Придерживайтесь обозначенных троп, соблюдайте правила природного парка и избегайте опасных участков.',
      en: 'Use marked trails, follow nature-park rules and avoid hazardous sections.',
    },
    sourceUrl: MOUNTAIN_GUIDANCE_URL,
    publisher: 'Almaty akimat / visitalmaty (gov.kz)',
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'guidance-call',
    title: {
      kk: '112 нөміріне қоңырау шалыңыз',
      ru: 'Звоните 112',
      en: 'Call 112',
    },
    body: {
      kk: 'Себебін, нақты орныңызды және атыңызды айтыңыз. Тұтқаны бірінші қоймаңыз және қайта қоңырауға желіні бос ұстаңыз.',
      ru: 'Сообщите причину, точное местоположение и своё имя. Не кладите трубку первым и держите линию свободной для обратного звонка.',
      en: 'State the reason, exact location and your name. Do not hang up first and keep the line free for a callback.',
    },
    sourceUrl: EGOV_112_URL,
    publisher: 'eGov / Government of Kazakhstan',
    lastVerified: EMERGENCY_LAST_VERIFIED,
    reviewStatus: REVIEW_REQUIRED,
  },
];

export const PHRASEBOOK_CATEGORIES: PhrasebookEntry['category'][] = [
  'identity',
  'location',
  'condition',
  'request',
];

export const PHRASEBOOK: PhrasebookEntry[] = [
  {
    id: 'phrase-name',
    category: 'identity',
    kk: 'Менің атым — ____.',
    ru: 'Меня зовут ____.',
    en: 'My name is ____.',
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'phrase-tourist',
    category: 'identity',
    kk: 'Мен туристпін.',
    ru: 'Я турист.',
    en: 'I am a tourist.',
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'phrase-lost',
    category: 'location',
    kk: 'Адасып қалдым.',
    ru: 'Я заблудился.',
    en: 'I am lost.',
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'phrase-unknown-location',
    category: 'location',
    kk: 'Мен нақты орнымды білмеймін.',
    ru: 'Я не знаю точного местоположения.',
    en: 'I do not know my exact location.',
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'phrase-coordinates',
    category: 'location',
    kk: 'Менің координаттарым — ____.',
    ru: 'Мои координаты — ____.',
    en: 'My coordinates are ____.',
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'phrase-injured',
    category: 'condition',
    kk: 'Бір адам зардап шекті.',
    ru: 'Есть пострадавший.',
    en: 'Someone is injured.',
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'phrase-cold',
    category: 'condition',
    kk: 'Мен тоңып, су болдым.',
    ru: 'Я замёрз и промок.',
    en: 'I am cold and wet.',
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'phrase-battery',
    category: 'condition',
    kk: 'Телефонымның батареясы аз.',
    ru: 'У меня садится телефон.',
    en: 'My phone battery is low.',
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'phrase-help',
    category: 'request',
    kk: 'Көмек жіберіңіз.',
    ru: 'Пришлите помощь.',
    en: 'Please send help.',
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'phrase-stay',
    category: 'request',
    kk: 'Мен орнымда қаламын.',
    ru: 'Я останусь на месте.',
    en: 'I will stay where I am.',
    reviewStatus: REVIEW_REQUIRED,
  },
  {
    id: 'phrase-hang-up',
    category: 'request',
    kk: 'Тұтқаны қоймаңыз.',
    ru: 'Не кладите трубку.',
    en: 'Do not hang up.',
    reviewStatus: REVIEW_REQUIRED,
  },
];
