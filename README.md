# Hospital Management Frontend

A modern Next.js frontend application for hospital management, built with TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- **Authentication System**: JWT-based authentication with refresh tokens
- **Dashboard**: Overview of key metrics and recent activity
- **Apartment Management**: View, search, and filter hospital listings
- **Application Management**: Review and manage hospital applications
- **Owner & Tenant Management**: Manage hospital owners and tenants
- **Responsive Design**: Mobile-first responsive design
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd hospital-management-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Authentication

The application uses JWT-based authentication with the following flow:

1. User logs in with email/password
2. Backend returns access token and refresh token
3. Tokens are stored in HTTP-only cookies
4. Access token is included in API requests
5. Refresh token is used to get new access tokens when needed

## API Integration

The frontend communicates with the backend API through the `apiClient` utility:

- **Base URL**: Configurable via `NEXT_PUBLIC_API_URL`
- **Authentication**: Automatic token inclusion in requests
- **Error Handling**: Automatic token refresh and error handling
- **Type Safety**: Full TypeScript support for API responses

## Components

### Layout Components

- `DashboardLayout`: Main layout with sidebar and header
- `Sidebar`: Navigation sidebar with user menu
- `Header`: Top header with search and notifications

### Auth Components

- `ProtectedRoute`: Route protection with role/permission checking
- `AuthContext`: Authentication state management

### UI Components

All UI components are from shadcn/ui and include:

- Button, Card, Input, Label
- Dialog, Dropdown Menu, Select
- Avatar, Badge, Separator
- Form components with validation
- Toast notifications

## Styling

The application uses Tailwind CSS for styling with:

- Custom color palette
- Responsive design utilities
- Dark mode support (via shadcn/ui)
- Consistent spacing and typography

## Development

### Adding New Pages

1. Create a new page in `src/app/[page-name]/page.tsx`
2. Add navigation link in `src/components/layout/Sidebar.tsx`
3. Implement the page with `DashboardLayout` wrapper

### Adding New API Endpoints

1. Add method to `src/lib/api.ts`
2. Create corresponding TypeScript types in `src/types/`
3. Use the API client in your components

### Adding New Components

1. Create component in appropriate `src/components/` subdirectory
2. Export from `src/components/index.ts` (if needed)
3. Follow existing patterns for styling and structure

## License

This project is licensed under the MIT License.
