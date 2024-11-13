## Getting Started

First, make sure you have a .env.local located in the root of the project folder with these variables defined:

```bash
MONGODB_URI={key value}
OPENAI_API_KEY={key value}
FLUX_API_KEY={key value}
```

Next, install all dependencies:

```bash
npm install
```

Then, run the websocket server:

```bash
node server.mjs
```

Then, run the next server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To re-seed the database with dummy data, run the seed script:

```bash
npm run seed
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
