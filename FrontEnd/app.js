/* ─────────────────────────────────────────────
   RPG MANAGER — app.js
   Connects to FastAPI on http://localhost:8000
   ───────────────────────────────────────────── */

const API_BASE = 'http://localhost:8000';

/* ── Class runes for card decoration ── */
const CLASS_RUNES = {
    'Guerrier':     'ᚹ',
    'Mage':         'ᛗ',
    'Rôdeur':       'ᚱ',
    'Paladin':      'ᛏ',
    'Voleur':       'ᚾ',
    'Druide':       'ᚦ',
    'Nécromancien': 'ᛉ',
    'Barbare':      'ᚷ',
};

/* ── DOM refs ── */
const cardsGrid    = document.getElementById('cards-grid');
const loadingState = document.getElementById('loading-state');
const emptyState   = document.getElementById('empty-state');
const errorState   = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const charCount    = document.getElementById('char-count');
const createForm   = document.getElementById('create-form');
const btnCreate    = document.getElementById('btn-create');
const globalError  = document.getElementById('global-error');

/* ═══════════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════════ */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

/* ═══════════════════════════════════════════
   STATE MANAGEMENT (show/hide sections)
═══════════════════════════════════════════ */
function showState(state) {
    loadingState.classList.add('hidden');
    emptyState.classList.add('hidden');
    errorState.classList.add('hidden');

    const existingCards = cardsGrid.querySelectorAll('.char-card');
    existingCards.forEach(c => c.remove());

    if (state === 'loading') {
        loadingState.classList.remove('hidden');
    } else if (state === 'empty') {
        emptyState.classList.remove('hidden');
    } else if (state === 'error') {
        errorState.classList.remove('hidden');
    }
}

function updateCharCount(n) {
    charCount.textContent = n === 0
        ? '— personnages'
        : n === 1
        ? '1 personnage'
        : `${n} personnages`;
}

/* ═══════════════════════════════════════════
   FETCH ALL PERSONNAGES
═══════════════════════════════════════════ */
async function fetchPersonnages() {
    showState('loading');
    try {
        const res = await fetch(`${API_BASE}/personnages`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.length === 0) {
            showState('empty');
        } else {
            showState(null);
            data.forEach((p, i) => {
                const card = buildCard(p);
                card.style.animationDelay = `${i * 60}ms`;
                cardsGrid.appendChild(card);
            });
        }
        updateCharCount(data.length);
    } catch (err) {
        showState('error');
        errorMessage.textContent = `Impossible de contacter le serveur. (${err.message})`;
        updateCharCount(0);
    }
}

/* ═══════════════════════════════════════════
   BUILD A CHARACTER CARD
═══════════════════════════════════════════ */
function buildCard(personnage) {
    const { id, nom, classe, niveau, pv, attaque, defense } = personnage;

    const rune = CLASS_RUNES[classe] || 'ᚠ';

    const card = document.createElement('article');
    card.className = 'char-card';
    card.dataset.id = id;
    card.dataset.classRune = rune;
    card.setAttribute('aria-label', `Personnage ${nom}`);

    const pvMax = Math.max(pv, 100);

    card.innerHTML = `
        <div class="card-header">
            <div class="card-identity">
                <div class="card-name" title="${escapeHtml(nom)}">${escapeHtml(nom)}</div>
                <div class="card-classe">${escapeHtml(classe || '—')}</div>
            </div>
            <div class="card-level" aria-label="Niveau ${niveau}">
                <span class="card-level-label">Niv.</span>
                <span class="card-level-value">${niveau}</span>
            </div>
        </div>

        <div class="hp-bar-wrap">
            <div class="hp-bar-label">
                <span>Points de Vie</span>
                <span>${pv}</span>
            </div>
            <div class="hp-bar-track">
                <div class="hp-bar-fill" style="width:${Math.min(100,(pv/pvMax)*100).toFixed(1)}%"></div>
            </div>
        </div>

        <div class="card-stats">
            <div class="stat-block pv">
                <span class="stat-sym">♥</span>
                <span class="stat-label">PV</span>
                <span class="stat-value">${pv}</span>
            </div>
            <div class="stat-block atk">
                <span class="stat-sym">⚡</span>
                <span class="stat-label">ATK</span>
                <span class="stat-value">${attaque}</span>
            </div>
            <div class="stat-block def">
                <span class="stat-sym">🛡</span>
                <span class="stat-label">DEF</span>
                <span class="stat-value">${defense}</span>
            </div>
        </div>

        <div class="card-actions">
            <button class="btn btn-levelup" aria-label="Level Up ${escapeHtml(nom)}">
                &#9650; Level Up
            </button>
            <button class="btn btn-delete" aria-label="Supprimer ${escapeHtml(nom)}">
                &#10007; Supprimer
            </button>
        </div>
    `;

    card.querySelector('.btn-levelup').addEventListener('click', () => levelUp(id, card));
    card.querySelector('.btn-delete').addEventListener('click', () => supprimerPersonnage(id, card, nom));

    return card;
}

