// Simple calculator logic with safer input handling
// DOM references (with fallbacks)
const display = document.getElementById('display');
let preview = document.getElementById('preview');
const historylist = document.getElementById('historyList') || document.getElementById('historylist');
const mainbox = document.getElementById('mainbox') || document.getElementById('calculator') || document.querySelector('.calculator');
const toggleBtn = document.getElementById('toggleBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const sizeButtons = document.querySelectorAll('.size-Btn');
const toolbar = document.getElementById('toolbar');
const toolbarToggle = document.getElementById('toolbarToggle');

// create preview element if missing
if (!preview && display) {
    preview = document.createElement('div');
    preview.id = 'preview';
    preview.className = 'preview';
    preview.style.fontSize = '0.75em';
    preview.style.opacity = '0.9';
    preview.style.textAlign = 'right';
    preview.style.marginTop = '6px';
    display.insertAdjacentElement('afterend', preview);
}

// Helper: add thousand separators to a numeric string (no exponent)
function groupNumberString(numStr) {
    if (numStr == null) return '';
    // handle non-numeric tokens
    if (numStr === 'Infinity' || numStr === 'NaN') return numStr;
    // keep negative sign
    const neg = numStr.startsWith('-');
    let s = neg ? numStr.slice(1) : numStr;
    // if scientific notation or empty, return as-is
    if (/[eE]/.test(s) || s === '') return numStr;
    const parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const result = parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];
    return neg ? '-' + result : result;
}

// Format an expression for display by inserting grouping into number tokens
function formatExpressionForDisplay(expr) {
    if (!expr || expr === '') return '0';
    // replace digit sequences (with optional decimal) with grouped version
    return expr.replace(/\d+(?:\.\d+)?/g, (match) => groupNumberString(match));
}

// Set display from a raw expression (no commas)
function setDisplayFromRaw(raw) {
    if (!display) return;
    if (raw === '' || raw == null) {
        display.textContent = '0';
        return;
    }
    display.textContent = formatExpressionForDisplay(raw);
}

// Preferences
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let currentScale = parseFloat(localStorage.getItem('calculatorScale')) || 1;

// Render theme toggle as icon (sun for light, moon for dark)
function updateThemeToggleIcon() {
    if (!toggleBtn) return;
    const sunSvg = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5L3.5 3.5M20.5 20.5L19 19M5 19L3.5 20.5M20.5 3.5L19 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>';
    const moonSvg = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/></svg>';
    // show sun when in dark mode (action: switch to light), show moon when in light mode
    toggleBtn.innerHTML = isDarkMode ? sunSvg : moonSvg;
    const label = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
    toggleBtn.setAttribute('aria-label', label);
    toggleBtn.title = label;
}

// Initial UI state (apply explicit dark/light class for predictable styling)
if (isDarkMode) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
} else {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
}
if (toggleBtn) updateThemeToggleIcon();
if (mainbox) mainbox.style.transform = `scale(${currentScale})`;
if (sizeButtons && sizeButtons.length) {
    sizeButtons.forEach(btn => {
        if (parseFloat(btn.dataset.scale) === currentScale) btn.classList.add('active');
    });
}

// Toolbar toggle
if (toolbarToggle && toolbar) {
    toolbarToggle.addEventListener('click', () => toolbar.classList.toggle('open'));
}

// Dark mode toggle
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        // use explicit toggles so classes remain predictable
        document.body.classList.toggle('dark-mode', isDarkMode);
        document.body.classList.toggle('light-mode', !isDarkMode);
        updateThemeToggleIcon();
        localStorage.setItem('darkMode', isDarkMode);
    });
}

// Clear history button (with confirmation)
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        if (!historylist) return;
        const ok = confirm('Hapus semua riwayat kalkulasi?');
        if (!ok) return;
        refreshHistory();
    });
}

// Shortcuts feature removed

