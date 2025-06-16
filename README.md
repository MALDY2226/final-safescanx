# SafeScanX

SafeScanX is an advanced malware detection system that scans uploaded files and analyzes them using hash-based and behavioral techniques. It provides real-time results and displays detected threats in a user-friendly dashboard.

---

## Features

- File hash lookup using external threat intelligence APIs
- Behavioral analysis for identifying malicious patterns
- Real-time scan results display
- Pie chart showing malicious vs. safe files
- Secure file upload and result storage using Supabase

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Supabase (Database + Storage)
- **API**: MalwareBazaar or similar threat intelligence sources

---

## How to Run

1. **Clone the repository**
   ```bash
   git clone https://github.com:MALDY2226/final-safescanx.git
   cd safescanx
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   * Create a project at [supabase.com](https://supabase.com/)
   * Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   * Create a `.env` file and add:

     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_KEY=your_anon_key
     ```

4. **Run the app**

   ```bash
   npm run dev
   ```

---

## Folder Structure

```
src/
├── components/
├── pages/
├── services/     # API and Supabase interactions
├── App.tsx
└── main.tsx
```

---

## To Do

* Improve performance of malware API calls
* Export scan report to PDF

---

## License

This project is open-source and available under the MIT License.

```

---

Let me know if you want me to:
- Replace the Supabase API setup with a local backend
- Add a demo link if you host it
- Or generate `.env.example`, `.gitignore`, or `LICENSE` file alongside
```
