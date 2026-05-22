# CareerNest v2.0 - Job Portal with Admin Analytics Dashboard

Welcome to **CareerNest v2.0**, an enterprise-level, three-sided job portal platform that seamlessly connects and manages three distinct user ecosystems: **Candidates**, **Employers**, and **Administrators**.

This project represents the successful completion of **Week 2, Task 2** during my Web Development Internship at **SQ Rock**. Building upon the foundational v1.0 job portal, CareerNest v2.0 transitions the application into a data-driven system by integrating a robust **Admin Analytics Dashboard** powered by client-side relational storage.

## 🚀 Live Project Link
Experience the platform live here:

[CareerNest Admin Analytics Dashboard](https://carrernest-adminanalytics.vercel.app/)

---

## 🎨 System Features

### 👑 1. Admin Analytics Dashboard (New in v2.0)

Designed to visualize system-wide platform health like a real product manager:

* **Live Data Metrics:** Real-time high-level tracking cards displaying *Total Jobs Posted*, *Total Applications Submitted*, *Total Platform Users*, and *Active Listings*.
* **Data Visualizations:** Dynamic graphical chart analysis tracking core platform metrics, including *Applications per Job* (Bar Chart) and *Jobs by Category* (Pie Chart).
* **Applicant & Job Audits:** A master control panel to monitor candidate application statuses (Pending/Selected/Rejected) and audit recruitment trends across employers.
* **Master CRUD Controls:** Complete administrative authority to view, edit, and delete any active job listing or registered user profile on the network.

### 👤 2. Candidate Portal

* **Role-Isolated Auth:** Secure Login and Registration system customized for job seekers.
* **Job Hunting Pipeline:** Browse, filter, search, and save listings, with an interactive application form submission setup.
* **Application Tracking:** Live candidate dashboard to view active submissions, track selection status, or natively withdraw applications.

### 🏢 3. Employer Portal

* **Recruiter Onboarding:** Dedicated onboarding workspace and secure credential gateway.
* **Talent Management:** Full CRUD controls to post/edit job listings and directly process applications (Accept or Reject candidates while viewing profile details and resumes).

### 🔐 4. Shared Platform Settings (All Roles)

* Self-service profile editing and details management.
* Secure credential modification (Change Password).
* Account lifetime management (Natively delete account).

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** HTML5, CSS3 (Advanced Flexbox & Grid layouts for full responsiveness)
* **Logic & Engine:** JavaScript (ES6+ Native DOM manipulation and modular logic)
* **Data Warehouse Engine:** Robust utilization of `localStorage` as a localized database, dynamically mapping schema relationships between candidates, employers, and admin analytical data streams in real-time.

---

## 📂 Project File Structure

The project follows a clean, modular structure optimized for client-side loading:

```text
MAIN_ADMINANALYTICS/
│
├── assets/
│   └── CarrerNest.png     # Brand asset & logo workspace
│
├── .gitignore             # Standard git exclusion configurations
├── index.html             # Main interface router handling dynamic views for all three roles
├── README.md              # Project documentation and setup guide
├── script.js              # Core logic: multi-role auth, dynamic charting, and localStorage syncing
└── style.css              # Custom dashboard UI design system (Sidebar, responsive grid, components)
```

> ⚠️ **Important Note on Assets:**  
> Your brand image asset is currently named `CarrerNest.png` (spelled with a double 'r'). If you choose to rename it to `CareerNest.png` down the line, make sure to update the filename references everywhere across your `index.html`, `style.css`, and `script.js` files to prevent broken image paths!

---

## 💾 The LocalStorage "Backend" Concept

A key highlight of CareerNest v2.0 is treating client-side storage like a relational database system. By linking the analytical charting interface directly to structural data keys in `localStorage`, actions performed by a candidate (such as applying for a job) or an employer (such as approving a candidate) instantly update the central Admin dashboard graphs without requiring page reloads.

---

## 🚀 Local Setup & Development Guide

Follow these steps to download the repository, run it on your own PC, and make your own changes to the code.

### 📋 Prerequisites

You only need:

* A modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari)
* A code editor (Recommended: **Visual Studio Code**)
* Git installed on your system (Optional but recommended)

### 🛠️ 1. Download the Project from GitHub

#### ✅ Option A: Using Git (Recommended)

Open Command Prompt, Terminal, or Git Bash and run:

```bash
# Clone the repository
git clone https://github.com/Shrutika2026/Sqrock-WebDevelopment-Week2-CarrerNest_AdminAnalyticsPortal-Task2.git

# Open the project folder
cd Sqrock-WebDevelopment-Week2-CarrerNest_AdminAnalyticsPortal-Task2
```

#### ✅ Option B: Download ZIP File

1. Open your GitHub repository page.
2. Click the green **Code** button.
3. Select **Download ZIP**.
4. Extract the ZIP file anywhere on your computer.

### 💻 2. Open the Project in VS Code

1. Open Visual Studio Code.
2. Click **File** → **Open Folder**.
3. Select your extracted project folder.

### ✏️ 3. Edit the Project Files

You can modify and expand the layout using the roles below:

| File | Purpose |
| --- | --- |
| `index.html` | Structure and dynamic dashboard user views |
| `style.css` | Global styling, dashboard sidebar, cards, and grid responsiveness |
| `script.js` | Logic, role-isolated authentication, graphing charts, and CRUD operations |
| `assets/` | Images, brand assets, and platform media files |

### ▶️ 4. Run the Project Locally

#### ✅ Method 1: Using VS Code Live Server (Recommended)

1. **Install Live Server Extension:**
   * Open VS Code and head to the **Extensions** tab.
   * Search for **Live Server** and install the extension created by *Ritwick Dey*.

2. **Start the Project:**
   * Open your `index.html` file.
   * Right-click inside the code editor environment and select **Open with Live Server**.
   * *Alternative:* Click the **Go Live** button located in the bottom-right status bar of VS Code.

3. **Local URL Example:**
   * The project will automatically initialize inside a default browser window at:
     `http://127.0.0.1:5500/index.html`

#### ✅ Method 2: Run Directly in Browser

1. Open the local project directory on your computer file explorer.
2. Double-click the `index.html` file.
3. The project will run instantly inside your browser engine using a direct `file://` path.

### 🔄 5. Save Changes & Push Updates to GitHub

After customizing your dashboard features, run the following commands to update your repository:

```bash
# Check changed files
git status

# Add files to staging
git add .

# Commit changes
git commit -m "Updated CareerNest project features"

# Push changes up to your GitHub main branch
git push origin main
```

---

## 🌐 Deployment Guide

This project is fully optimized for zero-config production deployments on **Vercel**:

1. Create a free deployment profile at https://vercel.com/
2. Select **Add New** > **Project** and securely link your GitHub account.
3. Choose the `Sqrock-WebDevelopment-Week2-CarrerNest_AdminAnalyticsPortal-Task2` repository workspace.
4. Leave the default settings as-is (since this is a native HTML5/CSS3/JS platform, no complex build commands or overrides are required).
5. Click **Deploy**. Your customized deployment will render live on a production-ready cloud link within seconds!

---

## 📈 Acknowledgments

Special thanks to **SQ Rock** for providing this incredible internship opportunity, continuous project guidance, and an industry-grade learning roadmap throughout the Web Development Internship Program.

## 🔗 Connect With Me

If you like this analytics platform implementation, feel free to ⭐ **star the repository** and connect with me on LinkedIn!

Happy Coding! 🚀
