import { App, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Distribution, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { domain, domainName, subDomain } from "./constants";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ENV } from "./env";

export class DeployStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, "zone", {
      domainName: domainName,
    });

    const bucket = new Bucket(this, "bucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: false,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new BucketDeployment(this, "bucketDeployment", {
      sources: [Source.asset("../source/dist")],
      destinationBucket: bucket,
    });

    const certificateArn = StringParameter.valueFromLookup(
      this,
      "certificate-arn",
    );

    const certificateArnLookup = certificateArn.includes("dummy-value")
      ? `arn:aws:acm:${ENV.REGION}:${ENV.ACCOUNT_ID}:certificate/dummy-id`
      : certificateArn;

    const certificate = Certificate.fromCertificateArn(
      this,
      "certificate",
      certificateArnLookup,
    );

    const distribution = new Distribution(this, "distribution", {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: [domain],
      certificate: certificate,
    });

    new ARecord(this, "arecord", {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      recordName: subDomain,
    });
  }
}
