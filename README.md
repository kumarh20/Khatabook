# 📒 OkCredit - Digital Udhar Bahi Khata

A modern, lightning-fast digital ledger and customer credit management web application designed for retail shops, merchants, and businesses. Built with Angular, Tailwind CSS, Material Icons, and Google Sheets 2-Way Real-time Cloud Synchronization.

---

## ✨ Features

- 👥 **Customer Management**: Add customers with phone number, address, and credit limits.
- 💰 **Udhar (Credit) & Jama (Payment)**: Instant entry of give/take transactions with date pickers, notes, and auto-balance calculation.
- 📊 **3-Tab Google Sheet Cloud Sync**:
  - `Customers` Tab: Customer IDs, names, contact numbers, addresses, and registration dates.
  - `Transactions` Tab: Complete history of debits and credits with timestamps and remarks.
  - `Settings` Tab: Shop name, owner details, UPI ID, custom uploaded QR image, and language preference.
- 📱 **Custom UPI QR Code & Standee Generator**:
  - Auto-generated UPI QR code or upload your own customized PhonePe, GPay, Paytm, or BharatPe QR code image.
  - Ready-to-print merchant counter standee.
- 🌐 **Bilingual (Hindi & English)**:
  - Instant toggle switch to change the entire app language between Hindi (हिंदी) and English.
- 📄 **PDF & Printable Statements**:
  - Generate and print customer account statements and daily ledger reports.
- 📱 **Mobile & Desktop Responsive**:
  - Optimized iOS-style touch interface with PWA and offline-first storage fallback.

---

## 🚀 Live Demo on GitHub Pages

This repository is pre-configured for **GitHub Pages** deployment:
1. Go to **Settings** > **Pages**.
2. Select **Source**: `Deploy from a branch`.
3. Choose branch: `main` (or `master`) and folder: `/ (root)` or `/docs`.
4. Click **Save** — Your app is live within 1–2 minutes!

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/okcredit-bahi-khata.git
cd okcredit-bahi-khata

# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev
# or
npm start
```

### Building for GitHub Pages
```bash
npm run build:github
```
This command compiles the Angular application and updates the `/docs` and root folders with ready-to-deploy static assets, `.nojekyll`, and `404.html`.

---

## 📊 Google Sheets Apps Script Setup

To connect your Google Sheet for 2-way cloud synchronization:

1. Open your [Google Sheet](https://sheets.new).
2. Click on **Extensions** > **Apps Script**.
3. Copy the Apps Script code from the in-app **Sheet Settings** modal (or `GOOGLE_SHEET_SETUP_GUIDE.md`).
4. Paste it into the script editor and click **Deploy** > **New deployment**.
5. Select **Web app**, set **Execute as**: *Me*, and **Who has access**: *Anyone*.
6. Copy the resulting **Web App URL** and paste it into the app's Google Sheet connection input.

---

## 📄 License
This project is open-source and available under the MIT License.
