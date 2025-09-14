# Manual GitHub Upload Instructions

## Step 1: Configure Git (if not done already)
```bash
git config --global user.name "salmanajju2"
git config --global user.email "your-email@example.com"
```

## Step 2: Initialize and Upload to GitHub
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: ALI ENTERPRISES with Firebase authentication"

# Set main branch
git branch -M main

# Add remote origin
git remote add origin https://github.com/salmanajju2/aa.git

# Push to GitHub (you'll need to authenticate)
git push -u origin main
```

## Step 3: Alternative - GitHub Desktop
1. Download GitHub Desktop from: https://desktop.github.com/
2. Sign in with your GitHub account
3. Click "Add an Existing Repository from your Hard Drive"
4. Select this folder: c:\Users\hp\Downloads\ali-enterprises
5. Publish repository to GitHub

## Step 4: After Upload - Deploy to Vercel
1. Go to https://vercel.com/
2. Sign in with GitHub
3. Import your repository: salmanajju2/aa
4. Configure environment variables:
   - VITE_FIREBASE_API_KEY=AIzaSyDcvA8qcEheap8YkhCboRhTrFx0KYTwaCU
   - VITE_FIREBASE_AUTH_DOMAIN=ali-enterprises-82dad.firebaseapp.com
   - VITE_FIREBASE_PROJECT_ID=ali-enterprises-82dad
   - VITE_FIREBASE_STORAGE_BUCKET=ali-enterprises-82dad.firebasestorage.app
   - VITE_FIREBASE_MESSAGING_SENDER_ID=714914859297
   - VITE_FIREBASE_APP_ID=1:714914859297:web:acb723ed92e0dbf819d660
   - VITE_FIREBASE_MEASUREMENT_ID=G-0KTNHK0NDD
5. Deploy!

## Troubleshooting
- If push fails, you might need to authenticate with GitHub
- Use Personal Access Token instead of password
- Or use SSH key authentication