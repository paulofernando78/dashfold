import { Clock } from "@/components/features/Clock";
import { QuickNotes } from "@/components/features/QuickNotes";

// Productivity
import { Pomodoro } from "@/components/features/Pomodoro";
import { Timer } from "@/components/features/Timer";

// Finance
import { Calculator } from "@/components/features/Calculator";
import { Purchases } from "@/components/features/Purchases";
import { Markets } from "@/components/features/Markets";

// Health
import { WaterIntake } from "@/components/features/WaterIntake";
import { Breathing } from "@/components/features/Breathing";

const bg = `
  bg-gray-100/10
`;

export const widgetCatalog = {
  clock: {
    category: "utilities",
    Component: Clock,
    title: "Clock",
    iconName: "clock",
    widgetClassName: `w-[318.03px] ${bg}`,
    defaultConfig: {
      location: "São Paulo, São Paulo, Brasil",
      latitude: -23.55052,
      longitude: -46.63331,
      timezone: "America/Sao_Paulo",
    },
  },
  quickNotes: {
    category: "productivity",
    Component: QuickNotes,
    title: "Quick Notes",
    iconName: "quickNotes",
    widgetClassName: "w-[206px] paper-texture",
    defaultConfig: {
      blocks: [],
    },
  },

  // Productivity
  pomodoro: {
    category: "productivity",
    Component: Pomodoro,
    title: "Pomodoro",
    iconName: "pomodoro",
    widgetClassName: bg,
    defaultConfig: {
      focusMinutes: 25,
      breakMinutes: 5,
      longBreakMinutes: 15,
      pomodoroGoal: 4,
    },
  },
  timer: {
    category: "productivity",
    Component: Timer,
    title: "Timer",
    iconName: "timer",
    widgetClassName: `w-[235.19px] ${bg}`,
    defaultConfig: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  },

  // Finance
  calculator: {
    category: "finance",
    Component: Calculator,
    title: "Calculator",
    iconName: "calculator",
    widgetClassName: bg,
    defaultConfig: {
      display: "0",
    },
  },
  markets: {
    category: "finance",
    Component: Markets,
    title: "Markets",
    iconName: "markets",
    widgetClassName: `w-[339px] ${bg}`,
    defaultConfig: {},
  },
  purchases: {
    category: "finance",
    Component: Purchases,
    title: "Purchases",
    iconName: "purchases",
    widgetClassName: `w-[220px] ${bg}`,
    defaultConfig: {},
  },

  // Health
  waterIntake: {
    category: "health",
    title: "Water intake",
    Component: WaterIntake,
    iconName: "waterIntake",
    widgetClassName: bg,
    defaultConfig: {},
  },
  breathing: {
    category: "health",
    title: "Breathing",
    Component: Breathing,
    iconName: "breathing",
    widgetClassName: `w-[232px] ${bg}`,
    defaultConfig: {
      inhaleSeconds: 4,
      holdInSeconds: 4,
      exhaleSeconds: 4,
    },
  },
};
