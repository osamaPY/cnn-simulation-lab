# Public Launch Checklist

## Required Before Publishing

- [x] Export TensorFlow.js model to `public/model/`.
- [ ] Verify `/model/model.json` loads on the deployed domain.
- [ ] Spot-check clean hand-drawn digits 0–9.
- [x] Confirm prediction winner matches the largest probability.
- [x] Verify real activation shapes against `model.summary()`.
- [x] Confirm repeated inference does not increase `tf.memory().numTensors`.
- [x] Remove or clearly label every representative, reconstructed, or fallback visualization.
- [x] Verify all controls perform a real action.
- [x] Verify every stage has Beginner, Mathematical, and Exam Prep text.
- [x] Test reduced-motion behavior.
- [x] Test desktop, tablet, and phone layouts.

## Repository Quality

- [x] `npm run lint` passes.
- [x] `npm run test` passes.
- [x] `npm run build` passes.
- [ ] README live-demo link is updated.
- [x] Screenshots are added and compressed.
- [ ] Compressed demo GIF is added.
- [x] Known limitations remain accurate.
- [x] No secrets, training artifacts, or local logs are committed.
- [x] MIT license is present.

## Deployment Verification

### Vercel

- [ ] Import the GitHub repository.
- [ ] Confirm build command is `npm run build`.
- [ ] Confirm output directory is `dist`.
- [ ] Open the deployed app and run a prediction.

### GitHub Pages

- [ ] Select GitHub Actions as the Pages source.
- [ ] Confirm the deployment workflow succeeds.
- [ ] Verify assets and model files load below `/cnn_simulation/`.
- [ ] Open the deployed app and run a prediction.

## Media Capture

- [x] Main workspace screenshot
- [x] Convolution screenshot
- [x] Feature-map screenshot
- [x] Softmax/prediction screenshot
- [x] Screenshot media compressed and referenced from README
- [ ] Short demo GIF compressed and referenced from README
