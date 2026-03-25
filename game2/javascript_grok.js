
// ============================================================
//  State
// ============================================================
let accounts = [0, 0, 0];
let playerName = "Oleg";
let partnerName = "Robo3";
let robotType = 3;    // 0=PvP, 1=Robo1, 2=Robo2, 3=Robo3
let currentPlayer = 0;   // 0=human/P1, 1=bot/P2
let gameOver = false;
let selectedAcc = 0;
let scores = [0, 0];
let history = [];   // undo stack (bot mode only)
let gameMode = 'bot'; // 'bot' | 'pvp'

// ============================================================
//  Nim strategy
// ============================================================
function xorSum() { return accounts[0] ^ accounts[1] ^ accounts[2]; }

// Returns winning move or delay move if losing
function findOptimalMove(accs) {
    const xor = accs[0] ^ accs[1] ^ accs[2];
    if (xor !== 0) {
        // Winning: find account to reduce so XOR → 0
        for (let i = 0; i < 3; i++) {
            const target = accs[i] ^ xor;
            if (target < accs[i]) return { idx: i, amount: accs[i] - target };
        }
    }
    // Losing position: take 1 from the largest non-zero account to delay
    let maxIdx = -1, maxVal = 0;
    for (let i = 0; i < 3; i++) {
        if (accs[i] > maxVal) { maxVal = accs[i]; maxIdx = i; }
    }
    return maxIdx >= 0 ? { idx: maxIdx, amount: 1 } : null;
}

// Random move (pick random non-empty account, random amount)
function findRandomMove(accs) {
    const nonEmpty = accs.map((v, i) => ({ v, i })).filter(x => x.v > 0);
    if (!nonEmpty.length) return null;
    const pick = nonEmpty[Math.floor(Math.random() * nonEmpty.length)];
    return { idx: pick.i, amount: Math.floor(Math.random() * pick.v) + 1 };
}

// ============================================================
//  Bots
// ============================================================
function botMove() {
    const accs = [...accounts];
    if (robotType === 1) return findRandomMove(accs);
    if (robotType === 2) return Math.random() < 0.8 ? (findOptimalMove(accs) || findRandomMove(accs)) : findRandomMove(accs);
    if (robotType === 3) return findOptimalMove(accs) || findRandomMove(accs);
    return null;
}

// ============================================================
//  UI helpers
// ============================================================
function selectMode(mode) {
    gameMode = mode;
    document.getElementById('tab-bot').classList.toggle('active', mode === 'bot');
    document.getElementById('tab-pvp').classList.toggle('active', mode === 'pvp');
    const lbl = document.getElementById('opp-label');
    if (mode === 'pvp') {
        lbl.textContent = 'Player 2 Name:';
        document.getElementById('partnerName').value = 'Manager B';
    } else {
        lbl.textContent = 'Opponent (Robo1 / Robo2 / Robo3):';
        document.getElementById('partnerName').value = 'Robo3';
    }
}

function randomAccounts(fair) {
    let a, b, c;
    do {
        a = Math.floor(Math.random() * 9) + 1;
        b = Math.floor(Math.random() * 9) + 1;
        c = Math.floor(Math.random() * 9) + 1;
    } while (fair && (a ^ b ^ c) === 0);
    document.getElementById('initA').value = a;
    document.getElementById('initB').value = b;
    document.getElementById('initC').value = c;
}

function selectAccount(idx) {
    if (gameOver) return;
    if (gameMode === 'bot' && currentPlayer !== 0) return;
    if (accounts[idx] === 0) return;
    selectedAcc = idx;
    document.getElementById('accSelect').value = idx;
    [0, 1, 2].forEach(i => {
        const c = document.getElementById('card' + i);
        c.classList.toggle('selected', i === idx);
    });
    updateSlider();
}

function updateSlider() {
    const max = accounts[selectedAcc] || 1;
    const slider = document.getElementById('moveSlider');
    const inp = document.getElementById('moveAmount');
    slider.max = max;
    if (parseInt(inp.value) > max) inp.value = max;
    slider.value = inp.value;
}

function syncAmount(from) {
    const slider = document.getElementById('moveSlider');
    const inp = document.getElementById('moveAmount');
    const max = accounts[selectedAcc] || 1;
    if (from === 'slider') {
        inp.value = slider.value;
    } else {
        let v = Math.max(1, Math.min(parseInt(inp.value) || 1, max));
        inp.value = v;
        slider.value = v;
    }
}

function setQuick(val) {
    const max = accounts[selectedAcc] || 1;
    let v = val === 'half' ? Math.max(1, Math.floor(max / 2))
        : val === 'all' ? max : 1;
    document.getElementById('moveAmount').value = v;
    document.getElementById('moveSlider').value = v;
}

