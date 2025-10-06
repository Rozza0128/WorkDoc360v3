import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53_targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export interface BaseStackProps extends cdk.StackProps {
  domainName?: string;   // e.g. workdoc360.com
  subdomain?: string;    // e.g. app (will become app.workdoc360.com)
}

export class BaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BaseStackProps = {}) {
    super(scope, id, props);

    // 1️⃣ S3 bucket for frontend
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
    });

    // 2️⃣ CloudFront Origin Access Identity
    const oai = new cloudfront.OriginAccessIdentity(this, 'SiteOAI');
    siteBucket.grantRead(oai);

    // 3️⃣ Optional Route53 + ACM Certificate
    let certificateArn: string | undefined = undefined;
    let domainNames: string[] | undefined = undefined;
    let zone: route53.IHostedZone | undefined;
    const { domainName, subdomain = 'app' } = props;

    if (domainName) {
      try {
        zone = route53.HostedZone.fromLookup(this, 'HostedZone', { domainName });
        const fullDomain = `${subdomain}.${domainName}`;
        const cert = new acm.DnsValidatedCertificate(this, 'SiteCert', {
          domainName: fullDomain,
          hostedZone: zone,
          region: 'us-east-1', // CloudFront requires this region
        });
        certificateArn = cert.certificateArn;
        domainNames = [fullDomain];
      } catch {
        new cdk.CfnOutput(this, 'DomainWarning', {
          value: '⚠️ Route53 hosted zone not found, default CloudFront domain used.',
        });
      }
    }

    // 4️⃣ CloudFront Distribution
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket, { originAccessIdentity: oai }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
      ...(domainNames ? { domainNames } : {}),
      ...(certificateArn
        ? {
            certificate: acm.Certificate.fromCertificateArn(
              this,
              'ImportedCert',
              certificateArn
            ),
          }
        : {}),
    });

    // 5️⃣ Deploy frontend build (corrected to top-level dist/public)
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../dist/public')],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // 6️⃣ Route53 alias (if using domain)
    if (zone && domainNames && domainNames.length > 0) {
      new route53.ARecord(this, 'AliasRecord', {
        zone,
        recordName: domainNames[0],
        target: route53.RecordTarget.fromAlias(
          new route53_targets.CloudFrontTarget(distribution)
        ),
      });
    }

    // 7️⃣ Outputs
    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${distribution.distributionDomainName}`,
    });
    new cdk.CfnOutput(this, 'BucketName', { value: siteBucket.bucketName });
  }
}

