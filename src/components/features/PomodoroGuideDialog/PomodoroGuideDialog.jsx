import { Icon } from "@/components/ui/Icon";

const phaseBase = "font-['Oswald_Variable'] self-center justify-self-center";

const phaseColors = {
  focus: `${phaseBase} text-green-500`,
  break: `${phaseBase} text-yellow-500`,
  long: `${phaseBase} text-blue-500`,
  done: `${phaseBase} text-red-500`,
};

const pomodoroCycle = [
  { restPhase: "break", restMinutes: 5 },
  { restPhase: "break", restMinutes: 5 },
  { restPhase: "break", restMinutes: 5 },
  { restPhase: "long", restMinutes: 15 },
];

function PhaseLabel({ phase }) {
  return <span className={`${phaseColors[phase]} uppercase`}>{phase}</span>;
}

function Tomate({ className }) {
  return (
    <img
      width="28"
      height="28"
      src="https://img.icons8.com/emoji/96/tomato-emoji.png"
      alt="tomato-emoji"
      className={className}
    />
  );
}

export function PomodoroInfo() {
  return (
    <>
        <h3 className="font-bold uppercase">What is it?</h3>
        <p>A simple method to balance focus with deliberate breaks.</p>
        {/* 1 Focus */}
        <p>
          The Pomodoro Technique was invented by Francesco Cirillo in the late
          1980s. He created the method as a university student because he
          struggled to focus on his studies and avoid distractions.
        </p>
        <h3 className="font-bold uppercase">How does it work?</h3>
        <ol className="space-y-3">
          <li>
            <span className="block mb-1 font-bold">1. Plan your tasks.</span>
            <p>How many pomodoros might you need?</p>
          </li>
          <li>
            <span className="block mb-1 ofont-bold">2. Do 1 FOCUS (Pomodoro)</span>
            <p>Time for 25 minutes then take a 5 minute break.</p>
          </li>
          <div
            className="
              grid grid-cols-[1fr_auto_1fr_auto_auto]
              grid-rows-[auto_auto]
              gap-x-1
              px-2
              w-max
              border border-gray-500 bg-gray-600 p-2 rounded-lg
            "
          >
            <PhaseLabel phase="focus" />
            <Icon
              name="arrowRight"
              aria-hidden="true"
              className="self-center"
            />
            <PhaseLabel phase="break" />

            <span className="row-span-2 self-center">=</span>
            <Tomate className="relative top-2 left-1 " />

            <div className="self-center justify-self-center text-sm">
              25mins
            </div>
            <div></div>
            <div className="self-center justify-self-center text-sm">5min</div>
            <div></div>
            <div></div>
          </div>
          <li className="flex gap-2">
            3. After the fourth focus session, take a long break.
          </li>
        </ol>
        <div className="flex gap-3 overflow-x-auto">
          {pomodoroCycle.map((session, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className="
                  grid grid-cols-[1fr_auto_1fr]
                  grid-rows-[auto_auto]
                  gap-x-1
                  px-2
                  w-max
                  border border-gray-500 bg-gray-600 p-2 rounded-lg
                "
              >
                <Tomate className="col-start-2 row-start-1 justify-self-center mb-1" />
                <div></div>
                <div></div>
                <PhaseLabel phase="focus" />
                <Icon
                  name="arrowRight"
                  aria-hidden="true"
                  className="self-center justify-self-center"
                />
                <PhaseLabel phase={session.restPhase} />

                <div className="self-center justify-self-center text-sm">
                  25mins
                </div>
                <div></div>
                <div className="self-center justify-self-center text-sm">
                  {session.restMinutes}min
                </div>
              </div>
              {index < pomodoroCycle.length - 1 && <Icon name="plus" />}
            </div>
          ))}
        </div>
      <p>One complete cycle takes 1 hour and 55 minutes.</p>
    </>
  );
}
