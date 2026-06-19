const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');
const GAMES_FILE = path.join(__dirname, 'games.json');

function loadUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            const defaultUsers = [{ username: "admin", password: "password123" }];
            fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
            return defaultUsers;
        }
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Errore nel caricamento del file utenti, restituisco array vuoto:", error);
        return [];
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error("Errore nel salvataggio del file utenti:", error);
    }
}

function loadGames() {
    try {
        if (!fs.existsSync(GAMES_FILE)) {
            fs.writeFileSync(GAMES_FILE, JSON.stringify({}, null, 2));
            return {};
        }
        const data = fs.readFileSync(GAMES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Errore nel caricamento del file partite, restituisco oggetto vuoto:", error);
        return {};
    }
}

function saveGames(games) {
    try {
        fs.writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2));
    } catch (error) {
        console.error("Errore nel salvataggio del file partite:", error);
    }
}

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username e password sono richiesti.' });
    }

    const registeredUsers = loadUsers();

    const userExists = registeredUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (userExists) {
        return res.status(400).json({ error: 'Questo nome utente è già registrato.' });
    }

    registeredUsers.push({ username, password });
    saveUsers(registeredUsers);

    console.log(`Nuovo utente registrato e salvato su disco: ${username}`);
    res.json({ message: 'Registrazione completata con successo!' });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const registeredUsers = loadUsers();

    const user = registeredUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Credenziali errate o utente non registrato.' });
    }
    console.log(`Login effettuato con successo da: ${username}`);
    res.json({ message: 'Login autorizzato', username: user.username });
});

app.post('/api/game/save', (req, res) => {
    const gameState = req.body;
    const username = gameState.username;

    if (!username) {
        return res.status(400).json({ error: 'Username mancante nello stato del gioco.' });
    }

    const activeGames = loadGames();
    activeGames[username] = gameState;
    saveGames(activeGames);

    console.log(`Partita salvata fisicamente su disco per l'utente: ${username}`);
    res.json({ message: 'Stato della partita salvato con successo.' });
});

app.get('/api/game/load/:username', (req, res) => {
    const username = req.params.username;
    
    const activeGames = loadGames();
    const savedGame = activeGames[username];

    if (!savedGame) {
        return res.status(404).json({ message: 'Nessuna partita in corso trovata per questo utente.' });
    }

    console.log(`Partita caricata da disco per l'utente: ${username}`);
    res.json(savedGame);
});

app.delete('/api/game/clear/:username', (req, res) => {
    const username = req.params.username;
    
    const activeGames = loadGames();
    if (activeGames[username]) {
        delete activeGames[username];
        saveGames(activeGames);
        console.log(`Partita attiva rimossa dal disco per l'utente: ${username}`);
    }
    res.json({ message: 'Partita attiva resettata.' });
});

app.listen(PORT, () => {
    console.log(`Server Persistente (JSON) attivo su http://localhost:${PORT}`);
});