// Size buttons
if (sizeButtons && sizeButtons.length) {
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const scale = parseFloat(btn.dataset.scale);
            if (!isNaN(scale) && mainbox) {
                currentScale = scale;
                mainbox.style.transform = `scale(${currentScale})`;
                sizeButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                localStorage.setItem('calculatorScale', currentScale);
            }
        });
    });
}

// --- Utility & calculation helpers ---
function refreshHistory() {
    if (!historylist) return;
    historylist.innerHTML = '';
}

function sanitizeForEval(raw) {
    // Replace × and ÷ if present (defensive)
    let s = raw.replace(/×/g, '*').replace(/÷/g, '/');
    // convert caret power operator to JS exponentiation
    s = s.replace(/\^/g, '**');
    // remove trailing operators
    s = s.replace(/[+\-*/.%\s]+$/g, '');
    // Convert percentages like 50% -> (50/100)
    s = s.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    // Allow digits, operators, parentheses, dot, spaces, percent and variable `x` (case-insensitive)
    if (!/^[0-9+\-*/().\s% xX]+$/.test(s)) return null;
    return s;
}

function formatResult(value) {
    if (typeof value !== 'number' || !isFinite(value)) return String(value);
    if (Number.isInteger(value)) return String(value);
    // limit to 10 decimal places, strip trailing zeros
    return parseFloat(value.toFixed(10)).toString();
}

// Update live preview (called after edits)
function updatepreview() {
    if (!display || !preview) return;
    const visible = display.textContent || '';
    const raw = visible.replace(/,/g, '');
    // if expression contains variable x, we cannot show a numeric preview
    if (/x/i.test(raw)) {
        preview.textContent = '';
        return;
    }
    const expr = sanitizeForEval(raw);
    if (!expr || expr === '0') {
        preview.textContent = '';
        return;
    }
    try {
        const res = eval(expr);
        if (typeof res === 'number' && isFinite(res)) {
            preview.textContent = '= ' + groupNumberString(formatResult(res));
        } else {
            preview.textContent = '';
        }
    } catch (e) {
        preview.textContent = '';
    }
}

// Append value (used by inline onclick handlers)
function append(value) {
    if (!display) return;
    // use raw (without commas) for logic
    const visible = display.textContent || '';
    const txt = visible.replace(/,/g, '');
    const isDigit = /^\d$/.test(value);
    const isDot = value === '.';
    const isOperator = /^[+\-*/%]$/.test(value);
    const isParen = value === '(' || value === ')';
    const lastChar = txt.slice(-1);

    // handle parentheses specifically
    if (isParen) {
        if (value === '(') {
            if (txt === '0' || txt === '') {
                setDisplayFromRaw('(');
            } else if (/\d|\)/.test(lastChar)) {
                // implicit multiplication: 2(3) -> 2*(3)
                setDisplayFromRaw(txt + '*(');
            } else {
                setDisplayFromRaw(txt + '(');
            }
            updatepreview();
            return;
        } else { // value === ')'
            const open = (txt.match(/\(/g) || []).length;
            const close = (txt.match(/\)/g) || []).length;
            // only append a closing paren if there's an unmatched opening paren
            // and the last char is not an operator or another '('
            if (open > close && lastChar !== '(' && !/^[+\-*/%]$/.test(lastChar) && txt !== '0') {
                setDisplayFromRaw(txt + ')');
            }
            updatepreview();
            return;
        }
    }

    // replace leading zero when inputting a digit
    if ((txt === '0' || txt === '') && isDigit) {
        setDisplayFromRaw(value);
        updatepreview();
        return;
    }

    // handle dot
    if (isDot) {
        // if display is 0 or empty -> 0.
        if (txt === '0' || txt === '') {
            setDisplayFromRaw('0.');
            updatepreview();
            return;
        }
        // prevent multiple dots in current number
        const last = txt.split(/[+\-*/%]/).pop();
        if (!last.includes('.')) display.textContent += '.';
        updatepreview();
        return;
    }

    // handle operators
    if (isOperator) {
        // if last char is operator, replace it (except allow unary minus at start)
        if (/[-+*/%]$/.test(txt)) {
            // allow leading negative sign
            if ((txt === '0' || txt === '') && value === '-') {
                setDisplayFromRaw('-');
            } else {
                setDisplayFromRaw(txt.replace(/[-+*/%]+$/, value));
            }
        } else {
            setDisplayFromRaw(txt + value);
        }
        updatepreview();
        return;
    }

    // default: digit appended
    if (txt === '0') setDisplayFromRaw(value); else setDisplayFromRaw(txt + value);
    updatepreview();
}

