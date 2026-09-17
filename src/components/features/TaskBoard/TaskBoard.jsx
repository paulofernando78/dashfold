import { Icon } from "@/components/ui/Icon";
import { useLanguage } from "@/i18n";

import { useEffect, useRef, useState } from "react";

import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
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
    color: "border-gray-500/50 bg-gray-500/20",
  },
  {
    id: "delegate",
    label: "delegate",
    color: "border-gray-500/50 bg-gray-500/20",
  },
  {
    id: "done",
    label: "done",
    color: "border-gray-500/50 bg-gray-500/20",
  },
];

const TASKS_STORAGE_KEY = "dashfold-task-board";

function createDefaultTasks() {
  return {
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
    delegate: [],
    done: [],
  };
}

function getSavedTasks() {
  const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);

  if (!savedTasks) return createDefaultTasks();

  try {
    const parsedTasks = JSON.parse(savedTasks);

    return Object.fromEntries(
      statusOptions.map(({ id }) => [
        id,
        Array.isArray(parsedTasks[id]) ? parsedTasks[id] : [],
      ]),
    );
  } catch {
    return createDefaultTasks();
  }
}

export function TaskBoard() {
  const [tasks, setTasks] = useState(getSavedTasks);

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
          <div className="grid gap-2 pt-2 grid-cols-[repeat(4,minmax(260px,1fr))]">
            {statusOptions.map((status) => (
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
        rounded-lg
        transition-colors
        ${isDropTarget ? "bg-white/10" : ""}
      `}
    >
      <div
        className={`
          min-h-40
          p-2
          rounded-lg
          gradient
          ${status.color}
        `}
      >
        <div
          className="
            flex
            gap-2
          "
        >
          <span className="mb-2 block font-bold uppercase">
            {t(status.label)}
          </span>
          <span>{tasks.length}</span>

          {/* <Icon name="ellipsis" className="translate-y-[-0.4rem]" /> */}
        </div>

        <TaskComposer
          color={status.color}
          placeholder={t("addTask")}
          onAddTask={(text) => onAddTask(status.id, text)}
          className="mb-2"
        />
        {/* Box for TaskCard */}
        <>
          <div className="flex flex-col gap-2">
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

          <div className="flex items-center gap-2">
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
        w-full
        h-9.5
        text-gray-900
        paper-texture
        border
        rounded
        group
        ${color}
        ${className}
      `}
    >
      {/* <Icon name="plus" className="text-gray-900" /> */}
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="
          w-full
          pl-2
          outline-none
          rounded-sm
          placeholder:text-gray-900
        "
      />
      <button
        type="submit"
        className="
          invisible
          px-2
          py-1
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
