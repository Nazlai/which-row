#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { CertificateStack } from "../lib/cert-stack";
import { DeployStack } from "../lib/deploy-stack";
import { ENV } from "../lib/env";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

const app = new App();

const certificateStack = new CertificateStack(app, "certificateStack", {
  env: {
    region: "us-east-1",
    account: ENV.ACCOUNT_ID,
  },
});

const deployStack = new DeployStack(app, "deployStack", {
  env: {
    region: ENV.REGION,
    account: ENV.ACCOUNT_ID,
  },
  crossRegionReferences: true,
});

deployStack.addDependency(certificateStack);

new StringParameter(deployStack, "parameter", {
  parameterName: "certificate-arn",
  stringValue: certificateStack.certificateArn,
});
