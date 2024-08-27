// @ts-check

const core = require("@actions/core");
const {
  createBranch,
  createPullRequest,
  closePullRequest,
  deleteBranch,
} = require("./lib/utils");

async function run() {
  try {
    const mainBranch = core.getInput("main-branch") || "main";
    const devBranch = core.getInput("dev-branch") || "develop";

    const PRbranch = `${mainBranch}-to-${devBranch}`;

    await createBranch({ base: mainBranch, name: PRbranch });

    const PRid = await createPullRequest({
      base: devBranch,
      head: PRbranch,
      title: `${mainBranch} to ${devBranch}`,
    });

    const success = await closePullRequest(PRid);

    if (success) await deleteBranch(PRbranch);

    core.setOutput("success", success);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
