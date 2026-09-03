(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let heroRemaining = 18 * 60 + 34;
  const heroTotal = 20 * 60;
  const renderHeroTimer = () => {
    const minutes = Math.floor(heroRemaining / 60);
    const seconds = heroRemaining % 60;
    byId("hero-timer").textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;
    byId("hero-progress").style.width = `${((heroTotal - heroRemaining) / heroTotal) * 100}%`;
  };
  window.setInterval(() => {
    heroRemaining = heroRemaining > 0 ? heroRemaining - 1 : heroTotal;
    renderHeroTimer();
  }, reduceMotion ? 5000 : 1000);

  const state = {
    mode: "main",
    intervalMin: 20,
    durationSec: 20,
    snoozeMin: 5,
    remainingSec: 20 * 60,
    breakRemainingSec: 20,
    paused: false,
    enabled: true,
    snoozed: false,
    blink: true,
    dark: true,
    sound: true,
    selectedSound: "gentle-bell",
    today: 0,
    total: 0,
    wellness: 100,
    xp: 0,
    level: 1
  };

  const views = {
    main: byId("demo-main-view"),
    settings: byId("demo-settings-view"),
    break: byId("demo-break-view"),
    complete: byId("demo-complete-view")
  };

  const announce = (message) => {
    byId("demo-announcer").textContent = message;
  };

  const setMode = (mode) => {
    state.mode = mode;
    Object.entries(views).forEach(([name, element]) => {
      element.hidden = name !== mode;
    });
  };

  const clamp = (value, min, max, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
  };

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;
    return `${minutes}:${String(remainder).padStart(2, "0")}`;
  };

  const updateStatus = () => {
    const status = byId("demo-status");
    const toggle = byId("toggle-timer");
    const icon = byId("timer-toggle-icon");
    status.className = "timer-status";

    if (!state.enabled) {
      status.textContent = "Disabled — press play to enable";
      status.classList.add("status-disabled");
      toggle.setAttribute("aria-label", "Enable breaks");
      icon.setAttribute("href", "#icon-play");
    } else if (state.paused) {
      status.textContent = "Paused";
      status.classList.add("status-paused");
      toggle.setAttribute("aria-label", "Resume timer");
      icon.setAttribute("href", "#icon-play");
    } else if (state.snoozed) {
      status.textContent = "Snoozed";
      status.classList.add("status-snoozed");
      toggle.setAttribute("aria-label", "Pause timer");
      icon.setAttribute("href", "#icon-pause");
    } else {
      status.textContent = "Active";
      status.classList.add("status-active");
      toggle.setAttribute("aria-label", "Pause timer");
      icon.setAttribute("href", "#icon-pause");
    }
  };

  const updateTimer = () => {
    const baseSeconds = state.snoozed ? state.snoozeMin * 60 : state.intervalMin * 60;
    const progress = baseSeconds > 0 ? ((baseSeconds - state.remainingSec) / baseSeconds) * 100 : 0;
    byId("demo-timer").textContent = formatTime(state.remainingSec);
    byId("demo-progress").style.width = `${Math.max(0, Math.min(100, progress))}%`;
    updateStatus();
  };

  const updateStats = () => {
    const needed = state.level * 100;
    byId("demo-today").textContent = String(state.today);
    byId("demo-total").textContent = String(state.total);
    byId("demo-wellness").textContent = String(state.wellness);
    byId("demo-level").textContent = String(state.level);
    byId("demo-xp-label").textContent = `${state.xp} / ${needed} XP`;
    byId("demo-xp").style.width = `${Math.min(100, (state.xp / needed) * 100)}%`;
  };

  const hideNotification = () => {
    byId("demo-notification").hidden = true;
  };

  const showNotification = () => {
    byId("demo-notification").hidden = false;
    announce("Chrome-style break reminder shown.");
  };

  const startBreak = () => {
    hideNotification();
    state.breakRemainingSec = state.durationSec;
    byId("break-count").textContent = String(state.breakRemainingSec);
    byId("break-message").textContent = state.blink
      ? "Look 20 feet away and blink fully."
      : "Look at something 20 feet away.";
    setMode("break");
    announce(`Break started for ${state.durationSec} seconds.`);
  };

  const returnToTimer = (message = "Back to the main timer.") => {
    state.remainingSec = state.intervalMin * 60;
    state.paused = false;
    state.snoozed = false;
    setMode("main");
    updateTimer();
    announce(message);
  };

  const snooze = () => {
    hideNotification();
    state.remainingSec = state.snoozeMin * 60;
    state.paused = false;
    state.snoozed = true;
    setMode("main");
    updateTimer();
    announce(`Break snoozed for ${state.snoozeMin} minutes.`);
  };

  const skipBreak = () => {
    returnToTimer("Break skipped. The next full interval has started.");
  };

  const completeBreak = () => {
    const gain = 10 + ((state.total * 7 + 5) % 15);
    state.today += 1;
    state.total += 1;
    state.wellness = Math.min(100, state.wellness + 2);
    state.xp += gain;
    const needed = state.level * 100;
    let leveledUp = false;
    if (state.xp >= needed) {
      state.xp -= needed;
      state.level += 1;
      leveledUp = true;
    }
    updateStats();
    byId("xp-reward").textContent = leveledUp ? `Level ${state.level} — Eye Buddy evolved!` : `+${gain} XP earned`;
    byId("complete-copy").textContent = "Your next break is ready when you are.";
    byId("demo-buddy-message").textContent = leveledUp ? "A new level! We did it." : "Thanks for taking care of me!";
    setMode("complete");
    announce(`Break complete. Eye Buddy earned ${gain} XP.`);
  };

  const syncSettingsForm = () => {
    byId("setting-interval").value = String(state.intervalMin);
    byId("setting-duration").value = String(state.durationSec);
    byId("setting-snooze").value = String(state.snoozeMin);
    byId("setting-blink").checked = state.blink;
    byId("setting-dark").checked = state.dark;
    byId("setting-sound").checked = state.sound;
    byId("sound-choice").hidden = !state.sound;
    const selected = document.querySelector(`input[name="demo-sound"][value="${state.selectedSound}"]`);
    if (selected) selected.checked = true;
  };

  const applyThemePreview = () => {
    byId("demo-popup").classList.toggle("light-mode", !byId("setting-dark").checked);
  };

  byId("show-reminder").addEventListener("click", showNotification);
  byId("close-notification").addEventListener("click", hideNotification);
  byId("notification-start").addEventListener("click", startBreak);
  byId("notification-snooze").addEventListener("click", snooze);
  byId("start-break-shortcut").addEventListener("click", startBreak);
  byId("snooze-break").addEventListener("click", snooze);
  byId("skip-break").addEventListener("click", skipBreak);
  byId("return-to-timer").addEventListener("click", () => returnToTimer());

  byId("turn-off-breaks").addEventListener("click", () => {
    state.enabled = false;
    state.paused = false;
    state.snoozed = false;
    setMode("main");
    updateTimer();
    announce("Break reminders turned off. Press play to enable them again.");
  });

  byId("toggle-timer").addEventListener("click", () => {
    if (!state.enabled) {
      state.enabled = true;
      state.paused = false;
      state.remainingSec = state.intervalMin * 60;
      announce("Break reminders enabled.");
    } else {
      state.paused = !state.paused;
      announce(state.paused ? `Timer paused at ${formatTime(state.remainingSec)}.` : `Timer resumed from ${formatTime(state.remainingSec)}.`);
    }
    updateTimer();
  });

  byId("reset-timer").addEventListener("click", () => {
    state.remainingSec = state.intervalMin * 60;
    state.snoozed = false;
    if (state.enabled) state.paused = false;
    updateTimer();
    announce("Timer reset to a full interval.");
  });

  byId("open-settings").addEventListener("click", () => {
    syncSettingsForm();
    setMode("settings");
    announce("Settings opened.");
  });

  byId("close-settings").addEventListener("click", () => {
    byId("demo-popup").classList.toggle("light-mode", !state.dark);
    setMode("main");
    updateTimer();
    announce("Settings closed without saving.");
  });

  byId("setting-dark").addEventListener("change", applyThemePreview);
  byId("setting-sound").addEventListener("change", (event) => {
    byId("sound-choice").hidden = !event.currentTarget.checked;
  });

  byId("demo-settings-form").addEventListener("submit", (event) => {
    event.preventDefault();
    state.intervalMin = clamp(byId("setting-interval").value, 1, 1440, 20);
    state.durationSec = clamp(byId("setting-duration").value, 5, 300, 20);
    state.snoozeMin = clamp(byId("setting-snooze").value, 1, 120, 5);
    state.blink = byId("setting-blink").checked;
    state.dark = byId("setting-dark").checked;
    state.sound = byId("setting-sound").checked;
    const selectedSound = document.querySelector('input[name="demo-sound"]:checked');
    if (selectedSound) state.selectedSound = selectedSound.value;
    byId("demo-popup").classList.toggle("light-mode", !state.dark);
    state.remainingSec = state.intervalMin * 60;
    state.snoozed = false;
    setMode("main");
    updateTimer();
    announce("Settings saved and the next interval rescheduled.");
  });

  window.setInterval(() => {
    if (state.mode === "main" && state.enabled && !state.paused) {
      state.remainingSec = Math.max(0, state.remainingSec - 1);
      updateTimer();
      if (state.remainingSec === 0) showNotification();
    } else if (state.mode === "break") {
      state.breakRemainingSec = Math.max(0, state.breakRemainingSec - 1);
      byId("break-count").textContent = String(state.breakRemainingSec);
      if (state.breakRemainingSec === 0) completeBreak();
    }
  }, 1000);

  updateTimer();
  updateStats();
})();