/* ═══════════════════════════════════════════
   CREATE PERSONNAGE
═══════════════════════════════════════════ */
createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const donnees = {
        nom:     document.getElementById('nom').value.trim(),
        classe:  document.getElementById('classe').value,
        niveau:  parseInt(document.getElementById('niveau').value, 10),
        pv:      parseInt(document.getElementById('pv').value, 10),
        attaque: parseInt(document.getElementById('attaque').value, 10),
        defense: parseInt(document.getElementById('defense').value, 10),
    };

    btnCreate.disabled = true;
    btnCreate.textContent = 'Invocation…';

    try {
        const res = await fetch(`${API_BASE}/personnages`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(donnees),
        });

        if (!res.ok) {
            const detail = await res.json().catch(() => null);
            throw new Error(detail?.detail || `HTTP ${res.status}`);
        }

        createForm.reset();
        clearAllErrors();
        showToast(`${donnees.nom} a rejoint les rangs !`, 'success');
        await fetchPersonnages();
    } catch (err) {
        showGlobalError(`Erreur lors de la création : ${err.message}`);
        showToast('Échec de la création.', 'error');
    } finally {
        btnCreate.disabled = false;
        btnCreate.innerHTML = '<span class="btn-rune" aria-hidden="true">ᚠ</span> Invoquer le Personnage';
    }
});

