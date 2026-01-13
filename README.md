# StayVerse — Personalized Stay & Experience Booking Platform

🏡 **Live Demo:** [Add your deployed frontend URL here]  
⚙️ **Backend API:** [Add your backend deployment URL here]

StayVerse is a full-stack **MERN-based marketplace platform** enabling users to discover, book, and manage personalized stays and experiences.  
The system implements a **request–approval booking workflow**, **deterministic rule-based personalization**, and a **scalable backend architecture**, while remaining fully explainable and implementable by a single developer.

This project emphasizes **real-world marketplace logic** and **interview-grade system design**, avoiding machine-learning black boxes in favor of transparent, debuggable personalization.

---

## 🎯 Project Objectives

- Deterministic personalization without machine learning  
- Correct booking lifecycle with availability protection  
- Role-based access control (Guest / Host)  
- Scalable MongoDB query and indexing strategy  
- Clear separation of discovery and personalization systems  
- Interview-safe, explainable backend architecture  

---

## 👥 System Roles

### Guest
- Browse and search listings  
- View listing details  
- Request bookings  
- Track booking status  
- Manage wishlist  
- View personalized home feed  
- Leave reviews after completed stays  

### Host
- Create and manage listings  
- Upload listing images  
- Manage pricing and deals  
- View booking requests  
- Approve or reject bookings  
- Track booking history  

> Admin role intentionally excluded to keep scope realistic and focused.

---

## 🔐 Authentication & Authorization

- JWT-based authentication  
- Protected route middleware  
- Role-based access control (Guest, Host)  
- Token-based session handling  
- Ownership checks at controller level  

---

## 🏘️ Listing Management

### Host Capabilities
- Create, update, delete listings  
- Upload multiple images via Cloudinary  
- Structured location storage:
  - Address  
  - Latitude / Longitude  
  - City / State / Country  

- Property metadata:
  - Property type (Hotel, Apartment, Villa, Resort, Cabin)  
  - Facilities (backend-controlled list)  
  - Highlights  

- Deal configuration:
  - Hot deal flag  
  - Discount percentage  
  - Deal expiry  

### Public Capabilities
- View all listings  
- View listing details  
- Browse by property type  
- Explore by location  

Each listing maintains:
- Average rating  
- View count  
- Booking count  

These metrics feed discovery and personalization systems.

---

## 🔎 Discovery System

Dedicated read-only discovery APIs:

### Browse by Property Type
- Category-based exploration  
- Sorted by rating and recency  

### Explore by Location
- Filters by city → state → country  
- Sorted by booking count and rating  

### Trending Listings
Trending if:
- `bookingCount > 0` OR `viewsCount > 0`  
- Sorted by `bookingCount`, then `viewsCount`  

### Hot Deals
Active deals:
- `isHotDeal = true`  
- `discountPercentage > 0`  
- `dealExpiry > currentTime`  
- Sorted by highest discount  

### Related Listings
Similarity matching:
- Same city  
- Same property type  
- Rating proximity (±0.5)  
- Progressive fallback strategy  

All discovery logic is deterministic and database-driven.

---

## 🔍 Search & Autocomplete

### Location Autocomplete
- Prefix-based suggestions from stored listings  
- Deduplicated via aggregation  
- Sorted by listing density  

### Destination Suggestions
Ranked by:
- Booking count (higher weight)  
- View count  

### Search History Tracking
- Stores user queries and applied filters  
- Timestamped search events  
- Used as personalization signals  
- Clean separation from discovery APIs  

---

## 📅 Booking System — Core Business Logic

### Booking Flow
1. Guest selects listing and date range  
2. Backend validates:
   - Date correctness  
   - Listing existence  
   - No overlap with approved bookings  
3. Booking created with `PENDING` status  
4. Host approves or rejects request  

On approval:
- Conflict check re-executed  
- Status updated to `APPROVED`  

After stay:
- Status updated to `COMPLETED`

### Status Lifecycle

PENDING → APPROVED → COMPLETED

↘ REJECTED-

### Availability Protection

A booking conflicts if:
requestedStart < existingEnd AND requestedEnd > existingStart

Applied only against `APPROVED` bookings — prevents double booking.

---

## ⭐ Reviews & Ratings

- One review per user per listing  
- Review allowed only after `COMPLETED` booking  
- Rating enforced between 1–5  
- Listing average rating recalculated and stored  
- Public review fetching supported  

Ensures trust and prevents fake reviews.

---

## 💖 Wishlist System

- One wishlist per user  
- Add / remove listings  
- Prevent duplicate entries  
- Populated listing data for frontend  
- Wishlist activity feeds personalization  

---

## 📊 User Activity Tracking

Tracks:
- Listing views  
- Wishlist actions  

Design principles:
- One document per action  
- No aggregation at write time  
- Time-series data model  

Enables:
- Recently viewed listings  
- Behavior-driven personalization  
- Analytics-ready backend  

---

## 🧠 Personalization System (Rule-Based)

### Personalized Home Feed

**Data Sources**
- Recently viewed listings  
- Frequently searched locations  
- Popular listings fallback  

**Priority Order**
1. Recently viewed  
2. Preferred location listings  
3. Globally popular listings  

**Characteristics**
- Deduplicated  
- Fixed deterministic ordering  
- Bounded feed size  
- Cold-start handling for guests  

> No machine learning. Fully explainable ranking.

---

## ☁️ Third-Party Integrations

### Cloudinary
- Image upload & optimized delivery  
- Multer + Cloudinary pipeline  

### Mapbox (Frontend)
- Location autocomplete  
- Map previews  
- Coordinates stored in backend  
- Backend remains Mapbox-agnostic  

---

## 🏗️ Backend Architecture

### Tech Stack
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT Authentication  
- Cloudinary  
- Mapbox  

### Folder Structure

server/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── config/
└── server.js


### Architectural Principles
- Thin controllers  
- Separation of concerns  
- Centralized validation  
- Reusable utilities  
- API-first design  

---

## 🗄️ Database Models

- User  
- Listing  
- Booking  
- Review  
- Wishlist  
- SearchHistory  
- UserActivity  

Indexed for:
- Search performance  
- Discovery queries  
- Personalization pipelines  
- Scalability  

---

## 🔒 Security

- JWT authentication  
- Role-based authorization  
- Ownership checks  
- Input validation  
- Controlled data exposure  

---

## 🚀 Project Outcomes

- Fully functional marketplace backend  
- Real-world booking logic  
- Deterministic personalization  
- Modular scalable architecture  
- Interview-grade system design  
- Strong full-stack portfolio foundation  

---

## ⚙️ Setup & Installation

*(Add after deployment)*

- Clone repository  
- Install dependencies  
- Configure environment variables  
- Run development server  

---

## 🛣️ Future Enhancements

- Payment gateway integration  
- Geo-based nearby discovery  
- Redis caching layer  
- Notification service  
- Admin moderation dashboard  

---
---


