# Design Guidelines: Next - Sistema de Gestão de Consultas Psicológicas

## Design Approach: Design System Based

**Selected System:** Modern Professional Dashboard Design (inspired by Linear, Notion, and healthcare management tools)

**Justification:** This is a utility-focused, data-intensive application where clarity, efficiency, and professional credibility are paramount. The design prioritizes rapid data entry, easy scanning of information, and trustworthy presentation suitable for healthcare contexts.

**Core Principles:**
- Clinical Clarity: Clean, uncluttered interfaces that reduce cognitive load
- Data Confidence: Clear visual hierarchy for critical patient information
- Efficient Workflows: Minimize clicks and form friction
- Professional Trust: Healthcare-appropriate visual language

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary Brand: 210 85% 45% (Professional blue)
- Background: 0 0% 100% (Pure white)
- Surface: 210 20% 98% (Subtle gray)
- Border: 210 15% 90%
- Text Primary: 210 25% 15%
- Text Secondary: 210 15% 45%
- Success: 142 76% 36%
- Warning: 38 92% 50%
- Error: 0 84% 60%

**Dark Mode:**
- Primary Brand: 210 80% 60%
- Background: 222 47% 11%
- Surface: 217 33% 17%
- Border: 217 20% 25%
- Text Primary: 210 20% 98%
- Text Secondary: 210 15% 70%

**Accent Colors:** Use accent colors sparingly - Success green for completed consultations, Warning amber for pending status

### B. Typography

**Font Family:**
- Primary: 'Inter' (via Google Fonts CDN) - Headings, UI elements
- Secondary: 'Inter' - Body text, forms
- Monospace: 'JetBrains Mono' - Data fields, timestamps

**Type Scale:**
- Page Titles: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Form Labels: text-sm font-medium (14px)
- Helper Text: text-xs (12px)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of **4, 6, 8, 12, 16** consistently
- Component padding: p-6
- Section spacing: space-y-8
- Form field gaps: gap-4
- Card margins: m-4
- Container max-width: max-w-7xl

**Grid System:**
- Dashboard: Single column on mobile, 12-column grid on desktop
- Form layout: Single column forms with logical field grouping
- Table view: Full-width responsive tables with horizontal scroll on mobile

### D. Component Library

**Navigation:**
- Top navigation bar: Fixed header with logo, user profile, notifications
- Height: h-16
- Background: Matches surface color with subtle border-bottom
- Logo placement: Left-aligned with "Next" branding

**Forms (Data Entry):**
- Input fields: Rounded borders (rounded-lg), focus ring in primary color
- Labels: Above inputs, font-medium, text-sm
- Required indicators: Red asterisk, clear visual hierarchy
- Field groups: Organized by consultation sections (Patient Info, Session Details, Notes)
- Buttons: Primary action (Save) - solid primary color, Secondary (Cancel) - outline variant
- Form container: max-w-4xl, centered with p-8

**Dashboard/Table:**
- Data table: Striped rows for readability, hover states
- Headers: Sticky position, font-semibold, border-b-2
- Row actions: Inline edit/delete icons on hover
- Status badges: Rounded pills with color-coded backgrounds (green: completed, amber: scheduled, gray: cancelled)
- Pagination: Bottom-right, clear current page indicator

**Data Display:**
- Cards: rounded-xl, shadow-sm, p-6, border in light mode
- Stats overview: Grid of metric cards (Consultas Hoje, Total Pacientes, Pendentes)
- Search/Filter bar: Top of table, with date range picker and patient name search
- Empty states: Centered illustration with helpful text

**Modals/Overlays:**
- Edit modal: Centered overlay with backdrop-blur
- Confirmation dialogs: For delete actions
- Toast notifications: Top-right corner for success/error feedback

### E. Animations

**Minimal, Purposeful Motion:**
- Page transitions: None (instant load for efficiency)
- Form feedback: Subtle scale on button press (scale-95)
- Table row hover: Simple background color change
- Modal appearance: Fade in with backdrop blur (150ms)
- Loading states: Subtle pulse animation on skeleton screens

---

## Page-Specific Guidelines

**Login/Dashboard Layout:**
- Split view: Sidebar (240px wide) with navigation, main content area
- Sidebar: List of sections (Dashboard, Nova Consulta, Histórico, Configurações)
- Active state: Primary background with rounded indicator

**Form Page (Nova Consulta):**
- Centered form container
- Progress indicator if multi-step (subtle top bar)
- Field sections with subtle dividers
- Auto-save indicator: "Salvo automaticamente" with checkmark icon

**Dashboard/Histórico:**
- Filter bar at top
- Stats cards in 3-column grid (1-col mobile, 3-col desktop)
- Table below with all consultation records
- Quick actions: Edit (pencil icon), Delete (trash icon), View (eye icon)

---

## Images

**Logo/Branding:**
- "Next" company logo in header (SVG, clean sans-serif wordmark or abstract symbol)
- Favicon: Simple "N" monogram in primary color

**Illustrations:**
- Empty state illustration for "Nenhuma consulta encontrada" - Simple line art of clipboard/calendar
- Loading skeleton: Gray placeholders matching table/card structure

**No hero images needed** - This is a functional dashboard application focused on data management efficiency.