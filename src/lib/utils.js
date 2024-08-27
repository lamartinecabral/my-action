// @ts-check

const github = require("@actions/github");

// @ts-ignore
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

const { repo, owner } = github.context.repo;

/** @param {{base: string, name: string}} _ */
async function createBranch({ base, name }) {
  const {
    data: {
      object: { sha },
    },
  } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `refs/heads/${base}`,
  });

  await octokit.rest.git.createRef({
    owner,
    repo,
    sha,
    ref: `refs/heads/${name}`,
  });
}

async function deleteBranch(name) {
  await octokit.rest.git.deleteRef({
    owner,
    repo,
    ref: `refs/heads/${name}`,
  });
}

/** @param {{base: string, head: string, title: string}} _ */
async function createPullRequest({ base, head, title }) {
  const {
    data: { id },
  } = await octokit.rest.pulls.create({
    base,
    head,
    owner,
    repo,
    title,
    draft: false,
  });

  return id;
}

async function closePullRequest(pull_number) {
  return octokit.rest.pulls
    .update({
      owner,
      repo,
      pull_number,
      state: "closed",
    })
    .then(() => true)
    .catch(() => false);
}

module.exports = {
  createBranch,
  deleteBranch,
  createPullRequest,
  closePullRequest,
};
