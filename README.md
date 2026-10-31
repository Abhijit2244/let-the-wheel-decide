# 🎡 Let the Wheel Decide

**Stop overthinking. Add your choices, spin the wheel, and let fate decide!**

Let the Wheel Decide is an interactive decision-making web application built with React, TypeScript, and Vite. It helps you make everyday decisions in a fun and engaging way using a customizable spinning wheel.

< [🚀 **Live Demo — Try the App Now**](https://let-the-wheel-decide.vercel.app/) >

Whether you're deciding what to eat, what to watch, where to go, or simply choosing between multiple options, let the wheel make the decision for you.

---

## ✨ Features

### 🎯 Interactive Decision Wheel
- Spin an animated wheel to randomly select a winner.
- Drag the wheel manually to make a selection.
- Click individual segments to select a choice.
- Smooth wheel rotation and animated transitions.
- Highlight selected and hovered segments.

### 🗂️ Multiple Saved Wheels
- Create and manage multiple decision wheels.
- Rename existing wheels.
- Duplicate wheels to reuse their choices.
- Delete wheels you no longer need.
- Search saved wheels by name.
- Recently used wheels appear first.
- Pagination for managing larger collections.

### ⚙️ Choice Management
- Add new choices to your wheel.
- Edit existing choices.
- Delete individual choices.
- Prevent empty and duplicate choices.
- Create a blank wheel.
- Load demo choices.
- Restore default choices.

### 🏆 Spin Results & History
- Display the winning choice after a spin.
- Distinguish between random spins and manual selections.
- Optionally save spin history.
- View previous results for the active wheel.
- Delete individual history entries.
- Clear history for a particular wheel or all wheels.

### 🎉 Interactive Experience
- Confetti celebration when a random spin finishes.
- Optional celebration sound.
- Enable or disable sound effects.
- Reset wheel position.
- Responsive interface for different screen sizes.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Component-based UI |
| TypeScript | Type safety |
| Vite | Development server and build tooling |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Animations and transitions |
| Lucide React | Icons |
| Canvas Confetti | Celebration effects |
| Browser LocalStorage | Persistent local data |

---

## 📸 Application Preview

<!-- Add your application screenshots here -->

<!--
![Application Screenshot](./screenshots/home.png)
![Wheel Management](./screenshots/wheel-manager.png)
![Spin History](./screenshots/spin-history.png)
-->

---

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/let-the-wheel-decide.git
```

### 2. Navigate to the project directory

```bash
cd let-the-wheel-decide
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### 5. Build for production

```bash
npm run build
```

The optimized production files will be generated in the `dist/` directory.

### 6. Run linting

```bash
npm run lint
```

---

## 📁 Project Structure

```text
let-the-wheel-decide/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── wheel/
│   │   │   ├── Wheel.tsx
│   │   │   └── WheelSegment.tsx
│   │   │
│   │   ├── saved-wheels/
│   │   │   └── WheelManager.tsx
│   │   │
│   │   └── history/
│   │       └── SpinHistory.tsx
│   │
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useSavedWheels.ts
│   │   └── useSpinHistory.ts
│   │
│   ├── types/
│   │   ├── wheel.ts
│   │   └── history.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## 💾 Data Persistence

The application currently uses browser **LocalStorage** to persist data locally.

| Storage Key | Description |
|---|---|
| `saved-wheels` | Stores saved wheels and their choices |
| `active-wheel-id` | Stores the currently selected wheel |
| `wheel-spin-history` | Stores spin history and its enabled state |
| `wheel-choices` | Legacy key used during saved-wheel migration |

This means your saved wheels and history remain available in the same browser on the same device.

**Note:** LocalStorage is device- and browser-specific. The application does not currently provide cloud synchronization or cross-device data sharing.

---

## 🧭 How to Use

1. Open the application.
2. Start with the default wheel or create a new one.
3. Add the choices you want to decide between.
4. Select a saved wheel if you have multiple wheels.
5. Click the spin button or manually drag the wheel.
6. View the result.
7. Enable spin history if you want to keep a record of your decisions.

---

## 🔮 Future Improvements

Here are some ideas planned for future development:

- [ ] Custom wheel colors and themes.
- [ ] Weighted choices and probability controls.
- [ ] Remove the winner after each spin.
- [ ] Prevent consecutive repeat winners.
- [ ] Undo and redo choice changes.
- [ ] Advanced decision analytics and statistics.
- [ ] Export and import wheel configurations.
- [ ] Shareable wheels and QR codes.
- [ ] User accounts and cloud synchronization.
- [ ] AI-powered wheel generation.
- [ ] Group decision-making mode.
- [ ] Progressive Web App (PWA) support.

---

## 🤝 Contributing

Contributions, suggestions, and feature requests are welcome!

If you have an idea that could make the application better:

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes.

```bash
git commit -m "Add: your feature description"
```

4. Push your branch.

```bash
git push origin feature/your-feature-name
```

5. Open a Pull Request.

---

## 📄 License

This project is currently available for personal and educational use. A formal open-source license can be added to the repository separately.

---

## 👨‍💻 Author

**Abhijit Das**

Built with ❤️ using React, TypeScript, and Vite.

---

⭐ If you find this project interesting, consider giving the repository a star!
