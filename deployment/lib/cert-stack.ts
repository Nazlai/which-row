import { App, Stack, StackProps } from "aws-cdk-lib";
import {
  Certificate,
  CertificateValidation,
} from "aws-cdk-lib/aws-certificatemanager";
import { domain, domainName } from "./constants";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class CertificateStack extends Stack {
  constructor(scope: App, id: string, props: StackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, "hostedZone", {
      domainName: domainName,
    });

    const certificate = new Certificate(this, "certificate", {
      domainName: domain,
      validation: CertificateValidation.fromDns(hostedZone),
    });

    new StringParameter(this, "parameter", {
      parameterName: "certificate-arn",
      stringValue: certificate.certificateArn,
    });
  }
}
