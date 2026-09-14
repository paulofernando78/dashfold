import { useEffect, useState } from "react";

import {
  WidgetBody,
  WidgetControls,
  widgetInnerBorder,
} from "@/components/ui/Widget";
import { NumberInput } from "@/components/ui/NumberInput";
import { playTick } from "@/utils/audio";

const DEFAULT_COUNTDOWN_SECONDS = 5;
const DEFAULT_GO_SECONDS = 20;
const DEFAULT_REST_SECONDS = 10;
const DEFAULT_TABATA_GOAL = 8;

const durationTitle = "flex flex-col justify-self-center";
const durationDisplay = "font-['Segoe_UI',sans-serif] font-bold";
const inactiveModeClass = "text-gray-400";

function calculateSessionDuration({
  countdownSeconds,
  goSeconds,
  restSeconds,
  tabataGoal,
}) {
  return (
    countdownSeconds +
    tabataGoal * goSeconds +
    Math.max(tabataGoal - 1, 0) * restSeconds
  );
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function Tabata({
  countdownSeconds: initialCountdownSeconds = DEFAULT_COUNTDOWN_SECONDS,
  goSeconds: initialGoSeconds = DEFAULT_GO_SECONDS,
  restSeconds: initialRestSeconds = DEFAULT_REST_SECONDS,
  tabataGoal: initialTabataGoal = DEFAULT_TABATA_GOAL,
  onConfigChange,
  onClose,
}) {
  const [countdownSeconds, setCountdownSeconds] = useState(
    initialCountdownSeconds,
  );
  const [goSeconds, setGoSeconds] = useState(initialGoSeconds);
  const [restSeconds, setRestSeconds] = useState(initialRestSeconds);
  const [tabataGoal, setTabataGoal] = useState(initialTabataGoal);

  const [time, setTime] = useState(initialCountdownSeconds);
  const [mode, setMode] = useState("countdown");
  const [completedRounds, setCompletedRounds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [editCountdownSeconds, setEditCountdownSeconds] = useState(
    initialCountdownSeconds,
  );
  const [editGoSeconds, setEditGoSeconds] = useState(initialGoSeconds);
  const [editRestSeconds, setEditRestSeconds] = useState(initialRestSeconds);
  const [editTabataGoal, setEditTabataGoal] = useState(initialTabataGoal);

  useEffect(() => {
    if (!isRunning) return;

    const intervalID = setInterval(() => {
      if (isSoundEnabled) playTick();

      setTime((current) => {
        if (current > 1) return current - 1;

        if (mode === "countdown") {
          setMode("go");
          return goSeconds;
        }

        if (mode === "go") {
          const nextCompletedRounds = completedRounds + 1;
          setCompletedRounds(nextCompletedRounds);

          if (nextCompletedRounds >= tabataGoal) {
            setMode("done");
            setIsRunning(false);
            return 0;
          }

          setMode("rest");
          return restSeconds;
        }

        if (mode === "rest") {
          setMode("go");
          return goSeconds;
        }

        return current;
      });
    }, 1000);

    return () => clearInterval(intervalID);
  }, [
    isRunning,
    isSoundEnabled,
    mode,
    completedRounds,
    tabataGoal,
    goSeconds,
    restSeconds,
  ]);

  const displayedRound = Math.min(completedRounds + 1, tabataGoal);

  const editingSessionDuration = calculateSessionDuration({
    countdownSeconds: editCountdownSeconds,
    goSeconds: editGoSeconds,
    restSeconds: editRestSeconds,
    tabataGoal: editTabataGoal,
  });

  function getRemainingSessionDuration() {
    if (mode === "done") return 0;

    if (mode === "countdown") {
      return (
        time +
        tabataGoal * goSeconds +
        Math.max(tabataGoal - 1, 0) * restSeconds
      );
    }

    const roundsAfterCurrent = Math.max(
      tabataGoal - completedRounds - (mode === "go" ? 1 : 0),
      0,
    );
    const futureRests = Math.max(tabataGoal - completedRounds - 1, 0);

    return time + roundsAfterCurrent * goSeconds + futureRests * restSeconds;
  }

  const totalTime = formatTime(
    isEditing ? editingSessionDuration : getRemainingSessionDuration(),
  );

  function handleEdit() {
    setIsRunning(false);
    setEditCountdownSeconds(countdownSeconds);
    setEditGoSeconds(goSeconds);
    setEditRestSeconds(restSeconds);
    setEditTabataGoal(tabataGoal);
    setIsEditing(true);
  }

  function applyEditSettings(shouldStart) {
    const nextConfig = {
      countdownSeconds: editCountdownSeconds,
      goSeconds: editGoSeconds,
      restSeconds: editRestSeconds,
      tabataGoal: editTabataGoal,
    };

    setCountdownSeconds(nextConfig.countdownSeconds);
    setGoSeconds(nextConfig.goSeconds);
    setRestSeconds(nextConfig.restSeconds);
    setTabataGoal(nextConfig.tabataGoal);
    setTime(nextConfig.countdownSeconds);
    setCompletedRounds(0);
    setMode("countdown");
    setIsRunning(shouldStart);
    setIsEditing(false);
    onConfigChange?.(nextConfig);
  }

  function handleToggle() {
    if (isEditing) {
      applyEditSettings(true);
      return;
    }

    if (mode === "done") return;
    setIsRunning((current) => !current);
  }

  function handleReset() {
    setIsRunning(false);
    setIsEditing(false);
    setCompletedRounds(0);
    setMode("countdown");
    setTime(countdownSeconds);
  }

  const activeModeClass = {
    countdown: "text-blue-400 [text-shadow:0_0_10px_rgba(96,165,250,1)]",
    go: "text-green-400 [text-shadow:0_0_8px_rgba(0,225,0,0.8)]",
    rest: "text-yellow-400 [text-shadow:0_0_8px_rgba(255,255,0,0.8)]",
    done: "text-red-400 [text-shadow:0_0_8px_rgba(248,113,113,0.8)] animate-pulse",
  };

  return (
    <WidgetBody
      onClose={onClose}
      top={
        <div className="flex flex-col items-center justify-center gap-4">
          <span>{totalTime}</span>
          {!isEditing && (
            <WidgetControls.Sound
              isSoundEnabled={isSoundEnabled}
              onClick={() => setIsSoundEnabled((current) => !current)}
            />
          )}
        </div>
      }
      middle={
        <div className="text-center uppercase">
          {isEditing ? (
            <div className="mx-auto grid w-max grid-cols-[1fr_auto] gap-4">
              <span className="place-self-center">countdown</span>
              <NumberInput
                hideLabel
                label="Countdown seconds"
                name="countdown-seconds"
                value={editCountdownSeconds}
                onChange={setEditCountdownSeconds}
                min={1}
              />
              <span className="place-self-center">go</span>
              <NumberInput
                hideLabel
                label="Go seconds"
                name="go-seconds"
                value={editGoSeconds}
                onChange={setEditGoSeconds}
                min={1}
              />
              <span className="place-self-center">rest</span>
              <NumberInput
                hideLabel
                label="Rest seconds"
                name="rest-seconds"
                value={editRestSeconds}
                onChange={setEditRestSeconds}
                min={1}
              />
              <span className="place-self-center">rounds</span>
              <NumberInput
                hideLabel
                label="Rounds"
                name="tabata-rounds"
                value={editTabataGoal}
                onChange={setEditTabataGoal}
                min={1}
              />
            </div>
          ) : (
            <div className="flex h-full flex-col gap-4">
              <p>No pain, no gain!</p>
              {/* <p className={`text-3xl font-bold ${activeModeClass[mode]}`}>
                {mode}
              </p>
              <p className="font-['Segoe_UI',sans-serif] text-5xl font-bold">
                {formatTime(time)}
              </p> */}
            </div>
          )}
        </div>
      }
      subMiddle={
        <div
          className={`grid place-items-center gap-2 uppercase ${widgetInnerBorder}`}
        >
          <span>
            round {displayedRound} of {tabataGoal}
          </span>
          <div className="flex gap-4">
            {[
              ["countdown", countdownSeconds],
              ["go", goSeconds],
              ["rest", restSeconds],
            ].map(([phase, duration]) => (
              <div
                key={phase}
                className={`grid place-items-center gap-2 ${durationTitle}`}
              >
                <span
                  className={`text-[1rem] ${
                    mode === phase && isRunning
                      ? activeModeClass[phase]
                      : inactiveModeClass
                  }`}
                >
                  {phase}
                </span>
                <span className={durationDisplay}>
                  {formatTime(mode === phase ? time : duration)}
                </span>
              </div>
            ))}
          </div>
          <span
            className={`uppercase ${
              mode === "done" ? activeModeClass.done : inactiveModeClass
            }`}
          >
            done
          </span>
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
            onConfirm={() => applyEditSettings(false)}
          />
          <WidgetControls.Reset onClick={handleReset} />
        </WidgetControls>
      }
    />
  );
}
