This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack
* Typescript, NextJS, React, Postgres, Prisma (ORM), Bull (async processing and queues);


## TODO
- [X] Clicking 'Fix' will display a modal confirming cost and prompting user to proceed.
  - [X] Clicking proceed will first process the transaction (`POST /files/{id}/purchase`) and then
  - [X] Generate a download link for file (`POST /files{id}/download`) and trigger download
  - [X] Any other files in the files list that are in the correct state will also display a download button.
- [ ] If user doesn't have sufficient credits they'll be prompted to purchase more.
- [ ] Clicking 'sign-in' will display modal asking user to choose identity provider. 
- [ ] Dragging/dropping file when not logged in will prompt user to choose identity provider.
- [ ] New users get 5 credits. 
- [ ] Users can purchase credits
- [ ] Emails

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
helm install --dry-run fixitpdf ./helm -f ./helm/config/config.prod.yaml -f secrets.yaml
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

## More Prisma Commands
```
npx prisma migrate reset
npx prisma migrate dev --name add_credits_etc_to_file
npx prisma migrate dev --name init
```

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
# Building the worker is a little different because we have to compile the pdf_annotation_binary and the
# process for that varies a little based on arm64 (Mac silicon) vs amd64. See Dockerfile for more info
# More details here: https://chatgpt.com/share/67367d79-501c-8006-8aec-2164ef3600f7
docker build --build-arg TARGETPLATFORM=linux/arm64 -f packages/worker/Dockerfile -t fixitpdf/worker .
OR
docker build --build-arg TARGETPLATFORM=linux/amd64 -f packages/worker/Dockerfile -t fixitpdf/worker .
docker run -it fixitpdf/worker sh


docker build -f packages/web/Dockerfile -t fixitpdf/web .
docker run -it fixitpdf/web sh


docker build -f packages/web/Dockerfile -t fixitpdf/web .

# From the root of the project
npm install
npm run build -w packages/shared -w packages/web -w packages/worke
```

# Login Providers
This app supports both Google and Apple login/identity providers. 

## OAuth Account Linking
* https://authjs.dev/concepts#security
* https://authjs.dev/reference/core/providers#allowdangerousemailaccountlinking

## Google
[ADD NOTES]

## Apple
The Apple login setup was a bit trickier than Google. And since Apple doesn't support localhost
redirect URI's, it won't work in development. 

Apple also seems to require a new `APPLE_CLIENT_SECRET` being generated every 180 days. The commands
to do that are below: 
```
jdinwiddy@JordansMBPM3Max web % npx auth add apple
Setting up OAuth provider in your Next.js app (more info)...

Add apple ID login support
Setup URL: https://developer.apple.com/account/resources/identifiers/list/serviceId
Callback URL (copied to clipboard): http://localhost:3000/api/auth/callback/apple
_________________________

Provider documentation: https://providers.authjs.dev/apple

‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
Opening setup URL in your browser...

? Paste Client ID: com.fixitpdf.web
? Paste Key ID: 6P52J78ZFN
? Paste Team ID: 2SWU7VRHYW
? Path to Private Key /Users/jdinwiddy/Downloads/AuthKey_6P52J78ZFN.p8
? Expires in days (default: 180) 180
Updating environment variable file...
📝 Created /Users/jdinwiddy/projects/fixitpdf/packages/web/.env.local with `AUTH_APPLE_ID`.
Apple client secret generated. Valid until: Thu May 15 2025 12:11:57 GMT-0700 (Pacific Daylight Time)
➕ Added `AUTH_APPLE_SECRET` to /Users/jdinwiddy/projects/fixitpdf/packages/web/.env.local.

🎉 Done! You can now use this provider in your app.
jdinwiddy@JordansMBPM3Max web % git status
```