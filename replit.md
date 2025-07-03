# DSA Challenge Hub

## Overview

DSA Challenge Hub is a web-based Data Structures and Algorithms (DSA) practice platform that combines competitive programming with social features. The application allows users to solve daily coding challenges, track their progress, and compete on leaderboards. It features an integrated code editor, automated test case execution, and real-time progress tracking.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Pure HTML/CSS/JavaScript implementation without frameworks
- **Code Editor**: Monaco Editor for syntax highlighting and code editing capabilities
- **Real-time UI Updates**: DOM manipulation for dynamic content rendering
- **Responsive Design**: CSS Grid and Flexbox for mobile-friendly layouts

### Backend Architecture
- **Serverless Backend**: Firebase Realtime Database for data persistence
- **Authentication**: Firebase Auth for user management
- **Code Execution**: External Judge0 API integration for running and testing code
- **Static Hosting**: Client-side rendering with CDN-delivered assets

## Key Components

### Authentication System
- **Firebase Auth Integration**: Email/password authentication
- **Session Management**: Persistent user sessions across browser refreshes
- **User State**: Global user object tracking authentication status

### Code Editor Interface
- **Monaco Editor**: Professional-grade code editor with syntax highlighting
- **Multi-language Support**: Java, C++, Python, JavaScript, and more
- **Theme Support**: Configurable editor themes and settings
- **Code Persistence**: Automatic saving of user code attempts

### Challenge Management
- **Daily Challenges**: Date-based challenge selection system
- **Difficulty Levels**: Easy, Medium, Hard, and God Level categorization
- **Problem Database**: Dynamic problem loading based on date and difficulty
- **Test Cases**: Automated test case execution and validation

### Timer and Progress Tracking
- **Attempt Timer**: Real-time timer for tracking solution time
- **Attempt Counter**: Progress tracking for user attempts
- **Leaderboard**: Performance comparison and ranking system

## Data Flow

1. **User Authentication**: Login/signup through Firebase Auth
2. **Challenge Selection**: Date and difficulty-based problem loading
3. **Code Development**: Write and test code in Monaco Editor
4. **Code Execution**: Submit to Judge0 API for compilation and testing
5. **Result Processing**: Parse execution results and update UI
6. **Progress Storage**: Save attempt data to Firebase Realtime Database
7. **Leaderboard Updates**: Real-time ranking updates based on performance

## External Dependencies

### CDN Resources
- **Firebase SDK v9**: Authentication and database services
- **Monaco Editor v0.34.1**: Code editing functionality
- **Font Awesome v6.4.0**: UI icons and visual elements
- **Marked.js**: Markdown parsing for problem descriptions

### APIs and Services
- **Judge0 API**: Code compilation and execution service
- **Firebase Realtime Database**: Real-time data synchronization
- **Firebase Authentication**: User management and security

### Browser APIs
- **Local Storage**: Client-side data persistence
- **Date API**: Challenge date management
- **Timer API**: Real-time progress tracking

## Deployment Strategy

### Static Site Hosting
- **Client-side Only**: No server-side processing required
- **CDN Distribution**: Global content delivery for performance
- **Firebase Hosting**: Integrated hosting with Firebase services

### Configuration Management
- **Environment Variables**: Firebase config exposed in client code
- **API Keys**: Public Firebase configuration (suitable for client-side)
- **External API Integration**: Judge0 API calls from client

### Scalability Considerations
- **Firebase Auto-scaling**: Automatic scaling for database operations
- **CDN Caching**: Static asset optimization
- **Client-side Processing**: Reduced server load through browser execution

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 03, 2025. Initial setup