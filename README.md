# Prompt Book

Welcome to the **Prompt Book** repository! This application is designed to help developers effectively manage and organize their AI prompts. With robust features like user authentication, role-based access control, and an admin dashboard, it provides a powerful solution for streamlined prompt management.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)

---

## Introduction

The **Prompt Book** is a web-based application built with **Next.js** and styled using **Tailwind CSS**. It enables developers to securely store, filter, and manage their AI prompts, offering advanced features like role-based access control and an admin dashboard for enhanced functionality.

---

## Features

- **Prompt Management**: Create, edit, and delete AI prompts with an intuitive interface.
- **User Authentication**: Secure access using JWT-based authentication.
- **Role System**: 
  - **Users**: Can create, view, filter, and manage their own prompts.
  - **Admins**: Have access to an admin dashboard for managing users and overseeing the system.
- **Admin Dashboard**: Manage users, assign roles, and oversee all prompts in the system.
- **Filter by Tags**: Quickly find prompts by applying filters based on tags or categories.
- **Modern Design**: Built with **Next.js** and **Tailwind CSS** for a fast, responsive, and user-friendly interface.

---

## Getting Started

### Prerequisites

Ensure the following software is installed on your system:

- **Node.js** (v14 or higher)

### Steps to Set Up Locally

1. Clone the repository:
    ```sh
    git clone https://github.com/julianoostwal/prompt-book.git
    ```

2. Navigate to the project directory:
    ```sh
    cd prompt-book
    ```

3. Install dependencies:
    ```sh
    npm install
    ```

4. Start the development server:
    ```sh
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

---

## Usage

### General Users
- **Sign up** or **log in** to access the application.
- **Create prompts**: Add and organize your AI prompts.
- **Filter prompts**: Use tags to find relevant prompts quickly.
- **Edit/Delete prompts**: Manage your entries with ease.

### Admin Users
- Access the **Admin Dashboard** to:
  - Manage user accounts (view, edit roles, or delete).
  - Oversee all prompts in the system.
  - Assign roles (e.g., upgrade a user to admin or restrict access).

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.


## User Stories

### User Story 1: User Registration
As a new user, I want to sign up for an account so that I can start using the Prompt Book application.

**Acceptance Criteria:**
- A registration form is available on the sign-up page.
- The form includes fields for username, email, and password.
- The user receives a confirmation email upon successful registration.

### User Story 2: Prompt Creation
As a registered user, I want to create new AI prompts so that I can manage and organize my ideas.

**Acceptance Criteria:**
- A prompt creation form is available after logging in.
- The form includes fields for the prompt title, description, and tags.
- The user can save the prompt, and it appears in the prompt list.

### User Story 3: Prompt Filtering
As a user, I want to filter my prompts by tags so that I can quickly find specific prompts.

**Acceptance Criteria:**
- The user can select one tag to filter the prompts.
- The prompt list updates to show only the prompts that match the selected tags.

### User Story 4: Admin User Management
As an admin, I want to manage user accounts so that I can oversee the system and assign roles.

**Acceptance Criteria:**
- An admin dashboard is available for admin users.
- The dashboard includes a list of all user accounts.
- The admin can view, edit roles, or delete user accounts from the dashboard.
- The admin can assign or revoke admin roles to/from users.