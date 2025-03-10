Catch Phrase Admin
A Next.js application for managing catch phrases, with features for reviewing, categorizing, and maintaining a database of phrases.
Project Structure

/app: Next.js app router pages

/admin: Admin dashboard for managing phrases
/review: Reviewer interface for rating and reviewing phrases
/components-demo: Showcase of Shadcn UI components


/components: Reusable UI components

/common: Shared utilities like filters, tables, etc.
/ui: Shadcn UI components


/features: Feature-specific components

/admin: Admin dashboard components
/review: Review interface components
/shared: Shared features (forms, modals)


/hooks: Custom React hooks

usePhrases: For fetching and managing phrases
useStats: For statistics calculations
and more...


/lib: Utility functions and services

/services: API services
/utils: Helper functions



Database Structure
The application uses Supabase with tables for:

phrases: Stores the main phrase data
categories: Main categories for organizing phrases
subcategories: Subcategories within main categories
tags: Tags for additional classification
phrase_tags: Linking table between phrases and tags
votes: Stores user ratings for phrases
reviewers: Information about reviewers

Getting Started

Clone the repository
Install dependencies: npm install
Set up environment variables:

Create a .env.local file with Supabase credentials


Run the development server: npm run dev
Open http://localhost:3000 in your browser

UI Components
The project uses Shadcn UI for its component library. You can see a demo of available components at /components-demo.
Admin Dashboard
Access the admin dashboard at /admin. Features include:

View and manage phrases
Import phrases in bulk
View statistics and analytics
Filter and search phrases

Review Interface
Access the review interface at /review. Features include:

Review phrases for quality and accuracy
Rate phrases and provide feedback
Create new phrases