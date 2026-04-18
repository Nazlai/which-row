#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { CertificateStack } from "../lib/cert-stack";
import { DeployStack } from "../lib/deploy-stack";

const ACCOUNT_ID = process.env.CDK_DEFAULT_ACCOUNT;
const REGION = process.env.CDK_DEFAULT_REGION;

const app = new App();

const certificateStack = new CertificateStack(app, "certificateStack", {
  env: {
    region: "us-east-1",
    account: ACCOUNT_ID,
  },
});

new DeployStack(app, "deployStack", {
  env: {
    region: REGION,
    account: ACCOUNT_ID,
  },
}).addDependency(certificateStack);
