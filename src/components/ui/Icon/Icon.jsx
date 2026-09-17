import {
  // A
  ArrowRight,
  // B
  Bookmark,
  Brain,
  // C
  Calendar,
  Calculator,
  CirclePause,
  CirclePlay,
  CirclePlus,
  ChartCandlestick,
  Check,
  ChevronRight,
  ChevronDown,
  Clock,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  CreditCard,
  // D
  Delete,
  Divide,
  Dot,
  Droplet,
  Dumbbell,
  Equal,
  // E
  Ellipsis,
  // F
  FolderClosed,
  FolderOpen,
  FolderPlus,
  // G
  GalleryHorizontalEnd,
  GlassWater,
  GripHorizontal,
  // I
  Info,
  // L
  Link2,
  ListClock,
  // M
  MapPin,
  Maximize2,
  MessageCircleWarning,
  Minus,
  Moon,
  // N
  NotebookPen,
  NotepadText,
  Newspaper,
  // P
  Parentheses,
  PaintBucket,
  Plus,
  // R
  Receipt,
  Redo2,
  RotateCcw,
  // S
  Search,
  Square,
  SquareCheck,
  SquarePen,
  SquareText,
  Store,
  Sun,
  // T
  Thermometer,
  Timer,
  Trash,
  Type,
  // U
  Undo2,
  // W
  WalletCards,
  // V
  Volume2,
  VolumeOff,
  // X
  X,
} from "lucide-react";

function Pomodoro({ size = 20, className = "", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 5c-4.97 0-9 3.8-9 8.5S7.03 22 12 22s9-3.8 9-8.5S16.97 5 12 5ZM12 5c.35-1.55 1.1-2.5 2.2-3M12 5c-.35-1.55-1.1-2.5-2.2-3M12 5c-1.55-.25-2.95-.1-4.2.85M12 5c1.55-.25 2.95-.1 4.2.85M12 5c-.9 1-2.05 1.72-3.45 2.15M12 5c.9 1 2.05 1.72 3.45 2.15" />
    </svg>
  );
}

function Breathing({ size = 20, className = "", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 3v9m0 0-3-3m3 3 3-3M9 5.5C7.7 5.9 6.8 7.1 6.3 8.6L4.4 14.3C3.7 16.5 3.9 19 5.5 20.2c.7.5 1.5.8 2.4.8H10v-7.5M15 5.5c1.3.4 2.2 1.6 2.7 3.1l1.9 5.7c.7 2.2.5 4.7-1.1 5.9-.7.5-1.5.8-2.4.8H14v-7.5" />
    </svg>
  );
}

function WeatherSun({ className = "", ...props }) {
  return (
    <Sun
      className={`
        [&>circle]:stroke-yellow-400
        [&>path]:stroke-yellow-400
        ${className}
      `}
      {...props}
    />
  );
}

function WeatherMoon({ className = "", ...props }) {
  return (
    <Moon
      className={`
        [&>path]:stroke-yellow-200
        ${className}
      `}
      {...props}
    />
  );
}

function WeatherCloudSun({ className = "", ...props }) {
  return (
    <CloudSun
      className={`
        [&>path:not(:last-child)]:stroke-yellow-400
        [&>path:last-child]:stroke-slate-400
        ${className}
      `}
      {...props}
    />
  );
}

function WeatherCloud({ className = "", ...props }) {
  return (
    <Cloud
      className={`
        [&>path]:stroke-slate-400
        ${className}
      `}
      {...props}
    />
  );
}

function WeatherCloudFog({ className = "", ...props }) {
  return (
    <CloudFog
      className={`
        [&>path:first-child]:stroke-slate-400
        [&>path:not(:first-child)]:stroke-gray-300
        ${className}
      `}
      {...props}
    />
  );
}

function WeatherCloudLightning({ className = "", ...props }) {
  return (
    <CloudLightning
      className={`
        [&>path:first-child]:stroke-slate-400
        [&>path:last-child]:stroke-yellow-400
        ${className}
      `}
      {...props}
    />
  );
}

function WeatherCloudRain({ className = "", ...props }) {
  return (
    <CloudRain
      className={`
        [&>path:first-child]:stroke-slate-400
        [&>path:not(:first-child)]:stroke-blue-400
        ${className}
      `}
      {...props}
    />
  );
}

function WeatherCloudSnow({ className = "", ...props }) {
  return (
    <CloudSnow
      className={`
        [&>path:first-child]:stroke-slate-400
        [&>path:not(:first-child)]:stroke-slate-100
        ${className}
      `}
      {...props}
    />
  );
}

const icons = {
  // A
  arrowRight: ArrowRight,
  // B
  bookmark: Bookmark,
  breathing: Breathing,
  brain: Brain,
  // C
  calendar: Calendar,
  calculator: Calculator,
  circlePause: CirclePause,
  circlePlay: CirclePlay,
  circlePlus: CirclePlus,
  markets: ChartCandlestick,
  check: Check,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  clock: Clock,
  cloud: WeatherCloud,
  cloudFog: WeatherCloudFog,
  cloudLightning: WeatherCloudLightning,
  cloudMoon: CloudMoon,
  cloudRain: WeatherCloudRain,
  cloudSnow: WeatherCloudSnow,
  cloudSun: WeatherCloudSun,
  purchases: CreditCard,
  // D
  delete: Delete,
  divide: Divide,
  dot: Dot,
  dumbbell: Dumbbell,
  waterIntake: Droplet,
  equal: Equal,
  // E
  ellipsis: Ellipsis,
  // F
  folderClosed: FolderClosed,
  folderOpen: FolderOpen,
  folderPlus: FolderPlus,
  // G
  galleryHorizontalEnd: GalleryHorizontalEnd,
  glassWater: GlassWater,
  gripHorizontal: GripHorizontal,
  // I
  info: Info,
  // L
  link2: Link2,
  listClock: ListClock,
  // M
  mapPin: MapPin,
  maximize2: Maximize2,
  messageCircleWarning: MessageCircleWarning,
  minus: Minus,
  moon: WeatherMoon,
  // N
  quickNotes: NotebookPen,
  news: Newspaper,
  notepadText: NotepadText,
  // P
  parentheses: Parentheses,
  paintBucket: PaintBucket,
  plus: Plus,
  pomodoro: Pomodoro,
  // R
  receipt: Receipt,
  redo: Redo2,
  rotateCcw: RotateCcw,
  // S
  search: Search,
  square: Square,
  squareCheck: SquareCheck,
  squarePen: SquarePen,
  squareText: SquareText,
  store: Store,
  sun: WeatherSun,
  // T
  thermometer: Thermometer,
  timer: Timer,
  trash: Trash,
  type: Type,
  // U
  undo: Undo2,
  // W
  walletCards: WalletCards,
  // V
  volume2: Volume2,
  volumeOff: VolumeOff,
  // X
  x: X,
};

export function Icon({
  name,
  size = 20,
  className = "text-gray-300",
  cursorNone = false,
  ...props
}) {
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;

  return (
    <LucideIcon
      size={size}
      className={`
        shrink-0
        ${cursorNone ? "cursor-default" : "cursor-pointer"}
        ${className}
        `}
      {...props}
    />
  );
}