// Clear display
function cleardisplay() {
    if (!display || !preview) return;
    display.textContent = '0';
    preview.textContent = '';
}

// Backspace (exposed in case you add a button)
function backspace() {
    if (!display) return;
    // operate on raw expression (no commas)
    let txt = (display.textContent || '').replace(/,/g, '');
    if (txt.length <= 1) {
        display.textContent = '0';
        updatepreview();
        return;
    }
    txt = txt.slice(0, -1);
    if (txt === '' || txt === '-') txt = '0';
    setDisplayFromRaw(txt);
    updatepreview();
}

// Calculate and push to history
function calculate() {
    if (!display) return;
    const visible = display.textContent || '';
    const raw = visible.replace(/,/g, '');
    // if expression contains an equation sign, try to solve
    if (raw.includes('=')) {
        // solve simple equations like "2x+3=7"
        if (typeof solveEquation === 'function') {
            solveEquation();
            return;
        }
    }
    // if expression contains variable x, prompt for its value
    if (/x/i.test(raw)) {
        evaluateForX();
        return;
    }

    const expr = sanitizeForEval(raw);
    if (!expr) {
        display.textContent = 'Error';
        preview.textContent = '';
        return;
    }
    try {
        const res = eval(expr);
        if (typeof res === 'number' && isFinite(res)) {
            const formatted = formatResult(res);
            const grouped = groupNumberString(formatted);
            const calculation = formatExpressionForDisplay(raw) + ' = ' + grouped;
            setDisplayFromRaw(String(formatted));
            preview.textContent = '';
            if (historylist) {
                const li = document.createElement('li');
                li.textContent = calculation;
                historylist.appendChild(li);
            }
        } else {
            display.textContent = 'Error';
            preview.textContent = '';
        }
    } catch (e) {
        display.textContent = 'Error';
        preview.textContent = '';
    }
}

// Prompt for a numeric value for x, substitute, and evaluate the expression
function evaluateForX() {
    if (!display) return;
    const visible = display.textContent || '';
    const raw = visible.replace(/,/g, '');
    if (!/x/i.test(raw)) {
        alert('Tidak ada variabel x pada ekspresi.');
        return;
    }
    let xRaw = prompt('Masukkan nilai x:');
    if (xRaw == null) return; // cancelled
    xRaw = xRaw.trim();
    // allow numeric input (integer or decimal, with optional sign)
    if (!/^[+\-]?\d+(?:\.\d+)?$/.test(xRaw)) {
        alert('Nilai x harus berupa angka.');
        return;
    }
    // substitute all occurrences of x or X with parenthesized numeric value
    const substituted = raw.replace(/x/gi, '(' + xRaw + ')');
    const expr = sanitizeForEval(substituted);
    if (!expr) {
        display.textContent = 'Error';
        if (preview) preview.textContent = '';
        return;
    }
    try {
        const res = eval(expr);
        if (typeof res === 'number' && isFinite(res)) {
            const formatted = formatResult(res);
            const grouped = groupNumberString(formatted);
            const calculation = formatExpressionForDisplay(raw) + ' with x=' + xRaw + ' = ' + grouped;
            setDisplayFromRaw(String(formatted));
            if (preview) preview.textContent = '';
            if (historylist) {
                const li = document.createElement('li');
                li.textContent = calculation;
                historylist.appendChild(li);
            }
        } else {
            display.textContent = 'Error';
            if (preview) preview.textContent = '';
        }
    } catch (e) {
        display.textContent = 'Error';
        if (preview) preview.textContent = '';
    }
}

