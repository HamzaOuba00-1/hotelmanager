# 🏨 HotelFlow

### Full-Stack Hotel Management & Booking Platform

HotelFlow is a **modern full-stack web application** designed for **hotel management and online booking**.
It enables hotels to efficiently manage **rooms, reservations, staff, planning, attendance, and communication**, while providing clients with a **secure and user-friendly public booking interface**.


## 🎥 Demo Video

[![Demo](https://img.youtube.com/vi/beIzHXRxwyo/0.jpg)](https://www.youtube.com/watch?v=beIzHXRxwyo)


---

## 🎯 Project Goals

* Centralize **hotel management** (hotels, rooms, reservations, users)
* Provide a **public booking interface** for clients
* Manage multiple **user roles** with distinct permissions
* Ensure **secure authentication and authorization**

---



## 👥 User Roles

### 🌍 Visitor (Public)

* Browse available hotels
* View available rooms/hotels by date
* Book a room
* Automatic client account creation

### 🧑‍💼 Manager

* Hotel dashboard
* Hotel configuration
* Room management
* Reservation management
* Employee management
* Planning and attendance tracking
* Issue tracking

### 🧑‍🔧 Employee

* View personal planning
* Check-in / check-out (attendance)
* Access assigned rooms
* Report internal issues
* Internal messaging

### 🧑‍💻 Client

* View personal reservations
* Communicate with hotel staff
* Manage profile information

---

## 🚀 Key Features

* Real-time room booking
* Secure JWT-based authentication
* Role-based dashboards
* Complete hotel & staff management
* Internal messaging system
* Modern, responsive user interface
* Clear separation between public and private areas

---

## 🛠️ Tech Stack

### Backend

* Java 
* Spring Boot
* Spring Security
* JWT Authentication
* Hibernate / JPA
* PostgreSQL
* Maven

### Frontend

* React 
* TypeScript
* React Router
* Tailwind CSS
* Lucide React (icons)
* Axios


---

## 🔐 Security

* JWT-based authentication
* Role-based authorization (`MANAGER`, `EMPLOYEE`, `CLIENT`)
* Protected routes on both frontend and backend
* Limited public access to essential endpoints only
* Strict separation of responsibilities

---



## 🗄️ Database

* PostgreSQL
* Managed via Hibernate (`ddl-auto=update`)


## ▶️ Running the Project

### Backend

```bash
cd hotelmanager-backend
mvn spring-boot:run
```

### Frontend

```bash
cd hotelmanager-frontend
npm install
npm start
```

The application will be available at:

```
http://localhost:5173
```

---

## 📈 Future Improvements

* Online payments (Stripe)
* Email / SMS notifications
* Advanced statistics & analytics dashboards
* Internationalization (i18n)
* Dark mode
* Mobile application
* CI/CD pipeline

---

## 📜 License

This project is a personal project - You are free to explore