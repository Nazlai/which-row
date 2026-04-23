import { App, Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  Distribution,
  Function,
  FunctionEventType,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
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
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

interface DeployStackProps extends StackProps {
  certificateArn: string;
}
export class DeployStack extends Stack {
  constructor(scope: App, id: string, props: DeployStackProps) {
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

    const certificate = Certificate.fromCertificateArn(
      this,
      "certificate",
      props.certificateArn,
    );

    const redirectFunction = Function.fromFunctionAttributes(
      this,
      "distributionReroute",
      {
        functionArn: "arn:aws:cloudfront::064137888589:function/csvs_reroute",
        functionName: "csvs_reroute",
      },
    );

    const myResponseHeadersPolicy = new ResponseHeadersPolicy(
      this,
      "responseHeadersPolicy",
      {
        responseHeadersPolicyName: "myResponseHeadersPolicy",
        securityHeadersBehavior: {
          contentSecurityPolicy: {
            contentSecurityPolicy: "default-src 'self'",
            override: true,
          },
          referrerPolicy: {
            referrerPolicy: HeadersReferrerPolicy.NO_REFERRER,
            override: true,
          },
          strictTransportSecurity: {
            accessControlMaxAge: Duration.seconds(31536000),
            includeSubdomains: true,
            override: true,
          },
          contentTypeOptions: {
            override: true,
          },
          xssProtection: {
            protection: true,
            override: true,
          },
          frameOptions: {
            frameOption: HeadersFrameOption.DENY,
            override: true,
          },
        },
        removeHeaders: ["Server"],
      },
    );

    const distribution = new Distribution(this, "distribution", {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            function: redirectFunction,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
        responseHeadersPolicy: myResponseHeadersPolicy,
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
