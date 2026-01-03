# E-Voting System

Sistem e-voting berbasis Hyperledger Fabric (JavaScript)

## Struktur Folder

- `chaincode-javascript/` — Chaincode (smart contract) untuk Hyperledger Fabric
- `backend/` — Backend REST API (Node.js/Express)
- `frontend/` — Frontend sederhana (HTML, CSS, JS)

---

## Cara Menjalankan Backend

1. **Masuk ke folder backend:**
   ```bash
   cd e-voting-system/backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Pastikan file `.env` sudah benar** (lihat contoh di backend/.env)
4. **Jalankan backend:**
   ```bash
   node app.js
   # atau untuk development (auto-reload):
   npx nodemon app.js
   ```
5. **Backend berjalan di** `http://localhost:3001`

---

## Cara Menjalankan Frontend

1. **Masuk ke folder frontend:**
   ```bash
   cd e-voting-system/frontend
   ```
2. **Buka file `index.html` di browser**
   - Bisa langsung klik dua kali, atau
   - Jalankan server lokal (opsional):
     ```bash
     npx serve -l 3002 .
     # atau
     python3 -m http.server 3002
     ```
   - Akses di `http://localhost:3002` (jika pakai server lokal)

---

## Catatan
- Pastikan backend sudah berjalan sebelum membuka frontend.
- Pastikan backend sudah terhubung ke jaringan Hyperledger Fabric dan chaincode sudah diinstal & diinstansiasi.
- Endpoint API backend dapat diubah di file `frontend/main.js` jika port/backend berbeda.
