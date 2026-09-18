import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";

import { useLanguage } from "@/i18n";
import { useDragScroll } from "@/hooks/useDragScroll";

import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

const statusOptionsColor = [
  {
    id: "inbox",
    label: "inbox",
    labelColor: "text-yellow-300",
  },
  {
    id: "todo",
    label: "toDo",
    labelColor: "text-green-300",
  },
  {
    id: "in-progress",
    label: "inProgress",
    labelColor: "text-sky-400",
  },
  {
    id: "done",
    label: "done",
    labelColor: "text-red-300",
  },
];

const inputBorder = `
  p-2
  border-2 border-gray-500/50
  rounded-lg
`

const TASKS_STORAGE_KEY = "dashfold-task-board";

function createDefaultTasks() {
  return {
    inbox: [],
    todo: [
      {
        id: crypto.randomUUID(),
        text: "Call a friend",
      },
      {
        id: crypto.randomUUID(),
        text: "Apply for a job",
      },
    ],
    "in-progress": [],
    done: [],
  };
}

function getSavedTasks() {
  const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);

  if (!savedTasks) return createDefaultTasks();

  try {
    const parsedTasks = JSON.parse(savedTasks);

    return Object.fromEntries(
      statusOptionsColor.map(({ id }) => [
        id,
        Array.isArray(parsedTasks[id]) ? parsedTasks[id] : [],
      ]),
    );
  } catch {
    return createDefaultTasks();
  }
}

export function TaskBoard() {
  const dragScroll = useDragScroll();
  const [tasks, setTasks] = useState(getSavedTasks);
  const { t } = useLanguage();

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function handleDragEnd(event) {
    if (event.canceled || !event.operation.target) return;

    setTasks((currentTasks) => move(currentTasks, event));
  }

  function addTask(columnId, text) {
    const newTask = {
      id: crypto.randomUUID(),
      text,
    };

    setTasks((currentTasks) => ({
      ...currentTasks,
      [columnId]: [newTask, ...currentTasks[columnId]],
    }));
  }

  function editTask(columnId, taskId, text) {
    setTasks((currentTasks) => ({
      ...currentTasks,
      [columnId]: currentTasks[columnId].map((task) =>
        task.id === taskId ? { ...task, text } : task,
      ),
    }));
  }

  function deleteTask(columnId, taskId) {
    setTasks((currentTasks) => ({
      ...currentTasks,
      [columnId]: currentTasks[columnId].filter((task) => task.id !== taskId),
    }));
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div
        className="
          grid
          w-full
          min-w-0
        "
      >
        <TaskBoardNotice text={t("taskBoardNotice")} />

        <div
          {...dragScroll}
          onPointerDown={(event) => {
            event.stopPropagation();
            dragScroll.onPointerDown(event);
          }}
          className="
          w-full
          min-w-0
          text-slate-100
          overflow-x-auto

          no-scrollbar
          cursor-grab
          active:cursor-grabbing
          select-none
          touch-pan-x
        "
        >
          <div className="grid grid-cols-4 gap-2 min-w-266 w-full pt-2">
            {statusOptionsColor.map((status) => (
              <TaskBoardColumn
                key={status.id}
                status={status}
                tasks={tasks[status.id]}
                t={t}
                onAddTask={addTask}
                onEditTask={editTask}
                onDeleteTask={deleteTask}
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
        items-center
        gap-2
        p-2
        bg-gray-500/50
        rounded-lg
      "
    >
      <Icon name="messageCircleWarning" cursorNone />
      <p className="leading-2">{text}</p>
    </div>
  );
}

function TaskBoardColumn({
  status,
  tasks,
  t,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) {
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
        card-style
        transition-colors
        ${isDropTarget ? "bg-white/10" : ""}
      `}
    >
      <div
        className={`
          flex
          flex-col
          h-55
          min-h-0
          p-4
          rounded-lg
          overflow-hidden
          ${status.color}
        `}
      >
        <div
          className="
            shrink-0
            flex
            gap-2
          "
        >
          <span
            className={`
                mb-2
                block
                font-bold
                uppercase
                ${status.labelColor}
              `}
          >
            {t(status.label)}
          </span>
          <span>{tasks.length}</span>

          {/* <Icon name="ellipsis" className="translate-y-[-0.4rem]" /> */}
        </div>

        <TaskComposer
          color={status.color}
          placeholder={t("addTask")}
          onAddTask={(text) => onAddTask(status.id, text)}
          className="shrink-0 mb-2 "
        />
        {/* Box for TaskCard */}
        <>
          <div
            className="
            flex
            flex-col
            gap-2
            overflow-y-auto"
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                columnId={status.id}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </>
      </div>
    </section>
  );
}

// Add task...
function TaskComposer({ color, placeholder, onAddTask, className }) {
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const taskText = text.trim();

    if (!taskText) return;

    onAddTask(taskText);
    setText("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`
        flex
        items-center
        gap-1
        ${inputBorder}
        ${color}
        ${className}
        group
      `}
    >
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="
          w-full
          outline-none
          placeholder:text-gray-100
        "
      />
      <button
        type="submit"
        className="
          invisible
          px-2
          text-xs
          font-bold
          rounded
          cursor-pointer
        hover:bg-white/10
          group-focus-within:visible
        "
      >
        Enter
      </button>
    </form>
  );
}

function TaskCard({ task, index, columnId, onEditTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const cancelOnBlurRef = useRef(false);
  const { ref: draggableRef, isDragging } = useDraggable({
    id: task.id,
    data: {
      taskId: task.id,
      columnId,
      index,
    },
  });
  const { ref: droppableRef } = useDroppable({
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

  function startEditing() {
    setDraft(task.text);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(task.text);
    setIsEditing(false);
  }

  function handleBlur(event) {
    if (cancelOnBlurRef.current) {
      cancelOnBlurRef.current = false;
      return;
    }

    saveTask(event);
  }

  function saveTask(event) {
    event?.preventDefault();
    const text = draft.trim();

    if (!text) {
      cancelEditing();
      return;
    }

    onEditTask(columnId, task.id, text);
    setIsEditing(false);
  }

  return (
    <article
      ref={setTaskRef}
      data-no-drag
      className={`
        cursor-grab
        ${inputBorder}
        transition-opacity
        active:cursor-grabbing
        ${isDragging ? "opacity-40" : ""}
      `}
    >
      {isEditing ? (
        <form onSubmit={saveTask}>
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={handleBlur}
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                cancelOnBlurRef.current = true;
                cancelEditing();
              }
            }}
            aria-label="Editar tarefa"
            autoFocus
          />
        </form>
      ) : (
        <div
          className="
            flex
            min-w-0
            justify-between
            h-4.75
          "
        >
          <p
            className="
              flex
              items-center
              min-w-0
              truncate
            "
            onDoubleClick={startEditing}
            onPointerDown={(event) => event.stopPropagation()}
            title={task.text}
          >
            {task.text}
          </p>

          <div
            className="f
              flex
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={startEditing}
              onPointerDown={(event) => event.stopPropagation()}
              className="
                shrink-0
                cursor-pointer
                rounded
                text-slate-300
                hover:bg-white/10 hover:text-white"
              aria-label={`Editar ${task.text}`}
              title="Editar tarefa
              "
            >
              <Icon name="squarePen" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteTask(columnId, task.id)}
              onPointerDown={(event) => event.stopPropagation()}
              className="
                shrink-0
                cursor-pointer
                rounded
                text-slate-300
                hover:bg-white/10 hover:text-red-400
              "
              aria-label={`Excluir ${task.text}`}
              title="Excluir tarefa"
            >
              <Icon name="x" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