/* ═══════════════════════════════════════════
   DELETE PERSONNAGE
═══════════════════════════════════════════ */
async function supprimerPersonnage(id, cardEl, nom) {
    if (!confirm(`Supprimer ${nom} définitivement ?`)) return;

    const btns = cardEl.querySelectorAll('.btn');
    btns.forEach(b => b.disabled = true);

    try {
        const res = await fetch(`${API_BASE}/personnages/${id}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);

        cardEl.style.transition = 'opacity .35s ease, transform .35s ease';
        cardEl.style.opacity = '0';
        cardEl.style.transform = 'scale(.95)';
        cardEl.addEventListener('transitionend', () => {
            cardEl.remove();
            const remaining = cardsGrid.querySelectorAll('.char-card').length;
            updateCharCount(remaining);
            if (remaining === 0) showState('empty');
        });

        showToast(`${nom} a été éliminé.`, 'info');
    } catch (err) {
        showToast(`Erreur : ${err.message}`, 'error');
        btns.forEach(b => b.disabled = false);
    }
}

/* ═══════════════════════════════════════════
   LEVEL UP
═══════════════════════════════════════════ */
async function levelUp(id, cardEl) {
    const levelBtn = cardEl.querySelector('.btn-levelup');
    levelBtn.disabled = true;
    levelBtn.textContent = '…';

    try {
        const res = await fetch(`${API_BASE}/personnages/${id}/levelup`, { method: 'PATCH' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const updated = await res.json();

        updateCardStats(cardEl, updated);
        cardEl.classList.remove('leveling');
        void cardEl.offsetWidth;
        cardEl.classList.add('leveling');
        cardEl.addEventListener('animationend', () => cardEl.classList.remove('leveling'), { once: true });

        showToast(`${updated.nom} passe au niveau ${updated.niveau} !`, 'success');
    } catch (err) {
        showToast(`Erreur level-up : ${err.message}`, 'error');
    } finally {
        levelBtn.disabled = false;
        levelBtn.innerHTML = '&#9650; Level Up';
    }
}

/* Update card DOM without rebuilding it */
function updateCardStats(cardEl, p) {
    cardEl.querySelector('.card-level-value').textContent = p.niveau;
    cardEl.querySelector('.stat-block.pv .stat-value').textContent = p.pv;
    cardEl.querySelector('.stat-block.atk .stat-value').textContent = p.attaque;
    cardEl.querySelector('.stat-block.def .stat-value').textContent = p.defense;

    const hpLabel = cardEl.querySelector('.hp-bar-label span:last-child');
    if (hpLabel) hpLabel.textContent = p.pv;

    const pvStatInHeader = cardEl.querySelector('.card-stats .pv .stat-value');
    if (pvStatInHeader) pvStatInHeader.textContent = p.pv;

    const pvMax = Math.max(p.pv, 100);
    const fill = cardEl.querySelector('.hp-bar-fill');
    if (fill) fill.style.width = `${Math.min(100,(p.pv/pvMax)*100).toFixed(1)}%`;
}

/* ═══════════════════════════════════════════
   FORM VALIDATION
═══════════════════════════════════════════ */
function validateForm() {
    clearAllErrors();
    let valid = true;

    const nom     = document.getElementById('nom').value.trim();
    const classe  = document.getElementById('classe').value;
    const niveau  = parseInt(document.getElementById('niveau').value, 10);
    const pv      = parseInt(document.getElementById('pv').value, 10);
    const attaque = parseInt(document.getElementById('attaque').value, 10);
    const defense = parseInt(document.getElementById('defense').value, 10);

    if (!nom) {
        setFieldError('nom', 'Le nom est requis.');
        valid = false;
    } else if (nom.length > 100) {
        setFieldError('nom', 'Maximum 100 caractères.');
        valid = false;
    }

    if (!classe) {
        setFieldError('classe', 'Choisissez une classe.');
        valid = false;
    }

    if (isNaN(niveau) || niveau < 1) {
        setFieldError('niveau', 'Niveau minimum : 1.');
        valid = false;
    }

    if (isNaN(pv) || pv < 1) {
        setFieldError('pv', 'PV doit être > 0.');
        valid = false;
    }

    if (isNaN(attaque) || attaque < 1) {
        setFieldError('attaque', 'Attaque doit être > 0.');
        valid = false;
    }

    if (isNaN(defense) || defense < 1) {
        setFieldError('defense', 'Défense doit être > 0.');
        valid = false;
    }

    return valid;
}

function setFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errEl = document.getElementById(`err-${fieldId}`);
    if (input)  input.classList.add('invalid');
    if (errEl)  errEl.textContent = message;
}

function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    globalError.classList.remove('visible');
    globalError.textContent = '';
}

function showGlobalError(message) {
    globalError.textContent = message;
    globalError.classList.add('visible');
}

/* Clear field error on input */
document.querySelectorAll('#create-form input, #create-form select').forEach(el => {
    el.addEventListener('input', () => {
        el.classList.remove('invalid');
        const errEl = document.getElementById(`err-${el.id}`);
        if (errEl) errEl.textContent = '';
    });
});

/* ═══════════════════════════════════════════
   UTILITY
═══════════════════════════════════════════ */
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
fetchPersonnages();
