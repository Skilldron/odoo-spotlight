/** @odoo-module **/

import { Component, useState, onMounted, onWillUnmount } from "@odoo/owl";

export class SpotlightQuickActions extends Component {
  static template = "odoo_spotlight.SpotlightQuickActions";
  static props = {
    item: { type: Object, optional: true },
    onAfterExecute: { type: Function, optional: true },
  };

  setup() {
    this.state = useState({
      activeIndex: 0,
      isQuickActionsOpen: false,
    });

    this.onKeyDown = (ev) => {
      // Toggle quick actions with Ctrl+. (or Cmd+. on macOS)
      const isCtrlOrMeta = ev.ctrlKey || ev.metaKey;
      if (isCtrlOrMeta && ev.key === ";") {
        ev.preventDefault();
        ev.stopPropagation();
        this.toggleQuickActions();
        return;
      }

      switch (ev.key) {
        case "ArrowDown":
          ev.preventDefault();
          this.move(1);
          break;
        case "ArrowUp":
          ev.preventDefault();
          this.move(-1);
          break;
        case "Enter":
          ev.preventDefault();
          this.executeActive();
          break;
        case "Escape":
          ev.preventDefault();
          this.props.onClose();
          break;
      }
    };

    onMounted(() => {
      window.addEventListener("keydown", this.onKeyDown);
    });

    onWillUnmount(() => {
      window.removeEventListener("keydown", this.onKeyDown);
    });
  }

  toggleQuickActions() {
    if (!this.props.item || !this.props.item.quickActions) {
      return;
    }
    this.state.isQuickActionsOpen = !this.state.isQuickActionsOpen;
    this.state.activeIndex = 0;
  }

  get structuredActions() {
    if (!this.props.item || !this.props.item.quickActions) {
      return { provider: [], common: [] };
    }
    return this.props.item.quickActions;
  }

  get flatActions() {
    return [
      ...this.structuredActions.provider,
      ...this.structuredActions.common,
    ];
  }

  move(direction) {
    const max = this.flatActions.length - 1;
    if (max < 0) return;

    let next = this.state.activeIndex + direction;

    if (next < 0) next = max;
    if (next > max) next = 0;

    this.state.activeIndex = next;
  }

  async executeActive() {
    const action = this.flatActions[this.state.activeIndex];
    if (!action || !action.execute) return;

    await action.execute();

    if (this.props.onAfterExecute) {
      await this.props.onAfterExecute();
    }

    this.props.onClose();
  }

  async onClick(ev, qa) {
    ev.preventDefault();
    ev.stopPropagation();
    this.state.activeIndex = this.flatActions.indexOf(qa);
    await this.executeActive();
  }

  isActive(qa) {
    return this.flatActions[this.state.activeIndex] === qa;
  }
}
