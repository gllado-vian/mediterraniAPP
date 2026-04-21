# Mediterranean Meal App - Development Environment Setup Guide

**Team:** Olga Garcia + Claude Code  
**Tech Stack:** React Native + Firebase + GitHub  
**Development Machine:** Mac mini  
**IDE:** VS Code (with Xcode CLI tools)  
**Testing:** iOS Simulator (free)  

**Setup Time:** ~2-3 hours (first time setup)

---

## PHASE 1: VERIFY & INSTALL PREREQUISITES

### Step 1.1: Verify Current Installation

You already have:
```bash
✓ Node.js v18.14.2
✓ npm v9.6.0
✓ GitHub account
```

Verify these are working:
```bash
node --version     # Should show v18.14.2
npm --version      # Should show 9.6.0
git --version      # Should show git version
```

### Step 1.2: Install Xcode Command Line Tools

Required for iOS development (includes iOS Simulator).

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify installation (this will take a few minutes)
xcode-select --print-path
# Should output: /Applications/Xcode.app/Xcode.app/Contents/Developer
# (or similar path)
```

**What you're installing:**
- Xcode simulators
- Swift compiler
- iOS build tools
- Git tools

**Time:** 10-15 minutes

### Step 1.3: Install Homebrew (Optional but Recommended)

Package manager for Mac - useful for managing dependencies.

```bash
# Check if Homebrew is installed
brew --version

# If not installed, install it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Verify
brew --version
```

---

## PHASE 2: SETUP VS CODE

### Step 2.1: Install/Verify VS Code

If you don't have VS Code:
```bash
# Using Homebrew (if installed)
brew install visual-studio-code

# OR download from: https://code.visualstudio.com/
```

Verify:
```bash
code --version
```

### Step 2.2: Install Recommended VS Code Extensions

Open VS Code and install these extensions:

1. **ES7+ React/Redux/React-Native snippets**
   - Author: dsznajder
   - ID: `dsznajder.es7-react-js-snippets`

2. **React Native Tools**
   - Author: Microsoft
   - ID: `msjsdiag.vscode-react-native`

3. **Firebase Explorer**
   - Author: jsayol
   - ID: `jsayol.firebase-explorer`

4. **Prettier - Code formatter**
   - Author: Prettier
   - ID: `esbenp.prettier-vscode`

5. **Thunder Client** (for testing APIs)
   - Author: Ranga Vadass
   - ID: `rangav.vscode-thunder-client`

**Install Method:**
- Open VS Code
- Go to Extensions (Cmd + Shift + X)
- Search for extension name
- Click Install

Or install from command line:
```bash
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension msjsdiag.vscode-react-native
code --install-extension jsayol.firebase-explorer
code --install-extension esbenp.prettier-vscode
code --install-extension rangav.vscode-thunder-client
```

### Step 2.3: Configure VS Code Settings (Optional but Recommended)

Create `.vscode/settings.json` in your project root:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "search.exclude": {
    "**/node_modules": true,
    ".git": true
  }
}
```

---

## PHASE 3: SETUP GITHUB REPOSITORY

### Step 3.1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `mediterranean-meal-app`
3. Description: "Mediterranean meal planning app with React Native + Firebase"
4. Choose: **Private** (team only) or **Public** (open source)
5. **Initialize with:**
   - ✓ Add a README file
   - ✓ Add .gitignore (select: Node)
   - ✓ Add a license (MIT)
6. Click "Create repository"

### Step 3.2: Clone Repository to Your Mac

```bash
# Navigate to where you want the project
cd ~/Projects  # or your preferred location

# Clone the repository
git clone https://github.com/YOUR_USERNAME/mediterranean-meal-app.git

# Navigate into project
cd mediterranean-meal-app

# Verify you're on main branch
git branch
```

### Step 3.3: Create Initial Folder Structure

