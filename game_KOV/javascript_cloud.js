// ============================================================
//  State
// ============================================================
const state = {
    accounts: [0, 0, 0],
    currentPlayer: 0,   // 0 = player1 (human), 1 = player2 (bot or human2)
    playerName: "",
    opponentName: "",
    botType: null,       // null = PvP, else bot object
    gameOver: false,
    moveCount: 0,
    selectedAccount: 0,
    scores: [0, 0],
    history: [],         // for undo: [{accounts, currentPlayer}]
    gameMode: 'bot',     // 'bot' | 'pvp'
};

// ============================================================
//  Nim strategy
// ============================================================
function xorSum(a, b, c) { return a ^ b ^ c; }

function smartMove(accounts) {
    const xor = xorSum(...accounts);
    if (xor !== 0) {
        // Winning position: find account to reduce so XOR becomes 0
        for (let i = 0; i < 3; i++) {
            const target = accounts[i] ^ xor;
            if (target < accounts[i]) {
                return { account: i, amount: accounts[i] - target };
            }
        }
    }
    // Losing position: take 1 from largest non-zero (delay tactic)
    const maxIdx = accounts.reduce((best, v, i) => v > accounts[best] ? i : best, 0);
    if (accounts[maxIdx] === 0) return null;
    return { account: maxIdx, amount: 1 };
}

// ============================================================
//  Bots
// ============================================================
const Robot1 = {
    name: "Robot1",
    makeMove(accounts) {
        const nonEmpty = accounts.map((v, i) => ({ v, i })).filter(x => x.v > 0);
        if (!nonEmpty.length) return null;
        const pick = nonEmpty[Math.floor(Math.random() * nonEmpty.length)];
        return { account: pick.i, amount: Math.floor(Math.random() * pick.v) + 1 };
    }
};

const Robot2 = {
    name: "Robot2",
    makeMove(accounts) {
        return Math.random() < 0.3 ? Robot1.makeMove(accounts) : (smartMove(accounts) || Robot1.makeMove(accounts));
    }
};

const Robot3 = {
    name: "Robot3",
    makeMove(accounts) {
        return smartMove(accounts) || Robot1.makeMove(accounts);
    }
};

function resolveBot(name) {
    const n = name.toLowerCase().trim();
    if (n === "robo1") return Robot1;
    if (n === "robo2") return Robot2;
    if (n === "robo3") return Robot3;
    return null; // human
}

// ============================================================
//  UI helpers
// ============================================================
let selectedMode = 'bot';
function selectMode(mode) {
    selectedMode = mode;
    document.getElementById('tab-bot').classList.toggle('active', mode === 'bot');
    document.getElementById('tab-pvp').classList.toggle('active', mode === 'pvp');
    const oppLabel = document.getElementById('opp-label');
    const botInfo = document.getElementById('botInfo');
    if (mode === 'pvp') {
        oppLabel.textContent = 'Player 2 Name';
        document.getElementById('opponentName').value = 'Manager B';
        botInfo.style.display = 'none';
    } else {
        oppLabel.textContent = 'Opponent Name / Bot Type';
        document.getElementById('opponentName').value = 'Robo3';
        botInfo.style.display = 'block';
    }
}

function selectAccount(idx) {
    if (state.gameOver || state.currentPlayer !== 0 && state.botType) return;
    if (state.accounts[idx] === 0) return;
    state.selectedAccount = idx;
    [0, 1, 2].forEach(i => {
        const card = document.getElementById(['cardA', 'cardB', 'cardC'][i]);
        card.classList.toggle('selected-account', i === idx);
    });
    updateSlider();
}

function updateSlider() {
    const max = state.accounts[state.selectedAccount] || 1;
    const slider = document.getElementById('moveSlider');
    const inp = document.getElementById('moveAmount');
    slider.max = max;
    if (parseInt(inp.value) > max) inp.value = max;
    if (parseInt(slider.value) > max) slider.value = max;
    inp.value = slider.value;
}

