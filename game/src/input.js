// Keyboard + mouse input for CURTAIN CALL. One job: read the devices and
// expose a clean, edge-triggered state the game loop can poll each frame.

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set(); // keys tapped since the last frame consumed them
  const mouse = { x: 640, y: 360, down: false, clicked: false, clickX: 0, clickY: 0 };

  const codeOf = (e) => e.code;

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (!e.repeat) pressed.add(e.code);
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => keys.clear());

  const toGame = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 1280,
      y: ((e.clientY - rect.top) / rect.height) * 720,
    };
  };
  canvas.addEventListener('mousemove', (e) => {
    const p = toGame(e);
    mouse.x = p.x;
    mouse.y = p.y;
  });
  canvas.addEventListener('mousedown', (e) => {
    const p = toGame(e);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.down = true;
    mouse.clicked = true;
    mouse.clickX = p.x;
    mouse.clickY = p.y;
  });
  window.addEventListener('mouseup', () => { mouse.down = false; });

  return {
    keys,
    mouse,
    // True while held.
    down(code) { return keys.has(code); },
    // True once per tap; consumed on read.
    tapped(code) {
      if (pressed.has(code)) { pressed.delete(code); return true; }
      return false;
    },
    // Movement vector from WASD / arrows, normalised.
    moveVector() {
      let x = 0;
      let y = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
      if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      return { x, y };
    },
    sneak() { return keys.has('ShiftLeft') || keys.has('ShiftRight'); },
    // Clear edge-triggered state at the end of a frame.
    endFrame() {
      pressed.clear();
      mouse.clicked = false;
    },
    codeOf,
  };
}
