# Contact Manager Project with API Integration

> A modern React-based contact management application that helps you organize and manage your contacts efficiently. Built with React 18, featuring real-time API synchronization, responsive design, and intuitive user interface.

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-14.x-orange.svg)](https://nodejs.org/)

**Keywords:** Contact Manager, React, API Integration, Contact Management, CRUD Application, React 18, Frontend Development, Contact List, Contact Organizer, Cloudinary, 4Geeks Academy, Responsive Design

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Known Limitations](#known-limitations)
- [Development](#development)
- [License](#license)
- [Contact](#contact)

## Features

- Create new contacts with detailed information (name, email, phone, address)
- View all contacts in a clean, organized list
- Update existing contact information
- Delete contacts with confirmation modal
- ⚠️ **Photo Upload Limitation**: While the application includes photo upload functionality using Cloudinary, please note that the 4Geeks Contact API does not support storing photo URLs. As a result, uploaded photos will not persist after page refresh. This is a limitation of the API rather than the application itself.
- Contacts are synchronized with a backend API
- Responsive layout optimized for both desktop and mobile views
- User-friendly interface with a modern design
- Form validation for all input fields
- Loading states and error handling
- Accessibility features for better user experience

## Tech Stack

- **Frontend:**
  - React 18.2.0
  - React Router for navigation
  - CSS3 for styling
  - Axios for API calls
  - Cloudinary for image hosting

- **Development Tools:**
  - npm for package management
  - Git for version control
  - VS Code (recommended IDE)

## Project Structure
```
src/
├── components/     # Reusable UI components
├── context/       # React context providers
├── services/      # API and external service integrations
├── styles/        # CSS stylesheets
├── views/         # Page components
└── ...
```

## Setup & Installation

1. Clone this repository:
   ```sh
   git clone https://github.com/dantefasano/contact-manager.git
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```env
   REACT_APP_API_URL=https://playground.4geeks.com/contact
   REACT_APP_AGENDA_SLUG=your_agenda_slug
   ```
   
   If you don't have access to the `.env` file, you can use these default values:
   - `REACT_APP_API_URL`: The API URL is public and can be used as is
   - `REACT_APP_AGENDA_SLUG`: You can use any unique string (e.g., "my-contacts" or "personal-agenda")
   
   Note: The agenda slug will be created automatically when you first use the application.

3. Install dependencies and run:
   ```sh
   cd contact-manager
   npm install
   npm start
   ```

4. Open your browser at http://localhost:3000

## Usage

After opening the Contact Manager app in your browser, you'll be presented with a modern, intuitive interface. You can:

- View all your contacts in a clean list format
- Add new contacts by clicking the "+" button and filling out the contact form
- Edit existing contacts by clicking the edit icon
- Delete contacts by clicking the trash icon (with confirmation)
- Upload contact photos
- View contact details including email, phone, and address
- Click on email addresses to open your email client
- Click on phone numbers to initiate calls

## API Documentation

This project uses the 4Geeks Academy Contact API:

- Base URL: https://playground.4geeks.com/contact
- Endpoints:
  - GET /agendas/{agenda_slug}/contacts - Get all contacts
  - POST /agendas/{agenda_slug}/contacts - Create a new contact
  - PUT /agendas/{agenda_slug}/contacts/{contact_id} - Update a contact
  - DELETE /agendas/{agenda_slug}/contacts/{contact_id} - Delete a contact

For more detailed API documentation, visit: https://playground.4geeks.com/contact/docs

## Known Limitations

After testing the API with Postman, we discovered that:
1. The API only supports basic contact fields (name, email, phone, address)
2. Additional fields like photos are not stored by the API
3. The API returns a simplified contact object without any extra fields

We attempted various solutions including different field names and formats, but the API's response structure remains fixed. This is why photos don't persist after page refresh.

## Development

### Available Scripts
- `npm start`
- `npm test`
- `npm run build`
- `npm run eject`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

**Dante Fasano** - [GitHub](https://github.com/dantefasano) - [LinkedIn](https://www.linkedin.com/in/dantefasano)

Project Link: [https://github.com/dantefasano/contact-manager](https://github.com/dantefasano/contact-manager)

---

Made with ❤️ by Dante Fasano