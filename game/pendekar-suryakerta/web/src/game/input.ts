const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "Space",
  "ShiftLeft",
  "ShiftRight",
  "KeyQ",
  "KeyE",
  "KeyF",
  "KeyR",
  "Escape",
  "Enter",
  "KeyP",
]);

function radialDeadzone(x: number, y: number, dz = 0.18) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

export class Input {
  keys = new Set<string>();
  injected: string[] | null = null;
  moveX = 0;
  moveY = 0;
  touchX = 0;
  touchY = 0;
  attackHeld = false;
  dodgeHeld = false;
  justAttack = false;
  justDodge = false;
  justNova = false;
  justSnare = false;
  justRend = false;
  justPause = false;
  justConfirm = false;
  pointerAttack = false;
  touchAttack = false;
  touchDodge = false;
  touchNova = false;
  touchSnare = false;
  touchRend = false;
  private prevAttack = false;
  private prevDodge = false;
  private prevNova = false;
  private prevSnare = false;
  private prevRend = false;
  private prevPause = false;
  private prevConfirm = false;
  private detach: (() => void) | null = null;
  private onVisibility: (() => void) | null = null;

  mount() {
    const onDown = (e: KeyboardEvent) => {
      if (GAME_CODES.has(e.code)) e.preventDefault();
      this.keys.add(e.code);
    };
    const onUp = (e: KeyboardEvent) => this.keys.delete(e.code);
    const clear = () => this.keys.clear();
    window.addEventListener("keydown", onDown, { passive: false });
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clear);
    const onVisibility = () => {
      if (document.hidden) clear();
    };
    document.addEventListener("visibilitychange", onVisibility);
    this.onVisibility = onVisibility;
    this.detach = () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", onVisibility);
      this.onVisibility = null;
    };
  }

  unmount() {
    this.detach?.();
    this.detach = null;
    this.keys.clear();
  }

  setInjected(codes: string[]) {
    this.injected = codes.length ? codes : null;
  }

  setStick(x: number, y: number) {
    this.touchX = x;
    this.touchY = y;
  }

  poll() {
    const codes = this.injected ? new Set(this.injected) : this.keys;
    let kx = 0;
    let ky = 0;
    if (codes.has("KeyA") || codes.has("ArrowLeft")) kx -= 1;
    if (codes.has("KeyD") || codes.has("ArrowRight")) kx += 1;
    if (codes.has("KeyW") || codes.has("ArrowUp")) ky += 1;
    if (codes.has("KeyS") || codes.has("ArrowDown")) ky -= 1;

    let padAttack = false;
    let padDodge = false;
    let padNova = false;
    let padPause = false;
    const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : null;
    if (pads) {
      for (const pad of pads) {
        if (!pad) continue;
        const stick = radialDeadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
        kx += stick.x;
        ky += -stick.y;
        padAttack ||= !!pad.buttons[0]?.pressed;
        padDodge ||= !!pad.buttons[1]?.pressed || !!pad.buttons[5]?.pressed;
        padNova ||= !!pad.buttons[2]?.pressed;
        padPause ||= !!pad.buttons[9]?.pressed;
      }
    }

    kx += this.touchX;
    ky += this.touchY;
    const mag = Math.hypot(kx, ky);
    if (mag > 1) {
      kx /= mag;
      ky /= mag;
    }
    this.moveX = kx;
    this.moveY = ky;

    const attack =
      codes.has("Space") || this.pointerAttack || this.touchAttack || padAttack;
    const dodge =
      codes.has("ShiftLeft") || codes.has("ShiftRight") || this.touchDodge || padDodge;
    const nova = codes.has("KeyQ") || this.touchNova || padNova;
    const snare = codes.has("KeyE") || this.touchSnare;
    const rend = codes.has("KeyF") || codes.has("KeyR") || this.touchRend;
    const pause = codes.has("Escape") || codes.has("KeyP") || padPause;
    const confirm = codes.has("Enter") || codes.has("Space");

    this.justAttack = attack && !this.prevAttack;
    this.justDodge = dodge && !this.prevDodge;
    this.justNova = nova && !this.prevNova;
    this.justSnare = snare && !this.prevSnare;
    this.justRend = rend && !this.prevRend;
    this.justPause = pause && !this.prevPause;
    this.justConfirm = confirm && !this.prevConfirm;
    this.attackHeld = attack;
    this.dodgeHeld = dodge;
    this.prevAttack = attack;
    this.prevDodge = dodge;
    this.prevNova = nova;
    this.prevSnare = snare;
    this.prevRend = rend;
    this.prevPause = pause;
    this.prevConfirm = confirm;
    this.pointerAttack = false;
  }
}
