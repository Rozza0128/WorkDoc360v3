
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BaseStack } from '../lib/base-stack';

const app = new cdk.App();

// You can pass context via: cdk deploy -c domainName=workdoc360.com -c subdomain=app
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

new BaseStack(app, 'WD360-BaseStack', {
  env,
  // Optional: set these if/when you migrate DNS to Route53 and want a custom domain
  domainName: app.node.tryGetContext('domainName'),
  subdomain: app.node.tryGetContext('subdomain') ?? 'app'
});
