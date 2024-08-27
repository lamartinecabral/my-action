# Main to Dev javascript action

This action opens a PR to send commits from the main branch to the develop branch.

## Inputs

### `main-branch`

**optional** The name of the main branch. Default `"main"`.

### `dev-branch`

**optional** The name of the dev branch. Default `"develop"`.

## Outputs

### `success`

`"true"` if the PR was closed successfully.

## Example usage

```yaml
uses: lamartinecabral/my-action@main
with:
  main-branch: "master"
```

## Reference

https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-javascript-action
