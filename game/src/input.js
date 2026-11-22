// CURTAIN CALL — keyboard and mouse input, shared by player and tools.
window.CURTAIN_INPUT = (function () {
  const keys = {};
  const mouse = { x: 640, y: 360, down: false, clicked: false, clickX: 0, clickY: 0 };
  let canvas = null;

  function keyDown(e) {
    keys[e.key.toLowerCase()] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault();
  }
  function keyUp(e) { keys[e.key.toLowerCase()] = false; }
  function pressed(code) { return !!keys[code]; }

  function moveVector() {
    let x = 0, y = 0;
    if (keys['a'] || keys['arrowleft']) x -= 1;
    if (keys['d'] || keys['arrowright']) x += 1;
    if (keys['w'] || keys['arrowup']) y -= 1;
    if (keys['s'] || keys['arrowdown']) y += 1;
    if (x !== 0 && y !== 0) { x *= 0.7071; y *= 0.7071; }
    return { x, y };
  }

  function attach(canvasEl) {
    canvas = canvasEl;
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    canvasEl.addEventListener('mousemove', (e) => {
      const r = canvasEl.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * (1280 / r.width);
      mouse.y = (e.clientY - r.top) * (720 / r.height);
    });
    canvasEl.addEventListener('mousedown', (e) => {
      mouse.down = true;
      mouse.clicked = true;
      const r = canvasEl.getBoundingClientRect();
      mouse.clickX = (e.clientX - r.left) * (1280 / r.width);
      mouse.clickY = (e.clientY - r.top) * (720 / r.height);
    });
    window.addEventListener('mouseup', () => { mouse.down = false; });
  }

  function consumeClick() {
    const c = mouse.clicked;
    mouse.clicked = false;
    return c;
  }

  return { keys, mouse, pressed, moveVector, attach, consumeClick };
})();
