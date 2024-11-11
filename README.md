This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack
* Typescript, NextJS, React, Postgres, Prisma (ORM), Bull (async processing and queues);


## Building
```bash
# Build
npm run build
docker build -t fixitpdf/web .

# Now run
docker run -p 3000:3000 fixitpdf/web
```

## Manually pushing new image
```bash
docker tag fixitpdf/web:latest 509072450144.dkr.ecr.us-east-1.amazonaws.com/fixitpdf/web:latest
docker push 509072450144.dkr.ecr.us-east-1.amazonaws.com/fixitpdf/web:latest
```

## Helm
### Testing Helm rendering
```
helm install --dry-run fixitpdf ./helm -f secrets.yaml
```


## Setup Notes
```
# Install Prisma and the Prisma client
npm install prisma @prisma/client

# Initialize Prisma in the project
npx prisma init

# Setup dev database
psql -d postgres
CREATE DATABASE fixitpdf_dev;
CREATE USER fixitpdf_dev WITH PASSWORD 'fixitpdf_dev';
GRANT ALL PRIVILEGES ON DATABASE fixitpdf_dev TO fixitpdf_dev;

# In development, user needs permission to create new databases
ALTER USER fixitpdf_dev CREATEDB;

# Local dev database doesn't require creds
DATABASE_URL="postgresql://localhost:5432/fixitpdf_dev"

# Create a migration
npx prisma migrate dev --name init

# Generate the Prisma client
npx prisma generate


```

## APIs
```
# Create a test user
curl -X POST http://localhost:3000/api/utils/create-test-user

# List users
curl http://localhost:3000/api/utils/users
```