# CNN Visual Lab: How Machines "See"

[**🚀 Explore the Live Demo**](https://cnn-simulation-psi.vercel.app)

I built this project out of pure curiosity. Convolutional Neural Networks (CNNs) are often treated as "black boxes," but I wanted to peel back the layers and see the math in motion. This is a visual, interactive laboratory designed to show how an image of a hand-drawn digit is transformed into a mathematical prediction.

Everything runs directly in your browser using **TensorFlow.js**. No servers, no hidden APIs—just pure client-side inference.

---

## 🔬 What’s Inside?

### 1. Interactive Pipeline
From the moment you draw a digit, you can follow it through:
- **Convolutional Layers**: Hunting for local patterns (edges and curves).
- **ReLU Activation**: Filtering out the noise and focusing on signal.
- **Max Pooling**: Shrinking the data to keep only the most important features.
- **Dense Layers**: Making high-level global connections.
- **Softmax**: Turning raw scores into an interpretable probability distribution.

### 2. Research & Education (`/research`)
For those who want to see the "code behind the curtain," I've included a dedicated research folder:
- `explain_cnn.py`: A step-by-step walkthrough of CNN algorithms implemented in pure `numpy`.
- `train_mnist.py`: The original Keras script used to train the model you see in the app.
- Complete instructions on how to train and convert your own models for the web.

---

## 🛠️ Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS.
- **Animations**: Framer Motion for that cinematic "flow."
- **Machine Learning**: TensorFlow.js (Inference) & Keras/Python (Training).
- **Deployment**: Vercel.

---

## 🏃 Local Development

If you want to run this locally and tinker with the code:

```bash
# 1. Clone and Install
git clone https://github.com/osamaPY/cnn_simulation.git
cd cnn_simulation
npm install

# 2. Start the Lab
npm run dev
```

If you want to play with the Python training scripts:
```bash
cd research
python -m venv venv
source venv/bin/activate # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
python explain_cnn.py
```

---

## 🤝 Contributing
Since this was a personal "curiosity project," it’s not perfect. If you find a bug or have an idea for a better visualization, feel free to open an issue or a PR!

*Made with ☕ and a lot of matrix math.*
