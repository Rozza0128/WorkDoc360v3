
# Workdoc360 — AWS CDK Infra Starter

This CDK app deploys a **cheap, secure, scalable** static frontend on **S3 + CloudFront**,
with optional **Route53 + ACM** custom domain, and SPA routing support.

## Structure
- `bin/workdoc360.ts` — CDK app entrypoint
- `lib/base-stack.ts` — S3, CloudFront (+ optional Route53/ACM), and S3 deployment from `../frontend/dist`
- `cdk.json`, `tsconfig.json`, `package.json` — CDK/TypeScript setup

## Prereqs
- AWS CLI v2 configured (`aws sts get-caller-identity` should work)
- CDK v2 installed globally (`npm i -g aws-cdk`)
- Bootstrapped env: `cdk bootstrap aws://ACCOUNT/eu-west-2`
- Node 18+

## Usage

1) Install deps
```bash
cd infra
npm install
```

2) Build your frontend (Vite/React) **before** deploying
```bash
# from repo root
cd frontend
npm install
npm run build
cd ../infra
```

3a) Deploy **without** custom domain (fastest)
```bash
npm run synth
npm run deploy
```
Output will include `CloudFrontURL` — use that URL immediately.

3b) Deploy **with** custom domain (requires Route53 hosted zone for your domain)
```bash
npm run deploy -- -c domainName=workdoc360.com -c subdomain=app
```
This creates/validates an ACM cert in `us-east-1` and adds an `app.workdoc360.com` A-record.

## Notes
- The S3 bucket is **private** and only accessible via CloudFront using **OAC**.
- SPA routing is enabled by mapping 403/404 to `/index.html`.
- If Route53 is not used, you can point your current DNS (e.g., GoDaddy/Cloudflare) CNAME to the `CloudFrontURL`.
- Logs and lifecycle policies are minimal and cost-aware.
