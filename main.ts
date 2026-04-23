import { App, Notice, Plugin, PluginSettingTab, Setting, debounce } from "obsidian";

interface CopyOnSelectionSettings {
  debounceMs: number;
  minLength: number;
  showNotice: boolean;
  enableOnTouch: boolean;
}

const DEFAULT_SETTINGS: CopyOnSelectionSettings = {
  debounceMs: 150,
  minLength: 1,
  showNotice: true,
  enableOnTouch: false,
};

export default class CopyOnSelectionPlugin extends Plugin {
  settings: CopyOnSelectionSettings = DEFAULT_SETTINGS;
  private lastCopied = "";
  private copyDebounced: () => void = () => {};

  async onload() {
    await this.loadSettings();
    this.rebuildDebouncer();

    this.registerDomEvent(document, "selectionchange", () => this.copyDebounced());
    this.registerDomEvent(document, "touchend", () => {
      if (this.settings.enableOnTouch) this.copyDebounced();
    });

    this.addSettingTab(new CopyOnSelectionSettingTab(this.app, this));
  }

  private rebuildDebouncer() {
    this.copyDebounced = debounce(
      () => this.maybeCopy(),
      this.settings.debounceMs,
      true,
    );
  }

  private async maybeCopy() {
    const text = window.getSelection()?.toString() ?? "";
    if (text.trim().length < this.settings.minLength) return;
    if (text === this.lastCopied) return;

    try {
      await navigator.clipboard.writeText(text);
      this.lastCopied = text;
      if (this.settings.showNotice) {
        new Notice(`Copied ${text.length} chars`, 1200);
      }
    } catch {
      // focus or permission race — safe to ignore
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.rebuildDebouncer();
  }
}

class CopyOnSelectionSettingTab extends PluginSettingTab {
  plugin: CopyOnSelectionPlugin;

  constructor(app: App, plugin: CopyOnSelectionPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Debounce (ms)")
      .setDesc(
        "How long to wait after the selection stops changing before " +
          "copying. Lower values feel more immediate; higher values reduce " +
          "clipboard churn during fast keyboard selection.",
      )
      .addSlider((slider) =>
        slider
          .setLimits(0, 500, 25)
          .setValue(this.plugin.settings.debounceMs)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.debounceMs = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Minimum selection length")
      .setDesc(
        "Selections shorter than this are ignored. A value of 1 copies " +
          "every non-empty selection; raise it to skip single-character " +
          "noise from accidental clicks or caret placement.",
      )
      .addSlider((slider) =>
        slider
          .setLimits(1, 20, 1)
          .setValue(this.plugin.settings.minLength)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.minLength = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Show notice on copy")
      .setDesc(
        "Briefly display a toast each time text is copied. Handy while " +
          "tuning settings; most users will want this off.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showNotice)
          .onChange(async (value) => {
            this.plugin.settings.showNotice = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Enable on touch (mobile)")
      .setDesc(
        "Also fire after a touch-based selection on mobile. iOS restricts " +
          "clipboard writes outside of direct user gestures, so this may " +
          "silently fail in some contexts.",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableOnTouch)
          .onChange(async (value) => {
            this.plugin.settings.enableOnTouch = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Reset to defaults")
      .setDesc("Restore every setting on this page to its default value.")
      .addButton((button) =>
        button
          .setButtonText("Reset")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings = { ...DEFAULT_SETTINGS };
            await this.plugin.saveSettings();
            this.display();
            new Notice("Copy on Selection: settings reset");
          }),
      );
  }
}
