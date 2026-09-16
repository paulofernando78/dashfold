import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n";

import { WidgetBody, WidgetControls } from "@/components/ui/Widget";

import { NumberInput } from "@/components/ui/NumberInput";

import { playTick } from "@/utils/audio";

import { PomodoroGuideDialog } from "@/components/features/PomodoroGuideDialog";

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const DEFAULT_LONG_BREAK_MINUTES = 15;
const LONG_BREAK_INTERVAL = 4;

function calculateSessionDuration({
  pomodoroGoal,
  focusDuration,
  breakDuration,
  longBreakDuration,
}) {
  const totalBreaks = Math.max(pomodoroGoal - 1, 0);

  const totalLongBreaks = Math.floor(totalBreaks / LONG_BREAK_INTERVAL);

  const totalShortBreaks = totalBreaks - totalLongBreaks;

  const totalFocusTime = pomodoroGoal * focusDuration;

  const totalShortBreakTime = totalShortBreaks * breakDuration;

  const totalLongBreakTime = totalLongBreaks * longBreakDuration;

  return totalFocusTime + totalShortBreakTime + totalLongBreakTime;
}

const durationDisplay = `
  font-['Segoe_UI',sans-serif]
  font-bold
`;

export function Pomodoro({
  focusMinutes: initialFocusMinutes = DEFAULT_FOCUS_MINUTES,
  breakMinutes: initialBreakMinutes = DEFAULT_BREAK_MINUTES,
  longBreakMinutes: initialLongBreakMinutes = DEFAULT_LONG_BREAK_MINUTES,
  pomodoroGoal: initialPomodoroGoal = 4,
  onConfigChange,
  onClose,
}) {
  const { t } = useLanguage();
  const [focusMinutes, setFocusMinutes] = useState(initialFocusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(initialBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(
    initialLongBreakMinutes,
  );
  const [pomodoroGoal, setPomodoroGoal] = useState(initialPomodoroGoal);

  const focusDuration = focusMinutes * 60;
  const breakDuration = breakMinutes * 60;
  const longBreakDuration = longBreakMinutes * 60;

  const [time, setTime] = useState(focusDuration);

  // Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editFocusMinutes, setEditFocusMinutes] = useState(initialFocusMinutes);
  const [editBreakMinutes, setEditBreakMinutes] = useState(initialBreakMinutes);
  const [editLongBreakMinutes, setEditLongBreakMinutes] = useState(
    initialLongBreakMinutes,
  );
  const [editPomodoroGoal, setEditPomodoroGoal] = useState(initialPomodoroGoal);

  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState("focus");
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const displayedPomodoro =
    mode === "focus"
      ? Math.min(completedPomodoros + 1, pomodoroGoal)
      : completedPomodoros;

  // Play Tick
  useEffect(() => {
    if (!isRunning) return;

    const intervalID = setInterval(() => {
      if (mode === "focus" && isSoundEnabled) {
        playTick();
      }

      setTime((current) => {
        if (current > 1) {
          return current - 1;
        }

        // "Focus" has finihed
        if (mode === "focus") {
          const nextPomodoro = completedPomodoros + 1;

          setCompletedPomodoros(nextPomodoro);

          // Goal is complete, so no further break is needed.
          if (nextPomodoro >= pomodoroGoal) {
            setMode("done");
            setIsRunning(false);
            return 0;
          }

          // Every four Pomodoros, a Long break replaces the short Break.
          // If nextPomodoro is divisible by 4 with no remainder, start a long break.
          if (nextPomodoro % LONG_BREAK_INTERVAL === 0) {
            setMode("long");
            return longBreakDuration;
          }

          // Start a short break before the next "Focus"
          setMode("break");
          return breakDuration;
        }

        // A short or long break finished
        if (mode === "break" || mode === "long") {
          setMode("focus");
          return focusDuration;
        }

        return current;
      });
    }, 1000);

    return () => clearInterval(intervalID);
  }, [
    isRunning,
    mode,
    completedPomodoros,
    pomodoroGoal,
    focusDuration,
    breakDuration,
    longBreakDuration,
    isSoundEnabled,
  ]);

  const activeFocusModeClass =
    "text-green-400 [text-shadow:0_0_8px_rgba(0,225,0,0.8)]";

  const activeBreakModeClass =
    "text-yellow-400 [text-shadow:0_0_8px_rgba(255,255,0,0.8)]";
  const activeLongModeClass =
    "text-blue-400 [text-shadow:0_0_12px_rgba(96,165,250,1)]";
  const activePomodoroDoneModeClass =
    "text-red-400 [text-shadow:0_0_8px_rgba(248,113,113,0.8)] animate-pulse";

  const activeModeClass = {
    focus: activeFocusModeClass,
    break: activeBreakModeClass,
    long: activeLongModeClass,
    done: activePomodoroDoneModeClass,
  };

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function formatTotalTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  const editingSessionDuration = calculateSessionDuration({
    pomodoroGoal: editPomodoroGoal,
    focusDuration: editFocusMinutes * 60,
    breakDuration: editBreakMinutes * 60,
    longBreakDuration: editLongBreakMinutes * 60,
  });

  function getRemainingSessionDuration() {
    if (mode === "done") return 0;

    const remainingFocusSessions =
      mode === "focus"
        ? pomodoroGoal - completedPomodoros - 1
        : pomodoroGoal - completedPomodoros;

    const remainingBreaks = Math.max(remainingFocusSessions, 0);

    const remainingLongBreaks = Math.floor(
      remainingBreaks / LONG_BREAK_INTERVAL,
    );
    const remainingShortBreaks = remainingBreaks - remainingLongBreaks;

    return (
      time +
      remainingFocusSessions * focusDuration +
      remainingShortBreaks * breakDuration +
      remainingLongBreaks * longBreakDuration
    );
  }

  const totalTime = formatTotalTime(
    isEditing ? editingSessionDuration : getRemainingSessionDuration(),
  );

  function handleEdit() {
    setIsRunning(false);
    setEditFocusMinutes(focusMinutes);
    setEditBreakMinutes(breakMinutes);
    setEditLongBreakMinutes(longBreakMinutes);
    setEditPomodoroGoal(pomodoroGoal);
    setIsEditing(true);
  }

  function applyEditSettings(shouldStart) {
    const nextConfig = {
      focusMinutes: editFocusMinutes,
      breakMinutes: editBreakMinutes,
      longBreakMinutes: editLongBreakMinutes,
      pomodoroGoal: editPomodoroGoal,
    };

    setFocusMinutes(nextConfig.focusMinutes);
    setBreakMinutes(nextConfig.breakMinutes);
    setLongBreakMinutes(nextConfig.longBreakMinutes);
    setPomodoroGoal(nextConfig.pomodoroGoal);
    setTime(nextConfig.focusMinutes * 60);
    setCompletedPomodoros(0);
    setMode("focus");
    setIsRunning(shouldStart);
    setIsEditing(false);
    onConfigChange?.(nextConfig);
  }

  function handleConfirmEdit() {
    applyEditSettings(false);
  }

  function handleToggle() {
    if (isEditing) {
      applyEditSettings(true);
      return;
    }

    if (mode === "done") return;

    setIsRunning((current) => !current);
  }

  function handleToggleSound() {
    setIsSoundEnabled((current) => !current);
  }

  function handleReset() {
    setIsRunning(false);

    setEditFocusMinutes(focusMinutes);
    setEditBreakMinutes(breakMinutes);
    setEditLongBreakMinutes(longBreakMinutes);
    setEditPomodoroGoal(pomodoroGoal);

    setCompletedPomodoros(0);
    setMode("focus");
    setTime(focusMinutes * 60);
  }

  return (
    <>
      <WidgetBody
        onClose={onClose}
        top={
          <div
            className="
              flex
              flex-col
              gap-4
              items-center
              justify-center
            "
          >
            <span>{totalTime}</span>
            {!isEditing && (
              <WidgetControls.Sound
                isSoundEnabled={isSoundEnabled}
                onClick={handleToggleSound}
              />
            )}
          </div>
        }
        middle={
          <div
            className="
              text-center
              uppercase
            "
          >
            {isEditing ? (
              <div
                className="
                  grid
                  grid-cols-[1fr_auto]
                  gap-4
                  mx-auto
                  w-max
                "
              >
                <span className="place-self-center">{t("focus")}</span>
                <NumberInput
                  hideLabel
                  label="Pomodoro Goal"
                  name="pomodoro-goal"
                  value={editPomodoroGoal}
                  onChange={setEditPomodoroGoal}
                  min={1}
                />
                <span className="place-self-center">{t("minutes")}</span>
                <NumberInput
                  hideLabel
                  label="focus"
                  name="focus"
                  value={editFocusMinutes}
                  onChange={setEditFocusMinutes}
                  min={1}
                />
                <span className="place-self-center">{t("break")}</span>
                <NumberInput
                  hideLabel
                  label="break"
                  name="break"
                  value={editBreakMinutes}
                  onChange={setEditBreakMinutes}
                  min={0}
                />
                <span className="place-self-center">{t("long")}</span>
                <NumberInput
                  hideLabel
                  label="long break"
                  name="long-break"
                  value={editLongBreakMinutes}
                  onChange={setEditLongBreakMinutes}
                  min={0}
                />
              </div>
            ) : (
              <div
                className={`
                    flex
                    flex-col
                    gap-4
                  `}
              >
                <p
                  className={`text-3xl font-bold uppercase ${activeModeClass[mode]}`}
                >
                  {t(mode)}
                </p>
                <span className={`text-2xl ${durationDisplay}`}>
                  {formatTime(time)}
                </span>
                <span className="p- text-xl font-bold">
                  {t("focus")} {displayedPomodoro} {t("of")} {pomodoroGoal}
                </span>
              </div>
            )}
          </div>
        }
        bottom={
          <WidgetControls>
            <WidgetControls.Play
              isRunning={isRunning}
              onClick={handleToggle}
              disabled={mode === "done" && !isEditing}
            />
            <WidgetControls.Edit
              isEditing={isEditing}
              onEdit={handleEdit}
              onConfirm={handleConfirmEdit}
            />
            <WidgetControls.Reset onClick={handleReset} />
            <PomodoroGuideDialog />
          </WidgetControls>
        }
      />
    </>
  );
}