// Helper to prepare expression for safe eval when substituting x
function prepareExpressionWithX(s, xValue) {
    if (!s) return s;
    // normalize displayed symbols
    let t = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
    // insert explicit multiplication for patterns like 2x or 2(x) or )( -> )*( etc.
    t = t.replace(/(\d)\s*(?=x)/gi, '$1*');
    t = t.replace(/(\d)\s*\(/g, '$1*(');
    t = t.replace(/\)\s*\(/g, ')*(');
    t = t.replace(/\)\s*(?=\d)/g, ')*');
    // substitute x with parenthesized value
    t = t.replace(/x/gi, '(' + xValue + ')');
    return t;
}

// Solve simple equations for x (assumes linear: a*x + b = 0 after moving terms)
function solveEquation() {
    if (!display) return;
    const visible = display.textContent || '';
    const raw = visible.replace(/,/g, '');
    if (!raw.includes('=')) {
        alert('Tidak ada tanda sama dengan (=) pada ekspresi.');
        return;
    }
    const parts = raw.split('=');
    if (parts.length !== 2) { alert('Persamaan tidak dikenali (lebih dari satu tanda =).'); return; }
    const left = parts[0].trim();
    const right = parts[1].trim();
    if (left === '' || right === '') { alert('Sisi persamaan kosong.'); return; }
    if (!/x/i.test(left) && !/x/i.test(right)) { alert('Tidak ada variabel x pada persamaan.'); return; }

    function evalSide(side, xVal) {
        try {
            const prepared = prepareExpressionWithX(side, xVal);
            const sanitized = sanitizeForEval(prepared);
            if (!sanitized) return NaN;
            return eval(sanitized);
        } catch (e) { return NaN; }
    }

    const f = (xv) => {
        const L = evalSide(left, xv);
        const R = evalSide(right, xv);
        if (typeof L !== 'number' || typeof R !== 'number' || !isFinite(L) || !isFinite(R)) return NaN;
        return L - R;
    };

    // helper: append human-readable step list to history
    function appendSteps(steps) {
        if (!historylist || !Array.isArray(steps) || steps.length === 0) return;
        const li = document.createElement('li');
        li.className = 'steps';
        const pre = document.createElement('pre');
        pre.textContent = steps.join('\n');
        li.appendChild(pre);
        historylist.appendChild(li);
    }

    const f0 = f(0);
    const f1 = f(1);
    const f2 = f(2);
    if (!isFinite(f0) || !isFinite(f1) || !isFinite(f2)) { display.textContent = 'Error'; if (preview) preview.textContent = ''; return; }

    const eps = 1e-9;
    // detect quadratic by second finite difference
    const d2 = f2 - 2 * f1 + f0; // approx 2*a for ax^2 + bx + c
    if (Math.abs(d2) > eps) {
        const a = d2 / 2;
        const b = f1 - f0 - a;
        const c = f0;
        // solve ax^2 + bx + c = 0
        const disc = b * b - 4 * a * c;
        // build steps
        const steps = [];
        steps.push('Langkah penyelesaian persamaan kuadrat:');
        steps.push(`Bawa semua ke satu sisi: (${left}) - (${right}) = 0`);
        steps.push(`Menghitung f(0)=${f0}, f(1)=${f1}, f(2)=${f2}`);
        steps.push(`Ditemukan koefisien (dari sampling): a = ${formatResult(a)}, b = ${formatResult(b)}, c = ${formatResult(c)}`);
        steps.push(`Diskriminan: D = b^2 - 4ac = ${formatResult(disc)}`);
        if (disc >= 0) {
            const sqrtD = Math.sqrt(disc);
            const r1 = (-b + sqrtD) / (2 * a);
            const r2 = (-b - sqrtD) / (2 * a);
            const r1s = formatResult(r1);
            const r2s = formatResult(r2);
            steps.push(`Akar: x1 = (-b + √D) / (2a) = ${formatResult(r1)}, x2 = (-b - √D) / (2a) = ${formatResult(r2)}`);
            const calc = `${formatExpressionForDisplay(left)} = ${formatExpressionForDisplay(right)} => x = ${groupNumberString(r1s)}, ${groupNumberString(r2s)}`;
            setDisplayFromRaw(String(r1s));
            if (preview) preview.textContent = '';
            if (historylist) { const li = document.createElement('li'); li.textContent = calc; historylist.appendChild(li); }
            appendSteps(steps);
            return;
        } else {
            // complex roots
            const sqrtD = Math.sqrt(-disc);
            const real = (-b) / (2 * a);
            const imag = sqrtD / (2 * Math.abs(a));
            const r1s = `${formatResult(real)} + ${formatResult(imag)}i`;
            const r2s = `${formatResult(real)} - ${formatResult(imag)}i`;
            steps.push(`Diskriminan < 0: akar kompleks.`);
            steps.push(`Akar: ${r1s} , ${r2s}`);
            const calc = `${formatExpressionForDisplay(left)} = ${formatExpressionForDisplay(right)} => x = ${r1s}, ${r2s}`;
            setDisplayFromRaw(formatResult(real));
            if (preview) preview.textContent = '';
            if (historylist) { const li = document.createElement('li'); li.textContent = calc; historylist.appendChild(li); }
            appendSteps(steps);
            return;
        }
    }

    // linear fallback: f(x) ~ a*x + b
    const a_lin = f1 - f0;
    const b_lin = f0;
    if (Math.abs(a_lin) < eps) {
        if (Math.abs(b_lin) < eps) {
            const calculation = `${formatExpressionForDisplay(left)} = ${formatExpressionForDisplay(right)} => ∀x (tak terhingga solusi)`;
            if (historylist) { const li = document.createElement('li'); li.textContent = calculation; historylist.appendChild(li); }
            appendSteps(['Persamaan setara 0 = 0 — tak terhingga solusi untuk semua x.']);
            display.textContent = 'Infinite';
            if (preview) preview.textContent = '';
            return;
        } else {
            const calculation = `${formatExpressionForDisplay(left)} = ${formatExpressionForDisplay(right)} => No solution`;
            if (historylist) { const li = document.createElement('li'); li.textContent = calculation; historylist.appendChild(li); }
            appendSteps(['Persamaan tidak konsisten — tidak ada solusi.']);
            display.textContent = 'No solution';
            if (preview) preview.textContent = '';
            return;
        }
    }

    const xSol = -b_lin / a_lin;
    if (!isFinite(xSol)) { display.textContent = 'Error'; if (preview) preview.textContent = ''; return; }
    const formatted = formatResult(xSol);
    const grouped = groupNumberString(formatted);
    const calculation = `${formatExpressionForDisplay(left)} = ${formatExpressionForDisplay(right)} => x = ${grouped}`;
    setDisplayFromRaw(String(formatted));
    if (preview) preview.textContent = '';
    if (historylist) { const li = document.createElement('li'); li.textContent = calculation; historylist.appendChild(li); }
    appendSteps([
        'Langkah penyelesaian linear:',
        `Bawa semua ke satu sisi: (${left}) - (${right}) = 0`,
        `Hitung f(0)=${f0} (sebagai konstanta b), f(1)=${f1} (sebagai a+b)`,
        `Maka a = f(1)-f(0) = ${formatResult(a_lin)}, b = f(0) = ${formatResult(b_lin)}`,
        `Solusi: x = -b/a = ${formatResult(xSol)}`
    ]);
}