function addLog(msg, cls = 'entry-sys') {
    const logEl = document.getElementById('log');
    const d = document.createElement('div');
    d.className = cls;
    const ts = new Date().toLocaleTimeString('en', { hour12: false });
    d.textContent = `[${ts}] ${msg}`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
}

function renderAccounts() {
    ['A', 'B', 'C'].forEach((name, i) => {
        document.getElementById('val' + name).textContent = accounts[i];
        const card = document.getElementById('card' + i);
        card.classList.toggle('empty', accounts[i] === 0);
        card.classList.toggle('selected', i === selectedAcc && accounts[i] > 0 && !gameOver);
    });
    // Sync select dropdown too
    document.getElementById('accSelect').value = selectedAcc;

    const xor = xorSum();
    const xorEl = document.getElementById('xorDisplay');
    document.getElementById('xorVal').textContent = xor;
    xorEl.className = 'xor ' + (xor === 0 ? 'zero' : 'nonzero');

    updateSlider();
    renderScores();
}

function renderScores() {
    document.getElementById('s1-name').textContent = playerName;
    document.getElementById('s2-name').textContent = partnerName;
    document.getElementById('s1-score').textContent = scores[0];
    document.getElementById('s2-score').textContent = scores[1];
}

function setTurnDisplay() {
    const el = document.getElementById('turnDisplay');
    if (gameOver) { el.textContent = ''; return; }
    if (currentPlayer === 0) {
        el.innerHTML = `🟢 <strong>${playerName}</strong>'s turn`;
    } else {
        el.innerHTML = gameMode === 'bot'
            ? `🟡 <strong>${partnerName}</strong> is thinking...`
            : `🟣 <strong>${partnerName}</strong>'s turn`;
    }
}

function setInputsEnabled(enabled) {
    document.getElementById('moveBtn').disabled = !enabled;
    document.getElementById('hintBtn').style.display = enabled ? 'inline-block' : 'none';
    document.getElementById('accSelect').disabled = !enabled;
    document.getElementById('moveAmount').disabled = !enabled;
    document.getElementById('moveSlider').disabled = !enabled;
}

// ============================================================
//  Core game logic
// ============================================================
function applyMove(playerIdx, idx, amount) {
    // Snapshot before move (only for human moves in bot mode)
    if (gameMode === 'bot' && playerIdx === 0) {
        history.push({ accounts: [...accounts], selectedAcc, currentPlayer });
    }

    accounts[idx] -= amount;
    const accName = ['A', 'B', 'C'][idx];
    const who = playerIdx === 0 ? playerName : partnerName;
    const cls = playerIdx === 0 ? 'entry-human' : 'entry-bot';
    addLog(`${who} transferred ${amount} from Account ${accName} → [${accounts.join(', ')}] XOR=${xorSum()}`, cls);
    renderAccounts();

    // Check: if all accounts are now zero, the player who just moved WINS
    if (accounts.every(v => v === 0)) {
        endGame(playerIdx);
        return;
    }

    // Switch turn
    currentPlayer = playerIdx === 0 ? 1 : 0;
    // Auto-select first non-empty for next player
    for (let i = 0; i < 3; i++) { if (accounts[i] > 0) { selectedAcc = i; break; } }
    setTurnDisplay();
    renderAccounts();

    // Bot plays
    if (gameMode === 'bot' && currentPlayer === 1) {
        setInputsEnabled(false);
        setTimeout(executeBotMove, 850);
    }
}

function endGame(winnerIdx) {
    gameOver = true;
    scores[winnerIdx]++;
    const wName = winnerIdx === 0 ? playerName : partnerName;
    const lName = winnerIdx === 0 ? partnerName : playerName;
    document.getElementById('winnerDisplay').innerHTML =
        `<span style="color:#ffd700;font-size:1.4em;">🏆 <strong>${wName}</strong> WINS!<br>
           <span style="color:#ff6666;">${lName} is FIRED! 🔥</span></span>`;
    document.getElementById('turnDisplay').textContent = '';
    addLog(`=== GAME OVER — ${wName} WINS! ${lName} is fired! ===`, 'entry-win');
    setInputsEnabled(false);
    renderScores();
}

function executeBotMove() {
    if (gameOver || currentPlayer !== 1 || gameMode !== 'bot') return;
    const move = botMove();
    if (!move) { endGame(0); return; } // Bot can't move → human wins
    applyMove(1, move.idx, move.amount);
    // Re-enable human input only if game is still going
    if (!gameOver) setInputsEnabled(true);
}

// ============================================================
//  Undo
// ============================================================
function undoMove() {
    if (!history.length || gameOver) return;
    const snap = history.pop();
    accounts = snap.accounts;
    selectedAcc = snap.selectedAcc;
    currentPlayer = snap.currentPlayer;
    gameOver = false;
    document.getElementById('winnerDisplay').innerHTML = '';
    document.getElementById('hintBox').style.display = 'none';
    addLog('↩ Move undone', 'entry-sys');
    setInputsEnabled(true);
    setTurnDisplay();
    renderAccounts();
}

