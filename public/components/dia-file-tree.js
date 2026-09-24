/* Native file tree adapted from the supplied Magic UI File Tree behavior. */
(function () {
  "use strict";

  const tree = [
    {
      id: "association",
      name: "ECUT-CA",
      children: [
        {
          id: "sections",
          name: "sections",
          children: [
            { id: "about", name: "about.md" },
            { id: "honors", name: "honors.json" },
            { id: "activities", name: "activities.md" },
          ],
        },
        {
          id: "learning",
          name: "learning",
          children: [
            { id: "algorithms", name: "algorithms.ts" },
            { id: "web", name: "web-lab.ts" },
          ],
        },
        { id: "readme", name: "README.md" },
      ],
    },
  ];

  class DiaFileTree extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._expanded = new Set(["association", "sections"]);
      this._selected = "about";
      this._render();
      this._ready = true;
    }

    _render() {
      this.replaceChildren();
      const shell = document.createElement("section");
      shell.className = "file-tree";
      shell.setAttribute("aria-label", "协会内容文件结构");

      const header = document.createElement("header");
      header.className = "file-tree__header";
      const title = document.createElement("span");
      title.textContent = "PROJECT FILES";
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "file-tree__toggle";
      toggle.setAttribute("aria-label", "展开或收起全部文件夹");
      toggle.textContent = this._expanded.size ? "−" : "+";
      toggle.addEventListener("click", () => {
        if (this._expanded.size) {
          this._expanded.clear();
        } else {
          this._collectFolders(tree).forEach((id) => this._expanded.add(id));
        }
        this._render();
      });
      header.append(title, toggle);

      const list = document.createElement("ul");
      list.className = "file-tree__list";
      this._appendNodes(list, tree);
      shell.append(header, list);
      this.append(shell);
    }

    _collectFolders(nodes) {
      return nodes.flatMap((node) => {
        if (!node.children) return [];
        return [node.id, ...this._collectFolders(node.children)];
      });
    }

    _appendNodes(parent, nodes) {
      nodes.forEach((node) => {
        const item = document.createElement("li");
        item.className = "file-tree__item";
        const isFolder = Array.isArray(node.children);
        const row = document.createElement("button");
        row.type = "button";
        row.className = `file-tree__row${this._selected === node.id ? " is-selected" : ""}`;

        const icon = document.createElement("span");
        icon.className = isFolder
          ? `file-tree__folder${this._expanded.has(node.id) ? " is-open" : ""}`
          : "file-tree__file";
        icon.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.textContent = node.name;
        row.append(icon, label);

        if (isFolder) {
          const expanded = this._expanded.has(node.id);
          row.setAttribute("aria-expanded", String(expanded));
          row.addEventListener("click", () => {
            if (expanded) this._expanded.delete(node.id);
            else this._expanded.add(node.id);
            this._render();
          });

          const children = document.createElement("ul");
          children.className = "file-tree__children";
          children.hidden = !expanded;
          this._appendNodes(children, node.children);
          item.append(row, children);
        } else {
          row.addEventListener("click", () => {
            this._selected = node.id;
            this._render();
          });
          item.append(row);
        }
        parent.append(item);
      });
    }
  }

  customElements.define("dia-file-tree", DiaFileTree);
})();
