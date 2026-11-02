# Local quality checks

Run `./scripts/verify-site.sh` from a clone of this repository. Requires Node.js
(with the built-in `node --test` command), Python 3.9+ and Bash; no package
installation, credentials or network connection are required.

The verifier checks every HTML file for duplicate element IDs, missing local
asset/script targets and broken `#anchors`. It then checks the syntax of every
browser JavaScript file and runs the existing regression tests.

Pull Requests can be reviewed with this one command before merging.

**Note:** a GitHub Actions workflow is not installed by this change. The
available GitHub credential could not create a file under
`.github/workflows/`, so these checks are currently local and on demand.
