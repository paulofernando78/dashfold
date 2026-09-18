import { useEffect, useMemo, useRef, useState } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { useLanguage } from "@/i18n";
import { NoteEditor } from "./NoteEditor";

export const NOTES_STORAGE_KEY = "notes";
const FOLDERS_STORAGE_KEY = "note-folders";

const noteColors = [
  "#111417",
  "#312e1f",
  "#1f3128",
  "#1f2b38",
  "#342635",
  "#382724",
];

function readNotes() {
  try {
    const value = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readFolders() {
  try {
    const value = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function createNote() {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    blocks: [{
      id: crypto.randomUUID(),
      type: "text",
      content: "",
      checked: false,
      url: "",
      title: "",
    }],
    color: noteColors[0],
    favorite: false,
    pinned: false,
    archived: false,
    deleted: false,
    folder: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function Notes() {
  const { t } = useLanguage();
  const dialogRef = useRef(null);
  const [notes, setNotes] = useState(readNotes);
  const [folders, setFolders] = useState(readFolders);
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState("all");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  }, [folders]);

  const activeNote = notes.find((note) => note.id === activeId);
  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notes
      .filter((note) => {
        if (view === "trash") return note.deleted;
        if (note.deleted) return false;
        if (view === "favorites" && !note.favorite) return false;
        if (view === "archive" && !note.archived) return false;
        if (view.startsWith("folder:") && note.folder !== view.slice(7)) return false;
        if (view === "all" && note.archived) return false;
        if (!normalizedQuery) return true;
        const content = note.blocks?.map((block) => block.content).join(" ") || "";
        return `${note.title} ${content}`.toLowerCase().includes(normalizedQuery);
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, query, view]);

  function updateNote(id, changes) {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? { ...note, ...changes, updatedAt: new Date().toISOString() }
          : note,
      ),
    );
  }

  function openNote(id) {
    setActiveId(id);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  }

  function addNote() {
    const note = createNote();
    setNotes((current) => [note, ...current]);
    openNote(note.id);
  }

  function setCurrentView(nextView) {
    setView(nextView);
    setSidebarOpen(false);
  }

  function addFolder() {
    const name = window.prompt(t("folderName"))?.trim();
    if (!name || folders.includes(name)) return;
    setFolders((current) => [...current, name]);
    setCurrentView(`folder:${name}`);
  }

  return (
    <div className="relative flex w-full min-w-0 select-text gap-4 cursor-auto">
      {sidebarOpen && (
        <button
          type="button"
          aria-label={t("closeMenu")}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 sm:hidden"
        />
      )}

      <aside className={`${sidebarOpen ? "fixed inset-y-0 left-0 z-40 flex w-64 bg-[#111417] p-4 shadow-2xl" : "hidden"} shrink-0 flex-col sm:static sm:flex sm:w-48 sm:bg-transparent sm:p-0 sm:shadow-none`}>
        <div className="mb-4 flex items-center justify-between sm:hidden">
          <strong>{t("notes")}</strong>
          <button type="button" onClick={() => setSidebarOpen(false)} aria-label={t("closeMenu")}>
            <Icon name="x" />
          </button>
        </div>
        <nav className="space-y-1">
          <SidebarButton active={view === "all"} icon="squareText" label={t("allNotes")} onClick={() => setCurrentView("all")} />
          <SidebarButton active={view === "favorites"} icon="bookmark" label={t("favorites")} onClick={() => setCurrentView("favorites")} />
          <SidebarButton active={view === "archive"} icon="archive" label={t("archived")} onClick={() => setCurrentView("archive")} />
          <SidebarButton active={view === "trash"} icon="trash" label={t("trash")} onClick={() => setCurrentView("trash")} />
          <div className="my-3 border-t border-gray-700" />
          <SidebarButton icon="folderPlus" label={t("newFolder")} onClick={addFolder} />
          {folders.map((folder) => (
            <SidebarButton
              key={folder}
              active={view === `folder:${folder}`}
              icon="folderClosed"
              label={folder}
              onClick={() => setCurrentView(`folder:${folder}`)}
            />
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-gray-700 p-2 sm:hidden"
            aria-label={t("openMenu")}
          >
            <Icon name="menu" />
          </button>
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-700 bg-[#171b20] px-3 py-2 focus-within:border-gray-500">
            <Icon name="search" cursorNone />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchNotes")}
              className="min-w-0 flex-1 bg-transparent outline-none"
            />
          </label>
          <button
            type="button"
            onClick={addNote}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 font-semibold hover:bg-blue-500"
          >
            <Icon name="plus" className="text-white" />
            <span className="hidden sm:inline">{t("newNote")}</span>
          </button>
        </div>

        {visibleNotes.length ? (
          <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
            {visibleNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                view={view}
                onOpen={() => openNote(note.id)}
                onUpdate={(changes) => updateNote(note.id, changes)}
              />
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={addNote}
            className="grid min-h-48 w-full place-items-center rounded-xl border border-dashed border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
          >
            <span className="flex flex-col items-center gap-2">
              <Icon name="notepadText" size={32} />
              {query ? t("noMatchingNotes") : t("createFirstNote")}
            </span>
          </button>
        )}
      </div>

      <Dialog dialogRef={dialogRef} className="h-[min(86dvh,44rem)] max-w-2xl p-4 sm:p-6">
        {activeNote && (
          <div className="flex h-full min-h-0 flex-col pr-8">
            <input
              value={activeNote.title}
              onChange={(event) => updateNote(activeNote.id, { title: event.target.value })}
              placeholder={t("noteTitle")}
              className="w-full bg-transparent pb-2 text-2xl font-bold outline-none placeholder:text-gray-600"
              autoFocus
            />
            <NoteEditor
              key={activeNote.id}
              blocks={activeNote.blocks}
              onChange={(blocks) => updateNote(activeNote.id, { blocks })}
            />
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-700 pt-3">
              <ActionButton label={t("favorite")} icon="bookmark" active={activeNote.favorite} onClick={() => updateNote(activeNote.id, { favorite: !activeNote.favorite })} />
              <ActionButton label={t("pinNote")} icon="pin" active={activeNote.pinned} onClick={() => updateNote(activeNote.id, { pinned: !activeNote.pinned })} />
              <ActionButton label={t("archiveNote")} icon="archive" active={activeNote.archived} onClick={() => updateNote(activeNote.id, { archived: !activeNote.archived })} />
              <ColorPicker color={activeNote.color} onChange={(color) => updateNote(activeNote.id, { color })} />
              <label className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-300">
                <Icon name="folderClosed" size={18} cursorNone />
                <select
                  value={activeNote.folder || ""}
                  onChange={(event) => updateNote(activeNote.id, { folder: event.target.value })}
                  className="max-w-32 rounded bg-gray-800 px-2 py-1 outline-none"
                  aria-label={t("moveToFolder")}
                >
                  <option value="">{t("noFolder")}</option>
                  {folders.map((folder) => <option key={folder} value={folder}>{folder}</option>)}
                </select>
              </label>
              <button
                type="button"
                className="ml-auto rounded-md p-2 hover:bg-red-500/15"
                title={t("trash")}
                aria-label={t("trash")}
                onClick={() => {
                  updateNote(activeNote.id, { deleted: true });
                  dialogRef.current?.close();
                }}
              >
                <Icon name="trash" />
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

function NoteCard({ note, view, onOpen, onUpdate }) {
  const lines = note.blocks?.filter((block) => block.content).slice(0, 8) || [];
  return (
    <article
      onClick={onOpen}
      onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && onOpen()}
      role="button"
      tabIndex={0}
      style={{ backgroundColor: note.color || noteColors[0] }}
      className="group relative mb-3 break-inside-avoid rounded-xl border border-gray-700 p-4 text-left transition hover:-translate-y-0.5 hover:border-gray-500 hover:shadow-lg"
    >
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 wrap-break-word text-lg font-bold">
          {note.title || "Untitled"}
        </h3>
        {note.pinned && <Icon name="pin" size={17} cursorNone />}
      </div>
      <div className="mt-2 space-y-1 text-sm text-gray-300">
        {lines.map((block) => (
          <div key={block.id} className={`flex gap-2 ${block.checked ? "text-gray-500 line-through" : ""}`}>
            {block.type === "checkbox" && <Icon name={block.checked ? "squareCheck" : "square"} size={16} cursorNone />}
            <span className="line-clamp-2 wrap-break-word">{block.title || block.content}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        {view === "trash" ? (
          <ActionButton label="Restore" icon="undo" onClick={(event) => { event.stopPropagation(); onUpdate({ deleted: false }); }} />
        ) : (
          <>
            <ActionButton label="Favorite" icon="bookmark" active={note.favorite} onClick={(event) => { event.stopPropagation(); onUpdate({ favorite: !note.favorite }); }} />
            <ActionButton label="Archive" icon="archive" active={note.archived} onClick={(event) => { event.stopPropagation(); onUpdate({ archived: !note.archived }); }} />
          </>
        )}
      </div>
    </article>
  );
}

function SidebarButton({ active, icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left ${active ? "bg-blue-500/20 text-blue-300" : "hover:bg-white/5"}`}>
      <Icon name={icon} />
      <span>{label}</span>
    </button>
  );
}

function ActionButton({ label, icon, active = false, onClick }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={`rounded-md p-2 hover:bg-white/10 ${active ? "bg-white/10 text-blue-300" : ""}`}>
      <Icon name={icon} className={active ? "text-blue-300" : "text-gray-300"} />
    </button>
  );
}

function ColorPicker({ color, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-md p-1" aria-label="Note color">
      {noteColors.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-label={`Use color ${option}`}
          className={`size-6 rounded-full border ${color === option ? "ring-2 ring-blue-400" : "border-gray-500"}`}
          style={{ backgroundColor: option }}
        />
      ))}
    </div>
  );
}
