````markdown
# ⏳ TimeWarpScheduler

A JavaScript library for scheduling tasks with **non-linear time intervals**, **time distortion**, and **rewind capabilities**. Ideal for simulations, animations, games, IoT, or interactive apps.

---

## 📚 Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Example: Heartbeat Simulation](#example-heartbeat-simulation)
- [Use Cases](#use-cases)
- [Contributing](#contributing)
- [License](#license)

---

## 📦 Installation

```bash
npm install time-warp-scheduler
````

Or, use it locally:

```js
const { TimeWarpScheduler } = require('./time-warp-scheduler');
```

---

## ✨ Features

* 🌀 **Non-linear Intervals**: `linear`, `sinusoidal`, `exponential`, `logarithmic`, or `custom` curves.
* 🕰️ **Time Distortion**: Dynamically speed up or slow down task execution.
* 🔁 **Task Rewind**: Replay specific past executions.
* 🔄 **Async Support**: Fully compatible with `async`/`await`.
* ⏸️ **Pause/Resume**: Temporarily halt or resume task scheduling.
* ❌ **Task Cancellation**: Cancel individual tasks via ID.
* 📡 **Event-Driven**: Listen to key lifecycle events (execution, errors, state).
* 🧾 **History Management**: Export/import task execution logs.

---

## 🚀 Usage

```js
const { TimeWarpScheduler } = require('./time-warp-scheduler');

const scheduler = new TimeWarpScheduler();

// Schedule an async task with a sinusoidal curve
scheduler.warpTask(async () => {
  console.log('Task executed!');
  await new Promise(resolve => setTimeout(resolve, 100));
}, {
  curve: 'sinusoidal',
  duration: 10000,
  amplitude: 1000,
  scale: 1.2
});

// Apply time distortion
scheduler.distort(() => 2); // Double speed

// Rewind task
scheduler.rewind(0, 0);

// Control execution
scheduler.pause();
scheduler.resume();
scheduler.cancelTask(0);
scheduler.stop();
```

---

## 📡 Event Listeners

```js
scheduler.on('taskExecuted', ({ taskId, time }) => {
  console.log(`Task ${taskId} executed at ${new Date(time).toISOString()}`);
});

scheduler.on('error', ({ taskId, error }) => {
  console.error(`Error in task ${taskId}: ${error}`);
});
```

---

## 📘 API Reference

### Constructor

```js
const scheduler = new TimeWarpScheduler();
```

### Methods

#### `warpTask(task, options)`

Schedules a task with specific interval behavior.

* `task`: `Function` (sync or async)
* `options`:

  * `curve`: `'linear' | 'sinusoidal' | 'exponential' | 'logarithmic' | 'custom'`
  * `duration`: number (ms, default: `60000`)
  * `amplitude`: number (ms, default: `1000`)
  * `scale`: number (default: `1`)
  * `customCurve`: `(elapsed, duration, amplitude, scale) => number`

✅ Returns: `taskId: number`

---

#### `distort(factorCallback)`

Apply time distortion.

```js
scheduler.distort(() => 2); // 2x speed
```

---

#### `rewind(taskId, executionIndex)`

Replay a past execution.

#### `cancelTask(taskId)`

Cancel task by ID.

#### `pause()` / `resume()`

Pause or resume scheduling.

#### `stop()`

Stop the scheduler entirely.

#### `exportHistory()` / `importHistory(historyJson)`

Export or import execution history.

---

### Events

* `taskAdded`: `{ taskId, options }`
* `taskExecuted`: `{ taskId, time }`
* `distortionChanged`: `{ factor }`
* `taskRewound`: `{ taskId, executionIndex }`
* `taskCancelled`: `{ taskId }`
* `paused` / `resumed` / `stopped`
* `error`: `{ taskId, error }`
* `historyImported`: `{ history }`

---

## ❤️ Example: Heartbeat Simulation

The included `heartbeat.js` mimics a dynamic human pulse (60–120 BPM).

```bash
npm start
```

**Terminal output:**

```
Heartbeat Simulation Started!
Commands: stress, rest, rewind, pause, resume, cancel, stop
❤️ Heartbeat at 2025-06-10T00:24:01.123Z (BPM: 80)
```

🎮 Try commands like:

* `stress` → Speeds up
* `rest` → Slows down
* `rewind` → Replay old beats

Logs are saved to `heartbeats.log`.

---

## 🧠 Use Cases

* **Games**: Animate NPCs, lights, or sounds irregularly.
* **IoT**: Simulate sensor behavior and transmission latency.
* **Medical**: Model heartbeats or respiratory patterns.
* **UI/UX**: Show alerts or tips based on dynamic pacing.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. `git checkout -b feature/new-feature`
3. Commit: `git commit -m 'Add new feature'`
4. Push: `git push origin feature/new-feature`
5. Open a Pull Request 🚀

---

## 📄 License

MIT © 2025 Le-Sourcier
