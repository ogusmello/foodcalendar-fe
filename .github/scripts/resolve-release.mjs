import fs from "node:fs";
const { RELEASE_SHA: sha, GITHUB_REPOSITORY: repo, GH_TOKEN: token, GITHUB_OUTPUT: output } = process.env;
if (!/^[a-f0-9]{40}$/.test(sha ?? "")) throw new Error("Use the full 40-character commit SHA");
const response = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/ci.yml/runs?head_sha=${sha}&event=push&status=success&per_page=100`, {
  headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
});
if (!response.ok) throw new Error("Cannot verify the release CI run");
const data = await response.json();
if (!data.workflow_runs?.some(run => run.head_sha === sha && run.head_branch === "main" && run.event === "push" && run.conclusion === "success")) throw new Error("Release has no successful main CI publication");
fs.appendFileSync(output, `image=ghcr.io/${repo.toLowerCase()}
`);
