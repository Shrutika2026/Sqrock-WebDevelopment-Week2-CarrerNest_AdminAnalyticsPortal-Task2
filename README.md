# CareerNest v2.0 - Job Portal with Admin Analytics Dashboard

Welcome to **CareerNest v2.0**, an enterprise-level, three-sided job portal platform that seamlessly connects and manages three distinct user ecosystems: **Candidates**, **Employers**, and **Administrators**.

This project represents the successful completion of **Week 2, Task 2** during my Web Development Internship at **SQ Rock**. Building upon the foundational v1.0 job portal, CareerNest v2.0 transitions the application into a data-driven system by integrating a robust **Admin Analytics Dashboard** powered by client-side relational storage.

## 🚀 Live Demo
Experience the platform live: [CareerNest Admin Analytics Dashboard](https://sqrock-web-development-week2-carrer.vercel.app/)

---

## 🎨 System Features

### 👑 1. Admin Analytics Dashboard (New in v2.0)

Designed to visualize system-wide platform health like a real product manager:

* **Live Data Metrics:** Real-time high-level tracking cards displaying *Total Jobs Posted*, *Total Applications Submitted*, *Total Platform Users*, and *Active Listings*.

* **Data Visualizations:** Dynamic graphical chart analysis tracking core platform metrics, including *Applications per Job* (Bar Chart) and *Jobs by Category* (Pie Chart).

* **Applicant & Job Audits:** A master control panel to monitor candidate application statuses (Pending/Selected/Rejected) and audit recruitment trends across employers.

* **Master CRUD Controls:** Complete administrative authority to view, edit, and delete any active job listing or registered user profile on the network.

---

### 👤 2. Candidate Portal

* **Role-Isolated Auth:** Secure Login and Registration system customized for job seekers.

* **Job Hunting Pipeline:** Browse, filter, search, and save listings, with an interactive application form submission setup.

* **Application Tracking:** Live candidate dashboard to view active submissions, track selection status, or natively withdraw applications.

---

### 🏢 3. Employer Portal

* **Recruiter Onboarding:** Dedicated onboarding workspace and secure credential gateway.

* **Talent Management:** Full CRUD controls to post/edit job listings and directly process applications (Accept or Reject candidates while viewing profile details and resumes).

---

### 🔐 4. Shared Platform Settings (All Roles)

* Self-service profile editing and details management.

* Secure credential modification (Change Password).

* Account lifetime management (Natively delete account).

---

# 🔑 Admin Login Credentials

Use the following credentials to access the Admin Analytics Dashboard:

```text
Email: carrernest@gmail.com
Password: CarrerNestAdmin@123
```

---

# 🛠️ Tech Stack & Architecture

* **Frontend:** HTML5, CSS3 (Advanced Flexbox & Grid layouts for full responsiveness)

* **Logic & Engine:** JavaScript (ES6+ Native DOM manipulation and modular logic)

* **Backend Simulation:** Browser-based `localStorage` functioning as a client-side database

* **Data Visualization:** Interactive analytical charts and dashboard insights

* **Architecture Style:** Multi-role modular application system

---

# 📂 Project File Structure

The project follows a clean, modular structure optimized for client-side loading:

```text
MAIN_ADMINANALYTICS/
│
├── assets/
│   └── CarrerNest.png
│
├── .gitignore
├── index.html
├── README.md
├── script.js
└── style.css
```

---

# 💾 The LocalStorage "Backend" Concept

A key highlight of CareerNest v2.0 is treating client-side storage like a relational database system.

By linking the analytical charting interface directly to structured data keys in `localStorage`, actions performed by a candidate (such as applying for a job) or an employer (such as approving a candidate) instantly update the central Admin dashboard graphs without requiring page reloads.

This simulates real-time synchronization between multiple user roles while keeping the application fully frontend-based.

---

# 💻 Local Setup & Development Guide

Follow these steps to download, run, and explore the project locally on your device.

## 📋 Prerequisites

You only need:

* A modern browser (Google Chrome / Microsoft Edge / Firefox)

* VS Code or any code editor

---

## ⚡ Installation Steps

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Shrutika2026/Sqrock-WebDevelopment-Week2-CarrerNest_AdminAnalyticsPortal-Task2.git
```

---

### 2️⃣ Navigate Into the Project Folder

```bash
cd Sqrock-WebDevelopment-Week2-CarrerNest_AdminAnalyticsPortal-Task2
```

---

### 3️⃣ Open the Project

#### Option A (Recommended)

Open the folder in VS Code and use **Live Server**.

```bash
Right Click → Open with Live Server
```

#### Option B

Directly open `index.html` in any browser.

---

# 🌐 Deployment Guide

This project is fully deployable on **Vercel**.

## Steps:

1. Create an account on:

```text
https://vercel.com/
```

2. Click:

```text
Add New → Project
```

3. Connect your GitHub account.

4. Import the repository:

```text
Sqrock-WebDevelopment-Week2-CarrerNest_AdminAnalyticsPortal-Task2
```

5. Keep default settings.

6. Click:

```text
Deploy
```

Your website will be live within seconds.

---

# ✨ Key Learning Outcomes

Through this project, I gained practical experience in:

* Multi-role authentication systems
* CRUD operations
* Dashboard analytics implementation
* Frontend architecture structuring
* localStorage database simulation
* Dynamic DOM rendering
* Responsive UI/UX design
* Real-time chart updates
* Deployment workflows using Vercel

---

# 🏆 Internship Context

This project was developed as part of my internship task at **SQ Rock**, where the objective was to transform a basic job portal into a scalable analytics-driven platform with enhanced administrative capabilities and structured user ecosystems.

---

# 📸 Project Highlights

✔️ Three-user architecture  
✔️ Admin analytics dashboard  
✔️ Dynamic charts & insights  
✔️ Role-based access system  
✔️ Job application workflow  
✔️ Employer recruitment management  
✔️ Fully responsive UI  
✔️ LocalStorage-powered data persistence  
✔️ Modern dashboard design  
✔️ Vercel deployment ready

---

⭐ If you liked this project, consider giving the repository a star!
