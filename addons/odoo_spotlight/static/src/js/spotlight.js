/** @odoo-module **/

import { registry } from "@web/core/registry";
import { Dialog } from "@web/core/dialog/dialog";
import { useService } from "@web/core/utils/hooks";
import { SpotlightSection } from "./spotlight_section";
import { debounce } from "@web/core/utils/timing";
import {
  useExternalListener,
  Component,
  EventBus,
  useRef,
  onMounted,
  onWillUnmount,
  useState,
} from "@odoo/owl";
import { spotlightProviderRegistry } from "./spotlight_provider_registry";

export class SpotlightPalette extends Component {
  static template = "odoo_spotlight.SpotlightPalette";
  static components = { Dialog, SpotlightSection };
  static props = {
    bus: { type: EventBus, optional: true },
    close: Function,
    config: Object,
  };

  setup() {
    this.state = useState({
      searchValue: "",
      results: [],
      flatItems: [],
      activeIndex: 0,
      isLoading: false,
    });
    this.commandService = useService("command");
    this.root = useRef("root");
    this.debounceSearch = debounce((value) => this.search(value), 10);

    useExternalListener(window, "mousedown", this.onWindowMouseDown);
    this.onKeyDown = (ev) => {
      switch (ev.key) {
        case"Tab":
          ev.preventDefault();
          ev.stopPropagation();
          this.switchCommandPalette(this.commandService);
          break;

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
          this.execute(ev.shiftKey);
          break;
      }
    };

    /**
     * Add a global keydown listener to capture the 'tab' key and switch to Odoo command palette.
     * Force the capture phase to get the event before the default behavior of the browser.
     * We need to clean up the listener to restore normal behavior once the palette is closed.
     */
    onMounted(() => {
      window.addEventListener("keydown", this.onKeyDown, { capture: true });
    });

    onWillUnmount(() => {
      window.removeEventListener("keydown", this.onKeyDown, { capture: true });
    });
  }

  move(direction) {
    const max = this.state.flatItems.length - 1;
    if (max < 0) return;

    let next = this.state.activeIndex + direction;

    if (next < 0) next = max;
    if (next > max) next = 0;

    this.state.activeIndex = next;
    this.scrollToActive();
  }

  scrollToActive() {
    requestAnimationFrame(() => {
      const el = this.root.el.querySelector(
        `[data-index="${this.state.activeIndex}"]`
      );
      if (el) {
        el.scrollIntoView({ block: "nearest" });
      }
    });
  }

  execute(openInDialog) {
    const item = this.state.flatItems[this.state.activeIndex];
    if (!item || !item.action) return;

    item.action({openInDialog});

    this.props.close();
  }

  async switchCommandPalette() {
    this.props.close();
    // Await for the DOM fully updated before opening the odoo command palette
    // Could be enhanced
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
    this.commandService.openMainPalette();
  }

  /**
   * Close the palette on outside click.
   */
  onWindowMouseDown(ev) {
    if (!this.root.el.contains(ev.target)) {
      this.props.close();
    }
  }

  async search(searchValue) {
    this.state.isLoading = true;
    this.state.activeIndex = 0;

    try {
      const providers = spotlightProviderRegistry
        .getAll()
        .sort((a, b) => (a.priority || 100) - (b.priority || 100));

      const results = [];
      const flatItems = [];
      let index = 0;

      for (const provider of providers) {
        const items = await provider.search(this.env, searchValue);
        if (items.length) {
          const enrichedItems = items.map((item) => ({
            ...item,
            __index: index++,
          }));

          flatItems.push(...enrichedItems);

          results.push({
            section: provider.section,
            icon: provider.icon,
            items: enrichedItems,
          });
        }
      }

      this.state.results = results;
      this.state.flatItems = flatItems;
    } finally {
      this.state.isLoading = false;
    }
  }

  onSearchInput(ev) {
    const value = ev.target.value;
    this.state.searchValue = value;
    this.debounceSearch(value).catch(() => {
      this.state.results = [];
    });
  }
}

export const SpotlightHotkey = {
  dependencies: ["dialog", "hotkey", "command"],
  name: "spotlight_hotkey",
  start(env, { dialog, hotkey: hotkeyService, command }) {
    let isSpotlightOpened = false;
    const bus = new EventBus();

    hotkeyService.add("control+k", openSpotlightPalette, {
      bypassEditableProtection: true,
      global: true,
    });

    function openSpotlightPalette(config = {}, onClose) {
      if (isSpotlightOpened) {
        return;
      }

      // Open Command Palette dialog
      isSpotlightOpened = true;
      dialog.add(
        SpotlightPalette,
        {
          config,
          bus,
        },
        {
          onClose: () => {
            isSpotlightOpened = false;
            if (onClose) {
              onClose();
            }
          },
        }
      );
    }
  },
};
registry.category("services").add("spotlight_hotkey", SpotlightHotkey);
