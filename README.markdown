TimeWarpScheduler
A JavaScript library for scheduling tasks with non-linear intervals, time distortion, rewind capabilities, and event-driven architecture.
Installation
npm install time-warp-scheduler

Usage
const { TimeWarpScheduler } = require('time-warp-scheduler');

const scheduler = new TimeWarpScheduler();

// Écouter les événements
scheduler.on('taskExecuted', ({ taskId, time }) => {
  console.log(`Tâche ${taskId} exécutée à ${new Date(time).toISOString()}`);
});

// Planifier une tâche avec une courbe logarithmique
scheduler.warpTask(() => {
  console.log('Tâche exécutée !');
}, {
  curve: 'logarithmic',
  duration: 60000,
  amplitude: 1000
});

// Appliquer une distorsion temporelle
scheduler.distort(() => {
  return Math.random() > 0.5 ? 0.5 : 1; // Ralentir ou accélérer aléatoirement
});

// Rejouer une tâche
scheduler.rewind(0);

// Exporter l'historique
const history = scheduler.exportHistory();
console.log(history);

Features

Non-linear intervals: Support for linear, sinusoidal, exponential, logarithmic, and custom curves.
Time distortion: Dynamically adjust execution speed with a callback.
Rewind: Replay past task executions.
Event-driven: Emit events for task execution, errors, distortion changes, and more.
History management: Export and import task execution history.
Lightweight: Minimal dependencies.

API

warpTask(task, options): Schedule a task with custom curve, duration, amplitude, and optional customCurve function.
distort(factorCallback): Apply a dynamic time distortion factor.
rewind(taskId, executionIndex): Replay a specific task execution.
exportHistory(): Export task execution history as JSON.
importHistory(historyJson): Import task execution history from JSON.
stop(): Stop the scheduler.
Events:
taskAdded: Emitted when a task is added.
taskExecuted: Emitted when a task is executed.
distortionChanged: Emitted when the distortion factor changes.
taskRewound: Emitted when a task is rewound.
error: Emitted when an error occurs.
stopped: Emitted when the scheduler stops.

License
MIT
