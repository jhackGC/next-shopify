# Next.js Shopify Store

A modern e-commerce application built with Next.js 15 and Shopify Storefront API, featuring passwordless authentication and seamless shopping experience.

## Features

### 🛍️ Core Shopping Features

- **Product Catalog**: Browse and search products with advanced filtering
- **Shopping Cart**: Add, remove, and manage cart items with persistence
- **Checkout**: Secure checkout flow through Shopify's checkout system
- **Product Details**: Comprehensive product pages with variants and options

### 🔐 Authentication

- **Passwordless Login**: Magic link authentication using Shopify's Customer Account API
- **OAuth2 PKCE Flow**: Secure authentication without passwords
- **Customer Account**: Access to order history and account management

### 🎨 Modern UI/UX

- **Responsive Design**: Mobile-first design that works on all devices
- **Loading States**: Skeleton loaders and loading indicators
- **Interactive Components**: Hover effects, animations, and smooth transitions
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

### ⚡ Performance

- **Next.js 15**: Latest Next.js features including App Router
- **TypeScript**: Full type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for fast styling
- **Image Optimization**: Next.js Image component for optimized images

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API Integration**: Shopify Storefront API & Customer Account API
- **Authentication**: OAuth2 PKCE with magic links
- **UI Components**: Custom components with Headless UI
- **Icons**: Heroicons

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── cart/             # Shopping cart components
│   ├── layout/           # Layout components (Header, Footer)
│   ├── product/          # Product-related components
│   ├── sections/         # Page sections (Hero, Featured Products)
│   └── ui/               # Generic UI components
├── contexts/             # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── CartContext.tsx   # Shopping cart state
├── lib/                  # Utilities and API clients
│   ├── auth.ts           # Authentication helpers
│   ├── cart.ts           # Cart management
│   ├── queries.ts        # GraphQL queries
│   ├── shopify.ts        # Shopify API client
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
    └── shopify.ts        # Shopify API types
```

## Getting Started

### Prerequisites

1. **Shopify Store**: You need a Shopify store with:

   - Storefront API access enabled
   - Customer Account API configured
   - Products and collections set up

2. **Environment Variables**: Create a `.env.local` file:

```env
# Shopify Storefront API
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token

# Shopify Customer Account API
NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=your_customer_api_client_id
NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_API_URL=https://shopify.com/your_shop_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

1. **Clone and Install**:

```bash
npm install
```

2. **Configure Environment**:

   - Copy `.env.example` to `.env.local`
   - Fill in your Shopify store details

3. **Start Development Server**:

```bash
npm run dev
```

4. **Open in Browser**: Visit [http://localhost:3000](http://localhost:3000)

## Shopify Configuration

### Storefront API Setup

1. Go to your Shopify Admin → Apps → Develop apps
2. Create a new app or use existing one
3. Configure Storefront API access with these permissions:
   - `unauthenticated_read_products`
   - `unauthenticated_read_collections`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_customer_tags`

### Customer Account API Setup

1. Enable Customer Account API in your store settings
2. Configure OAuth redirect URLs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`
3. Set up the client ID and API URL

## Key Features Implementation

### Passwordless Authentication

- Uses Shopify's Customer Account API
- OAuth2 PKCE flow for security
- Magic link sent via email
- No password required

### Shopping Cart

- Persistent cart using Shopify Cart API
- Real-time quantity updates
- Optimistic UI updates
- Error handling and recovery

### Product Catalog

- GraphQL queries for efficient data fetching
- Image optimization with Next.js Image
- Responsive product grids
- Search and filtering capabilities

### Responsive Design

- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Progressive enhancement

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- Check the [Issues](https://github.com/your-repo/issues) page
- Review Shopify's [Storefront API documentation](https://shopify.dev/docs/api/storefront)
- Check [Next.js documentation](https://nextjs.org/docs)
