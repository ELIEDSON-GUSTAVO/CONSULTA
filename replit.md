# Next - Sistema de Gestão de Consultas Psicológicas

## Overview

Next is a comprehensive psychological consultation management system with dual user interfaces. The **employee portal** (no password required) allows staff to submit consultation requests and track their status using unique tracking codes. The **psychologist interface** (password: NEXTPY@2026) provides full management capabilities including patient records, consultation scheduling, request approval/rejection, and analytics.

The system features a medical record system where approved employees automatically become patients with unique Código Prontuário (P-00001 format). Employees track requests using Código de Rastreamento (S-00001 format). The system supports full CRUD operations, status tracking, attendance monitoring, filtering, sector-based analytics, and interactive charts.

The application emphasizes clinical clarity and workflow efficiency with separate optimized interfaces for employees and psychologists.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, configured with custom aliases (@, @shared, @assets)
- **Wouter** for lightweight client-side routing (dashboard, new consultation, edit consultation, history views)

**UI Component Strategy**
- **shadcn/ui** component library (New York style variant) with Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- Custom CSS variables for theme switching (light/dark mode support)
- Design system inspired by Linear, Notion, and healthcare management tools
- Professional blue color scheme (HSL 210 85% 45%) with healthcare-appropriate visual language

**State Management**
- **TanStack Query (React Query)** for server state management and data fetching
- Custom query client with automatic error handling and infinite stale time
- **React Hook Form** with Zod validation for form state management
- Context API for theme provider (light/dark mode toggle)

**Form Validation**
- **Zod** schemas for runtime type validation
- Integration with React Hook Form via @hookform/resolvers
- Shared validation schemas between frontend and backend (drizzle-zod integration)

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript for REST API
- Custom Vite middleware integration for development HMR
- Request logging middleware with response time tracking
- JSON body parsing and URL-encoded form support

**API Design**
- RESTful endpoints under `/api/consultas` namespace:
  - GET `/api/consultas` - List all consultations
  - GET `/api/consultas/:id` - Get single consultation
  - POST `/api/consultas` - Create consultation
  - PATCH `/api/consultas/:id` - Update consultation
  - DELETE `/api/consultas/:id` - Delete consultation
- Centralized error handling middleware
- Zod schema validation on request payloads

**Storage Layer**
- Storage abstraction interface (IStorage) for potential database swapping
- DatabaseStorage implementation using Drizzle ORM
- Repository pattern separating database logic from route handlers

### Data Storage

**Database**
- **PostgreSQL** via Neon serverless with WebSocket support
- **Drizzle ORM** for type-safe database queries and migrations
- Schema-first design with TypeScript type inference

**Schema Design**
```typescript
consultas table:
- id (varchar, UUID primary key)
- paciente (text, required) - Patient name
- data (date, required) - Appointment date
- horario (time, required) - Appointment time
- status (text, required) - Status enum: agendada/realizada/cancelada
- observacoes (text, optional) - Notes
- createdAt (timestamp, auto-generated)

solicitacoes table:
- id (varchar, UUID primary key)
- codigoRastreamento (text, unique, required) - Tracking code format S-00001
- nomeFuncionario (text, required) - Employee name
- genero (text, optional) - Gender
- setor (text, required) - Department/sector
- motivo (text, required) - Main reason for consultation
- descricao (text, required) - Detailed description
- dataPreferencial (date, optional) - Preferred date
- horarioPreferencial (text, optional) - Preferred time period
- email (text, optional) - Employee email for contact
- telefone (text, optional) - Employee phone for contact
- status (text, required) - Status: pendente/aprovada/rejeitada
- consultaId (varchar, optional) - Linked consultation ID when approved
- observacoesPsicologo (text, optional) - Psychologist notes
- createdAt (timestamp, auto-generated)

pacientes table:
- id (varchar, UUID primary key)
- codigoProntuario (text, unique, required) - Medical record code format P-00001
- nome (text, required) - Patient full name
- genero (text, optional) - Gender
- setor (text, required) - Work department/sector
- email (text, optional) - Contact email
- telefone (text, optional) - Contact phone
- observacoes (text, optional) - Psychologist private notes
- createdAt (timestamp, auto-generated)
```

