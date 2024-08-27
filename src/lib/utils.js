// @ts-check

const github = require("@actions/github");

// @ts-ignore
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

const { repo, owner } = github.context.repo;

/** @param {{base: string, name: string}} _ */
async function createBranch({ base, name }) {
  console.log(`get sha from '${base}' branch`);
  const {
    data: {
      object: { sha },
    },
  } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${base}`,
  });

  console.log(`create '${name}' branch`);
  await octokit.rest.git.createRef({
    owner,
    repo,
    sha,
    ref: `refs/heads/${name}`,
  });
}

async function deleteBranch(name) {
  console.log(`delete '${name}' branch`);
  await octokit.rest.git.deleteRef({
    owner,
    repo,
    ref: `heads/${name}`,
  });
}

/** @param {{base: string, head: string, title: string}} _ */
async function createPullRequest({ base, head, title }) {
  console.log(`create PR from ${head} to ${base}: "${title}"`);
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

  console.log(`PR created with id ${id}`);
  return id;
}

async function mergePullRequest(pull_number) {
  console.log(`trying to merge PR ${pull_number}`);
  const mergeable = await retry({
    interval: 10000,
    count: 10,
    func: async () => {
      const {
        data: { mergeable },
      } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number,
      });
      if (mergeable === null) throw new Error("PR not ready yet");
      return mergeable;
    },
  }).catch((err) => {
    console.log("Could not merge PR: ", err);
    return false;
  });

  if (!mergeable) return false;

  return await octokit.rest.pulls
    .merge({
      owner,
      repo,
      pull_number,
      merge_method: "merge",
    })
    .then(() => true)
    .catch(() => false);
}

/**
 * @template T
 * @param {{func: () => Promise<T>, interval: number, count: number}} _
 * @returns {Promise<T>}
 * */
async function retry({ func, interval, count }) {
  return new Promise(async (resolve, reject) => {
    let error;
    while (count--) {
      const response = await func().catch((err) => {
        error = err;
        return undefined;
      });
      if (response !== undefined) return resolve(response);
      await new Promise((r) => setTimeout(r, interval));
    }
    return reject(error);
  });
}

module.exports = {
  createBranch,
  deleteBranch,
  createPullRequest,
  mergePullRequest,
};
