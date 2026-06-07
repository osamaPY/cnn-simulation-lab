# Contributing

Thanks for helping improve CNN Digit Lab. Contributions should preserve its
main promise: real ML data stays real, and every educational simplification is
clearly labeled.

## Run Locally

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

## Reporting Issues

Use the GitHub issue templates and include:

- steps to reproduce
- browser and operating system
- expected and actual behavior
- screenshots or console errors when useful

Do not include secrets, private paths, or unrelated logs.

## Pull Requests

- Keep changes focused and explain the educational or technical benefit.
- Add tests for durable math, preprocessing, or user-flow behavior.
- Avoid fragile visual snapshots.
- Label representative kernels, sampled connections, and other simplified
  visualizations as educational simplified views.
- Do not substitute mocked predictions or activations for missing model data.

