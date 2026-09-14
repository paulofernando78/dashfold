import { useEffect, useState, useRef } from "react";

import {
  WidgetBody,
  widgetInnerBorder,
  WidgetControls,
} from "@/components/ui/Widget";

const presets = {
  relaxed: {
    label: "4-2-4",
    phases: [
      {
        id: "breatheIn",
        label: "breathe in",
        duration: 4000,
        scale: "scale-145",
      },
      {
        id: "hold",
        label: "hold",
        duration: 2000,
        scale: "scale-145",
      },
      {
        id: "breatheOut",
        label: "breathe out",
        duration: 4000,
        scale: "scale-100",
      },
    ],
  },
  box: {
    label: "4-4-4-4",
    phases: [
      {
        id: "breatheIn",
        label: "breathe in",
        duration: 4000,
        scale: "scale-145",
      },
      {
        id: "holdIn",
        label: "hold",
        duration: 4000,
        scale: "scale-145",
      },
      {
        id: "breatheOut",
        label: "breathe out",
        duration: 4000,
        scale: "scale-100",
      },
      {
        id: "holdOut",
        label: "hold",
        duration: 4000,
        scale: "scale-100",
      },
    ],
  },
};

export function Breathing({ onConfigChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [sessionMinutes, setSessionMinutes] = useState(1);
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  const [presetId, setPresetId] = useState("relaxed");
  const currentPreset = presets[presetId];

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSeconds, setPhaseSeconds] = useState(
    Math.ceil(presets.relaxed.phases[0].duration / 1000),
  );
  const [isResetting, setIsResetting] = useState(false);
  const currentPhase = currentPreset.phases[phaseIndex];

  const audioRef = useRef(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const circlesRef = useRef(null);

  useEffect(() => {
    if (!isRunning || phaseSeconds <= 0) return;

    const timer = setTimeout(() => {
      if (phaseSeconds === 1) {
        const nextIndex = (phaseIndex + 1) % currentPreset.phases.length;

        setPhaseIndex(nextIndex);

        setPhaseSeconds(
          Math.ceil(currentPreset.phases[nextIndex].duration / 1000),
        );

        return;
      }

      setPhaseSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, phaseSeconds, phaseIndex, currentPreset]);

  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) return;

    const timer = setTimeout(() => {
      if (remainingSeconds === 1) {
        setRemainingSeconds(0);
        setIsRunning(false);
        setHasStarted(false);
        setPhaseIndex(0);
        setPhaseSeconds(Math.ceil(currentPreset.phases[0].duration / 1000));

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        return;
      }

      setRemainingSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, remainingSeconds, currentPreset]);

  useEffect(() => {
    const animations = circlesRef.current?.getAnimations({
      subtree: true,
    });

    animations?.forEach((animation) => {
      if (isRunning || !hasStarted) {
        animation.play();
      } else {
        animation.pause();
      }
    });
  }, [isRunning, phaseIndex, hasStarted]);

  const isExpanded = hasStarted && currentPhase.scale === "scale-145";

  const displayMinutes = Math.floor(remainingSeconds / 60);
  const displaySeconds = String(remainingSeconds % 60).padStart(2, "0");

  const isDone = !isRunning && remainingSeconds === 0;

  const activeDoneClass =
    "text-red-400 [text-shadow:0_0_8px_rgba(248,113,113,0.8)] animate-pulse";
  const inactiveDoneClass = "text-gray-400";

  const circle = `
    absolute
    w-30
    h-30
    rounded-full
  `;

  function handleToggleSound() {
    const nextEnabled = !isSoundEnabled;

    setIsSoundEnabled(nextEnabled);

    if (audioRef.current) {
      audioRef.current.muted = !nextEnabled;
    }
  }

  function handleToggle() {
    const nextRunning = !isRunning;

    setIsRunning(nextRunning);

    if (nextRunning) {
      setHasStarted(true);
      setIsEditing(false);

      if (remainingSeconds === 0) {
        setRemainingSeconds(sessionMinutes * 60);
        setPhaseIndex(0);
      }

      if (audioRef.current) {
        audioRef.current.volume = 1;
        audioRef.current?.play();
      }
    } else {
      audioRef.current?.pause();
    }
  }

  function handleEdit() {
    setIsEditing(true);
    setIsRunning(false);
    audioRef.current?.pause();
  }

  function handleSelectPreset(id) {
    setPresetId(id);
    setPhaseIndex(0);

    setPhaseSeconds(Math.ceil(presets[id].phases[0].duration / 1000));
  }

  function handleSelectDuration(minutes) {
    setSessionMinutes(minutes);

    if (!isRunning) {
      setRemainingSeconds(minutes * 60);
    }
  }

  function handleConfirm() {
    onConfigChange?.({});
    setIsEditing(false);
  }

  function handleReset() {
    setIsEditing(false);
    setIsRunning(false);
    setHasStarted(false);
    setPhaseIndex(0);
    setRemainingSeconds(sessionMinutes * 60);

    setPhaseSeconds(Math.ceil(currentPreset.phases[0].duration / 1000));

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsResetting(true);
  }

  return (
    <WidgetBody
      top={
        <div className="flex flex-col items-center gap-4">
          <span>
            {displayMinutes}:{displaySeconds}
          </span>
          <audio
            ref={audioRef}
            src="/assets/audio/meditation.mp3"
            loop
            preload="auto"
          />
          {!isEditing && (
            <WidgetControls.Sound
              isSoundEnabled={isSoundEnabled}
              onClick={handleToggleSound}
            />
          )}
        </div>
      }
      middle={
        !isEditing ? (
          <>
            <div
              className="
              flex
              flex-col
              h-full
              justify-center
              "
            >
              <div className="mx-auto">
                <div
                  ref={circlesRef}
                  className="
                    relative
                    grid
                    place-items-center
                    w-50
                    h-50
                  "
                >
                  {/* 3 divs animation */}

                  {/* Labels */}
                  <div
                    className="
                      grid
                      place-items-center
                      gap-2
                      text-lg
                      text-gray-800
                      [text-shadow:0_0_4px_rgba(0,0,0,0.35)] uppercase
                      z-5
                    "
                  >
                    <span className="text-sm">{currentPreset.label}</span>
                    <span>{currentPhase.label}</span>
                    <span>{phaseSeconds}s</span>
                  </div>

                  {/* Circle */}
                  <div
                    className={`
                    ${circle}
                      bg-gray-300
                      shadow-[0_0_5px_1px_rgba(255,255,255,0.7)]
                      transition-transform
                      ease-linear
                      ${isExpanded ? "scale-145" : "scale-100"}
                      z-4
                    `}
                     style={{
                      transitionDuration: `${currentPhase.duration}ms`,
                    }}
                  ></div>

                 
                  {/* Outer border */}
                  <div
                    className={`
                      absolute
                      w-45
                      h-45
                      bg-[radial-gradient(circle_at_center,gray,black)]
                      rounded-full
                    `}
                  ></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div
              className="
              
                flex 
                flex-col 
                items-center
                gap-2
              "
            >
              <span className="text-center">Breathing pattern</span>

              {Object.entries(presets).map(([id, preset]) => (
                <button
                  key={id}
                  onClick={() => handleSelectPreset(id)}
                  aria-pressed={presetId === id}
                  className={`
          clickable
          ${presetId === id ? "font-bold" : "opacity-50"}
        `}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div
              className="
                flex
                flex-col
                items-center
                gap-2
              "
            >
              <span className="text-center">Session duration</span>

              {[1, 2, 3, 4, 5].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => handleSelectDuration(minutes)}
                  aria-pressed={sessionMinutes === minutes}
                  className={`
          clickable
          ${sessionMinutes === minutes ? "font-bold" : "opacity-50"}
        `}
                >
                  {minutes} minute{minutes > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>
        )
      }
      subMiddle={
        !isEditing && (
          <div className={`w-full text-center uppercase ${widgetInnerBorder}`}>
            <span className={isDone ? activeDoneClass : inactiveDoneClass}>
              done
            </span>
          </div>
        )
      }
      bottom={
        <WidgetControls>
          <WidgetControls.Play isRunning={isRunning} onClick={handleToggle} />
          <WidgetControls.Edit
            isEditing={isEditing}
            onEdit={handleEdit}
            onConfirm={handleConfirm}
          />
          <WidgetControls.Reset onClick={handleReset} />
        </WidgetControls>
      }
    />
  );
}
