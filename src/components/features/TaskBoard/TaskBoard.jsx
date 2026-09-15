import { Icon } from "@/components/ui/Icon";
import { useLanguage } from "@/i18n";

import { useState } from "react";

import {
  DragDropProvider,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

const statusOptions = [
  {
    id: "todo",
    label: "toDo",
    color: "border-gray-500/50 bg-gray-500/20",
  },
  {
    id: "in-progress",
    label: "inProgress",
    color: "border-green-500/20 bg-green-500/10",
  },
  {
    id: "delegate",
    label: "delegate",
    color: "border-yellow-500/20 bg-yellow-500/10",
  },
  {
    id: "done",
    label: "done",
    color: "border-red-500/20 bg-red-500/10",
  },
];

export function TaskBoard() {
  const [tasks, setTasks] = useState({
    todo: [
      {
        id: crypto.randomUUID(),
        text: "Estudar React",
      },
      {
        id: crypto.randomUUID(),
        text: "Criar Task Board",
      },
    ],

    "in-progress": [],

    delegate: [],

    done: [],
  });

  function handleDragEnd(event) {
    if (event.canceled || !event.operation.target) return;

    setTasks((currentTasks) => move(currentTasks, event));
  }

  const { t } = useLanguage();
  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="grid">
        <TaskBoardNotice text={t("taskBoardNotice")} />
        <div
          className="
          overflow-x-auto
        text-slate-100
        "
        >
          <div className="grid gap-2 pt-2 grid-cols-[repeat(4,minmax(220px,1fr))]">
            {statusOptions.map((status) => (
              <TaskBoardColumn
                key={status.id}
                status={status}
                tasks={tasks[status.id]}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
    </DragDropProvider>
  );
}

function TaskBoardNotice({ text }) {
  return (
    <div
      className="
        flex
        gap-2
        p-2
        bg-gray-500/20
        rounded-lg
      "
    >
      <Icon name="messageCircleWarning" cursorNone />
      <p>{text}</p>
    </div>
  );
}

function TaskBoardColumn({ status, tasks, t }) {
  const { ref, isDropTarget } = useDroppable({
    id: status.id,
    data: {
      columnId: status.id,
    },
  });

  return (
    <section
      ref={ref}
      className={`
        flex
        min-h-40
        flex-col
        gap-2
        rounded
        transition-colors
        ${isDropTarget ? "bg-white/10" : ""}
      `}
    >
      <div
        className={`
          min-h-40
          p-2
          global-border
          ${status.color}
        `}
      >
        <div className="flex items-center justify-between">
          <span className="mb-2 block font-bold uppercase">
            {t(status.label)}
          </span>

          <Icon name="ellipsis" className="translate-y-[-0.4rem]" />
        </div>

        <div className="flex flex-col gap-2">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              columnId={status.id}
            />
          ))}
        </div>

        <TaskComposer color={status.color} placeholder={t("addTask")} />
      </div>
    </section>
  );
}

function TaskCard({ task, index, columnId }) {
  const { ref: draggableRef, isDragging } = useDraggable({
    id: task.id,
    data: {
      taskId: task.id,
      columnId,
      index,
    },
  });
  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: task.id,
    data: {
      taskId: task.id,
      columnId,
      index,
    },
  });

  function setTaskRef(element) {
    draggableRef(element);
    droppableRef(element);
  }

  return (
    <article
      ref={setTaskRef}
      className={`
        cursor-grab
        rounded
        border
        bg-gray-800
        p-2
        transition-opacity
        active:cursor-grabbing

        ${isDropTarget ? "border-blue-400" : "border-white/10"}

        ${isDragging ? "opacity-40" : ""}
      `}
    >
      {task.text}
    </article>
  );
}

function TaskComposer({ color, placeholder }) {
  return (
    <div
      className={`
        flex
        items-center
        gap-1
        w-full
        p-1
        border
        rounded
        ${color}
      `}
    >
      <Icon name="plus" />
      <input
        type="text"
        name=""
        id=""
        placeholder={placeholder}
        className="pl-2 w-full"
      />
    </div>
  );
}
