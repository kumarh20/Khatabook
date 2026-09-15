# GitHub Pages Par Live Kaise Karein (Hosting Guide)

Aapka application GitHub Pages ke liye poori tarah tayyar (build) ho chuka hai. Is project me `index.html`, bundle files, `.nojekyll`, aur `404.html` dono jagah ready hain:
1. **Root Folder** (`/index.html`)
2. **Docs Folder** (`/docs/index.html`)

---

## Method 1: Direct GitHub Pages Setup (Sabse Aasan Tarika)

1. **AI Studio se Export karein**:
   - Upar right side menu me jakar **"Export to GitHub"** par click karein ya zip download karein.
   - Apne GitHub repository me saara code push karein.

2. **GitHub Repository Settings me jayein**:
   - Apne GitHub repository me jayein.
   - **Settings** tab par click karein.
   - Left sidebar me **Pages** (GitHub Pages) par click karein.

3. **Branch aur Folder select karein**:
   - **Source**: "Deploy from a branch" chunein.
   - **Branch**: `main` (ya `master`) chunein.
   - **Folder**:
     - Option A: `/ (root)` chunein (Kyunki root me `index.html` already available hai).
     - OR Option B: `/docs` chunein (Kyunki `/docs` folder me bhi sabhi production files ready hain).
   - **Save** button dabayein.

4. **1 se 2 minute me Live Link mil jayega**:
   - GitHub aapko link dega: `https://<username>.github.io/<repo-name>/`
   - Is link par click karte hi aapka **OkCredit - Udhar Bahi Khata** app live chalne lagega!

---

## Key Features Enabled for GitHub Pages:
- ✅ **Base Href `./` Configured**: Relative path configured hai jisse GitHub Pages ke subfolder URL par bhi CSS aur JS bina kisi 404 error ke load hoti hain.
- ✅ **404.html Added**: Direct URL refresh ya reload karne par 404 nahi aayega.
- ✅ **.nojekyll File Included**: GitHub Pages ka Jekyll parser bypass hota hai jisse sabhi files aur assets bina rukawat ke load hote hain.
- ✅ **Client-Side Google Sheet Fallback**: GitHub Pages static hosting hone ke bawajood, direct browser-to-sheet sync engine shamil hai taaki aapka data Google Sheet se bina kisi backend server ke direct sync ho sake.

---

## Future Re-Build Command (Agar code me koi badlav karein):
Agar aap aage chal kar code me koi change karte hain, toh bas ye command run karein:
```bash
npm run build:github
```
Ye automatically Angular build generate karega aur root tatha `/docs` dono jagah fresh `index.html` aur bundle files update kar dega.