```bash
# From project root: mediterranean-meal-app/

# Create folders
mkdir -p src/{screens,components,services,utils,styles}
mkdir docs
mkdir config

# Create initial files
touch src/screens/.gitkeep
touch src/components/.gitkeep
touch src/services/.gitkeep
touch src/utils/.gitkeep
touch src/styles/.gitkeep
touch config/.gitkeep
touch docs/DEVELOPMENT.md

# Create .env.example (template for environment variables)
touch .env.example
```

### Step 3.4: Create .gitignore

If not already created, add this to `.gitignore`:

```
# React Native
node_modules/
.gradle
.m2repository/
.idea
.gradle
local.properties
*.iml
*.apk
*.ap_
*.dex
*.class
build/
.buckconfig
buck-out/
\.buckd/

# iOS
ios/Pods
ios/Podfile.lock
Pods/
*.pbxuser
*.mode1v3
xcuserdata/
*.xcworkspace/xcuserdata/
DerivedData/
.DS_Store

# Android
.idea
android/.gradle
android/.idea
android/local.properties
android/*.iml
android/app/debug
android/app/release

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/settings.json
.DS_Store
*.swp
*.swo
*~

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Build
dist/
build/
```

### Step 3.5: First Git Commit

```bash
# Add all files
git add .

# Commit
git commit -m "chore: initial project setup with folder structure"

# Push to GitHub
git push origin main

# Verify on GitHub (refresh page)
```

---

## PHASE 4: SETUP REACT NATIVE PROJECT

### Step 4.1: Initialize React Native Project with Expo

Expo is the easiest way to start React Native (handles iOS/Android builds automatically).

```bash
# From your project root
# Download and run the setup script (interactive)
npx create-expo-app@latest .

# This creates the project in current directory
# The . means "current folder"
```

**What gets created:**
- `app.json` - App configuration
- `package.json` - Dependencies
- `App.js` - Main entry point
- `node_modules/` - Dependencies folder
- `.gitignore` - Already configured

**Time:** 3-5 minutes (depends on internet speed)

### Step 4.2: Verify React Native Installation

```bash
# Check that files were created
ls -la

# Should show:
# - app.json
# - App.js
# - package.json
# - node_modules/
# - etc.

# Verify npm packages installed
npm list react-native
npm list expo
```

### Step 4.3: Add Essential Packages

```bash
# Navigation (routing between screens)
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# Firebase (database, auth)
npm install firebase @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore

# State Management (Context API - built-in, but good to have Redux if needed later)
# For MVP, we'll use React Context, so no package needed yet

# UI Components
npm install react-native-paper

# Async Storage (local data)
npm install @react-native-async-storage/async-storage

# Utilities
npm install axios lodash moment

# Linting & Formatting
npm install --save-dev eslint prettier eslint-config-prettier
```

**Total installation time:** 5-10 minutes

### Step 4.4: Verify Package Installation

```bash
# Check package.json was updated
cat package.json | grep dependencies

# Verify node_modules has packages
ls node_modules | grep react-native
ls node_modules | grep firebase
```

---

## PHASE 5: SETUP FIREBASE PROJECT

### Step 5.1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Create a project"
3. Project name: `mediterranean-meal-app`
4. Accept Firebase terms
5. **Disable Google Analytics** (not needed for MVP)
6. Click "Create project"

**Time to create:** 2-3 minutes

### Step 5.2: Create Firebase Web App

