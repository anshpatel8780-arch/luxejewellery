# LuxeJewels: System Design & Architecture Diagrams

This document contains the comprehensive project profile, system design principles, Data Flow Diagrams (DFDs), Entity Relationship (ER) diagrams, and UML diagrams for the LuxeJewels application.

---

## 1. Project Profile & Description

**Project Name**: LuxeJewels
**Project Type**: Premium E-Commerce Web Application
**Domain**: Jewellery Retail
**Target Audience**: Customers looking to buy premium rings, necklaces, earrings, bracelets, and watches online.

### Project Description
LuxeJewels is a full-stack, responsive, and secure e-commerce platform designed to simulate a high-end jewellery shopping experience. It features continuous cart syncing, wishlist management, product reviews, and an administrative quadrant for inventory and order management.

**Core Technology Stack**:
- **Frontend**: Angular 17 (Standalone Components, RxJS, TypeScript)
- **Backend API**: Node.js & Express.js (RESTful architecture)
- **Database**: MongoDB & Mongoose ODM
- **Security**: JWT (JSON Web Tokens) stateless authentication & bcrypt password hashing

---

## 2. System Architecture Design

The system runs on a decoupled client-server architecture where the Angular 17 SPA communicates with the Express.js backend entirely over HTTP REST endpoints.

```mermaid
flowchart TD
    subgraph Client [Frontend - Angular 17]
        UI[User Interface Components]
        Services[Angular Services / API Calls]
        State[RxJS BehaviorSubjects]
        UI <--> State
        State <--> Services
    end

    subgraph API [Backend API - Node.js Express]
        Router[Express Routes]
        Auth[Auth & Admin Middleware]
        Controllers[Controllers / Logic]
        Router --> Auth
        Auth --> Controllers
    end

    subgraph Database [Database - MongoDB]
        Mongoose[Mongoose ODM]
        DB[(MongoDB Database)]
        Mongoose <--> DB
    end

    Client -- "HTTP/REST (JSON)" --> API
    API -- "Mongoose Methods" --> Database
```

---

## 3. Data Flow Diagrams (DFD)

### Level 0 DFD (Context Diagram)
A high-level overview showing the system's interactions with its external entities (User and Admin).

```mermaid
flowchart LR
    User([Customer]) -- "Search, Browse, Add to Cart, Checkout" --> System[LuxeJewels System]
    System -- "Products, Invoices, Order Status" --> User
    Admin([Administrator]) -- "Manage Inventory, Process Orders" --> System
    System -- "Sales Analytics, Dashboard Stats" --> Admin
```

### Level 1 DFD
This diagram breaks down the main system into detailed sub-processes.

```mermaid
flowchart TD
    User([Customer/Admin]) --> |Login/Register Credentials| AuthProc(1. Authentication)
    AuthProc --> |Store/Verify| UserDB[(Users Collection)]
    
    User --> |Search/Filter| ProdProc(2. Product Catalog)
    ProdProc --> |Query/Update| ProdDB[(Products Collection)]
    Admin --> |Add/Edit/Delete| ProdProc
    
    User --> |Add Item/Change Quantities| CartProc(3. Cart Management)
    CartProc --> |Update| CartDB[(Cart Collection)]
    
    User --> |Submit Payment & Address| OrderProc(4. Order Processing)
    OrderProc --> |Create Invoice| OrderDB[(Orders Collection)]
    OrderProc --> |Trigger Clear| CartProc
```

---

## 4. Entity Relationship (ER) Diagram

Outlines the MongoDB collections and how they logically relate to one another via Mongoose `ObjectId` references.

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--|| CART : owns
    USER ||--|| WISHLIST : maintains
    USER ||--o{ REVIEW : writes
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT }o--o{ CART : "added to"
    PRODUCT }o--o{ ORDER : "included in"
    
    USER {
        ObjectId _id PK
        String name
        String email
        String password
        String role
    }
    PRODUCT {
        ObjectId _id PK
        String name
        Number price
        String category
        Number stock
        Boolean featured
    }
    ORDER {
        ObjectId _id PK
        ObjectId userId FK
        Number totalPrice
        String status
        String paymentMethod
        Object address
    }
    CART {
        ObjectId _id PK
        ObjectId userId FK
        Array products
    }
    REVIEW {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId productId FK
        Number rating
        String comment
    }
```

---

## 5. UML Diagrams

### A. Use Case Diagram
Maps out the system functionalities available to the different actors.

```mermaid
flowchart LR
    User([User])
    Admin([Admin])
    
    subgraph LuxeJewels Application
        UC1(Browse & Filter Products)
        UC2(Manage Cart & Wishlist)
        UC3(Checkout & Place Order)
        UC4(Leave Product Review)
        UC5(View Order History)
        UC6(CRUD Products)
        UC7(Update Order Statuses)
        UC8(View Analytics Dashboard)
    end
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    
    Admin --> UC1
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
```

### B. Sequence Diagram: Creating an Order (Checkout Flow)
Visualizes the sequence of logical operations across the stack when a user places an order.

```mermaid
sequenceDiagram
    actor User
    participant AngularApp
    participant ExpressAPI
    participant DB as MongoDB
    
    User->>AngularApp: Clicks "Place Order" (Form Submit)
    AngularApp->>AngularApp: Validate Address Form
    AngularApp->>ExpressAPI: POST /api/orders (Authorization: Bearer Token)
    
    Note over ExpressAPI: auth.js Middleware checks token
    
    ExpressAPI->>DB: Fetch user's Cart (GET Cart details)
    DB-->>ExpressAPI: Returns cart items & total
    ExpressAPI->>DB: Check Product Stock Levels
    DB-->>ExpressAPI: Stock OK
    
    ExpressAPI->>DB: Create new Order document
    DB-->>ExpressAPI: Order Created successfully
    
    ExpressAPI->>DB: Clear user's Cart document
    DB-->>ExpressAPI: Cart Cleared
    
    ExpressAPI->>DB: Decrement Product Stock
    
    ExpressAPI-->>AngularApp: 201 Created (Order ID)
    AngularApp-->>User: Redirect to User Dashboard / Success Message
```

### C. Class Diagram (Backend Domain Models)
A structural representation of the primary Mongoose Schemas used in the backend.

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String phone
        +String role
        +Date createdAt
        +comparePassword()
    }

    class Product {
        +ObjectId _id
        +String name
        +Number price
        +String category
        +String description
        +String[] images
        +Number stock
        +Number rating
    }

    class Order {
        +ObjectId _id
        +ObjectId userId
        +Object[] products
        +Number totalPrice
        +Object address
        +String paymentMethod
        +String status
        +Date createdAt
    }

    class Cart {
        +ObjectId _id
        +ObjectId userId
        +Object[] products
    }

    User "1" -- "*" Order : Creates >
    User "1" -- "1" Cart : Has >
    Order "*" -- "*" Product : Contains >
```

---

## 6. Database Design Summary

* **NoSQL Approach**: The database heavily leverages document embedding (e.g., embedding snapshot product data into the `Order` document securely) rather than strict relational normalization, which is highly efficient for read-heavy operations like e-commerce.
* **Indexes**: 
  * `email` is indexed and unique in the `Users` collection for fast login mechanisms.
  * A powerful `text` index on `name`, `description`, and `category` allows for instantaneous global searching capabilities.
* **Data Integrity**: Enforced strictly at the Mongoose App-Layer using enums (`'Pending', 'Processing', 'Shipped', 'Delivered'`) and required constraints.
