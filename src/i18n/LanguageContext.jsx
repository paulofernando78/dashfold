import { createContext, useContext, useState } from "react";

const LANGUAGE_STORAGE_KEY = "language";

const messages = {
  en: {
    homeDescription: "Everything you need in one place.",
    login: "Login",
    widgets: "Widgets",
    taskBoard: "Task Board",
    select: "Select",
    addWidget: "Add widget",
    utilities: "Utilities",
    productivity: "Productivity",
    finance: "Finance",
    health: "Health",
    clock: "Clock",
    quickNotes: "Quick notes",
    news: "News",
    latestNews: "Latest news",
    noNews: "No news available.",
    newsError: "Could not load news.",
    openArticle: "Open article",
    pomodoro: "Pomodoro",
    timer: "Timer",
    calculator: "Calculator",
    markets: "Markets",
    hiit: "HIIT",
    waterIntake: "Water intake",
    breathing: "Breathing",
    now: "Now",
    maximum: "max",
    minimum: "min",
    typeLocation: "Type location",
    toDo: "To Do",
    inProgress: "In progress",
    done: "Done",
    addTask: "Add task...",
    taskBoardNotice:
      "Break your big task into 'Micro-Wins'. Pick ONLY 3 things to do today. If you do these, the day is a success. Everything else is a bonus.",
    error: "Error",
    countdown: "Countdown",
    go: "Go",
    rest: "Rest",
    workoutComplete: "Workout complete",
    rounds: "Rounds",
    round: "Round",
    of: "of",
    focus: "Focus",
    break: "Break",
    long: "Long break",
    minutes: "Minutes",
    ready: "Ready?",
    breatheIn: "Breathe in",
    breatheOut: "Breathe out",
    hold: "Hold",
    holdIn: "Hold",
    holdOut: "Hold",
    breathingPattern: "Breathing pattern",
    sessionDuration: "Session duration",
    minute: "minute",
  },
  pt: {
    homeDescription: "Tudo o que você precisa em um só lugar.",
    login: "Entrar",
    widgets: "Widgets",
    taskBoard: "Quadro de tarefas",
    select: "Selecionar",
    addWidget: "Adicionar widget",
    utilities: "Utilidades",
    productivity: "Produtividade",
    finance: "Finanças",
    health: "Saúde",
    clock: "Relógio",
    quickNotes: "Notas rápidas",
    news: "Notícias",
    latestNews: "Últimas notícias",
    noNews: "Nenhuma notícia disponível.",
    newsError: "Não foi possível carregar as notícias.",
    openArticle: "Abrir notícia",
    pomodoro: "Pomodoro",
    timer: "Temporizador",
    calculator: "Calculadora",
    markets: "Mercados",
    hiit: "HIIT",
    waterIntake: "Consumo de água",
    breathing: "Respiração",
    now: "Agora",
    maximum: "máx",
    minimum: "mín",
    typeLocation: "Digite uma localização",
    toDo: "Fazer",
    inProgress: "Em andamento",
    done: "Concluído",
    addTask: "Adicionar tarefa...",
    taskBoardNotice:
      "Divida sua tarefa maior em pequenas conquistas. Escolha SOMENTE 3 coisas para fazer hoje. Se concluí-las, o dia foi um sucesso. Todo o resto é bônus.",
    error: "Erro",
    countdown: "Contagem",
    go: "Exercício",
    rest: "Descanso",
    workoutComplete: "Treino concluído",
    rounds: "Rodadas",
    round: "Rodada",
    of: "de",
    focus: "Foco",
    break: "Pausa",
    long: "Pausa longa",
    minutes: "Minutos",
    ready: "Prepare-se",
    breatheIn: "Inspire",
    breatheOut: "Expire",
    hold: "Segure",
    holdIn: "Segure",
    holdOut: "Segure",
    breathingPattern: "Padrão respiratório",
    sessionDuration: "Duração da sessão",
    minute: "minuto",
  },
};

const LanguageContext = createContext(null);

function getInitialLanguage() {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return savedLanguage === "pt" || savedLanguage === "en"
    ? savedLanguage
    : navigator.language.toLowerCase().startsWith("pt")
      ? "pt"
      : "en";
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  function setLanguage(nextLanguage) {
    if (!messages[nextLanguage]) return;
    setLanguageState(nextLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage === "pt" ? "pt-BR" : "en";
  }

  function t(key) {
    return messages[language][key] ?? messages.en[key] ?? key;
  }

  const locale = language === "pt" ? "pt-BR" : "en-US";

  return (
    <LanguageContext value={{ language, locale, setLanguage, t }}>
      {children}
    </LanguageContext>
  );
}

// The provider and its companion hook intentionally live together.
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
