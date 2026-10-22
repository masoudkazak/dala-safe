import type { FeatureState, LocalizedText } from '../../domain/types';

export const FEATURE_STATUS_ROUTE_PATH = '/status';

export const FEATURE_STATES: readonly FeatureState[] = [
  'available',
  'demo',
  'planned',
  'requires-integration',
  'needs-verification',
];

export interface FeatureRegistryEntry {
  id: string;
  label: LocalizedText;
  state: FeatureState;
  note: LocalizedText;
  productionNote?: LocalizedText;
}

export const FEATURE_REGISTRY: readonly FeatureRegistryEntry[] = [
  {
    id: 'trip-crud',
    label: {
      kk: 'Сапарлар: қосу, өңдеу, жою',
      ru: 'Поездки: создание, изменение, удаление',
      en: 'Trips: create, edit, delete',
    },
    state: 'available',
    note: {
      kk: 'Сапарлар тек осы браузерде сақталады. Қосу, өңдеу, көшірме жасау, жою және мәртебені өзгерту автоматтық тестермен қамтылған.',
      ru: 'Поездки хранятся только в этом браузере. Создание, редактирование, дублирование, удаление и смена статуса покрыты автотестами.',
      en: 'Trips are stored in this browser only. Creating, editing, duplicating, deleting and status changes are covered by automated tests.',
    },
  },
  {
    id: 'checklist',
    label: {
      kk: 'Дайындық чек-тізімі',
      ru: 'Чек-лист готовности',
      en: 'Readiness checklist',
    },
    state: 'available',
    note: {
      kk: 'Үлгі және тапсырыс бойынша тармақтар, прогресс және сақтау іске асырылып, тестіленген; әр белгі осы құрылғыда сақталады.',
      ru: 'Шаблонные и пользовательские пункты, прогресс и сохранение реализованы и покрыты тестами; каждая отметка хранится на этом устройстве.',
      en: 'Template and custom items, progress and persistence are implemented and tested; every tick is stored on this device.',
    },
  },
  {
    id: 'safety-plan',
    label: {
      kk: 'Қауіпсіздік жоспары',
      ru: 'План безопасности',
      en: 'Safety plan',
    },
    state: 'needs-verification',
    note: {
      kk: 'Жоспар дайындық жауаптары мен сенімді байланыс деректерінен браузерде құрастырылады; құрастыру және сақтау үдерісінде бөлек автоматтық тест жоқ.',
      ru: 'План собирается в браузере из ответов о готовности и контакта доверенного человека; у процесса создания и сохранения нет отдельного автотеста.',
      en: 'The plan is built in the browser from readiness answers and trusted-contact fields; the generate-and-save flow has no dedicated automated test.',
    },
    productionNote: {
      kk: 'Құрастыру және сақтау үдерісін автоматтық қамту және жоспар басып шығаратын ұсыныстардың тиісті сарапшылық шолуы.',
      ru: 'Автотесты процесса создания и сохранения, а также экспертная проверка рекомендаций, которые показывает план.',
      en: 'Automated coverage of the generate-and-save flow, plus authoritative review of the recommendations the plan shows.',
    },
  },
  {
    id: 'rule-guidance',
    label: {
      kk: 'Ережеге негізделген нұсқаулық',
      ru: 'Рекомендации по правилам',
      en: 'Rule-based guidance',
    },
    state: 'needs-verification',
    note: {
      kk: 'Ережелер движогі, каталог және нұсқаулық беті іске асырылып, тестіленген; әр ережеде дереккөз, шолу және аударма мәртебесі бар.',
      ru: 'Движок правил, каталог и страница рекомендаций реализованы и покрыты тестами; у каждого правила есть источник, статус проверки и статус перевода.',
      en: 'The rules engine, catalog and guidance page are implemented and tested; every rule carries a source, review status and translation status.',
    },
    productionNote: {
      kk: 'Әр ережені білікті маман шолуы, қазақша және орысша мәтіннің адам шолуы және мерзімі қайта тексерілуі.',
      ru: 'Экспертная проверка каждого правила квалифицированным специалистом, вычитка казахского и русского текста человеком и повторная проверка с датой.',
      en: 'Expert review of every rule by a qualified specialist, human review of the Kazakh and Russian wording, and dated re-verification.',
    },
  },
  {
    id: 'message-sharing',
    label: {
      kk: 'Қауіпсіздік жоспары хабарламалары',
      ru: 'Сообщения плана безопасности',
      en: 'Safety plan messages',
    },
    state: 'available',
    note: {
      kk: 'Хабарламаны құрастыру, көшіру, бөлісу және электрондық пошта жобасын құру іске асырылып, тестіленген; Dala Safe хабарламаны сіздің орныңыза жібермейді.',
      ru: 'Создание, копирование, отправка через системный диалог и подготовка письма реализованы и покрыты тестами; Dala Safe не отправляет сообщения за вас.',
      en: 'Generating, copying, sharing and building an email draft are implemented and tested; Dala Safe never sends a message for you.',
    },
  },
  {
    id: 'calendar-ics',
    label: {
      kk: 'Күнтізбе ескертпесі (.ics)',
      ru: 'Календарное напоминание (.ics)',
      en: 'Calendar reminder (.ics)',
    },
    state: 'available',
    note: {
      kk: 'Күнтізбе файлын құрастыру, тексеру және атауды өңдеу бөлек тестермен қамтылған; ескертпе жұмыс істеуі күнтізбе бағдарламасына байланысты.',
      ru: 'Генерация файла календаря, валидация и имя файла покрыты отдельными тестами; срабатывание напоминаний зависит от календарного клиента.',
      en: 'Calendar file generation, validation and filename handling have dedicated tests; whether alarms fire still depends on the calendar client.',
    },
  },
  {
    id: 'emergency-screen',
    label: {
      kk: 'Төтенше жағдай экраны',
      ru: 'Экран экстренной помощи',
      en: 'Emergency screen',
    },
    state: 'needs-verification',
    note: {
      kk: 'Экран, tel: сілтемелері, дереккөз белгілері және шолу таңбалары іске асырылып, тестіленген; жеткізілген әр нөмір әлі де адам шолуына белгіленген.',
      ru: 'Экран, tel:-ссылки, ссылки на источники и статусы проверки реализованы и покрыты тестами; каждый номер в данных всё ещё помечен на проверку человеком.',
      en: 'The screen, tel: links, source labels and review badges are implemented and tested; every shipped number is still flagged for human review.',
    },
    productionNote: {
      kk: 'Әр нөмірді атауы мен дереккөзі көрсетілген шолушының мерзімді тексеруі және шығару алдында жоспарлы қайта тексеру.',
      ru: 'Проверка каждого номера с датой, источником и именем проверяющего, а также плановый повторный контроль перед релизом.',
      en: 'A dated, sourced verification pass over every number by a named reviewer, plus a scheduled re-check before release.',
    },
  },
  {
    id: 'geolocation',
    label: {
      kk: 'Құрылғы геолокациясы',
      ru: 'Геолокация устройства',
      en: 'Device geolocation',
    },
    state: 'available',
    note: {
      kk: 'Рұқсат, дәлдік мәртебелері және координаталарды көшіру немесе бөлісу құрылғы жауаптарын ұқсатып тестіленген; артқы фонда ештеңе бақыламайды.',
      ru: 'Разрешение, состояния точности и копирование или отправка координат реализованы и покрыты тестами с имитацией ответов устройства; в фоне ничего не отслеживается.',
      en: 'Permission, accuracy states and copy or share of coordinates are implemented and tested with simulated device answers; nothing tracks you in the background.',
    },
  },
  {
    id: 'phrasebook',
    label: {
      kk: 'Төтенше жағдай сөздігі',
      ru: 'Разговорник для экстренных ситуаций',
      en: 'Emergency phrasebook',
    },
    state: 'needs-verification',
    note: {
      kk: 'Тармақтар қазақша, орысша және ағылшынша көрсетіліп, рендеринг тестімен қамтылған; мәтін машиналық көмекті аударма және шолуға белгіленген.',
      ru: 'Фразы отображаются на казахском, русском и английском и покрыты тестом отрисовки; формулировки машинного перевода и помечены на проверку.',
      en: 'Entries render in Kazakh, Russian and English and are covered by a rendering test; the wording is machine-assisted and labelled for review.',
    },
    productionNote: {
      kk: 'Әр сөзді тілді білетін адамның шолуы және ресми төтенше терминологияге қарсы соңғы тексеру.',
      ru: 'Проверка каждой фразы компетентным носителем или специалистом и финальное сверение с официальной экстренной терминологией.',
      en: 'Human review of every phrase by a competent speaker and a final check against official emergency terminology.',
    },
  },
  {
    id: 'offline-pwa',
    label: {
      kk: 'Оффлайн орнату (PWA)',
      ru: 'Оффлайн-установка (PWA)',
      en: 'Offline install (PWA)',
    },
    state: 'needs-verification',
    note: {
      kk: 'Манифест, сервис-жұмысшы және кэшті жаңарту үдерісі іске асырылған, бірақ осы репозиторийде нақты байланыс үзілуін тесттейтін ештеңе жоқ.',
      ru: 'Манифест, service worker и обновление кэша реализованы, но в репозитории нет теста реального отключения сети.',
      en: 'Manifest, service worker and the cache update flow are implemented, but nothing in this repository tests a real network disconnect.',
    },
    productionNote: {
      kk: 'Автоматтық оффлайн тестер, нақты құрылғыларда орнату мен байланыссыз жұмысты растау және кэш нұсқасы бар HTTPS орналастыру.',
      ru: 'Автотесты оффлайна, проверка установки и работы без сети на реальных устройствах и развёртывание по HTTPS с версионированием кэша.',
      en: 'Automated offline tests, a verified install and disconnect flow on real devices, and HTTPS deployment with cache versioning.',
    },
  },
  {
    id: 'gpx-import-export',
    label: {
      kk: 'GPX импорті және экспорты',
      ru: 'Импорт и экспорт GPX',
      en: 'GPX import and export',
    },
    state: 'available',
    note: {
      kk: 'Талдау, жол қорытындысы, экспорт және схемалық жол картасы іске асырылып, тестіленген; карта жергілікті сурет, навигация емес.',
      ru: 'Разбор файла, сводка маршрута, экспорт и схематическая карта реализованы и покрыты тестами; карта — локальная отрисовка, а не навигация.',
      en: 'Parsing, the track summary, export and the schematic route map are implemented and tested; the map is a local drawing, not navigation.',
    },
  },
  {
    id: 'data-management',
    label: {
      kk: 'Деректерді экспорттау, импорттау және жою',
      ru: 'Экспорт, импорт и удаление данных',
      en: 'Data export, import and delete',
    },
    state: 'available',
    note: {
      kk: 'Экспорт, импорт, жою, квота немесе бүлінген деректерді өңдеу іске асырылып, тестіленген; бәрі осы браузерде қалады.',
      ru: 'Экспорт, импорт, удаление и обработка квоты или повреждений реализованы и покрыты тестами; всё остаётся в этом браузере.',
      en: 'Export, import, deletion and quota or corruption handling are implemented and tested; everything stays in this browser.',
    },
  },
  {
    id: 'tour',
    label: {
      kk: 'Өнімге шолу',
      ru: 'Обзор продукта',
      en: 'Product tour',
    },
    state: 'available',
    note: {
      kk: 'Он бір қадамдық тур іске асырылған және талап етілген 9 автоматтық тестпен тексерілген.',
      ru: 'Одиннадцатишаговый обзор реализован и покрыт 9 обязательными автотестами.',
      en: 'The eleven-step tour is implemented and covered by 9 automated tests.',
    },
    productionNote: {
      kk: 'Әр қадам қосымшаның нақты компоненттерін қолданады және үлгі деректерді нақты жергілікті жолаушы деректерінен бөлек ұстайды.',
      ru: 'Каждый шаг использует реальные компоненты приложения и хранит демоданные отдельно от реальных локальных данных пользователя.',
      en: 'Each step uses real application components and keeps demo data separate from the real local user data.',
    },
  },
  {
    id: 'route-planning',
    label: {
      kk: 'Маршрутты жоспарлау',
      ru: 'Планирование маршрута',
      en: 'Route planning',
    },
    state: 'demo',
    note: {
      kk: 'Тек үлгі маршруттармен интерактивті демонстрация бар; қадамдық навигация немесе тірі карта жоқ.',
      ru: 'Есть только интерактивная демонстрация на примерных маршрутах; пошаговой навигации и живой карты нет.',
      en: 'Only an interactive demonstration on sample routes exists; there is no turn-by-turn navigation or live map.',
    },
    productionNote: {
      kk: 'Расталған карта деректері немесе келісімді жеткізуші, лицензия шарттары, офлайн тайлдар және маршрут есебі мен рендеринг тестері.',
      ru: 'Проверенные данные карты или согласованный провайдер, условия лицензии, офлайн-тайлы и тесты расчёта и отрисовки маршрута.',
      en: 'Verified map data or an agreed provider, licence terms, offline tiles and tests for route calculations and rendering.',
    },
  },
  {
    id: 'learning',
    label: {
      kk: 'Жаттығу режимі',
      ru: 'Режим практики',
      en: 'Practice mode',
    },
    state: 'demo',
    note: {
      kk: 'Тек үлгі деректермен демонстрация бар; мұнда нақты дайындық бағаланбайды.',
      ru: 'Есть только демонстрация на демонстрационных данных; здесь не оценивается реальная готовность.',
      en: 'Only a demonstration with sample data exists; nothing here assesses real readiness.',
    },
    productionNote: {
      kk: 'Шолудан өткен оқу мазмұны, анықталған оқу нәтижелері және жаттығу үдерісі үйрететінімен сәйкесін тесттер.',
      ru: 'Проверенный учебный контент, определённые результаты обучения и тесты соответствия практики заявленному.',
      en: 'Reviewed training content, defined learning outcomes and tests that the practice flow matches what it claims to teach.',
    },
  },
  {
    id: 'weather',
    label: {
      kk: 'Нақты ауа райы болжамы',
      ru: 'Прогноз погоды',
      en: 'Live weather forecast',
    },
    state: 'requires-integration',
    note: {
      kk: 'Тек үлгі деректермен демонстрация бар; дайындық саяхатшының өзі хабарлағанына сүйенеді.',
      ru: 'Есть только демонстрация на демонстрационных данных; готовность опирается на то, что сообщает путешественник.',
      en: 'Only a sample-data demonstration exists; readiness relies on what the traveler reports.',
    },
    productionNote: {
      kk: 'Лицензияланған болжам дереккөзі, нақты уақыт белгісі бар офлайн кэш, дереккөзді көрсету және мәлімдеме алдында тексеру.',
      ru: 'Лицензированный источник прогноза, офлайн-кэш с явными отметками времени, указание источника и проверка до любых заявлений.',
      en: 'A licensed forecast source, offline caching with explicit timestamps, attribution and verification before any claim.',
    },
  },
  {
    id: 'regional-risk',
    label: {
      kk: 'Өңірлік қауіп туралы ақпарат',
      ru: 'Региональная информация об опасностях',
      en: 'Regional hazard information',
    },
    state: 'requires-integration',
    note: {
      kk: 'Тек үлгі деректермен демонстрация бар; қосымша қауіп деректерін ағымдағы немесе ресми ретінде көрсетпейді.',
      ru: 'Есть только демонстрация на демонстрационных данных; приложение никогда не показывает данные об опасностях как актуальные или официальные.',
      en: 'Only a sample-data demonstration exists; the app never presents hazard data as current or official.',
    },
    productionNote: {
      kk: 'Ресми немесе лицензияланған қауіп ағыны, расталған жариялаушы, мерзімді жаңартулар және деректің мағынасының нақты шектері.',
      ru: 'Официальный или лицензированный поток данных об опасностях с проверенным издателем, датированными обновлениями и ясными ограничениями.',
      en: 'An official or licensed hazard feed with a verified publisher, dated updates and clear limits on what the data means.',
    },
  },
  {
    id: 'group',
    label: {
      kk: 'Топты үйлестіру',
      ru: 'Координация группы',
      en: 'Group coordination',
    },
    state: 'requires-integration',
    note: {
      kk: 'Тек үлгі деректермен демонстрация бар; әр құрылғы өз деректерін қалпында сақтайды, ортақ күй жоқ.',
      ru: 'Есть только демонстрация на демонстрационных данных; каждое устройство хранит свои данные, общего состояния нет.',
      en: 'Only a sample-data demonstration exists; each device keeps its own data with no shared state.',
    },
    productionNote: {
      kk: 'Тіркелгілері бар бэкенд, келісім мен құпиялылықты өңдеу, сондай-ақ қайшылық пен оффлайн мінез-құлқына тестер.',
      ru: 'Бэкенд с аккаунтами, согласием и обработкой персональных данных, а также тесты конфликтов и офлайн-поведения.',
      en: 'A backend with accounts, consent and privacy handling, plus tests for conflict and offline behaviour.',
    },
  },
  {
    id: 'checkin-escalation',
    label: {
      kk: 'Хабарласу және эскалация',
      ru: 'Check-in и эскалация',
      en: 'Check-in and escalation',
    },
    state: 'requires-integration',
    note: {
      kk: 'Тек үлгі деректермен демонстрация бар; қосымша жіберілген хабарласуды байқамайды және сіздің орныңыза ешкімге хабарласпайды.',
      ru: 'Есть только демонстрация на демонстрационных данных; приложение не замечает пропущенный check-in и не связывается с кем-либо за вас.',
      en: 'Only a sample-data demonstration exists; the app cannot notice a missed check-in or contact anyone for you.',
    },
    productionNote: {
      kk: 'Серверлік таймерлер, push жіберу, хабарлатуға келіскен байланыс адамдары және жалған дабыл мен байланыс жоғалтуына тестер.',
      ru: 'Серверные таймеры, доставка push, согласие контактов на оповещение и тесты ложных срабатываний и потери сети.',
      en: 'Server-side timers, push delivery, contacts who agree to be alerted, and tests for false alarms and network loss.',
    },
  },
  {
    id: 'satellite',
    label: {
      kk: 'Спутникалық SOS',
      ru: 'Спутниковый SOS',
      en: 'Satellite SOS',
    },
    state: 'requires-integration',
    note: {
      kk: 'Тек үлгі деректермен демонстрация бар; қосымшада спутникалық жабдық немесе құтқару байланысы жоқ.',
      ru: 'Есть только демонстрация на демонстрационных данных; у приложения нет спутникового оборудования и связи со спасателями.',
      en: 'Only a sample-data demonstration exists; the app has no satellite hardware or rescue link.',
    },
    productionNote: {
      kk: 'Спутникалық жеткізушімен келісім, үйлесімді жабдық, нақты пайдаланушы келісімі және жеткізуді растау тестері.',
      ru: 'Соглашение со спутниковым провайдером, совместимое оборудование, явное согласие пользователя и тесты подтверждения доставки.',
      en: 'An agreement with a satellite provider, compatible hardware, clear user consent and tested delivery receipts.',
    },
  },
];

const COUNTS: Record<FeatureState, number> = {
  available: 0,
  demo: 0,
  planned: 0,
  'requires-integration': 0,
  'needs-verification': 0,
};

for (const feature of FEATURE_REGISTRY) {
  COUNTS[feature.state] += 1;
}

export const FEATURE_COUNT_BY_STATE: Readonly<Record<FeatureState, number>> = COUNTS;

export function getFeature(id: string): FeatureRegistryEntry | undefined {
  return FEATURE_REGISTRY.find((feature) => feature.id === id);
}