// Square root (√) using non-negative input only for even roots
function applySqrt() {
    if (!display) return;
    const visible = display.textContent || '';
    const raw = visible.replace(/,/g, '');
    const expr = sanitizeForEval(raw);
    let value = NaN;
    if (expr) {
        try { value = eval(expr); } catch (e) { value = NaN; }
    } else {
        value = parseFloat(raw);
    }
    if (typeof value !== 'number' || !isFinite(value) || value < 0) {
        display.textContent = 'Error';
        if (preview) preview.textContent = '';
        return;
    }
    const res = Math.sqrt(value);
    if (!isFinite(res)) {
        display.textContent = 'Error';
        if (preview) preview.textContent = '';
        return;
    }
    const formatted = formatResult(res);
    const grouped = groupNumberString(formatted);
    const calculation = `√(${formatExpressionForDisplay(raw)}) = ${grouped}`;
    setDisplayFromRaw(String(formatted));
    if (preview) preview.textContent = '';
    if (historylist) {
        const li = document.createElement('li');
        li.textContent = calculation;
        historylist.appendChild(li);
    }
}

// Nth root: prompts for degree n (integer > 0). For even n, negative radicands are invalid.
function applyNthRoot() {
    if (!display) return;
    let nRaw = prompt('Masukkan derajat akar (n), mis. 2 untuk akar kuadrat:');
    if (nRaw == null) return; // cancel
    nRaw = nRaw.trim();
    if (!/^[0-9]+$/.test(nRaw)) {
        alert('Derajat akar harus bilangan bulat positif.');
        return;
    }
    const n = parseInt(nRaw, 10);
    if (n <= 0) { alert('Derajat akar harus lebih besar dari 0.'); return; }

    const visible = display.textContent || '';
    const raw = visible.replace(/,/g, '');
    const expr = sanitizeForEval(raw);
    let value = NaN;
    if (expr) {
        try { value = eval(expr); } catch (e) { value = NaN; }
    } else {
        value = parseFloat(raw);
    }
    if (typeof value !== 'number' || !isFinite(value)) {
        display.textContent = 'Error';
        if (preview) preview.textContent = '';
        return;
    }
    // if even root and negative value -> invalid
    if (n % 2 === 0 && value < 0) {
        display.textContent = 'Error';
        if (preview) preview.textContent = '';
        return;
    }
    const res = Math.pow(Math.abs(value), 1 / n) * (value < 0 ? -1 : 1);
    if (!isFinite(res)) {
        display.textContent = 'Error';
        if (preview) preview.textContent = '';
        return;
    }
    const formatted = formatResult(res);
    const grouped = groupNumberString(formatted);
    const calculation = `${n}√(${formatExpressionForDisplay(raw)}) = ${grouped}`;
    setDisplayFromRaw(String(formatted));
    if (preview) preview.textContent = '';
    if (historylist) {
        const li = document.createElement('li');
        li.textContent = calculation;
        historylist.appendChild(li);
    }
}