1. In Firebase Console, click the **</>** (Web) icon
2. App nickname: `mediterranean-meal-web`
3. Check "Also set up Firebase Hosting for this app" (optional, we'll use it for web version later)
4. Click "Register app"

### Step 5.3: Copy Firebase Config

You'll see a code block like:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

**Save this somewhere safe!** You'll need it in the next step.

### Step 5.4: Create Firebase Config File

Create a new file in your project:

```bash
# From project root
touch config/firebaseConfig.js
```

Add your Firebase credentials:

```javascript
// config/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
```

### Step 5.5: Create .env.example File

For team security, don't commit real credentials. Create a template:

```bash
# Create .env.example (template only, no real values)
cat > .env.example << 'EOF'
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EOF
```

### Step 5.6: Create Actual .env File (Local Only)

```bash
# Create .env (NOT committed to git)
cat > .env << 'EOF'
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
EOF
```

**Important:** `.env` is in `.gitignore` and won't be committed (keep credentials safe!)

### Step 5.7: Enable Firebase Services

Go to Firebase Console and enable:

1. **Authentication**
   - Click "Authentication" in left menu
   - Click "Get started"
   - Enable "Email/Password" provider
   - Enable "Anonymous" (for testing)

2. **Firestore Database**
   - Click "Firestore Database"
   - Click "Create database"
   - Start in "Test mode" (we'll secure later)
   - Choose region: `us-central1`
   - Click "Create"

3. **Firestore Security Rules (for development)**
   - Go to "Rules" tab
   - Replace with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read/write to all users (development only!)
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Click "Publish"

**IMPORTANT:** These rules are for development only. Before going to production, we'll make them secure.

---

## PHASE 6: TEST REACT NATIVE SETUP

### Step 6.1: Create Test App Component

Replace `App.js` with:

```javascript
// App.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { auth, db } from './config/firebaseConfig';

export default function App() {
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  useEffect(() => {
    // Test Firebase connection
    try {
      console.log('Firebase initialized successfully');
      console.log('Auth:', auth.currentUser ? 'Connected' : 'Not connected');
      console.log('Firestore:', db ? 'Connected' : 'Not connected');
      setFirebaseConnected(true);
    } catch (error) {
      console.error('Firebase error:', error);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mediterranean Meal App</Text>
      <Text style={styles.subtitle}>Development Setup</Text>
      
      <View style={styles.statusBox}>
        <Text style={styles.label}>Firebase Status:</Text>
        <Text style={[styles.status, firebaseConnected && styles.statusOk]}>
          {firebaseConnected ? '✓ Connected' : '✗ Not Connected'}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.info}>Environment ready for development!</Text>
        <Text style={styles.info}>Press the Home button to reload.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d6a4f',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  statusBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  statusOk: {
    color: '#4CAF50',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
  },
  info: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
});
```

### Step 6.2: Start iOS Simulator

```bash
# From project root
# Start the development server
npm start

# Or use Expo CLI directly
expo start

# This will show a menu like:
# › Press i to open iOS Simulator
# › Press a to open Android Emulator
# › Press w to open web
# › Press r to reload
# › Press q to quit
```

Press **i** to open iOS Simulator.

### Step 6.3: Verify App Works

You should see:
1. iOS Simulator opens (takes 30-60 seconds first time)
2. App loads in simulator
3. Green checkmark: "✓ Connected" under Firebase Status
4. No red errors in terminal

**Troubleshooting:**
- If simulator doesn't open: `xcode-select --install` (check Step 1.2)
- If Firebase shows "✗ Not Connected": Check firebaseConfig.js has correct credentials
- If bundle errors: Delete `node_modules` and run `npm install` again

---

## PHASE 7: CREATE INITIAL PROJECT STRUCTURE

### Step 7.1: Create Folder Structure

```bash
# From project root
mkdir -p src/{screens,components,services,utils,styles,navigation}
mkdir -p config
mkdir -p docs

# Create initial files
touch src/screens/.gitkeep
touch src/components/.gitkeep
touch src/services/.gitkeep
touch src/navigation/.gitkeep
```

### Step 7.2: Create Initial Service Files

**Firebase Service:**

```bash
# Create src/services/firebaseService.js
```

```javascript
// src/services/firebaseService.js
import { auth, db } from '../../config/firebaseConfig';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

export const authService = {
  // Sign up
  signUp: async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Sign in
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  // Monitor auth state
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

export default authService;
```

**Meal Service:**

```bash
# Create src/services/mealService.js
```

```javascript
// src/services/mealService.js
import { db } from '../../config/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

export const mealService = {
  // Create meal
  createMeal: async (teamId, userId, mealData) => {
    try {
      const mealsRef = collection(db, 'meals');
      const docRef = await addDoc(mealsRef, {
        ...mealData,
        team_id: teamId,
        created_by: userId,
        created_at: serverTimestamp(),
        times_cooked: 0,
        last_cooked: null
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating meal:', error);
      throw error;
    }
  },

  // Get all team meals
  getTeamMeals: async (teamId) => {
    try {
      const mealsRef = collection(db, 'meals');
      const q = query(
        mealsRef,
        where('team_id', '==', teamId),
        orderBy('name')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting meals:', error);
      throw error;
    }
  },

  // Log meal cooked
  logMealCooked: async (mealId, userId, teamId, rating = null) => {
    try {
      const historyRef = collection(db, 'meal_history');
      await addDoc(historyRef, {
        meal_id: mealId,
        cooked_by: userId,
        team_id: teamId,
        cooked_date: serverTimestamp(),
        rating: rating,
        notes: ''
      });

      // Update meal stats
      const mealRef = doc(db, 'meals', mealId);
      await updateDoc(mealRef, {
        times_cooked: increment(1),
        last_cooked: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging meal:', error);
      throw error;
    }
  }
};

export default mealService;
```

### Step 7.3: Create Custom Hooks

```bash
# Create src/utils/useAuth.js
```

```javascript
// src/utils/useAuth.js
import { useState, useEffect } from 'react';
import authService from '../services/firebaseService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
```

### Step 7.4: Git Commit

```bash
# Add all new files
git add .

# Commit
git commit -m "feat: setup React Native project structure and Firebase services"

# Push to GitHub
git push origin main
```

---

## PHASE 8: SETUP TEAM DEVELOPMENT WORKFLOW

### Step 8.1: Create Development Documentation

Create `docs/DEVELOPMENT.md`:

```markdown
# Development Guide

## Starting Development

1. Pull latest code:
   \`\`\`bash
   git pull origin main
   \`\`\`

2. Install dependencies (if needed):
   \`\`\`bash
   npm install
   \`\`\`

3. Start the app:
   \`\`\`bash
   npm start
   \`\`\`

4. Press \`i\` for iOS Simulator

## Git Workflow

### Before Starting Work

1. Create a feature branch:
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

2. Make your changes

3. Commit regularly:
   \`\`\`bash
   git add .
   git commit -m "type: description"
   # Types: feat, fix, docs, style, refactor, test, chore
   \`\`\`

4. Push to GitHub:
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

5. Create Pull Request on GitHub
6. Merge after review

### Naming Convention

Branches:
- Feature: \`feature/home-screen\`
- Fix: \`fix/auth-bug\`
- Docs: \`docs/setup-guide\`

Commits:
- \`feat: add meal suggestion engine\`
- \`fix: prevent 7-day rule bypass\`
- \`docs: add deployment guide\`
```

### Step 8.2: Create Code Style Guide

Create `docs/CODE_STYLE.md`:

```markdown
# Code Style Guide

## JavaScript/React Native

### File Organization

\`\`\`javascript
// 1. Imports
import React, { useState } from 'react';
import { View, Text } from 'react-native';

// 2. Constants
const MAX_MEALS = 100;

// 3. Component
export default function MealCard({ meal }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <View>
      <Text>{meal.name}</Text>
    </View>
  );
}

// 4. Styles
const styles = StyleSheet.create({
  container: { flex: 1 }
});
\`\`\`

### Naming Conventions

- Files: \`camelCase.js\`
- Components: \`PascalCase\`
- Functions: \`camelCase\`
- Constants: \`SCREAMING_SNAKE_CASE\`
- CSS classes: \`kebab-case\`

### Comments

\`\`\`javascript
// Single line comments for clarity
// Multi-line comments for complex logic
\`\`\`

### Formatting

Use Prettier (auto-format on save):
\`\`\`bash
npm run format
\`\`\`
```

### Step 8.3: Create .env Template

Create `.env.local.example`:

```
# Copy this file to .env.local and fill in your values
# .env.local is in .gitignore and won't be committed

EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
```

### Step 8.4: Final Git Setup

```bash
# Add documentation
git add docs/
git add config/

# Commit
git commit -m "docs: add development guide and code style"

# Push
git push origin main

# Create a main branch protection rule (on GitHub):
# - Go to Settings > Branches
# - Add rule for "main"
# - Require pull request reviews
# - Require status checks to pass
```

---

## PHASE 9: QUICK REFERENCE - COMMON COMMANDS

### Daily Development

```bash
# Start development
npm start

# Open iOS Simulator (during npm start)
Press i

# Reload app (in simulator)
Press r

# Clear cache and restart
npm start -- --clear

# Install new package
npm install package-name

# Format code
npx prettier --write .

# Test Firebase connection
npm start
# Check console logs for Firebase status
```

### Git Commands

```bash
# Create and switch to feature branch
git checkout -b feature/my-feature

# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "type: description"

# Push to GitHub
git push origin feature/my-feature

# Pull latest
git pull origin main

# Switch branches
git checkout main
```

### Terminal Navigation

```bash
# Navigate to project
cd ~/Projects/mediterranean-meal-app

# List files
ls -la

# Remove node_modules (if needed)
rm -rf node_modules

# Reinstall
npm install

# View Firebase config
cat config/firebaseConfig.js
```

---

## PHASE 10: TROUBLESHOOTING

### Problem: iOS Simulator won't open

**Solution:**
```bash
# Install Xcode CLI tools
xcode-select --install

# Reset simulator
xcrun simctl erase all

# Try again
npm start
# Press i
```

### Problem: Firebase shows "Not Connected"

**Check:**
1. Verify firebaseConfig.js has correct credentials
2. Check .env file has EXPO_PUBLIC_ prefix
3. Verify Firebase project has Firestore enabled
4. Check Firestore security rules are published

### Problem: Git push rejected

**Solution:**
```bash
# Pull first
git pull origin main

# Resolve conflicts if any
# Then push
git push origin feature/branch-name
```

### Problem: npm install fails

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules

# Reinstall
npm install
```

### Problem: Simulator is slow

**Solution:**
```bash
# Restart simulator
xcrun simctl shutdown all
xcrun simctl erase all

# Restart npm
Ctrl+C
npm start
```

---

## PHASE 11: NEXT STEPS AFTER SETUP

Once setup is complete:

1. ✅ Run through this guide with your team
2. ✅ Verify everyone can start the app
3. ✅ Confirm Firebase is connected
4. ✅ Make test git commits
5. ✅ Schedule first development week

**You're ready to start Week 1 tasks:**
- [ ] Authentication (signup/login)
- [ ] User profiles
- [ ] Team creation
- [ ] Home screen

---

## SETUP CHECKLIST

Use this checklist to verify everything is ready:

### Pre-Setup
- [ ] Node.js v18.14.2 installed
- [ ] npm v9.6.0 installed
- [ ] GitHub account created
- [ ] VS Code installed

### Phase 1-2: Prerequisites
- [ ] Xcode CLI tools installed
- [ ] Homebrew installed (optional)
- [ ] VS Code extensions installed
- [ ] VS Code settings configured

### Phase 3: GitHub
- [ ] Repository created on GitHub
- [ ] Repository cloned locally
- [ ] Folder structure created
- [ ] First commit pushed

### Phase 4-5: React Native & Firebase
- [ ] React Native project created
- [ ] All npm packages installed
- [ ] Firebase project created
- [ ] Firebase web app registered
- [ ] Firestore database created
- [ ] Authentication enabled
- [ ] .env file created with credentials

### Phase 6-7: Testing & Services
- [ ] App runs in iOS Simulator
- [ ] Firebase connection verified
- [ ] Service files created
- [ ] Custom hooks created

### Phase 8-9: Team Setup
- [ ] Documentation written
- [ ] Code style guide created
- [ ] .env.example created
- [ ] All commits pushed to GitHub

### Phase 10-11: Ready
- [ ] Team can clone and run app
- [ ] Firebase credentials working
- [ ] Git workflow understood
- [ ] Troubleshooting guide reviewed

---

**Status:** Ready for Week 1 Development! 🚀

**Team Contact:**
- Olga Garcia
- Claude Code

**Last Updated:** April 21, 2026
