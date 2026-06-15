# CollegeOS

A personal academic operating system designed to help students manage their entire academic life from a single platform.

CollegeOS combines task management, calendar planning, study tracking, academic records, grade prediction, and CGPA planning into one unified dashboard.

---

## Overview

Students often use multiple applications to manage their academic workflow:

* Google Calendar
* To-Do Applications
* GPA Calculators
* Timetable Apps
* Study Trackers

CollegeOS brings all of these functions together into a single system focused on productivity, academic planning, and long-term progress tracking.

---

## Features

### Dashboard

* Academic overview
* Upcoming deadlines
* Upcoming exams
* Study statistics
* Current CGPA and SGPA
* Study streak tracking

### Calendar

* Monthly view
* Weekly view
* Daily agenda
* Exam schedules
* Assignment deadlines
* Personal events
* Calendar synchronization with tasks

### Task Management

* Multiple task lists
* Due dates
* Priorities
* Task statuses
* Progress tracking
* Calendar integration

### Timetable

* Weekly class schedule
* Daily agenda
* Subject organization
* Classroom information

### Academic Records

* Semester management
* Subject tracking
* Grade component tracking
* Historical academic records

### Grade Predictor

Calculate required final exam scores based on:

* Mid-semester marks
* Quizzes
* Assignments
* Practicals

### GPA Impact Simulator

Analyze academic scenarios:

* Best case outcomes
* Expected outcomes
* Worst case outcomes

Instantly view SGPA and CGPA impact.

### CGPA Goal Planner

Set a target CGPA and calculate:

* Required future SGPA
* Goal feasibility
* Academic planning requirements

### Study Timer

Track:

* Study sessions
* Assignment work
* Revision sessions
* Project work

### Study Analytics

View:

* Daily study hours
* Weekly study hours
* Monthly study hours
* Subject-wise study distribution
* Productivity trends

### Study Streaks

Track consistency and maintain study habits through daily streak monitoring.

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* ShadCN UI
* React Router
* React Query
* Zustand
* FullCalendar
* Recharts

### Backend

* Node.js
* Express
* TypeScript

### Database

* PostgreSQL
* Neon

### Deployment

* Vercel
* Render

### Authentication

* Master Password System
* JWT Authentication
* bcrypt Password Hashing

---

## Architecture

```text
Frontend (React PWA)
        │
        ▼
Backend API (Express)
        │
        ▼
PostgreSQL Database (Neon)
```

---

## Authentication Model

CollegeOS is a single-user application.

### First Launch

* Create a master password
* Password is securely hashed using bcrypt
* User profile is initialized

### Future Access

* Unlock application using the master password
* Secure session management with JWT

No registration or multi-user functionality is included.

---

## Database Modules

* Users
* Semesters
* Subjects
* Grade Components
* Grades
* Task Lists
* Tasks
* Calendar Events
* Timetable Entries
* Study Sessions
* CGPA Goals

---

## PWA Support

CollegeOS is designed as a Progressive Web App (PWA).

Features:

* Installable on Android
* Installable on Windows
* Responsive design
* Mobile-first experience
* App-like interface

---

## Project Status

Currently under active development.

Planned roadmap:

* Authentication
* Calendar
* Task Management
* Timetable
* Academic Records
* Grade Predictor
* GPA Simulator
* Study Timer
* Analytics Dashboard
* PWA Optimization

---

## Motivation

CollegeOS was created to solve a personal problem:

Managing academic life across multiple disconnected applications creates friction and reduces productivity.

This project aims to provide a single place for academic planning, progress tracking, and productivity management.

---

## License

This project is currently intended for personal use and educational purposes.

---

## Author

Hetraj Chauhan

Computer Science Engineering Student

Passionate about software engineering, cybersecurity, productivity systems, and building tools that solve real-world problems.