// Apply trigonometric functions (sin, cos, tan).
// Uses degrees as input (common calculator behaviour) and records result in history.
function applyTrig(fn) {
    if (!display) return;
    const visible = display.textContent || '';
    const raw = visible.replace(/,/g, '');
    if (/x/i.test(raw)) {
        alert('Tidak dapat menerapkan fungsi trigonometrik pada ekspresi yang mengandung variabel x.');
        return;
    }
    const expr = sanitizeForEval(raw);
    let value = NaN;
    if (expr) {
        try { value = eval(expr); } catch (e) { value = NaN; }
    } else {
        value = parseFloat(raw);
    }
    if (typeof value !== 'number' || !isFinite(value)) {
        display.textContent = 'Error';
        if (preview) preview.textContent = '';
        return;
    }
    // interpret the input as degrees
    const rad = value * Math.PI / 180;
    let res;
    if (fn === 'sin') res = Math.sin(rad);
    else if (fn === 'cos') res = Math.cos(rad);
    else if (fn === 'tan') {
        // guard against near-vertical asymptotes where cos ~ 0
        const cosv = Math.cos(rad);
        if (Math.abs(cosv) < 1e-12) {
            display.textContent = 'Error';
            if (preview) preview.textContent = '';
            return;
        }
        res = Math.tan(rad);
    } else {
        return;
    }
    if (!isFinite(res)) {
        display.textContent = 'Error';
        if (preview) preview.textContent = '';
        return;
    }
    const formatted = formatResult(res);
    const grouped = groupNumberString(formatted);
    const calculation = `${fn}(${formatExpressionForDisplay(raw)}) = ${grouped}`;
    setDisplayFromRaw(String(formatted));
    if (preview) preview.textContent = '';
    if (historylist) {
        const li = document.createElement('li');
        li.textContent = calculation;
        historylist.appendChild(li);
    }
}

