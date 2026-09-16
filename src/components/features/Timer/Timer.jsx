import { useState, useEffect } from "react";

import { WidgetBody, WidgetControls } from "@/components/ui/Widget";

import { Icon } from "@/components/ui/Icon";

import { playAlarm } from "@/utils/audio";

import { NumberInput } from "@/components/ui/NumberInput";

export function Timer({
  hours = 0,
  minutes = 0,
  seconds = 0,
  onConfigChange,
  onClose,
}) {
  const initialTime = hours * 3600 + minutes * 60 + seconds;

  const [time, setTime] = useState(initialTime);

  // Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editHours, setEditHours] = useState(0);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editSeconds, setEditSeconds] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [mode, setMode] = useState("idle");

  function handleEdit() {
    setIsRunning(false);
    setIsAlarmPlaying(false);

    setEditHours(Math.floor(time / 3600));
    setEditMinutes(Math.floor((time % 3600) / 60));
    setEditSeconds(time % 60);

    setIsEditing(true);
  }

  function applyEditSettings(shouldStart) {
    const nextHours = Math.max(0, Number(editHours));
    const nextMinutes = Math.min(59, Math.max(0, Number(editMinutes)));
    const nextSeconds = Math.min(59, Math.max(0, Number(editSeconds)));

    const newTime = nextHours * 3600 + nextMinutes * 60 + nextSeconds;

    setTime(newTime);
    setMode("idle");
    setIsAlarmPlaying(false);
    setIsEditing(false);
    setIsRunning(shouldStart && newTime > 0);

    onConfigChange?.({
      hours: nextHours,
      minutes: nextMinutes,
      seconds: nextSeconds,
    });
  }

  function handleConfirmEdit() {
    applyEditSettings(false);
  }

  function handleToggle() {
    if (isEditing) {
      applyEditSettings(true);
      return;
    }

    if (time === 0) return;

    setIsRunning((current) => !current);
  }

  function addMinutes(minutesToAdd) {
    const secondsToAdd = minutesToAdd * 60;
    const nextTime = Math.max(0, time + secondsToAdd);

    const nextHours = Math.floor(nextTime / 3600);
    const nextMinutes = Math.floor((nextTime % 3600) / 60);
    const nextSeconds = nextTime % 60;

    setTime(nextTime);

    onConfigChange?.({
      hours: nextHours,
      minutes: nextMinutes,
      seconds: nextSeconds,
    });
  }

  function handleReset() {
    setIsRunning(false);
    setIsAlarmPlaying(false);

    setTime(0);

    setEditHours(0);
    setEditMinutes(0);
    setEditSeconds(0);

    setMode("idle");

    onConfigChange?.({
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  }

  useEffect(() => {
    if (!isRunning) return;

    const intervalID = setInterval(() => {
      setTime((current) => {
        if (current > 1) {
          return current - 1;
        }

        setIsRunning(false);
        setMode("done");
        setIsAlarmPlaying(true);
        return 0;
      });
    }, 1000);

    return () => clearInterval(intervalID);
  }, [isRunning]);

  useEffect(() => {
    if (!isAlarmPlaying) return;

    playAlarm();

    const alarmIntervalID = setInterval(() => {
      playAlarm();
    }, 1500);

    return () => clearInterval(alarmIntervalID);
  }, [isAlarmPlaying]);

  const hoursLeft = Math.floor(time / 3600);
  const minutesLeft = Math.floor((time % 3600) / 60);
  const secondsLeft = time % 60;

  const getFormattedTime = `
    ${String(hoursLeft).padStart(2, "0")}:${String(minutesLeft).padStart(2, "0")}:${String(secondsLeft).padStart(2, "0")}
    `;

  const activeTimerDoneModeClass =
    "text-red-400 [text-shadow:0_0_8px_rgba(248,113,113,0.8)] animate-pulse";
  const inactiveModeClass = "text-gray-400";

  const shortCuts = [0.5, 1, 5];

  function formatShortcut(minutes) {
    if (minutes < 1) {
      return `0:${String(minutes * 60).padStart(2, "0")}`;
    }

    return `${minutes}:00`;
  }

  return (
    <WidgetBody
      onClose={onClose}
      top={<span>{getFormattedTime}</span>}
      middle={
        !isEditing ? (
          <div
            className={`
            flex
            flex-col
            items-center
            gap-2.75
            `}
          >
            <div className="flex flex-col gap-2">
              {shortCuts.map((minutes) => (
                <div
                  key={minutes}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                    
                  "
                >
                  <button
                    type="button"
                    onClick={() => addMinutes(-minutes)}
                    className="clickable"
                  >
                    <Icon name="minus" />
                  </button>
                  <span>{formatShortcut(minutes)}</span>
                  <button
                    type="button"
                    onClick={() => addMinutes(minutes)}
                    className="clickable"
                  >
                    <Icon name="plus" />
                  </button>
                </div>
              ))}
            </div>
            <span
              className={`
              justify-self-center
              text-3xl
              font-bold
              uppercase
              pt-6
              ${mode === "done" ? activeTimerDoneModeClass : inactiveModeClass}
            `}
            >
              done
            </span>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-[1fr_auto]
              gap-4
              mx-auto
              uppercase
            "
          >
            <span className="place-self-center">hour</span>
            <NumberInput
              hideLabel
              label="hour"
              name="hour"
              value={editHours}
              onChange={setEditHours}
            />
            <span className="place-self-center">minute</span>
            <NumberInput
              hideLabel
              label="minute"
              name="minute"
              value={editMinutes}
              onChange={setEditMinutes}
            />
            <span className="place-self-center">second</span>
            <NumberInput
              hideLabel
              label="second"
              name="second"
              value={editSeconds}
              onChange={setEditSeconds}
            />
          </div>
        )
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
        </WidgetControls>
      }
    />
  );
}
