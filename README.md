# 🌱 BMI+ — Smart Wellness Tracker

> **A Modern, Full-Stack Web Technology Academic Project**  
> Built with Semantic HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, and MongoDB Atlas.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Project Structure](#-project-structure)
5. [REST API Endpoints](#-rest-api-endpoints)
6. [Local Installation & Setup](#-local-installation--setup)
7. [MongoDB Atlas Setup Guide](#-mongodb-atlas-setup-guide)
8. [Render Deployment Guide](#-render-deployment-guide)
9. [Gamification, Streaks & XP System](#-gamification-streaks--xp-system)
10. [Academic Viva & Demonstration Points](#-academic-viva--demonstration-points)
11. [Medical Disclaimer](#-medical-disclaimer)

---

## 🌟 Project Overview
**BMI+** is a personalized smart wellness platform that expands standard Body Mass Index (BMI) calculations into a complete daily health dashboard. 

The application helps users build consistent healthy habits by tracking:
- **BMI & Healthy Weight Ranges** (with visual scale meters and chronological trend charts)
- **Daily Hydration** (quick-add water volumes and visual fill gauges)
- **Sleep Quality & Rest Duration** (automatic duration calculation between bedtime and wake-up)
- **Physical Activity & Workouts** (active minutes, steps, and estimated calories)
- **Mindfulness & Mood Reflections** (daily emoji reflections and personal notes)
- **Daily Goals & Checklists** (interactive checklist with XP rewards)
- **Gamification** (daily streaks, level-up XP, and unlockable milestone badges)

---

## 🚀 Key Features

- **No Frontend Framework Bloat**: Pure, semantic HTML5, modern CSS3 (Flexbox/CSS Grid/Variables), and Vanilla JavaScript DOM manipulation — ideal for academic explanation during vivas.
- **Dynamic Light & Dark Theme**: Custom CSS variable theme switcher persisted locally across sessions.
- **Secure Authentication**: JWT-based stateless authentication with password hashing using `bcryptjs`.
- **Interactive Chart.js Visualizations**: Responsive charts for BMI trends, 7-day hydration bars, sleep patterns, and multi-metric analytics.
- **Dynamic Toast & Modal System**: Smooth notifications and celebratory popups when completing goals or unlocking badges.
- **Single-Service Deployment**: Express statically serves the frontend and handles REST APIs simultaneously, making Render deployment seamless.

---

## 🛠 Technology Stack

### Frontend
- **HTML5**: Semantic tags (`<header>`, `<main>`, `<aside>`, `<nav>`, `<section>`, `<footer>`).
- **CSS3**: CSS Custom Properties (variables), Flexbox, CSS Grid, animations, and media queries for mobile/tablet responsiveness.
- **Vanilla JavaScript**: ES6+ modules, `fetch()` API, localStorage, and DOM manipulation.
- **Chart.js (via CDN)**: Responsive charts for data visualization.

### Backend
- **Node.js**: Asynchronous JavaScript runtime.
- **Express.js**: RESTful API routing, middleware, and static file hosting.
- **Mongoose**: Object Data Modeling (ODM) for MongoDB.
- **JSON Web Tokens (`jsonwebtoken`)**: Secure session authorization.
- **Bcrypt.js**: Cryptographic password hashing.
- **CORS & Dotenv**: Cross-origin requests and environment variable security.

### Database
- **MongoDB Atlas** / **Local MongoDB**: Cloud NoSQL document database.

---

## 📁 Project Structure

```
c:\axra_sem_3\wt_mp\
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js        # Register, login, session retrieval
│   │   ├── profileController.js     # User profile and setup
│   │   ├── bmiController.js         # BMI calculations and history
│   │   ├── hydrationController.js   # Water intake and weekly logs
│   │   ├── sleepController.js       # Bedtime calculations and sleep logs
│   │   ├── activityController.js    # Workouts, steps, and calories
│   │   ├── moodController.js        # Emoji check-ins and reflection logs
│   │   ├── goalController.js        # Checklist, custom goals, and toggles
│   │   ├── progressController.js    # Aggregated analytics for charts
│   │   ├── achievementController.js # Milestone badges and progress
│   │   └── dashboardController.js   # Central dashboard overview API
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT token verification
│   ├── models/
│   │   ├── User.js                  # User credentials and profile
│   │   ├── BMIRecord.js             # BMI logs
│   │   ├── Hydration.js             # Water records
│   │   ├── Sleep.js                 # Sleep records
│   │   ├── Activity.js              # Workout records
│   │   ├── Mood.js                  # Mood check-ins
│   │   ├── Goal.js                  # Daily habits/goals
│   │   └── Achievement.js           # Badges collection
│   └── utils/
│       └── gamification.js          # XP, streak, and badge evaluation engine
├── frontend/
│   ├── css/
│   │   ├── style.css                # Global CSS variables, reset, toasts, modals
│   │   ├── auth.css                 # Login, Register, Profile Setup layouts
│   │   ├── dashboard.css            # Sidebar, topbar, widgets, meters, badges
│   │   └── responsive.css           # Mobile flyout drawer and breakpoints
│   ├── js/
│   │   ├── api.js                   # Central API wrapper and token manager
│   │   ├── theme.js                 # Light/Dark mode switcher
│   │   ├── modal.js                 # Reusable toasts and celebratory popups
│   │   ├── navigation.js            # Sidebar active highlighting & mobile toggle
│   │   ├── auth.js                  # Login and register forms
│   │   ├── profile-setup.js         # Initial setup onboarding
│   │   ├── dashboard.js             # Dashboard live stats & checklist
│   │   ├── bmi.js                   # BMI calculator & line trend
│   │   ├── hydration.js             # Water bottle fill & bar chart
│   │   ├── sleep.js                 # Sleep duration calc & weekly stats
│   │   ├── activity.js              # Workout logs & duration vs goal
│   │   ├── mood.js                  # Emoji selector & reflection timeline
│   │   ├── goals.js                 # Daily checklist & custom goals
│   │   ├── progress.js              # Aggregated analytics & multi-charts
│   │   ├── achievements.js          # Badges gallery & milestones
│   │   ├── profile.js               # Profile view and edit form
│   │   └── settings.js              # Theme switcher, reminders & logout
│   ├── index.html                   # Premium landing page
│   ├── register.html                # User registration
│   ├── login.html                   # User login
│   ├── profile-setup.html           # Initial personal metrics setup
│   ├── dashboard.html               # Main authenticated wellness dashboard
│   ├── bmi.html                     # BMI calculator & category gauge
│   ├── hydration.html               # Hydration tracker
│   ├── sleep.html                   # Sleep tracker
│   ├── activity.html                # Physical activity tracker
│   ├── mood.html                    # Emotional wellbeing check-in
│   ├── goals.html                   # Goals & daily habits
│   ├── progress.html                # Progress analytics (Today/Week/Month)
│   ├── achievements.html            # Badges and XP milestones
│   ├── profile.html                 # Profile view and editor
│   └── settings.html                # Application preferences
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore list
├── package.json                     # NPM configuration
├── server.js                        # Express server entry point
└── README.md                        # Documentation
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user | Private |
| `GET` | `/api/profile` | Get user profile & baseline metrics | Private |
| `PUT` | `/api/profile` | Update profile details and goals | Private |
| `POST` | `/api/bmi` | Calculate and save new BMI measurement | Private |
| `GET` | `/api/bmi/history` | Retrieve chronological BMI logs | Private |
| `POST` | `/api/hydration` | Log water intake (ml) | Private |
| `GET` | `/api/hydration` | Get today's intake & 7-day history | Private |
| `POST` | `/api/sleep` | Log sleep bedtime & wake time | Private |
| `GET` | `/api/sleep` | Get sleep history & weekly average | Private |
| `POST` | `/api/activity` | Log workout type, duration & steps | Private |
| `GET` | `/api/activity` | Get activity summary & weekly logs | Private |
| `POST` | `/api/mood` | Save daily emoji mood check-in | Private |
| `GET` | `/api/mood` | Get today's mood & recent timeline | Private |
| `GET` | `/api/goals` | Get today's daily checklist | Private |
| `POST` | `/api/goals` | Create a custom goal | Private |
| `PUT` | `/api/goals/:id` | Toggle goal completion status | Private |
| `DELETE` | `/api/goals/:id` | Delete custom goal | Private |
| `GET` | `/api/progress` | Aggregated analytics (Today/Week/Month) | Private |
| `GET` | `/api/achievements` | Badges gallery and unlock status | Private |
| `GET` | `/api/dashboard` | Main aggregated dashboard overview | Private |

---

## 💻 Local Installation & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally OR a free MongoDB Atlas connection string.

### 2. Clone / Open Project Directory
```bash
cd c:\axra_sem_3\wt_mp
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root folder (or edit the generated `.env`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bmi_plus_db
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

### 5. Start the Application
For production/standard mode:
```bash
npm start
```
For auto-reloading development mode:
```bash
npm run dev
```

### 6. Access in Browser
Open your browser and navigate to:
```
http://localhost:5000
```

---

## ☁️ MongoDB Atlas Setup Guide

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g., `bmi_admin`) with a secure password.
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`) for cloud deployment.
5. In **Database Deployment**, click **Connect** -> **Drivers** (Node.js).
6. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bmi_plus_db?retryWrites=true&w=majority
   ```
7. Paste this connection string into your `.env` file as `MONGODB_URI`.

---

## 🚀 Render Deployment Guide

Deploying BMI+ on [Render](https://render.com/) is straightforward because the Node.js server automatically serves both the backend API and the static frontend.

### Step 1: Push Code to GitHub
```bash
git init
git add .
git commit -m "Initial commit of BMI+ full stack app"
git branch -M main
git remote add origin https://github.com/<your-username>/bmi-plus-wellness-tracker.git
git push -u origin main
```

### Step 2: Create a Web Service on Render
1. Log in to [Render](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.

### Step 3: Configure Settings
- **Name**: `bmi-plus-wellness-tracker`
- **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon).
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Plan**: `Free`

### Step 4: Add Environment Variables
In the **Environment Variables** tab in Render:
| Key | Value |
|---|---|
| `MONGODB_URI` | *Your MongoDB Atlas connection URI* |
| `JWT_SECRET` | *A secure random string* |
| `NODE_ENV` | `production` |

*(Note: Do not define `PORT` manually; Render automatically assigns `process.env.PORT`)*

### Step 5: Deploy
Click **Create Web Service**. Once the build finishes, open your live URL (e.g., `https://bmi-plus-wellness-tracker.onrender.com`).

---

## 🎮 Gamification, Streaks & XP System

| Action | XP Awarded | Trigger / Condition |
|---|---|---|
| Profile Setup | **+30 XP** | Initial onboarding completion |
| Log BMI Record | **+10 XP** | Height & weight calculation |
| Log Water Intake | **+10 XP** | Adding fluid volume |
| Complete Daily Water Goal | **+20 XP** | Reaching 100% of daily target |
| Log Restful Sleep | **+10 to +15 XP** | Rest recorded (bonus for 7+ hours) |
| Log Physical Activity | **+15 to +20 XP** | Exercise logged (bonus for 30+ mins) |
| Daily Mood Check-in | **+10 XP** | Emotional reflection logged |
| Complete Daily Goal | **+20 XP** | Checking off any goal |
| All Goals Complete Bonus | **+25 XP** | 100% checklist completion for the day |

### Milestone Badges:
- 🌱 **First Step**: First wellness record recorded.
- 🧮 **BMI Explorer**: First BMI calculated.
- 💧 **Hydration Hero**: Daily water intake target met.
- 😴 **Sleep Champion**: 7+ hours restful sleep logged.
- 🏃 **Active Mover**: 30+ minutes workout logged.
- 😊 **Mindful Soul**: Daily mood reflection completed.
- 🎯 **Goal Crusher**: 100% daily checklist completed.
- ⚡ **Consistency Starter**: 3-day active streak.
- 🔥 **7 Day Streak**: 7-day continuous active streak.
- 👑 **30 Day Master**: 30-day legendary streak.
- ⭐ **XP Milestones**: 100 XP, 500 XP, and 1,000 XP badges.

---

## 🎓 Academic Viva & Demonstration Points

When demonstrating this project to professors or external examiners:

1. **Client-Server Architecture**:
   - The frontend communicates asynchronously with Express REST endpoints using standard `fetch()` API calls with Bearer JWT tokens.
2. **State & DOM Manipulation**:
   - Pure Vanilla JS handles live form calculations (e.g. sleep duration, BMI gauge needle, water bottle fill height) without bulky virtual DOM libraries.
3. **Data Security**:
   - Passwords are never stored as plain text. The User model employs cryptographic pre-save hashing using `bcryptjs` (salt rounds: 10).
4. **Data Isolation**:
   - All Mongoose database queries are scoped to `req.user._id`, ensuring users cannot access or alter data belonging to other accounts.
5. **Responsive Design**:
   - Built with mobile-first CSS media queries, responsive CSS Grid, and custom flyout hamburger drawers for small screens.
6. **Themes with CSS Variables**:
   - The entire theme is controlled dynamically via `[data-theme="dark"]` and `[data-theme="light"]` attribute selectors on `<html>`.

---

## ⚠️ Medical Disclaimer
> **Notice**: BMI+ is designed for general wellness tracking and educational purposes only. It is not intended as a medical device, diagnosis tool, or treatment recommendation. Always consult qualified medical professionals for clinical healthcare advice.

