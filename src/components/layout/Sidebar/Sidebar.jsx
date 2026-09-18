import { useState } from "react";
import { Link } from "react-router-dom";

import { Icon } from "@/components/ui/Icon";

export function Sidebar() {
  const [folderOpen, setFolderOpen] = useState(false);

  function handleFolderToggle() {
    setFolderOpen((current) => !current);
  }

  return (
    <div className="border-style">
      <aside>
        <nav className="p-2 space-y-2">
          <Link to="/favorites" className="flex items-center gap-2">
            <Icon name="squareText" />
            <span>All notes</span>
          </Link>
          <Link to="/favorites" className="flex items-center gap-2">
            <Icon name="bookmark" />
            <span>Favorites</span>
          </Link>
          <hr className="my-3 text-gray-600" />
          <button className="flex items-center gap-2">
            <Icon name="plus" />
            <span>New folder</span>
          </button>
          <div className="flex items-center justify-between">
            <button
              onClick={handleFolderToggle}
              className="flex items-center gap-2"
            >
              {folderOpen ? (
                <Icon name="folderOpen" />
              ) : (
                <Icon name="folderClosed" />
              )}
              <span>folder.name</span>
            </button>
          </div>
        </nav>
      </aside>
    </div>
  );
}