// ============================================================
//  Hint
// ============================================================
function showHint() {
    const hb = document.getElementById('hintBox');
    const xor = xorSum();
    const move = findOptimalMove([...accounts]);
    if (xor === 0) {
        hb.className = 'hint-box lose';
        hb.innerHTML = `⚠️ XOR = 0 — you are in a <strong>losing position</strong> if your opponent plays perfectly. Best you can do: take 1 from the largest account to delay.`;
    } else {
        const accName = ['A', 'B', 'C'][move.idx];
        hb.className = 'hint-box win';
        hb.innerHTML = `💡 XOR = ${xor} ≠ 0 — <strong>winning position!</strong> Transfer <strong>${move.amount}</strong> from Account <strong>${accName}</strong> to make XOR = 0.`;
    }
    hb.style.display = 'block';
}

// ============================================================
//  Start / Reset
// ============================================================
function startGame() {
    playerName = document.getElementById('playerName').value.trim() || 'Player 1';
    partnerName = document.getElementById('partnerName').value.trim() || 'Robo3';

    accounts[0] = Math.max(0, parseInt(document.getElementById('initA').value) || 0);
    accounts[1] = Math.max(0, parseInt(document.getElementById('initB').value) || 0);
    accounts[2] = Math.max(0, parseInt(document.getElementById('initC').value) || 0);

    if (accounts.every(v => v === 0)) { alert('Set at least one non-zero account!'); return; }

    if (gameMode === 'bot') {
        const n = partnerName.toLowerCase();
        if (n.includes('robo1') || n.includes('robot1')) robotType = 1;
        else if (n.includes('robo2') || n.includes('robot2')) robotType = 2;
        else if (n.includes('robo3') || n.includes('robot3')) robotType = 3;
        else { alert('Bot name must be Robo1, Robo2 or Robo3!'); return; }
    } else {
        robotType = 0;
    }

    currentPlayer = 0;
    gameOver = false;
    selectedAcc = 0;
    history = [];
    for (let i = 0; i < 3; i++) { if (accounts[i] > 0) { selectedAcc = i; break; } }

    document.getElementById('setupArea').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('log').innerHTML = '';
    document.getElementById('winnerDisplay').innerHTML = '';
    document.getElementById('hintBox').style.display = 'none';
    document.getElementById('undoBtn').style.display = gameMode === 'bot' ? 'inline-block' : 'none';

    addLog(`=== GAME STARTED: ${playerName} vs ${partnerName} ===`, 'entry-sys');
    addLog(`Accounts: A=${accounts[0]}, B=${accounts[1]}, C=${accounts[2]} | XOR=${xorSum()}`, 'entry-sys');

    setInputsEnabled(true);
    setTurnDisplay();
    renderAccounts();
}

function resetGame() {
    document.getElementById('setupArea').style.display = 'block';
    document.getElementById('gameArea').style.display = 'none';
    scores = [0, 0]; // reset scores on full new game
}

// ============================================================
//  Event listeners
// ============================================================
document.getElementById('startBtn').addEventListener('click', startGame);

document.getElementById('moveBtn').addEventListener('click', () => {
    if (gameOver) return;
    if (gameMode === 'bot' && currentPlayer !== 0) return;

    const idx = parseInt(document.getElementById('accSelect').value);
    const amount = parseInt(document.getElementById('moveAmount').value);

    if (!amount || amount < 1) { alert('Enter a positive amount!'); return; }
    if (amount > accounts[idx]) {
        alert(`Account ${['A', 'B', 'C'][idx]} only has ${accounts[idx]} coins!`); return;
    }

    document.getElementById('hintBox').style.display = 'none';
    selectedAcc = idx;
    applyMove(currentPlayer, idx, amount);
});

// Keep card selection in sync with dropdown
document.getElementById('accSelect').addEventListener('change', e => {
    const idx = parseInt(e.target.value);
    if (accounts[idx] > 0) selectAccount(idx);
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    if (gameOver) return;
    const isMyTurn = gameMode === 'pvp' || currentPlayer === 0;
    if (!isMyTurn) return;
    if (e.key === 'Enter') { document.getElementById('moveBtn').click(); return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        let next = selectedAcc + (e.key === 'ArrowRight' ? 1 : -1);
        for (let t = 0; t < 3; t++) {
            next = ((next % 3) + 3) % 3;
            if (accounts[next] > 0) { selectAccount(next); break; }
            next += e.key === 'ArrowRight' ? 1 : -1;
        }
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const max = accounts[selectedAcc] || 1;
        let v = parseInt(document.getElementById('moveAmount').value) || 1;
        v += e.key === 'ArrowUp' ? 1 : -1;
        v = Math.max(1, Math.min(v, max));
        document.getElementById('moveAmount').value = v;
        document.getElementById('moveSlider').value = v;
    }
});
