// Import EventEmitter for event-driven architecture
const EventEmitter = require("events");

const SUPPORTED_CURVES = [
  "linear",
  "sinusoidal",
  "exponential",
  "logarithmic",
  "custom",
];

class TimeWarpScheduler extends EventEmitter {
  // Initialize scheduler properties
  constructor() {
    super();
    this.tasks = []; // Array to store scheduled tasks
    this.isRunning = false; // Flag to control scheduler loop
    this.isPaused = false; // Flag to track pause state
    this.distortionFactor = 1; // Time distortion multiplier
    this.history = []; // Store task execution history
    this.minInterval = 100; // Minimum interval (ms) to prevent CPU overload
  }

  // Validate task options
  validateOptions(options) {
    const {
      curve = "linear",
      duration = 60000,
      amplitude = 1000,
      scale = 1,
    } = options;
    console.debug(`Validating curve: ${curve}`); // Debug log
    if (
      ![
        "linear",
        "sinusoidal",
        "exponential",
        "logarithmic",
        "custom",
      ].includes(curve)
    ) {
      throw new Error(
        `Unsupported curve type: ${curve}. Use linear, sinusoidal, exponential, logarithmic, or custom.`
      );
    }
    if (typeof duration !== "number" || duration <= 0) {
      throw new Error("Duration must be a positive number");
    }
    if (typeof amplitude !== "number" || amplitude <= 0) {
      throw new Error("Amplitude must be a positive number");
    }
    if (typeof scale !== "number" || scale <= 0) {
      throw new Error("Scale must be a positive number");
    }
    return { curve, duration, amplitude, scale };
  }

  // Schedule a task with a temporal curve
  async warpTask(task, options = {}) {
    if (!SUPPORTED_CURVES.includes(options.curve)) {
      throw new Error(
        `Unsupported curve type: ${options.curve}. Use linear, sinusoidal, exponential, logarithmic, or custom.`
      );
    }
    if (typeof task !== "function") {
      throw new Error("Task must be a function");
    }

    const { curve, duration, amplitude, scale } = this.validateOptions(options);
    const taskId = this.tasks.length;
    const startTime = Date.now();

    const taskObj = {
      id: taskId,
      task,
      curve,
      duration,
      amplitude,
      scale,
      lastExecution: startTime,
      customCurve: options.customCurve || null,
      status: "pending", // Track task status: pending, running, cancelled
    };

    this.tasks.push(taskObj);
    this.history.push({ id: taskId, executions: [] });
    this.emit("taskAdded", { taskId, options });

    if (!this.isRunning && !this.isPaused) {
      this.isRunning = true;
      this.run();
    }

    return taskId;
  }

  // Calculate the next interval based on the curve
  getNextInterval(task, currentTime) {
    const elapsed = currentTime - task.lastExecution;
    let interval;

    switch (task.curve) {
      case "sinusoidal":
        // Add base to prevent near-zero intervals, scaled for flexibility
        interval =
          task.amplitude *
          (0.5 +
            0.5 * Math.abs(Math.sin((elapsed / task.duration) * Math.PI))) *
          task.scale;
        break;
      case "exponential":
        interval =
          task.amplitude * Math.exp(-elapsed / task.duration) * task.scale;
        break;
      case "logarithmic":
        interval =
          task.amplitude * Math.log1p(elapsed / task.duration) * task.scale;
        break;
      case "custom":
        if (typeof task.customCurve !== "function") {
          throw new Error(
            "A customCurve function is required for custom curve"
          );
        }
        interval = task.customCurve(
          elapsed,
          task.duration,
          task.amplitude,
          task.scale
        );
        break;
      default:
        interval = task.amplitude * task.scale;
    }

    return Math.max(this.minInterval, interval * this.distortionFactor);
  }

  // Apply time distortion
  distort(factorCallback) {
    if (typeof factorCallback !== "function") {
      throw new Error("factorCallback must be a function");
    }
    const newFactor = factorCallback();
    if (typeof newFactor !== "number" || newFactor <= 0) {
      throw new Error("Distortion factor must be a positive number");
    }
    this.distortionFactor = newFactor;
    this.emit("distortionChanged", { factor: newFactor });
  }

  // Rewind to replay a task execution
  async rewind(taskId, executionIndex = 0) {
    const taskHistory = this.history.find((h) => h.id === taskId);
    if (!taskHistory) {
      throw new Error(`No task found with ID ${taskId}`);
    }
    if (!taskHistory.executions[executionIndex]) {
      throw new Error(
        `No execution found at index ${executionIndex} for task ${taskId}`
      );
    }
    const task = this.tasks.find((t) => t.id === taskId);
    if (task && task.status !== "cancelled") {
      try {
        await task.task(); // Support async tasks
        taskHistory.executions.push({ time: Date.now() });
        this.emit("taskRewound", { taskId, executionIndex });
      } catch (error) {
        this.emit("error", { taskId, error: error.message });
      }
    }
  }

  // Cancel a specific task
  cancelTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`No task found with ID ${taskId}`);
    }
    task.status = "cancelled";
    this.emit("taskCancelled", { taskId });
  }

  // Get task status by ID
  getTaskStatus(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    return task ? task.status : null;
  }

  // Pause the scheduler
  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.isRunning = false;
      this.emit("paused");
    }
  }

  // Resume the scheduler
  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.isRunning = true;
      this.run();
      this.emit("resumed");
    }
  }

  // Export execution history
  exportHistory() {
    return JSON.stringify(this.history, null, 2);
  }

  // Import execution history
  importHistory(historyJson) {
    try {
      this.history = JSON.parse(historyJson);
      this.emit("historyImported", { history: this.history });
    } catch (error) {
      throw new Error(`Failed to import history: ${error.message}`);
    }
  }

  // Main loop to execute tasks
  async run() {
    const loop = async () => {
      if (!this.isRunning || !this.tasks.length || this.isPaused) {
        this.isRunning = false;
        return;
      }

      // Skip loop if all tasks are cancelled
      if (this.tasks.every((task) => task.status === "cancelled")) {
        this.isRunning = false;
        this.emit("stopped");
        return;
      }

      const currentTime = Date.now();
      for (const task of this.tasks) {
        if (task.status === "cancelled") continue;
        try {
          const interval = this.getNextInterval(task, currentTime);
          if (currentTime - task.lastExecution >= interval) {
            task.status = "running";
            await task.task(); // Support async tasks
            task.status = "pending";
            task.lastExecution = currentTime;
            this.history
              .find((h) => h.id === task.id)
              .executions.push({ time: currentTime });
            this.emit("taskExecuted", { taskId: task.id, time: currentTime });
          }
        } catch (error) {
          this.emit("error", { taskId: task.id, error: error.message });
        }
      }

      setTimeout(loop, this.minInterval);
    };

    loop();
  }

  // Stop the scheduler
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.emit("stopped");
  }
}

module.exports = { TimeWarpScheduler };
