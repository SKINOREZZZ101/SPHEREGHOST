// Bilingual in-app management guide content for Ghost Sphere.
export type GuideBlock =
  | { type: 'p'; text: string }
  | { type: 'steps'; items: string[] }
  | { type: 'tip'; text: string }
  | { type: 'code'; text: string };

export interface GuideSection {
  id: string;
  icon: string; // tabler icon name key (mapped in page)
  title: string;
  blocks: GuideBlock[];
}

type Lang = 'ru' | 'en';

export const GUIDE: Record<Lang, GuideSection[]> = {
  ru: [
    {
      id: 'intro',
      icon: 'sphere',
      title: 'Что такое Ghost Sphere',
      blocks: [
        {
          type: 'p',
          text: 'Ghost Sphere — это единый центр управления вашей VPN-инфраструктурой на базе экосистемы Remnawave. Из одной премиальной панели вы управляете нодами, конфигурациями Xray, пользователями, подписками, ключами, ботами и бэкапами.',
        },
        {
          type: 'p',
          text: 'Платформа разработана Ghost OS и спроектирована так, чтобы быть в разы удобнее, технологичнее и профессиональнее существующих решений: тёмный интерфейс, мгновенный поиск (Ctrl+K), живые метрики и аккуратные анимации, которые не перегружают восприятие.',
        },
        {
          type: 'tip',
          text: 'Нажмите Ctrl+K в любой момент, чтобы открыть командную палитру и мгновенно перейти к любому разделу или действию.',
        },
      ],
    },
    {
      id: 'connect',
      icon: 'plug',
      title: 'Подключение к панели',
      blocks: [
        {
          type: 'p',
          text: 'Ghost Sphere подключается к вашей панели Remnawave по защищённому API-токену. Токен хранится только в вашем браузере и используется для проксирования запросов через Ghost Sphere Core.',
        },
        {
          type: 'steps',
          items: [
            'Откройте панель Remnawave → Настройки → API-токены и создайте новый токен.',
            'Скопируйте Bearer-токен.',
            'На экране входа Ghost Sphere введите адрес панели и вставьте токен.',
            'Нажмите «Подключиться». Готово — сфера активирована.',
          ],
        },
        {
          type: 'tip',
          text: 'Если у вас ещё нет панели, нажмите «Войти в демо-режиме» — Ghost Sphere покажет полностью рабочий интерфейс на демо-данных.',
        },
      ],
    },
    {
      id: 'nodes',
      icon: 'server',
      title: 'Управление нодами',
      blocks: [
        {
          type: 'p',
          text: 'Раздел «Ноды» показывает все ваши узлы в виде карточек или таблицы с живой нагрузкой: пользователи онлайн, CPU, RAM, трафик и версия Xray. Статус подсвечивается цветным индикатором.',
        },
        {
          type: 'steps',
          items: [
            'Нажмите «Добавить ноду», заполните имя, адрес, порт и страну, выберите профиль конфигурации.',
            'Для нового сервера используйте «Мастер установки»: скопируйте команду и SECRET_KEY, выполните на сервере под root.',
            'Откройте порт 2222 для IP панели — нода подключится автоматически.',
            'Управляйте нодой через меню: включить, отключить, перезапустить, сбросить трафик или удалить.',
          ],
        },
        {
          type: 'tip',
          text: 'Множитель потребления позволяет учитывать дорогой трафик премиум-локаций при расчёте лимитов пользователей.',
        },
      ],
    },
    {
      id: 'configs',
      icon: 'braces',
      title: 'Конфигурации Xray',
      blocks: [
        {
          type: 'p',
          text: 'Профили конфигураций содержат полный JSON Xray (inbounds, outbounds, routing). Один профиль можно применить сразу к нескольким нодам — изменения раскатываются автоматически.',
        },
        {
          type: 'steps',
          items: [
            'Откройте «Конфигурации» и выберите профиль, чтобы войти в редактор.',
            'Редактируйте JSON в редакторе Monaco с подсветкой и автодополнением по схеме Xray.',
            'Нажмите «Проверить» — Ghost Sphere покажет ошибки и предупреждения (например, REALITY без realitySettings).',
            'Сгенерируйте ключи X25519 для REALITY одной кнопкой.',
            'Сохраните — профиль будет применён к связанным нодам.',
          ],
        },
        {
          type: 'tip',
          text: 'Сниппеты — это переиспользуемые фрагменты (например, блокировка рекламы), которые вставляются в конфиг через {{snippet:имя}}.',
        },
      ],
    },
    {
      id: 'users',
      icon: 'users',
      title: 'Пользователи и ключи',
      blocks: [
        {
          type: 'p',
          text: 'В разделе «Пользователи» вы создаёте ключи доступа, задаёте лимиты трафика, срок действия и стратегию сброса, наблюдаете за онлайн-статусом и расходом трафика.',
        },
        {
          type: 'steps',
          items: [
            'Нажмите «Создать пользователя», задайте имя, лимит трафика (ГБ) и срок.',
            'Скопируйте ссылку подписки иконкой копирования прямо в таблице.',
            'Через меню действий: включить/отключить, сбросить трафик, перевыпустить ключ.',
            'Используйте поиск, чтобы быстро найти пользователя по имени или email.',
          ],
        },
      ],
    },
    {
      id: 'subscriptions',
      icon: 'link',
      title: 'Подписки',
      blocks: [
        {
          type: 'p',
          text: 'Ghost Sphere поддерживает все популярные форматы выдачи: Xray JSON/Base64, Clash, Mihomo, Sing-box и Stash. Шаблоны определяют, как клиент получит конфигурацию.',
        },
        {
          type: 'p',
          text: 'В настройках подписки задаются заголовок профиля, интервал обновления, ссылка поддержки и перемешивание хостов для балансировки.',
        },
      ],
    },
    {
      id: 'integrations',
      icon: 'puzzle',
      title: 'Интеграции и боты',
      blocks: [
        {
          type: 'p',
          text: 'Ghost Sphere объединяет всю экосистему: Telegram-магазин (продажи и тарифы), админ-бот, Cloudflare-ноды (DNS по здоровью), Xray Checker и Whitebox (мониторинг), MCP-сервер (управление через LLM), бэкап-агент и WARP.',
        },
        {
          type: 'steps',
          items: [
            'Откройте «Интеграции» и выберите нужный сервис.',
            'Нажмите «Подключить» и укажите эндпоинт/секрет, если требуется.',
            'Индикатор здоровья покажет, что интеграция работает корректно.',
          ],
        },
      ],
    },
    {
      id: 'backups',
      icon: 'backup',
      title: 'Бэкапы и восстановление',
      blocks: [
        {
          type: 'p',
          text: 'Создавайте резервные копии панели, базы данных и ботов вручную или по расписанию. Поддерживаются локальное хранилище, S3, Google Drive и Telegram.',
        },
        {
          type: 'steps',
          items: [
            'Нажмите «Создать бэкап», выберите назначение и компоненты (БД, панель, боты).',
            'Включите автоматические бэкапы и задайте cron-расписание и срок хранения.',
            'Восстанавливайте из истории одной кнопкой.',
          ],
        },
      ],
    },
    {
      id: 'faq',
      icon: 'help',
      title: 'Частые вопросы',
      blocks: [
        {
          type: 'p',
          text: 'Безопасно ли хранить токен? Да — токен хранится локально в браузере и передаётся только вашему Ghost Sphere Core, который проксирует запросы к панели.',
        },
        {
          type: 'p',
          text: 'Можно ли подключить несколько панелей? Да, в настройках можно переключаться между панелями. Версия 0.0.1 закладывает основу для мультипанельного управления.',
        },
        {
          type: 'p',
          text: 'Зачем демо-режим? Чтобы изучить все возможности интерфейса без реальной инфраструктуры — идеально для оценки и обучения.',
        },
      ],
    },
  ],
  en: [
    {
      id: 'intro',
      icon: 'sphere',
      title: 'What is Ghost Sphere',
      blocks: [
        {
          type: 'p',
          text: 'Ghost Sphere is the unified command center for your VPN infrastructure built on the Remnawave ecosystem. From a single premium panel you manage nodes, Xray configurations, users, subscriptions, keys, bots and backups.',
        },
        {
          type: 'p',
          text: 'Built by Ghost OS, it is designed to be far more convenient, technological and professional than existing tools: a dark interface, instant search (Ctrl+K), live metrics and restrained animations that never overwhelm.',
        },
        {
          type: 'tip',
          text: 'Press Ctrl+K anytime to open the command palette and jump to any section or action instantly.',
        },
      ],
    },
    {
      id: 'connect',
      icon: 'plug',
      title: 'Connecting to the panel',
      blocks: [
        {
          type: 'p',
          text: 'Ghost Sphere connects to your Remnawave panel using a secure API token. The token is stored only in your browser and is used to proxy requests through Ghost Sphere Core.',
        },
        {
          type: 'steps',
          items: [
            'Open Remnawave → Settings → API tokens and create a new token.',
            'Copy the Bearer token.',
            'On the Ghost Sphere login screen, enter the panel URL and paste the token.',
            'Click “Connect”. Done — your sphere is live.',
          ],
        },
        {
          type: 'tip',
          text: 'No panel yet? Click “Enter demo mode” to explore a fully working interface on demo data.',
        },
      ],
    },
    {
      id: 'nodes',
      icon: 'server',
      title: 'Managing nodes',
      blocks: [
        {
          type: 'p',
          text: 'The Nodes section shows all your nodes as cards or a table with live load: online users, CPU, RAM, traffic and Xray version. Status is shown with a colored indicator.',
        },
        {
          type: 'steps',
          items: [
            'Click “Add node”, fill in name, address, port and country, pick a config profile.',
            'For a fresh server use the Install Wizard: copy the command and SECRET_KEY, run as root.',
            'Open port 2222 for the panel IP — the node connects automatically.',
            'Use the menu to enable, disable, restart, reset traffic or delete.',
          ],
        },
        {
          type: 'tip',
          text: 'The consumption multiplier lets you account for expensive premium-location traffic when computing user limits.',
        },
      ],
    },
    {
      id: 'configs',
      icon: 'braces',
      title: 'Xray configurations',
      blocks: [
        {
          type: 'p',
          text: 'Config profiles hold the full Xray JSON (inbounds, outbounds, routing). A single profile can be applied to many nodes — changes roll out automatically.',
        },
        {
          type: 'steps',
          items: [
            'Open “Configurations” and select a profile to enter the editor.',
            'Edit JSON in the Monaco editor with highlighting and Xray-schema autocomplete.',
            'Click “Validate” — Ghost Sphere shows errors and warnings (e.g. REALITY without realitySettings).',
            'Generate X25519 keys for REALITY with one click.',
            'Save — the profile is applied to the linked nodes.',
          ],
        },
        {
          type: 'tip',
          text: 'Snippets are reusable fragments (e.g. ad blocking) injected into the config via {{snippet:name}}.',
        },
      ],
    },
    {
      id: 'users',
      icon: 'users',
      title: 'Users and keys',
      blocks: [
        {
          type: 'p',
          text: 'In the Users section you create access keys, set traffic limits, expiry and reset strategy, and watch online status and traffic usage.',
        },
        {
          type: 'steps',
          items: [
            'Click “Create user”, set the name, traffic limit (GB) and duration.',
            'Copy the subscription link with the copy icon right in the table.',
            'Use the actions menu: enable/disable, reset traffic, revoke key.',
            'Use search to quickly find a user by name or email.',
          ],
        },
      ],
    },
    {
      id: 'subscriptions',
      icon: 'link',
      title: 'Subscriptions',
      blocks: [
        {
          type: 'p',
          text: 'Ghost Sphere supports all popular delivery formats: Xray JSON/Base64, Clash, Mihomo, Sing-box and Stash. Templates define how a client receives its configuration.',
        },
        {
          type: 'p',
          text: 'Subscription settings define the profile title, update interval, support link and host randomization for balancing.',
        },
      ],
    },
    {
      id: 'integrations',
      icon: 'puzzle',
      title: 'Integrations and bots',
      blocks: [
        {
          type: 'p',
          text: 'Ghost Sphere unifies the whole ecosystem: Telegram shop (sales and tariffs), admin bot, Cloudflare nodes (health-aware DNS), Xray Checker and Whitebox (monitoring), MCP server (LLM control), backup agent and WARP.',
        },
        {
          type: 'steps',
          items: [
            'Open “Integrations” and pick a service.',
            'Click “Connect” and provide an endpoint/secret if required.',
            'The health indicator confirms the integration works correctly.',
          ],
        },
      ],
    },
    {
      id: 'backups',
      icon: 'backup',
      title: 'Backups and restore',
      blocks: [
        {
          type: 'p',
          text: 'Create backups of the panel, database and bots manually or on a schedule. Local storage, S3, Google Drive and Telegram are supported.',
        },
        {
          type: 'steps',
          items: [
            'Click “Create backup”, choose the destination and components (DB, panel, bots).',
            'Enable automatic backups and set the cron schedule and retention.',
            'Restore from history with one click.',
          ],
        },
      ],
    },
    {
      id: 'faq',
      icon: 'help',
      title: 'FAQ',
      blocks: [
        {
          type: 'p',
          text: 'Is it safe to store the token? Yes — the token stays local in your browser and is only sent to your Ghost Sphere Core, which proxies requests to the panel.',
        },
        {
          type: 'p',
          text: 'Can I connect multiple panels? Yes, you can switch panels in settings. Version 0.0.1 lays the groundwork for multi-panel management.',
        },
        {
          type: 'p',
          text: 'Why a demo mode? To explore every interface capability without real infrastructure — perfect for evaluation and training.',
        },
      ],
    },
  ],
};
