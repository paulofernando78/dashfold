import { Clock } from "@/components/features/Clock";
import { QuickNotes } from "@/components/features/QuickNotes";
import { News } from "@/components/features/News";

// Productivity
import { Pomodoro } from "@/components/features/Pomodoro";
import { Timer } from "@/components/features/Timer";

// Finance
import { Calculator } from "@/components/features/Calculator";
// import { Purchases } from "@/components/features/Purchases";
import { Markets } from "@/components/features/Markets";

// Health
import { HIIT } from "@/components/features/HIIT";
import { WaterIntake } from "@/components/features/WaterIntake";
import { Breathing } from "@/components/features/Breathing";

const widgetWidth = `
  w-[calc(100vw-1.5rem)]
  sm:w-[254px]
`;

const wideWidgetWidth = `
  w-[calc(100vw-1.5rem)]
  sm:w-[318px]
`;

export const widgetCatalog = {
  clock: {
    category: "utilities",
    Component: Clock,
    title: "clock",
    iconName: "clock",
    widgetClassName: wideWidgetWidth,
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
    title: "quickNotes",
    iconName: "quickNotes",
    widgetClassName: `${widgetWidth}`,
    defaultConfig: {
      blocks: [],
    },
  },
  news: {
    category: "utilities",
    Component: News,
    title: "news",
    iconName: "news",
    widgetClassName: wideWidgetWidth,
    defaultConfig: {},
  },

  // Productivity
  pomodoro: {
    category: "productivity",
    Component: Pomodoro,
    title: "pomodoro",
    iconName: "pomodoro",
    widgetClassName: widgetWidth,
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
    widgetClassName: widgetWidth,
    defaultConfig: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  },

  // Health
  hiit: {
    category: "health",
    Component: HIIT,
    title: "hiit",
    iconName: "dumbbell",
    widgetClassName: widgetWidth,
    defaultConfig: {
      countdownSeconds: 5,
      goSeconds: 20,
      restSeconds: 10,
      tabataGoal: 8,
    },
  },
  waterIntake: {
    category: "health",
    title: "waterIntake",
    Component: WaterIntake,
    iconName: "waterIntake",
    widgetClassName: widgetWidth,
    defaultConfig: {},
  },
  breathing: {
    category: "health",
    title: "breathing",
    Component: Breathing,
    iconName: "breathing",
    widgetClassName: widgetWidth,
    defaultConfig: {
      inhaleSeconds: 4,
      holdInSeconds: 4,
      exhaleSeconds: 4,
    },
  },

  // Finance
  calculator: {
    category: "finance",
    Component: Calculator,
    title: "calculator",
    iconName: "calculator",
    widgetClassName: `
      w-[calc(100vw-1.5rem)]
      sm:w-[197px]
    `,
    defaultConfig: {
      display: "0",
    },
  },
  markets: {
    category: "finance",
    Component: Markets,
    title: "markets",
    iconName: "markets",
    widgetClassName: widgetWidth,
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
};
