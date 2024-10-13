"use server";

import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function writeWorkflowFile(
  owner: string,
  repo: string,
  workflowName: string,
  workflowContent: string
) {
  const workflowFileName = workflowName.toLowerCase().replace(" ", "-");
  const rsp = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: `.github/workflows/${workflowFileName}.yml`,
    message: "Add workflow file",
    content: Buffer.from(workflowContent).toString("base64"),
    committer: {
      name: "Workfly",
      email: "bot@workfly.dev",
    },
  });
}
