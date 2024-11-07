This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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


## Resources
### Icons
https://icon-sets.iconify.design/simple-icons/quickbooks/
