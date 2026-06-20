const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurazione dei permessi (CORS) e lettura JSON
app.use(cors({ origin: 'http://localhost:4200', credentials: true }));
app.use(express.json());

// Configurazione del collegamento a PostgreSQL usando il file .env
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// TEST IMMEDIATO DI CONNESSIONE
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error("Errore di connessione al database:", err.message);
    } else {
        console.log("Connessione a PostgreSQL riuscita! Il database risponde correttamente.");
    }
});

// --- 1. API REGISTRAZIONE ---
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username e password sono richiesti.' });
    }

    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Questo nome utente è già registrato.' });
        }

        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
        console.log(`Nuovo utente registrato nel DB: ${username}`);
        return res.json({ message: 'Registrazione completata con successo!' });
    } catch (error) {
        console.error("Errore durante la registrazione:", error.message);
        return res.status(500).json({ error: 'Errore interno del server.' });
    }
});

// --- 2. API LOGIN ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username e password richiesti.' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND password = $2', [username, password]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenziali errate o utente non registrato.' });
        }

        console.log(`Login effettuato con successo da: ${username}`);
        return res.json({ message: 'Login autorizzato', username: result.rows[0].username });
    } catch (error) {
        console.error("Errore durante il login:", error.message);
        return res.status(500).json({ error: 'Errore durante il login.' });
    }
});

// --- 3. API SALVA PARTITA (IN CORSO) ---
app.post('/api/game/save', async (req, res) => {
    const gameState = req.body;
    const username = gameState.username;

    if (!username) {
        return res.status(400).json({ error: 'Username mancante nello stato del gioco.' });
    }

    try {
        const queryText = `
            INSERT INTO games (username, game_data) 
            VALUES ($1, $2) 
            ON CONFLICT (username) 
            DO UPDATE SET game_data = EXCLUDED.game_data;
        `;
        await pool.query(queryText, [username, JSON.stringify(gameState)]);
        console.log(`Partita salvata nel DB per l'utente: ${username}`);
        return res.json({ message: 'Stato della partita salvato con successo.' });
    } catch (error) {
        console.error("Errore nel salvataggio della partita:", error.message);
        return res.status(500).json({ error: 'Errore nel salvataggio dei dati.' });
    }
});

// --- 4. API CARICA PARTITA ---
app.get('/api/game/load/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const result = await pool.query('SELECT game_data FROM games WHERE LOWER(username) = LOWER($1)', [username]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Nessuna partita in corso trovata per questo utente.' });
        }

        console.log(`Partita caricata dal DB per l'utente: ${username}`);
        return res.json(result.rows[0].game_data);
    } catch (error) {
        console.error("Errore nel caricamento della partita:", error.message);
        return res.status(500).json({ error: 'Errore nel recupero dei dati.' });
    }
});

// --- 5. API CANCELLA PARTITA ---
app.delete('/api/game/clear/:username', async (req, res) => {
    const username = req.params.username;

    try {
        await pool.query('DELETE FROM games WHERE LOWER(username) = LOWER($1)', [username]);
        console.log(`Partita attiva rimossa dal DB per l'utente: ${username}`);
        return res.json({ message: 'Partita attiva resettata.' });
    } catch (error) {
        console.error("Errore nella cancellazione della partita:", error.message);
        return res.status(500).json({ error: 'Errore nella cancellazione.' });
    }
});

// --- 6. API SALVA PARTITA CONCLUSA (STORICO NUOVO REGOLE) ---
app.post('/api/game/finish', async (req, res) => {
    const { username, dettagli } = req.body;

    if (!username || !dettagli) {
        return res.status(400).json({ error: 'Dati incompleti per salvare la partita.' });
    }

    try {
        // Estraiamo i campi direttamente dall'oggetto passato da Angular
        const { category, title, attempts, time, won, previewText } = dettagli;

        const queryText = `
            INSERT INTO match_history (username, category, title, attempts, time_spent, won, preview_text) 
            VALUES ($1, $2, $3, $4, $5, $6, $7);
        `;
        
        await pool.query(queryText, [
            username, 
            category || '', 
            title || 'Titolo Sconosciuto', 
            attempts || 0, 
            time || '00:00', 
            won ?? false, 
            previewText || ''
        ]);

        console.log(`🏁 Partita di [${username}] salvata nello storico SQL. Esito: ${won ? 'VINTA' : 'PERSA'}`);
        return res.json({ message: 'Partita archiviata nello storico con successo!' });
    } catch (error) {
        console.error("Errore nel salvataggio dello storico:", error.message);
        return res.status(500).json({ error: 'Errore interno del server durante il salvataggio.' });
    }
});

// --- 7. API LEADERBOARD / CRONOLOGIA (STORICO COMPLETO STRUTTURATO) ---
app.get('/api/leaderboard', async (req, res) => {
    try {
        const queryText = `
            SELECT id, username, category, title, attempts, time_spent, won, preview_text, data_partita
            FROM match_history
            ORDER BY data_partita DESC;
        `;
        const result = await pool.query(queryText);
        return res.json(result.rows);
    } catch (error) {
        console.error("Errore nel recupero della classifica strutturata:", error.message);
        return res.status(500).json({ error: 'Errore nel recupero dei dati storici.' });
    }
});

// --- 8. API AZZERA CLASSIFICA (NUOVA) ---
app.delete('/api/leaderboard/clear', async (req, res) => {
    try {
        // Elimina fisicamente tutti i record dalla tabella dello storico
        await pool.query('DELETE FROM match_history;');
        console.log('Classifica azzerata con successo nel database PostgreSQL.');
        return res.status(200).json({ message: 'Classifica azzerata con successo nel database.' });
    } catch (error) {
        console.error("Errore durante l'azzeramento della classifica:", error.message);
        return res.status(500).json({ error: 'Errore interno del server durante la cancellazione.' });
    }
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server Persistente (PostgreSQL) attivo su http://localhost:${PORT}`);
});