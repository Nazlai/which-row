import { App, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  Distribution,
  Function,
  FunctionEventType,
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
