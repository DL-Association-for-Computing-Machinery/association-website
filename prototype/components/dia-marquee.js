/* Native HTML equivalent of Magic UI Marquee. */
(function () {
  "use strict";

  class DiaMarquee extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready === "true") return;

      const sourceNodes = Array.from(this.childNodes).map((node) => node.cloneNode(true));
      const repeat = Math.max(2, Math.min(8, Number(this.getAttribute("repeat")) || 4));
      const vertical = this.hasAttribute("vertical");

      this.replaceChildren();
      for (let index = 0; index < repeat; index += 1) {
        const item = document.createElement("span");
        item.className = "dia-marquee__item";
        sourceNodes.forEach((node) => item.append(node.cloneNode(true)));
        this.append(item);
      }

      this.dataset.ready = "true";
      this.dataset.reverse = String(this.hasAttribute("reverse"));
      this.dataset.vertical = String(vertical);
      this.dataset.pauseOnHover = String(this.hasAttribute("pause-on-hover"));
    }
  }

  customElements.define("dia-marquee", DiaMarquee);
})();
