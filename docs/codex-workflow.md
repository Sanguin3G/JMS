# JMS Codex workflow

## Roles

External planning is normally done outside the repository by ChatGPT web / Sol high. It provides product or architectural intent, but repository inspection is the source of truth.

Terra high is the primary Codex agent and owns all repository mutations, verification, documentation, staging, and local commits. The model mapping is current practice rather than a permanent dependency.

Luna high is the default read-only specialist. Luna xhigh is reserved for a clearly hard, bounded question where the added analysis materially changes confidence.

## Specialist routing

- `@explore`: bounded mapping of repository structure, code paths, symbols, architecture, tests, configuration, and ownership.
- `@docs_researcher`: authoritative, version-specific framework, library, or toolchain facts after local inspection identifies a material question.
- `@web_researcher`: current external facts or recommendations when official technical documentation is not the main source.
- `@technical_writer`: audit and organization of an already fact-established, minimal documentation set.

Delegate a concrete question, not “understand the repository.” Optimize total work and cost: do not automatically use every specialist. Specialists remain read-only, do not own Git, and do not make product or architecture decisions.

## Operating loop

1. Inspect Git state, repository instructions, manifests, and relevant code before making assumptions.
2. Delegate only independent bounded investigations that improve confidence.
3. Wait for every delegate, reconcile their evidence with the repository, and mark observations versus inferences versus unknowns.
4. Make only the changes authorized by the owner. Preserve unrelated working-tree changes.
5. Verify in proportion to risk. Record environment blockers rather than silently changing toolchains, infrastructure, or dependencies.
6. Use purpose-based local commits; inspect status, diff, and staged diff before each. Never push unless explicitly asked.
