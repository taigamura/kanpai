// UI Studio — self-contained DOM overlay (web + __DEV__ only).
//
// Injected over the LIVE react-native-web app by StudioOverlay. Two jobs:
//   1) Sliders / color pickers for every theme token (font, spacing, radius, colors). Editing
//      builds a pending set; "Apply" persists overrides to localStorage and reloads so the real
//      screens re-render at the new sizes with pixel-exact fidelity (see src/theme/studio.ts).
//   2) A drag-an-arrow + comment layer for anything a slider can't express, tagged to the screen.
//
// Written as vanilla DOM (globals accessed loosely as `any`) so it needs no DOM lib in tsconfig
// and adds zero React Native styling. Everything here runs only when mountStudio() is called,
// which StudioOverlay gates to web + __DEV__.
import { THEME_DEFAULTS } from '@/theme/theme';
import {
  readStudioState,
  writeStudioState,
  type StudioComment,
  type StudioState,
} from '@/theme/studio';

const win: any = globalThis as any;
const doc: any = win.document;

const UI_KEY = 'kanpai:studio-ui';
const ROUTE_KEY = 'kanpai:studio-route';

type NumRange = { min: number; max: number };
type Tab = 'type' | 'space' | 'radius' | 'color' | 'notes';

// ---- token control config -------------------------------------------------
function numRange(def: number, kind: 'font' | 'spacing' | 'radius'): NumRange {
  if (kind === 'font') return { min: Math.max(6, Math.floor(def * 0.4)), max: Math.ceil(def * 2.2) };
  return { min: 0, max: Math.max(16, Math.ceil(def * 3) + 8) };
}

// rgba() tokens get a text input; hex tokens get a native color picker.
function isHex(v: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);
}

