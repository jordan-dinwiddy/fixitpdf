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

# Or to debug
docker run -it fixitpdf/web sh
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


# Run these commands whilst connected to the correct database
GRANT ALL PRIVILEGES ON DATABASE fixitpdf_dev TO fixitpdf_dev;
GRANT CREATE ON SCHEMA public TO fixitpdf_dev;

# In development, user needs permission to create new databases
ALTER USER fixitpdf_dev CREATEDB;

# Local dev database doesn't require creds
DATABASE_URL="postgresql://localhost:5432/fixitpdf_dev"

# Create a migration
npx prisma migrate dev --name init

# Generate the Prisma client
npx prisma generate


```

## PSQL Commands
```
psql -h mycoldplunge-prod.cvammhgiaev1.us-east-1.rds.amazonaws.com --username=mycoldplunge

# List databases
\l;

# List tables of the current database
\dt;

# Change database? 
\c;


```

## APIs
```
# Create a test user
curl -X POST http://localhost:3000/api/utils/create-test-user

# List users
curl http://localhost:3000/api/utils/users
```

## Database Modification / Migrations
### Development
1. Update `schema.prisma`
2. Create the migration and apply it to development: `npx prisma migrate dev --name add-age-to-user`
  * This writes a new file to `/prisma/migrations` that represents the SQL DDL.
  * It applies the change to the development database
3. Regenerate the Prisma client: `npx prisma generate`
  * This process reads in the schema file and generates some types to access the database.
  * The output of this should **not** be stored in source control. Instead it gets written to `/node_modules`. 
  * So the idea is that the generate process runs on every build / deploy.
  * It certainly runs whenever the schema changes.
  * I'm pretty sure the prisma client npm install has a post install hook that triggers generate.

Just **note** that the `prisma generate` command generates new code in `/node_modules' and
therefore doesn't intent for that code to be checked in to Git. Presumably each new fresh
build of the project will regenerate the client.

### Production
1. `npx prisma migrate deploy` - just applies any outstanding migrations.
  * Note that in order to run this the prisma CLI must be available.


## K8's
### DBMigration roles and bindings
The `k8s-wait-for` script is used by pods during init to ensure they don't launch before the migration job has 
completed its run. However this script requires permission to query K8's to ask for the status of the migration
job. That requires the following setup per instructions [here](https://github.com/groundnuty/k8s-wait-for?tab=readme-ov-file).

```bash
kubectl create role pod-reader --verb=get --verb=list --verb=watch --resource=pods,services,deployments,jobs
kubectl create rolebinding default-pod-reader --role=pod-reader --serviceaccount=fixitpdf:default --namespace=fixitpdf
```



# Notes
```
docker build -f packages/worker/Dockerfile -t fixitpdf/worker .
docker run -it fixitpdf/worker sh


docker build -f packages/web/Dockerfile -t fixitpdf/web .
docker run -it fixitpdf/web sh


docker build -f packages/web/Dockerfile -t fixitpdf/web .

# From the root of the project
npm install
npm run build -w packages/shared -w packages/web -w packages/worke
```