# Public Release Plan Compliance

Audited against `CNN Digit Lab — Public Release Plan.md` on June 7, 2026.

## Verified

- Real mouse drawing, preprocessing, TensorFlow.js inference, and real intermediate activations
- Exported model included under `public/model/`
- Model contract: `28x28x1 -> 26x26x8 -> 13x13x8 -> 11x11x16 -> 5x5x16 -> 400 -> 64 -> 10`
- Model test accuracy: 98.43% on MNIST
- Real feature-map viewer with channel selection
- Step-driven convolution and pooling
- Dedicated ReLU clipping visualization
- Real `5x5x16 -> 400` flatten visualization
- Sampled dense wiring explicitly labeled as simplified
- Real Softmax probabilities and honest final confidence explanation
- Tensor shapes shown on every stage
- Beginner, Math, and Exam content populated for all 13 stages
- Math formulas rendered with KaTeX
- Reduced-motion CSS and timeline path
- Real browser prediction verified on a hand-drawn `7`
- Tensor count remained stable at 8 across repeated browser inference
- Real-model Playwright smoke test covering draw, Run, prediction, and timeline navigation
- Reduced-motion, tablet, and phone viewport smoke tests
- Open-source contributor guide, model documentation, MIT license, and issue templates
- Secret/private-path scan and deploy-artifact model-path verification
- Lint, unit tests, E2E test, production build, and GitHub Pages build

## Still Required Before Claiming Public Release v1

- Deploy the live demo and replace the README live-demo placeholder
- Capture and embed a short compressed demo GIF
- Spot-check and record clean hand-drawn digits 0 through 9
- Run and record a mid-tier-device 60fps/profile audit
- Complete tablet and phone manual QA on physical devices
- Publish the prepared changes, configure repository topics/issues, and create the v1.0.0 release

The project is a strong release candidate, but the Public Release Plan explicitly forbids calling
v1 complete until every external launch and media item above is finished.