function syncAmount(from) {
    const slider = document.getElementById('moveSlider');
    const inp = document.getElementById('moveAmount');
    const max = state.accounts[state.selectedAccount] || 1;
    if (from === 'slider') {
        inp.value = slider.value;
    } else {
        let v = parseInt(inp.value) || 1;
        v = Math.max(1, Math.min(v, max));
        inp.value = v;
        slider.value = v;
    }
}

function setQuick(val) {
    const max = state.accounts[state.selectedAccount] || 1;
    let v = 1;
    if (val === 'half') v = Math.max(1, Math.floor(max / 2));
    else if (val === 'all') v = max;
    else v = val;
    document.getElementById('moveAmount').value = v;
    document.getElementById('moveSlider').value = v;
}

function logEntry(msg, type = "system") {
    const log = document.getElementById("gameLog");
    const div = document.createElement("div");
    div.className = `log-entry ${type}`;
    const ts = new Date().toLocaleTimeString("en", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    div.textContent = `[${ts}] ${msg}`;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

function renderState() {
    const names = ['valA', 'valB', 'valC'];
    const cards = ['cardA', 'cardB', 'cardC'];
    state.accounts.forEach((v, i) => {
        const el = document.getElementById(names[i]);
        const oldVal = parseInt(el.textContent);
        el.textContent = v;
        if (oldVal !== v) {
            el.classList.remove('changed');
            void el.offsetWidth;
            el.classList.add('changed');
        }
        const card = document.getElementById(cards[i]);
        card.classList.toggle('account-empty', v === 0);
        card.classList.toggle('selected-account', i === state.selectedAccount && !state.gameOver && v > 0);
    });

    const xor = xorSum(...state.accounts);
    const xorEl = document.getElementById("xorDisplay");
    xorEl.textContent = `XOR = ${xor}`;
    xorEl.className = "xor-display " + (xor === 0 ? "xor-zero" : "xor-nonzero");

    document.getElementById('moveCount').textContent = `MOVES: ${state.moveCount}`;

    // Turn indicator
    const turnEl = document.getElementById("turnIndicator");
    if (!state.gameOver) {
        const isMyTurn = state.currentPlayer === 0 || state.botType === null;
        if (state.currentPlayer === 0) {
            turnEl.textContent = `${state.playerName}'s TURN`;
            turnEl.className = "turn-indicator turn-player";
        } else {
            turnEl.textContent = state.botType ? `${state.opponentName} THINKING...` : `${state.opponentName}'s TURN`;
            turnEl.className = "turn-indicator " + (state.botType ? "turn-bot turn-thinking" : "turn-p2");
        }
    }

    // Move button: enabled only on human's turn
    const canMove = !state.gameOver && (state.currentPlayer === 0 || state.botType === null);
    document.getElementById("moveBtn").disabled = !canMove;
    document.getElementById("hintBtn").style.display = canMove ? 'inline-block' : 'none';

    updateSlider();
    updateScoreBoard();
}

function updateScoreBoard() {
    document.getElementById('p1-score-label').textContent = state.playerName;
    document.getElementById('p2-score-label').textContent = state.opponentName;
    document.getElementById('p1-score').textContent = state.scores[0];
    document.getElementById('p2-score').textContent = state.scores[1];
}

// ============================================================
//  Game logic
// ============================================================
function startGame() {
    const pName = document.getElementById("playerName").value.trim() || "Player 1";
    const oName = document.getElementById("opponentName").value.trim() || "Robo3";
    const a = Math.max(0, parseInt(document.getElementById("initA").value) || 0);
    const b = Math.max(0, parseInt(document.getElementById("initB").value) || 0);
    const c = Math.max(0, parseInt(document.getElementById("initC").value) || 0);

    if (a === 0 && b === 0 && c === 0) {
        alert("Please set at least one non-zero account!");
        return;
    }

    state.accounts = [a, b, c];
    state.playerName = pName;
    state.opponentName = oName;
    state.gameMode = selectedMode;
    state.botType = selectedMode === 'pvp' ? null : resolveBot(oName);
    state.currentPlayer = 0;
    state.gameOver = false;
    state.moveCount = 0;
    state.selectedAccount = 0;
    state.history = [];

    // Auto-select first non-empty account
    for (let i = 0; i < 3; i++) {
        if (state.accounts[i] > 0) { state.selectedAccount = i; break; }
    }

    document.getElementById("setupPanel").style.display = "none";
    document.getElementById("gameArea").style.display = "block";
    document.getElementById("winnerBanner").classList.remove("show");
    document.getElementById("gameLog").innerHTML = "";
    document.getElementById("hintBox").style.display = "none";
    document.getElementById("undoBtn").style.display = state.botType ? 'inline-block' : 'none';

    logEntry(`⚡ Game started! ${pName} vs ${oName} | Mode: ${selectedMode === 'pvp' ? '2 Players' : 'vs Bot'}`, "system");
    logEntry(`📊 Accounts: A=${a}, B=${b}, C=${c} | XOR=${xorSum(a, b, c)}`, "system");
    renderState();
}

function applyMove(playerIndex, accountIdx, amount) {
    // Save history for undo (only in vs-bot mode, only before human move)
    if (state.botType && playerIndex === 0) {
        state.history.push({
            accounts: [...state.accounts],
            currentPlayer: state.currentPlayer,
            moveCount: state.moveCount,
        });
    }

    state.accounts[accountIdx] -= amount;
    state.moveCount++;

    const who = playerIndex === 0 ? state.playerName : state.opponentName;
    const accName = ["A", "B", "C"][accountIdx];
    const cls = playerIndex === 0 ? "player" : "bot";
    logEntry(`${who} → transferred ${amount} from account ${accName} | Remaining: [${state.accounts.join(", ")}] | XOR=${xorSum(...state.accounts)}`, cls);
}

function checkGameOver() {
    // The player who just moved emptied everything → they WIN
    // (current player will be unable to move on their turn)
    if (state.accounts.every(v => v === 0)) {
        // currentPlayer is still the one who JUST MOVED (before switchTurn)
        const winnerIdx = state.currentPlayer;
        const loserIdx = winnerIdx === 0 ? 1 : 0;
        const winnerName = winnerIdx === 0 ? state.playerName : state.opponentName;
        const loserName = loserIdx === 0 ? state.playerName : state.opponentName;

        state.scores[winnerIdx]++;
        state.gameOver = true;

        document.getElementById("winnerName").textContent = winnerName;
        document.getElementById("winnerSub").textContent = `${loserName} — FIRED! 🔥`;
        document.getElementById("winnerBanner").classList.add("show");
        document.getElementById("turnIndicator").textContent = "GAME OVER";
        document.getElementById("turnIndicator").className = "turn-indicator";
        document.getElementById("moveBtn").disabled = true;
        logEntry(`🏆 ${winnerName} WINS! ${loserName} is fired!`, "winner");
        updateScoreBoard();
        return true;
    }
    return false;
}

function switchTurn() {
    state.currentPlayer = state.currentPlayer === 0 ? 1 : 0;
    // Auto-select first non-empty account for new active player
    for (let i = 0; i < 3; i++) {
        if (state.accounts[i] > 0) { state.selectedAccount = i; break; }
    }
}

// Human / P2 move
function playerMove() {
    if (state.gameOver) return;
    // In bot mode only p1 uses this button; in pvp both use it
    if (state.botType && state.currentPlayer !== 0) return;

    const accIdx = state.selectedAccount;
    const amount = parseInt(document.getElementById("moveAmount").value);

    if (isNaN(amount) || amount <= 0) { alert("Enter a positive amount!"); return; }
    if (amount > state.accounts[accIdx]) {
        alert(`Account ${["A", "B", "C"][accIdx]} only has ${state.accounts[accIdx]} coins!`);
        return;
    }

    document.getElementById("hintBox").style.display = "none";
    applyMove(state.currentPlayer, accIdx, amount);
    renderState();
    if (checkGameOver()) return;

    switchTurn();
    renderState();

    // Schedule bot turn
    if (state.botType && state.currentPlayer === 1) {
        document.getElementById("moveBtn").disabled = true;
        setTimeout(botTurn, 850);
    }
}

function botTurn() {
    if (state.gameOver || state.currentPlayer !== 1 || !state.botType) return;

    const move = state.botType.makeMove([...state.accounts]);
    if (!move) { checkGameOver(); return; }

    applyMove(1, move.account, move.amount);
    renderState();
    if (checkGameOver()) return;

    switchTurn();
    renderState();
}

// Undo last human move + bot's response
function undoMove() {
    if (!state.history.length || state.gameOver) return;
    const snap = state.history.pop();
    state.accounts = snap.accounts;
    state.currentPlayer = snap.currentPlayer;
    state.moveCount = snap.moveCount;
    state.selectedAccount = 0;
    for (let i = 0; i < 3; i++) {
        if (state.accounts[i] > 0) { state.selectedAccount = i; break; }
    }
    document.getElementById("hintBox").style.display = "none";
    logEntry("↩ Move undone", "system");
    renderState();
}

// Hint
function showHint() {
    const hintBox = document.getElementById("hintBox");
    const xor = xorSum(...state.accounts);
    const move = smartMove([...state.accounts]);
    if (xor === 0) {
        hintBox.className = "info-box hint-lose";
        hintBox.innerHTML = `⚠️ XOR = 0 — you are in a <strong>losing position</strong> with perfect opponent play. Try taking 1 from the largest account.`;
    } else {
        const accName = ["A", "B", "C"][move.account];
        hintBox.className = "info-box hint-win";
        hintBox.innerHTML = `💡 XOR = ${xor} ≠ 0 — <strong>winning position!</strong> Transfer <strong>${move.amount}</strong> from account <strong>${accName}</strong> to make XOR = 0.`;
    }
    hintBox.style.display = "block";
}

function resetGame() {
    document.getElementById("setupPanel").style.display = "block";
    document.getElementById("gameArea").style.display = "none";
    document.getElementById("winnerBanner").classList.remove("show");
}

function randomAccounts(fair = false) {
    let a, b, c;
    if (fair) {
        // Generate position where XOR ≠ 0 (good for first player)
        do {
            a = Math.floor(Math.random() * 9) + 1;
            b = Math.floor(Math.random() * 9) + 1;
            c = Math.floor(Math.random() * 9) + 1;
        } while ((a ^ b ^ c) === 0);
    } else {
        a = Math.floor(Math.random() * 9) + 1;
        b = Math.floor(Math.random() * 9) + 1;
        c = Math.floor(Math.random() * 9) + 1;
    }
    document.getElementById("initA").value = a;
    document.getElementById("initB").value = b;
    document.getElementById("initC").value = c;
}

// Keyboard: Enter = Transfer, ← → = switch account, ↑ ↓ = amount
document.addEventListener("keydown", e => {
    if (state.gameOver) return;
    const canAct = !state.botType || state.currentPlayer === 0;
    if (!canAct) return;

    if (e.key === "Enter") { playerMove(); return; }

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        let next = state.selectedAccount + (e.key === "ArrowRight" ? 1 : -1);
        next = (next + 3) % 3;
        // Skip empty
        for (let t = 0; t < 3; t++) {
            if (state.accounts[next] > 0) { selectAccount(next); break; }
            next = (next + (e.key === "ArrowRight" ? 1 : -1) + 3) % 3;
        }
        return;
    }

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const inp = document.getElementById("moveAmount");
        const max = state.accounts[state.selectedAccount] || 1;
        let v = parseInt(inp.value) || 1;
        v += e.key === "ArrowUp" ? 1 : -1;
        v = Math.max(1, Math.min(v, max));
        inp.value = v;
        document.getElementById("moveSlider").value = v;
    }
});