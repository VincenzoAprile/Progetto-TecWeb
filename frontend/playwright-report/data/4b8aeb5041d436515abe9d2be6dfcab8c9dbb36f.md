# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wikiblank.spec.ts >> 8. Interazione con il campo inserimento Parola in partita
- Location: tests\wikiblank.spec.ts:91:5

# Error details

```
TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('#word-guess') to be visible

```

# Page snapshot

```yaml
- generic [ref=e6]:
  - generic [ref=e7]:
    - heading "Scegli una Categoria" [level=2] [ref=e8]
    - paragraph [ref=e9]: Seleziona un pool di pagine da Wikipedia per iniziare la sfida
  - generic [ref=e10]:
    - button "Videogiochi" [ref=e11] [cursor=pointer]
    - button "Serie Animate" [ref=e12] [cursor=pointer]
    - button "Programmazione" [ref=e13] [cursor=pointer]
  - button "Torna al Menu" [ref=e14] [cursor=pointer]
```

# Test source

```ts
  3   | test('1. Apertura corretta della pagina di login ed elementi principali', async ({ page }) => {
  4   |   await page.goto('/');
  5   |   await page.waitForLoadState('networkidle');
  6   |   await expect(page.locator('#user-input')).toBeVisible();
  7   |   await expect(page.locator('#pass-input')).toBeVisible();
  8   |   await expect(page.locator('.btn-submit')).toBeVisible();
  9   | });
  10  | 
  11  | test('2. Passaggio dinamico alla modalità Registrazione', async ({ page }) => {
  12  |   await page.goto('/');
  13  |   await page.waitForLoadState('networkidle');
  14  |   await page.locator('.toggle-link').click();
  15  |   await expect(page.locator('h2')).toContainText('Crea un Account');
  16  | });
  17  | 
  18  | test('3. Attivazione dei validatori Angular al click su campi vuoti', async ({ page }) => {
  19  |   await page.goto('/');
  20  |   await page.waitForLoadState('networkidle');
  21  |   await page.locator('.btn-submit').click();
  22  |   await expect(page.locator('.error-message').first()).toBeVisible();
  23  | });
  24  | 
  25  | test('4. Accesso riuscito con credenziali reali e superamento del login', async ({ page }) => {
  26  |   await page.goto('/');
  27  |   await page.waitForLoadState('networkidle');
  28  |   
  29  |   // Inseriamo le tue credenziali reali
  30  |   await page.locator('#user-input').fill('mike');
  31  |   await page.locator('#pass-input').fill('1234');
  32  |   await page.waitForTimeout(200);
  33  | 
  34  |   // Clicchiamo su "Inizia la sessione" per fare il login vero
  35  |   await page.locator('.btn-submit').click();
  36  |   await page.waitForTimeout(1500);
  37  |   
  38  |   const bodyText = await page.locator('body').innerText();
  39  |   expect(bodyText).not.toContain("Accedi all'App");
  40  | });
  41  | 
  42  | test('5. Navigazione verso la schermata di scelta categoria', async ({ page }) => {
  43  |   await page.goto('/');
  44  |   await page.waitForLoadState('networkidle');
  45  |   await page.locator('#user-input').fill('mike');
  46  |   await page.locator('#pass-input').fill('1234');
  47  |   await page.locator('.btn-submit').click();
  48  |   
  49  |   // Aspetta che la login card sparisca dal DOM prima di cercare il menu
  50  |   await page.waitForSelector('.login-card', { state: 'detached', timeout: 5000 });
  51  | 
  52  |   // Clicca sul pulsante del Menu Principale usando il testo reale
  53  |   const menuPlayBtn = page.locator('button', { hasText: /gioca|nuova partita|inizia|avvia/i }).first();
  54  |   await menuPlayBtn.click();
  55  |   await page.waitForTimeout(1000);
  56  | 
  57  |   await expect(page.locator('h2')).toContainText('Scegli una Categoria');
  58  | });
  59  | 
  60  | test('6. Attivazione del Loader Wikipedia al click su una categoria', async ({ page }) => {
  61  |   await page.goto('/');
  62  |   await page.waitForLoadState('networkidle');
  63  |   await page.locator('#user-input').fill('mike');
  64  |   await page.locator('#pass-input').fill('1234');
  65  |   await page.locator('.btn-submit').click();
  66  |   await page.waitForSelector('.login-card', { state: 'detached', timeout: 5000 });
  67  |   
  68  |   await page.locator('button', { hasText: /gioca|nuova partita|inizia|avvia/i }).first().click();
  69  |   await page.waitForTimeout(1000);
  70  | 
  71  |   await page.locator('.btn-games').click();
  72  |   await expect(page.locator('.sub-loader')).toContainText("Sto estraendo un articolo a sorte per te");
  73  | });
  74  | 
  75  | test('7. Caricamento della schermata Fase di Gioco e statistiche', async ({ page }) => {
  76  |   await page.goto('/');
  77  |   await page.waitForLoadState('networkidle');
  78  |   await page.locator('#user-input').fill('mike');
  79  |   await page.locator('#pass-input').fill('1234');
  80  |   await page.locator('.btn-submit').click();
  81  |   await page.waitForSelector('.login-card', { state: 'detached', timeout: 5000 });
  82  |   
  83  |   await page.locator('button', { hasText: /gioca|nuova partita|inizia|avvia/i }).first().click();
  84  |   await page.waitForTimeout(1000);
  85  |   await page.locator('.btn-games').click();
  86  | 
  87  |   await page.waitForSelector('.game-stats', { timeout: 15000 });
  88  |   await expect(page.locator('h2')).toContainText('Fase di Gioco');
  89  | });
  90  | 
  91  | test('8. Interazione con il campo inserimento Parola in partita', async ({ page }) => {
  92  |   await page.goto('/');
  93  |   await page.waitForLoadState('networkidle');
  94  |   await page.locator('#user-input').fill('mike');
  95  |   await page.locator('#pass-input').fill('1234');
  96  |   await page.locator('.btn-submit').click();
  97  |   await page.waitForSelector('.login-card', { state: 'detached', timeout: 5000 });
  98  |   
  99  |   await page.locator('button', { hasText: /gioca|nuova partita|inizia|avvia/i }).first().click();
  100 |   await page.waitForTimeout(1000);
  101 |   await page.locator('.btn-games').click();
  102 | 
> 103 |   await page.waitForSelector('#word-guess', { timeout: 15000 });
      |              ^ TimeoutError: page.waitForSelector: Timeout 15000ms exceeded.
  104 |   await page.locator('#word-guess').fill('computer');
  105 |   await page.locator('.btn-submit').click();
  106 | });
  107 | 
  108 | test('9. Interazione con il campo Risoluzione Titolo', async ({ page }) => {
  109 |   await page.goto('/');
  110 |   await page.waitForLoadState('networkidle');
  111 |   await page.locator('#user-input').fill('mike');
  112 |   await page.locator('#pass-input').fill('1234');
  113 |   await page.locator('.btn-submit').click();
  114 |   await page.waitForSelector('.login-card', { state: 'detached', timeout: 5000 });
  115 |   
  116 |   await page.locator('button', { hasText: /gioca|nuova partita|inizia|avvia/i }).first().click();
  117 |   await page.waitForTimeout(1000);
  118 |   await page.locator('.btn-games').click();
  119 | 
  120 |   await page.waitForSelector('#title-guess', { timeout: 15000 });
  121 |   await page.locator('#title-guess').fill('Minecraft');
  122 |   await expect(page.locator('.btn-victory')).toBeVisible();
  123 | });
  124 | 
  125 | test('10. Funzionamento del bottone Abbandona e comparsa risultati', async ({ page }) => {
  126 |   await page.goto('/');
  127 |   await page.waitForLoadState('networkidle');
  128 |   await page.locator('#user-input').fill('mike');
  129 |   await page.locator('#pass-input').fill('1234');
  130 |   await page.locator('.btn-submit').click();
  131 |   await page.waitForSelector('.login-card', { state: 'detached', timeout: 5000 });
  132 |   
  133 |   await page.locator('button', { hasText: /gioca|nuova partita|inizia|avvia/i }).first().click();
  134 |   await page.waitForTimeout(1000);
  135 |   await page.locator('.btn-games').click();
  136 | 
  137 |   await page.waitForSelector('.btn-abandon', { timeout: 15000 });
  138 |   
  139 |   page.once('dialog', async dialog => {
  140 |     await dialog.accept();
  141 |   });
  142 | 
  143 |   await page.locator('.btn-abandon').click();
  144 |   await page.waitForSelector('app-game-result', { timeout: 4000 });
  145 |   await expect(page.locator('app-game-result')).toBeVisible();
  146 | });
```