**Migration Strategy**
- Drizzle Kit for schema migrations (push-based workflow)
- Schema definitions in `/shared/schema.ts` for frontend/backend sharing
- Migration files output to `/migrations` directory

### Authentication & Authorization

**Current Implementation**
- No authentication system currently implemented
- Application assumes trusted internal network or future auth integration
- Session infrastructure present via connect-pg-simple (configured but not actively used)

### Design System

**Typography**
- Primary font: Inter (Google Fonts CDN) for UI elements and body text
- Monospace font: JetBrains Mono for data fields and timestamps
- Type scale: Page titles (text-3xl), forms use base sizing

**Color System**
- CSS custom properties for theme values (--primary, --background, --foreground, etc.)
- Light/dark mode toggle with localStorage persistence
- Automatic class-based theme switching on document root
- Healthcare-appropriate professional blue with success/warning/error states

**Component Patterns**
- Elevation system (--elevate-1, --elevate-2) for hover/active states
- Consistent border radius values (9px/6px/3px for lg/md/sm)
- Shadow system for depth hierarchy
- Button variants: default (primary), destructive, outline, secondary, ghost
- Accessible focus states with ring utilities

## External Dependencies

### Database & ORM
- **@neondatabase/serverless** - Neon PostgreSQL serverless driver with WebSocket support
- **drizzle-orm** - Type-safe ORM for database operations
- **drizzle-kit** - Migration tooling and schema management
- **drizzle-zod** - Automatic Zod schema generation from Drizzle schemas

### UI Framework
- **@radix-ui/** - Comprehensive accessible component primitives (20+ component packages)
- **tailwindcss** - Utility-first CSS framework
- **class-variance-authority** - Type-safe component variant API
- **cmdk** - Command menu component
- **embla-carousel-react** - Carousel/slider functionality

### Forms & Validation
- **react-hook-form** - Performant form state management
- **@hookform/resolvers** - Validation resolver adapters
- **zod** - TypeScript-first schema validation

### Data Fetching
- **@tanstack/react-query** - Server state management and caching

### Routing & Navigation
- **wouter** - Lightweight React router (sub-2KB alternative to React Router)

### Date Handling
- **date-fns** - Modern date utility library with pt-BR locale support

### Development Tools
- **@replit/vite-plugin-runtime-error-modal** - Development error overlay
- **@replit/vite-plugin-cartographer** - Replit integration
- **tsx** - TypeScript execution for development server
- **esbuild** - Fast JavaScript bundler for production builds

### Build Configuration
- **vite** - Frontend build tool with React plugin
- **postcss** - CSS processing with autoprefixer
- Custom path aliases for clean imports (@/, @shared/, @assets/)

## Recent Changes

### Employee Portal Unified Interface (October 2025)
- **Tabs-based Interface**: Employee portal now features a unified tabbed interface with two sections:
  - "Solicitar Atendimento" tab: Full consultation request form
  - "Consultar Solicitação" tab: Track request status using tracking code
- **Tracking System**: Automatic generation of unique tracking codes (S-00001 format) for each request
- **Post-submission Dialog**: Success modal displays tracking code with copy-to-clipboard functionality
- **Status Tracking**: Employees can search by tracking code to view real-time status (pendente/aprovada/rejeitada)
- **Simplified Navigation**: Single "Portal do Funcionário" menu item for all employee functions

### Technical Implementation
- Retry logic with exponential backoff prevents tracking code conflicts during concurrent submissions
- Query-based status lookup with loading states and error handling
- Color-coded status badges (yellow/green/red) for visual clarity
- Responsive design with shadcn Tabs component for seamless mobile experience