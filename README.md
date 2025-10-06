# Content Scheduler

A Next.js application for scheduling and automatically publishing social media content.

## Features

- 📝 Schedule content posts for future publication
- ⏰ Automatic publishing via cron jobs
- 🗄️ MongoDB integration for data persistence
- 🔄 Status tracking (pending, posted, failed)

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file with your MongoDB connection string:
```
MONGODB_URI=your_mongodb_connection_string
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Start the cron job (in a separate terminal):**
```bash
npm run cron
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## API Endpoints

- `POST /api/schedule` - Schedule a new post
- `POST /api/publish` - Publish all pending posts (used by cron job)

## Cron Job

The cron job runs every 5 minutes to check for scheduled posts and publish them automatically. It can be started with:

```bash
npm run cron          # Run once
npm run cron:dev      # Run with watch mode for development
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
