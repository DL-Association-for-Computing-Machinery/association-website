/* Native HTML equivalent of Magic UI Avatar Circles. */
(function () {
  "use strict";

  class DiaAvatarCircles extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready === "true") return;

      const numPeople = Number(this.getAttribute("num-people"));
      if (Number.isFinite(numPeople) && numPeople > 0) {
        const more = document.createElement("span");
        more.className = "dia-avatar-circles__more";
        more.textContent = `+${numPeople}`;
        more.setAttribute("aria-hidden", "true");
        this.append(more);
      }

      this.dataset.ready = "true";
    }
  }

  customElements.define("dia-avatar-circles", DiaAvatarCircles);
})();
