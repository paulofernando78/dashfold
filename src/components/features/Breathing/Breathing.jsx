import { useEffect, useState, useRef, useEffectEvent } from "react";

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
  const circle = `
    absolute
    w-30
    h-30
    rounded-full
  `;

  // const timer
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

  const audioContextRef = useRef(null);

  // Tibet Bowl sound
  function getAudioContext() {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    return audioContextRef.current;
  }

  function createReverbImpulse(audioContext) {
    const duration = 4;
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;

    const impulse = audioContext.createBuffer(2, length, sampleRate);

    // Fill right / left channels
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);

      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 3);
        data[i] = (Math.random() * 2 - 1) * decay;
      }
    }

    return impulse;
  }

  async function playSingBowl() {
    const audioContext = getAudioContext();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const now = audioContext.currentTime;

    // mastergain
    const masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.setValueAtTime(0.25, now);

    const reverb = audioContext.createConvolver();
    reverb.buffer = createReverbImpulse(audioContext);

    const reverbGain = audioContext.createGain();
    reverbGain.gain.setValueAtTime(0.6, now);

    masterGain.connect(reverb);
    reverb.connect(reverbGain);
    reverbGain.connect(audioContext.destination);

    // Hertz
    const frequencies = [200, 430, 600, 882];
    frequencies.forEach((frequency) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);

      // oscillator → toneGain → masterGain → speakers
      const toneGain = audioContext.createGain();

      const bowlDuration = 8;

      toneGain.gain.setValueAtTime(0.2, now);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, now + bowlDuration);

      // Connect
      oscillator.connect(toneGain);
      toneGain.connect(masterGain);

      // Start
      oscillator.start(now);
      oscillator.stop(now + bowlDuration);
    });
  }

  const randomBowlTimeRef = useRef(null);

  const playRandomBowl = useEffectEvent(() => {
    playSingBowl();
  });

  useEffect(() => {
    if (!isRunning || !isSoundEnabled) return;

    function scheduleNextBowl() {
      const minimumDelay = 12000;
      const maximumDelay = 25000;

      const randomDelay =
        Math.random() * (maximumDelay - minimumDelay) + minimumDelay;

      randomBowlTimeRef.current = setTimeout(() => {
        playRandomBowl();
        scheduleNextBowl();
      }, randomDelay);
    }

    scheduleNextBowl();

    return () => {
      clearTimeout(randomBowlTimeRef.current);
    };
  }, [isRunning, isSoundEnabled]);

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

      if (isSoundEnabled && !hasStarted) {
        playSingBowl();
      }

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
    handleReset();
    setIsEditing(true);
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

  useEffect(() => {
    if (!isResetting) return;

    const frame = requestAnimationFrame(() => {
      setIsResetting(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [isResetting]);

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
          {/* <audio
            ref={audioRef}
            src="/assets/audio/meditation.mp3"
            loop
            preload="auto"
          /> */}
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
                      ${isResetting ? "transition-none" : "transition-transform"}
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
