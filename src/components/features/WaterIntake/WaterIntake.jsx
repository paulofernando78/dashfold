import { useState } from "react";

import {
  WidgetBody,
  WidgetControls,
  widgetGlassMorphism,
} from "@/components/ui/Widget";
import { Icon } from "@/components/ui/Icon";
import { NumberInput } from "@/components/ui/NumberInput";

export function WaterIntake({ onConfigChange, onClose }) {
  const [glassMl, setGlassMl] = useState(500);
  const [goalGlasses, setGoalGlasses] = useState(6);
  const [completedGlasses, setCompletedGlasses] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editGlassMl, setEditGlassMl] = useState(glassMl);
  const [editGoalGlasses, setEditGoalGlasses] = useState(goalGlasses);

  const completedMl = completedGlasses * glassMl;
  const totalMl = goalGlasses * glassMl;

  function handleGlassClick(index) {
    const clickedGlassNumber = index + 1;

    const nextCompletedGlasses =
      clickedGlassNumber === completedGlasses
        ? completedGlasses - 1
        : clickedGlassNumber;
    setCompletedGlasses(nextCompletedGlasses);
  }

  function handleEdit() {
    setEditGlassMl(glassMl);
    setEditGoalGlasses(goalGlasses);
    setIsEditing(true);
  }

  function handleConfirm() {
    const nextGlassMl = Math.max(1, Number(editGlassMl));
    const nextGoalGlasses = Math.max(1, Number(editGoalGlasses));
    const nextCompletedGlasses = Math.min(completedGlasses, nextGoalGlasses);

    setGlassMl(nextGlassMl);
    setGoalGlasses(nextGoalGlasses);
    setCompletedGlasses(nextCompletedGlasses);

    onConfigChange?.({
      glassMl: nextGlassMl,
      goalGlasses: nextGoalGlasses,
      completedGlasses: nextCompletedGlasses,
    });
    setIsEditing(false);
  }

  function handleReset() {
    setCompletedGlasses(0);
    setIsEditing(false);
  }

  const glasses = [
    {
      ml: "1",
    },
    {
      ml: "2",
    },
    {
      ml: "3",
    },
    {
      ml: "4",
    },
    {
      ml: "5",
    },
    {
      ml: "6",
    },
  ];

  return (
    <WidgetBody
      onClose={onClose}
      top={
        <span className="text-2xl">
          {completedMl} of {totalMl}ml
        </span>
      }
      middle={
        <div
          className={`${widgetGlassMorphism} flex h-full items-center justify-center`}
        >
          {!isEditing ? (
            <div className="grid grid-cols-2 gap-2">
              {glasses.map((glass, index) => {
                const isCompleted = index < completedGlasses;

                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() => handleGlassClick(index)}
                  >
                    <div
                      className="
                      flex
                      items-center
                      justify-center
                      gap-2
                      clickable
                    "
                    >
                      <span>{glass.ml}</span>
                      <Icon
                        name="glassWater"
                        className={
                          isCompleted ? "text-blue-500" : "text-gray-400"
                        }
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              <NumberInput
                label="ml"
                name="glass-ml"
                value={editGlassMl}
                onChange={setEditGlassMl}
                min={1}
                className="w-12"
              />

              <NumberInput
                label="goal"
                name="goal-glasses"
                value={editGoalGlasses}
                onChange={setEditGoalGlasses}
                min={1}
              />
            </div>
          )}
        </div>
      }
      bottom={
        <WidgetControls>
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