// ---- persisted UI prefs ---------------------------------------------------
function loadUi(): { open: boolean; tab: Tab; x: number; y: number } {
  try {
    const raw = win.localStorage?.getItem(UI_KEY);
    if (raw) return { open: true, tab: 'type', x: 16, y: 16, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { open: false, tab: 'type', x: 16, y: 16 };
}
function saveUi(ui: any): void {
  try {
    win.localStorage?.setItem(UI_KEY, JSON.stringify(ui));
  } catch {
    /* ignore */
  }
}

function currentRoute(): string {
  try {
    const raw = win.localStorage?.getItem(ROUTE_KEY);
    if (raw) return (JSON.parse(raw)?.name as string) || 'home';
  } catch {
    /* ignore */
  }
  return 'home';
}

// tiny DOM helper
function el(tag: string, props: any = {}, children: any[] = []): any {
  const node = doc.createElement(tag);
  for (const k of Object.keys(props)) {
    if (k === 'style') Object.assign(node.style, props[k]);
    else if (k.startsWith('on') && typeof props[k] === 'function')
      node.addEventListener(k.slice(2).toLowerCase(), props[k]);
    else if (k === 'text') node.textContent = props[k];
    else node.setAttribute(k, props[k]);
  }
  for (const c of children) if (c != null) node.appendChild(c);
  return node;
}

const uid = () => 'c' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

// ===========================================================================
export function mountStudio(): () => void {
  if (!doc || win.__kanpaiStudioMounted) return () => {};
  win.__kanpaiStudioMounted = true;

  const state: StudioState = readStudioState();
  const savedTokens = state.tokens ?? {};
  let comments: StudioComment[] = state.comments ?? [];

  // pending = full current value for every token, seeded from defaults + saved overrides.
  const pending: {
    font: Record<string, number>;
    spacing: Record<string, number>;
    radius: Record<string, number>;
    colors: Record<string, string>;
  } = {
    font: { ...THEME_DEFAULTS.font, ...(savedTokens.font ?? {}) },
    spacing: { ...THEME_DEFAULTS.spacing, ...(savedTokens.spacing ?? {}) },
    radius: { ...THEME_DEFAULTS.radius, ...(savedTokens.radius ?? {}) },
    colors: { ...THEME_DEFAULTS.colors, ...(savedTokens.colors ?? {}) },
  };

  const ui = loadUi();
  let commentMode = false;

  // ---- styles -------------------------------------------------------------
  const style = el('style', {
    text: `
      .kstudio, .kstudio * { box-sizing: border-box; font-family: -apple-system, system-ui, sans-serif; }
      .kstudio-launch { position: fixed; z-index: 2147483000; bottom: 14px; right: 14px;
        background:#3C1F05; color:#FDF7E6; border:none; border-radius:999px; padding:10px 16px;
        font-weight:700; font-size:13px; cursor:pointer; box-shadow:0 6px 20px rgba(0,0,0,.35); }
      .kstudio-panel { position: fixed; z-index: 2147483001; width: 320px; max-height: 82vh;
        background:#1c130a; color:#FDF7E6; border:1px solid #5F3E17; border-radius:14px;
        box-shadow:0 16px 48px rgba(0,0,0,.5); display:flex; flex-direction:column; overflow:hidden; }
      .kstudio-head { display:flex; align-items:center; gap:8px; padding:10px 12px; cursor:move;
        background:#2a1c0c; border-bottom:1px solid #5F3E17; user-select:none; }
      .kstudio-title { font-weight:800; font-size:13px; flex:1; }
      .kstudio-apply { background:#FF5D66; color:#fff; border:none; border-radius:8px;
        padding:6px 10px; font-weight:800; font-size:12px; cursor:pointer; }
      .kstudio-apply[disabled] { background:#4a3a2a; color:#8a7a68; cursor:default; }
      .kstudio-x { background:none; border:none; color:#c9b79a; font-size:16px; cursor:pointer; padding:2px 6px; }
      .kstudio-tabs { display:flex; gap:2px; padding:6px; background:#160f07; border-bottom:1px solid #3a2913; }
      .kstudio-tab { flex:1; background:none; border:none; color:#a68f70; font-size:11px; font-weight:700;
        padding:6px 2px; border-radius:6px; cursor:pointer; }
      .kstudio-tab.active { background:#3C1F05; color:#F7C64E; }
      .kstudio-body { padding:10px 12px; overflow-y:auto; }
      .kstudio-row { display:flex; align-items:center; gap:8px; margin:7px 0; }
      .kstudio-row label { width:74px; font-size:11px; color:#c9b79a; flex-shrink:0; }
      .kstudio-row input[type=range] { flex:1; accent-color:#F7C64E; }
      .kstudio-val { width:52px; text-align:right; font-size:11px; font-variant-numeric:tabular-nums; }
      .kstudio-val.mod { color:#F7C64E; font-weight:800; }
      .kstudio-row input[type=color] { width:30px; height:24px; padding:0; border:1px solid #5F3E17;
        background:none; border-radius:5px; cursor:pointer; }
      .kstudio-row input[type=text] { flex:1; background:#160f07; border:1px solid #5F3E17; color:#FDF7E6;
        border-radius:5px; padding:4px 6px; font-size:11px; }
      .kstudio-foot { display:flex; gap:6px; padding:8px 12px; border-top:1px solid #3a2913; flex-wrap:wrap; }
      .kstudio-btn { background:#2a1c0c; color:#FDF7E6; border:1px solid #5F3E17; border-radius:7px;
        padding:6px 9px; font-size:11px; font-weight:700; cursor:pointer; }
      .kstudio-btn.on { background:#F7C64E; color:#2a1c0c; border-color:#F7C64E; }
      .kstudio-hint { font-size:10px; color:#8a7a68; margin:2px 0 8px; line-height:1.4; }
      .kstudio-note { border:1px solid #3a2913; border-radius:8px; padding:8px; margin:6px 0; font-size:11px; }
      .kstudio-note .rt { color:#F7C64E; font-weight:700; font-size:10px; }
      .kstudio-note textarea, .kstudio-modal textarea { width:100%; background:#160f07; color:#FDF7E6;
        border:1px solid #5F3E17; border-radius:6px; font-size:11px; padding:5px; resize:vertical; }
      .kstudio-modal { position:fixed; z-index:2147483003; inset:0; background:rgba(0,0,0,.6);
        display:flex; align-items:center; justify-content:center; }
      .kstudio-modal .box { width:min(520px,92vw); background:#1c130a; border:1px solid #5F3E17;
        border-radius:12px; padding:14px; color:#FDF7E6; }
      .kstudio-layer { position:fixed; z-index:2147482999; inset:0; pointer-events:none; }
      .kstudio-layer.draw { pointer-events:auto; cursor:crosshair; }
      .kstudio-pin { position:absolute; transform:translate(-50%,-50%); width:22px; height:22px;
        border-radius:999px; background:#FF5D66; color:#fff; font-size:11px; font-weight:800;
        display:flex; align-items:center; justify-content:center; pointer-events:auto; cursor:pointer;
        box-shadow:0 2px 8px rgba(0,0,0,.4); }
      .kstudio-pop { position:absolute; z-index:2147483002; width:220px; background:#1c130a;
        border:1px solid #5F3E17; border-radius:10px; padding:8px; box-shadow:0 10px 30px rgba(0,0,0,.5); }
      .kstudio-drawhint { position:fixed; z-index:2147483002; top:12px; left:50%; transform:translateX(-50%);
        background:#F7C64E; color:#2a1c0c; padding:6px 14px; border-radius:999px; font-size:12px;
        font-weight:800; pointer-events:none; }
    `,
  });
  doc.head.appendChild(style);

  // ---- SVG arrow layer ----------------------------------------------------
  const SVGNS = 'http://www.w3.org/2000/svg';
  const layer = doc.createElement('div');
  layer.className = 'kstudio-layer';
  const svg = doc.createElementNS(SVGNS, 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  const defs = doc.createElementNS(SVGNS, 'defs');
  defs.innerHTML =
    '<marker id="kstudio-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">' +
    '<path d="M0,0 L7,3 L0,6 Z" fill="#FF5D66"/></marker>';
  svg.appendChild(defs);
  layer.appendChild(svg);
  doc.body.appendChild(layer);

  // Comment coords are normalized to the web phone frame (#kanpai-phone-frame) when present, so
  // arrows stay pinned to their component as the window resizes. Falls back to the full viewport.
  function frameRect() {
    const f = doc.getElementById('kanpai-phone-frame');
    if (f) {
      const r = f.getBoundingClientRect();
      return { left: r.left, top: r.top, w: r.width, h: r.height };
    }
    return { left: 0, top: 0, w: win.innerWidth, h: win.innerHeight };
  }
  function px(nx: number, ny: number) {
    const r = frameRect();
    return { x: r.left + nx * r.w, y: r.top + ny * r.h };
  }
  function norm(x: number, y: number) {
    const r = frameRect();
    return { nx: (x - r.left) / r.w, ny: (y - r.top) / r.h };
  }

  function renderComments() {
    // clear existing arrows/pins/pops
    Array.from(svg.querySelectorAll('line')).forEach((n: any) => n.remove());
    Array.from(layer.querySelectorAll('.kstudio-pin, .kstudio-pop')).forEach((n: any) => n.remove());
    const route = currentRoute();
    const here = comments.filter((c) => c.route === route);
    here.forEach((c, i) => {
      const a = px(c.x1, c.y1);
      const b = px(c.x2, c.y2);
      const line = doc.createElementNS(SVGNS, 'line');
      line.setAttribute('x1', a.x);
      line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x);
      line.setAttribute('y2', b.y);
      line.setAttribute('stroke', '#FF5D66');
      line.setAttribute('stroke-width', '2.5');
      line.setAttribute('marker-end', 'url(#kstudio-arrow)');
      svg.appendChild(line);
      const pin = el('div', { class: 'kstudio-pin', text: String(i + 1) });
      pin.style.left = a.x + 'px';
      pin.style.top = a.y + 'px';
      pin.addEventListener('click', (e: any) => {
        e.stopPropagation();
        openCommentPopover(c, a.x, a.y);
      });
      layer.appendChild(pin);
    });
    updateNotesTab();
  }

  function openCommentPopover(c: StudioComment, x: number, y: number) {
    layer.querySelectorAll('.kstudio-pop').forEach((n: any) => n.remove());
    const ta = el('textarea', { rows: '3' });
    ta.value = c.text;
    const pop = el('div', { class: 'kstudio-pop' }, [
      ta,
      el('div', { style: { display: 'flex', gap: '6px', marginTop: '6px' } }, [
        el('button', {
          class: 'kstudio-btn',
          text: 'Save',
          onclick: () => {
            c.text = ta.value.trim();
            persist();
            renderComments();
          },
        }),
        el('button', {
          class: 'kstudio-btn',
          text: 'Delete',
          onclick: () => {
            comments = comments.filter((x) => x.id !== c.id);
            persist();
            renderComments();
          },
        }),
        el('button', { class: 'kstudio-btn', text: 'Close', onclick: () => pop.remove() }),
      ]),
    ]);
    pop.style.left = Math.min(x, win.innerWidth - 240) + 'px';
    pop.style.top = Math.min(y + 14, win.innerHeight - 140) + 'px';
    layer.appendChild(pop);
    ta.focus();
  }

  // ---- draw interaction ---------------------------------------------------
  let drawing: any = null;
  let tempLine: any = null;
  let drawHint: any = null;

  function setCommentMode(on: boolean) {
    commentMode = on;
    layer.classList.toggle('draw', on);
    if (on && !drawHint) {
      drawHint = el('div', {
        class: 'kstudio-drawhint',
        text: 'ドラッグで矢印を引く → コメント入力  (Escで終了)',
      });
      doc.body.appendChild(drawHint);
    } else if (!on && drawHint) {
      drawHint.remove();
      drawHint = null;
    }
    const btn = panel.querySelector('#kstudio-commentbtn');
    if (btn) btn.classList.toggle('on', on);
  }

  layer.addEventListener('pointerdown', (e: any) => {
    if (!commentMode) return;
    if (e.target.closest && e.target.closest('.kstudio-pin, .kstudio-pop')) return;
    drawing = { x1: e.clientX, y1: e.clientY };
    tempLine = doc.createElementNS(SVGNS, 'line');
    tempLine.setAttribute('x1', e.clientX);
    tempLine.setAttribute('y1', e.clientY);
    tempLine.setAttribute('x2', e.clientX);
    tempLine.setAttribute('y2', e.clientY);
    tempLine.setAttribute('stroke', '#FF5D66');
    tempLine.setAttribute('stroke-width', '2.5');
    tempLine.setAttribute('stroke-dasharray', '5,4');
    tempLine.setAttribute('marker-end', 'url(#kstudio-arrow)');
    svg.appendChild(tempLine);
    layer.setPointerCapture?.(e.pointerId);
  });
  layer.addEventListener('pointermove', (e: any) => {
    if (!drawing || !tempLine) return;
    tempLine.setAttribute('x2', e.clientX);
    tempLine.setAttribute('y2', e.clientY);
  });
  layer.addEventListener('pointerup', (e: any) => {
    if (!drawing) return;
    const start = drawing;
    const endX = e.clientX;
    const endY = e.clientY;
    if (tempLine) tempLine.remove();
    tempLine = null;
    drawing = null;
    // tiny drag → treat as a point marker (short arrow up-left so the pin sits on the target)
    let x1 = start.x1;
    let y1 = start.y1;
    let x2 = endX;
    let y2 = endY;
    if (Math.hypot(endX - start.x1, endY - start.y1) < 12) {
      x1 = start.x1 - 40;
      y1 = start.y1 - 40;
      x2 = start.x1;
      y2 = start.y1;
    }
    const n1 = norm(x1, y1);
    const n2 = norm(x2, y2);
    const draft: StudioComment = {
      id: uid(),
      route: currentRoute(),
      x1: n1.nx,
      y1: n1.ny,
      x2: n2.nx,
      y2: n2.ny,
      text: '',
      ts: Date.now(),
    };
    // inline compose box at the tail
    const ta = el('textarea', { rows: '3', placeholder: 'このコンポーネントへのコメント…' });
    const pop = el('div', { class: 'kstudio-pop' }, [
      ta,
      el('div', { style: { display: 'flex', gap: '6px', marginTop: '6px' } }, [
        el('button', {
          class: 'kstudio-btn',
          text: '保存',
          onclick: () => {
            draft.text = ta.value.trim();
            if (draft.text) {
              comments.push(draft);
              persist();
            }
            pop.remove();
            renderComments();
          },
        }),
        el('button', { class: 'kstudio-btn', text: '取消', onclick: () => pop.remove() }),
      ]),
    ]);
    pop.style.left = Math.min(x1, win.innerWidth - 240) + 'px';
    pop.style.top = Math.min(y1 + 14, win.innerHeight - 140) + 'px';
    layer.appendChild(pop);
    ta.focus();
  });

  win.addEventListener('resize', renderComments);
  const onKey = (e: any) => {
    if (e.key === 'Escape' && commentMode) setCommentMode(false);
  };
  win.addEventListener('keydown', onKey);

  // ---- persistence --------------------------------------------------------
  function tokenDiff() {
    const diff: any = {};
    (['font', 'spacing', 'radius', 'colors'] as const).forEach((grp) => {
      const d: any = {};
      const def: any = (THEME_DEFAULTS as any)[grp];
      const cur: any = (pending as any)[grp];
      Object.keys(cur).forEach((k) => {
        if (String(cur[k]) !== String(def[k])) d[k] = cur[k];
      });
      if (Object.keys(d).length) diff[grp] = d;
    });
    return diff;
  }

  function persist() {
    writeStudioState({ tokens: readStudioState().tokens, comments });
  }

  function apply() {
    const diff = tokenDiff();
    writeStudioState({ tokens: diff, comments });
    win.location.reload();
  }

  // ---- panel + launcher ---------------------------------------------------
  const launcher = el('button', {
    class: 'kstudio-launch',
    text: '🎛 Studio',
    onclick: () => togglePanel(true),
  });
  doc.body.appendChild(launcher);

  const panel = el('div', { class: 'kstudio kstudio-panel' });
  panel.style.display = 'none';
  panel.style.left = ui.x + 'px';
  panel.style.top = ui.y + 'px';
  doc.body.appendChild(panel);

  let pendingCount = 0;
  function refreshApply() {
    pendingCount = Object.values(tokenDiff()).reduce(
      (a: number, g: any) => a + Object.keys(g).length,
      0,
    );
    const btn = panel.querySelector('.kstudio-apply');
    if (btn) {
      btn.textContent = pendingCount ? `Apply (${pendingCount}) ↻` : 'Applied';
      btn.disabled = pendingCount === 0;
    }
  }

  function numRow(grp: 'font' | 'spacing' | 'radius', key: string): any {
    const def = (THEME_DEFAULTS as any)[grp][key] as number;
    const r = numRange(def, grp);
    const cur = (pending as any)[grp][key] as number;
    const valEl = el('span', { class: 'kstudio-val', text: String(cur) });
    const range = el('input', {
      type: 'range',
      min: String(r.min),
      max: String(r.max),
      step: '1',
      value: String(cur),
    });
    range.addEventListener('input', (e: any) => {
      const v = Number(e.target.value);
      (pending as any)[grp][key] = v;
      valEl.textContent = String(v);
      valEl.classList.toggle('mod', v !== def);
      refreshApply();
    });
    valEl.classList.toggle('mod', cur !== def);
    return el('div', { class: 'kstudio-row' }, [el('label', { text: key }), range, valEl]);
  }

  function colorRow(key: string): any {
    const def = (THEME_DEFAULTS as any).colors[key] as string;
    const cur = (pending as any).colors[key] as string;
    const valEl = el('span', { class: 'kstudio-val', text: cur.startsWith('#') ? cur : '' });
    let input: any;
    if (isHex(cur)) {
      input = el('input', { type: 'color', value: cur });
      input.addEventListener('input', (e: any) => {
        pending.colors[key] = e.target.value;
        valEl.textContent = e.target.value;
        valEl.classList.toggle('mod', e.target.value.toLowerCase() !== def.toLowerCase());
        refreshApply();
      });
    } else {
      input = el('input', { type: 'text', value: cur });
      input.addEventListener('input', (e: any) => {
        pending.colors[key] = e.target.value;
        valEl.classList.toggle('mod', e.target.value !== def);
        refreshApply();
      });
    }
    valEl.classList.toggle('mod', cur !== def);
    return el('div', { class: 'kstudio-row' }, [el('label', { text: key }), input, valEl]);
  }

  function buildBody(tab: Tab): any {
    const body = el('div', { class: 'kstudio-body' });
    if (tab === 'type') {
      body.appendChild(
        el('div', {
          class: 'kstudio-hint',
          text: 'フォントサイズ。Applyでリロードし実寸で反映。',
        }),
      );
      Object.keys(THEME_DEFAULTS.font).forEach((k) => body.appendChild(numRow('font', k)));
    } else if (tab === 'space') {
      body.appendChild(el('div', { class: 'kstudio-hint', text: '余白トークン (px)。' }));
      Object.keys(THEME_DEFAULTS.spacing).forEach((k) => body.appendChild(numRow('spacing', k)));
    } else if (tab === 'radius') {
      body.appendChild(el('div', { class: 'kstudio-hint', text: '角丸 (px)。pill=999は固定。' }));
      Object.keys(THEME_DEFAULTS.radius)
        .filter((k) => k !== 'pill')
        .forEach((k) => body.appendChild(numRow('radius', k)));
    } else if (tab === 'color') {
      body.appendChild(
        el('div', { class: 'kstudio-hint', text: 'カラートークン。hexはピッカー、rgbaは直接入力。' }),
      );
      Object.keys(THEME_DEFAULTS.colors).forEach((k) => body.appendChild(colorRow(k)));
    } else {
      body.id = 'kstudio-notes';
      renderNotesInto(body);
    }
    return body;
  }

  function renderNotesInto(body: any) {
    body.innerHTML = '';
    const route = currentRoute();
    const here = comments.filter((c) => c.route === route);
    body.appendChild(
      el('div', {
        class: 'kstudio-hint',
        text: `画面「${route}」: ${here.length}件 / 全${comments.length}件。下のボタンでコメントを追加。`,
      }),
    );
    body.appendChild(
      el('button', {
        id: 'kstudio-commentbtn',
        class: 'kstudio-btn' + (commentMode ? ' on' : ''),
        text: commentMode ? '✓ 矢印コメント中 (Escで終了)' : '＋ 矢印コメントを追加',
        onclick: () => setCommentMode(!commentMode),
      }),
    );
    here.forEach((c, i) => {
      body.appendChild(
        el('div', { class: 'kstudio-note' }, [
          el('div', { class: 'rt', text: `#${i + 1} @ ${route}` }),
          el('div', { text: c.text || '(空)' }),
        ]),
      );
    });
    if (comments.length) {
      body.appendChild(
        el('button', {
          class: 'kstudio-btn',
          style: { marginTop: '8px' },
          text: '📋 全コメントをClaude用にコピー',
          onclick: copyForClaude,
        }),
      );
    }
  }

  function updateNotesTab() {
    const body = panel.querySelector('#kstudio-notes');
    if (body) renderNotesInto(body);
  }

  function copyForClaude() {
    const diff = tokenDiff();
    const lines: string[] = ['# カンパイ！ UI Studio — apply these changes', ''];
    if (Object.keys(diff).length) {
      lines.push('## Token changes (src/theme/theme.ts)');
      (['font', 'spacing', 'radius', 'colors'] as const).forEach((grp) => {
        if (!diff[grp]) return;
        Object.keys(diff[grp]).forEach((k) => {
          lines.push(`- ${grp}.${k}: ${(THEME_DEFAULTS as any)[grp][k]} → ${diff[grp][k]}`);
        });
      });
      lines.push('');
    }
    if (comments.length) {
      lines.push('## Component comments (arrow → target)');
      const byRoute: Record<string, StudioComment[]> = {};
      comments.forEach((c) => (byRoute[c.route] ??= []).push(c));
      Object.keys(byRoute).forEach((rt) => {
        lines.push(`### screen: ${rt}`);
        byRoute[rt].forEach((c, i) => {
          const tgt = `${Math.round(c.x2 * 100)}%,${Math.round(c.y2 * 100)}%`;
          lines.push(`- [${i + 1}] → (${tgt}): ${c.text}`);
        });
        lines.push('');
      });
    }
    const text = lines.join('\n');
    win.navigator?.clipboard?.writeText?.(text);
    openModal('Claude用コピー (クリップボードにコピー済み)', text);
  }

  function openModal(title: string, text: string) {
    const ta = el('textarea', { rows: '16', style: { marginTop: '8px' } });
    ta.value = text;
    const modal = el('div', { class: 'kstudio kstudio-modal' }, [
      el('div', { class: 'box' }, [
        el('div', { style: { fontWeight: '800', fontSize: '13px' }, text: title }),
        ta,
        el('div', { style: { display: 'flex', gap: '6px', marginTop: '8px' } }, [
          el('button', {
            class: 'kstudio-btn',
            text: 'コピー',
            onclick: () => win.navigator?.clipboard?.writeText?.(ta.value),
          }),
          el('button', {
            class: 'kstudio-btn',
            text: '閉じる',
            onclick: () => modal.remove(),
          }),
        ]),
      ]),
    ]);
    modal.addEventListener('click', (e: any) => {
      if (e.target === modal) modal.remove();
    });
    doc.body.appendChild(modal);
    ta.select();
  }

  function renderPanel() {
    panel.innerHTML = '';
    const applyBtn = el('button', { class: 'kstudio-apply', text: 'Applied', onclick: apply });
    const head = el('div', { class: 'kstudio-head' }, [
      el('div', { class: 'kstudio-title', text: '🎛 カンパイ！ UI Studio' }),
      applyBtn,
      el('button', { class: 'kstudio-x', text: '×', onclick: () => togglePanel(false) }),
    ]);
    const tabs = el(
      'div',
      { class: 'kstudio-tabs' },
      (['type', 'space', 'radius', 'color', 'notes'] as Tab[]).map((t) =>
        el('button', {
          class: 'kstudio-tab' + (ui.tab === t ? ' active' : ''),
          text: { type: '文字', space: '余白', radius: '角丸', color: '色', notes: 'コメント' }[t],
          onclick: () => {
            ui.tab = t;
            saveUi({ tab: ui.tab, x: ui.x, y: ui.y });
            renderPanel();
          },
        }),
      ),
    );
    const foot = el('div', { class: 'kstudio-foot' }, [
      el('button', {
        class: 'kstudio-btn',
        text: 'Export',
        onclick: copyForClaude,
      }),
      el('button', {
        class: 'kstudio-btn',
        text: 'Reset tokens',
        onclick: () => {
          writeStudioState({ tokens: {}, comments });
          win.location.reload();
        },
      }),
    ]);
    panel.appendChild(head);
    panel.appendChild(tabs);
    panel.appendChild(buildBody(ui.tab));
    panel.appendChild(foot);
    refreshApply();
    makeDraggable(head);
  }

  function makeDraggable(handle: any) {
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    handle.addEventListener('pointerdown', (e: any) => {
      if (e.target.closest('button')) return;
      sx = e.clientX;
      sy = e.clientY;
      ox = parseInt(panel.style.left, 10) || 0;
      oy = parseInt(panel.style.top, 10) || 0;
      const move = (ev: any) => {
        ui.x = Math.max(0, ox + ev.clientX - sx);
        ui.y = Math.max(0, oy + ev.clientY - sy);
        panel.style.left = ui.x + 'px';
        panel.style.top = ui.y + 'px';
      };
      const up = () => {
        win.removeEventListener('pointermove', move);
        win.removeEventListener('pointerup', up);
        saveUi({ tab: ui.tab, x: ui.x, y: ui.y });
      };
      win.addEventListener('pointermove', move);
      win.addEventListener('pointerup', up);
    });
  }

  function togglePanel(open: boolean) {
    panel.style.display = open ? 'flex' : 'none';
    launcher.style.display = open ? 'none' : 'block';
    if (open) renderPanel();
    else if (commentMode) setCommentMode(false);
    saveUi({ tab: ui.tab, x: ui.x, y: ui.y, ...(open ? {} : {}) });
    try {
      win.localStorage?.setItem(UI_KEY, JSON.stringify({ open, tab: ui.tab, x: ui.x, y: ui.y }));
    } catch {
      /* ignore */
    }
  }

  renderComments();
  if (ui.open) togglePanel(true);

  // ---- cleanup ------------------------------------------------------------
  return () => {
    win.__kanpaiStudioMounted = false;
    win.removeEventListener('resize', renderComments);
    win.removeEventListener('keydown', onKey);
    [style, layer, launcher, panel].forEach((n) => n?.remove?.());
    if (drawHint) drawHint.remove();
  };
}