// Expose functions globally for inline handlers (HTML uses onclick="append(...)" etc.)
window.append = append;
window.cleardisplay = cleardisplay;
window.calculate = calculate;
window.backspace = backspace;
window.refreshHistory = refreshHistory;
window.applyTrig = applyTrig;

// Flash visual feedback for keyboard-triggered presses
function flashButton(label) {
    if (!label) return;
    // prefer matching by data-key attribute for reliability
    let btn = document.querySelector(`button[data-key="${label}"]`);
    if (!btn) {
        // fallback: match by visible text
        const buttons = Array.from(document.querySelectorAll('button'));
        btn = buttons.find(b => (b.textContent || '').trim() === label);
    }
    if (!btn) return;
    btn.classList.add('kbd-press');
    // remove after short delay
    setTimeout(() => btn.classList.remove('kbd-press'), 140);
    // also create a centered ripple for keyboard-triggered flashes
    try {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.2;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width/2 - size/2) + 'px';
        ripple.style.top = (rect.height/2 - size/2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    } catch (e) {
        // ignore if DOM changes
    }
}

// Pointer ripple: show ripple where user clicked/touched on buttons
document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest && e.target.closest('button');
    if (!btn) return;
    // ignore if it's not in our calculator (safety)
    if (!btn.isConnected) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    // compute position relative to button
    const x = (e.clientX - rect.left) - size / 2;
    const y = (e.clientY - rect.top) - size / 2;
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    btn.appendChild(ripple);
    // remove after animation finishes
    setTimeout(() => { try { ripple.remove(); } catch (er) {} }, 700);
});

// Keyboard support: map keys to calculator actions
document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;

    const key = e.key;

    // digits
    if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        append(key);
        flashButton(key);
        return;
    }

    // decimal point
    if (key === '.') { e.preventDefault(); append('.'); flashButton('.'); return; }

    // parentheses
    if (key === '(' || key === ')') { e.preventDefault(); append(key); flashButton(key); return; }

    // operators (accept x/X for multiply)
    if (key === '+' || key === '-' || key === '/' || key === '%') {
        e.preventDefault(); append(key);
        flashButton(key);
        return;
    }
    if (key === '*' || key === 'x' || key === 'X') { e.preventDefault(); append('*'); flashButton('*'); return; }

    // Enter / = -> calculate
    if (key === 'Enter' || key === '=') { e.preventDefault(); calculate(); flashButton('='); return; }

    // Backspace -> backspace
    if (key === 'Backspace') { e.preventDefault(); backspace(); flashButton('Backspace'); return; }

    // Escape or C -> clear
    if (key === 'Escape' || key === 'c' || key === 'C') { e.preventDefault(); cleardisplay(); flashButton('C'); return; }

    // Numpad support (fallback if e.key isn't what we expect)
    if (e.code) {
        if (e.code === 'NumpadMultiply') { e.preventDefault(); append('*'); flashButton('*'); return; }
        if (e.code === 'NumpadAdd') { e.preventDefault(); append('+'); flashButton('+'); return; }
        if (e.code === 'NumpadSubtract') { e.preventDefault(); append('-'); flashButton('-'); return; }
        if (e.code === 'NumpadDivide') { e.preventDefault(); append('/'); flashButton('/'); return; }
        if (e.code === 'NumpadDecimal') { e.preventDefault(); append('.'); flashButton('.'); return; }
        if (/^Numpad[0-9]$/.test(e.code)) { e.preventDefault(); append(key); flashButton(key); return; }
    }
});

// Keyboard shortcut: 'r' for square root, 'R' for nth-root (prompt)
document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
    if (e.key === 'r') { e.preventDefault(); applySqrt(); flashButton('sqrt'); }
    if (e.key === 'R') { e.preventDefault(); applyNthRoot(); flashButton('nroot'); }
});

// initial preview update
updatepreview();