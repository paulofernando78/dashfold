import { Clock } from "@/components/features/Clock";
import { QuickNotes } from "@/components/features/QuickNotes";

// Productivity
import { Pomodoro } from "@/components/features/Pomodoro";
import { Timer } from "@/components/features/Timer";

// Finance
import { Calculator } from "@/components/features/Calculator";
// import { Purchases } from "@/components/features/Purchases";
import { Markets } from "@/components/features/Markets";

// Health
import { Tabata } from "@/components/features/Tabata";
import { WaterIntake } from "@/components/features/WaterIntake";
import { Breathing } from "@/components/features/Breathing";

const bg = `
  bg-gray-100/10
`;

export const widgetCatalog = {
  clock: {
    category: "utilities",
    Component: Clock,
    title: "clock",
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
    title: "quick notes",
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
    title: "pomodoro",
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
    title: "timer",
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
    title: "calculator",
    iconName: "calculator",
    widgetClassName: `w-[197px] ${bg}`,
    defaultConfig: {
      display: "0",
    },
  },
  markets: {
    category: "finance",
    Component: Markets,
    title: "markets",
    iconName: "markets",
    widgetClassName: `w-[339px] ${bg}`,
    defaultConfig: {},
  },
  // purchases: {
  //   category: "finance",
  //   Component: Purchases,
  //   title: "Purchases",
  //   iconName: "purchases",
  //   widgetClassName: `w-[220px] ${bg}`,
  //   defaultConfig: {},
  // },

  // Health
  tabata: {
    category: "health",
    Component: Tabata,
    title: "tabata",
    iconName: "dumbbell",
    widgetClassName: `w-[235.19px] ${bg}`,
    defaultConfig: {
      countdownSeconds: 5,
      goSeconds: 20,
      restSeconds: 10,
      tabataGoal: 8,
    },
  },
  waterIntake: {
    category: "health",
    title: "water intake",
    Component: WaterIntake,
    iconName: "waterIntake",
    widgetClassName: `w-[222.45px] ${bg}`,
    defaultConfig: {},
  },
  breathing: {
    category: "health",
    title: "breathing",
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
