const { TimeWarpScheduler } = require("./time-warp-scheduler");
const readline = require("readline");
const fs = require("fs").promises;

// Configure readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Initialize scheduler
const scheduler = new TimeWarpScheduler();

// Simulate an async heartbeat with data logging
async function heartbeat() {
  const timestamp = new Date().toISOString();
  const bpm = Math.round(
    60000 / scheduler.getNextInterval(scheduler.tasks[0], Date.now())
  );
  console.log(`❤️ Heartbeat at ${timestamp} (BPM: ${bpm})`);
  // Log to file
  await fs.appendFile(
    "heartbeats.log",
    `Heartbeat at ${timestamp}, BPM: ${bpm}\n`
  );
}

// Schedule heartbeat task
const taskId = scheduler.warpTask(heartbeat, {
  curve: "sinusoidal",
  duration: 10000, // 10-second period for variation
  amplitude: 1000, // Intervals between 500-1000ms (60-120 BPM)
  scale: 1.2, // Slightly increase interval range
});

// Event listeners
scheduler.on("taskExecuted", ({ taskId, time }) => {
  console.log(`Task ${taskId} executed at ${new Date(time).toISOString()}`);
});

scheduler.on("distortionChanged", ({ factor }) => {
  console.log(`Heartbeat rate changed: ${factor}x`);
});

scheduler.on("taskRewound", ({ taskId, executionIndex }) => {
  console.log(`Rewound heartbeat ${taskId} to execution ${executionIndex}`);
});

scheduler.on("error", ({ taskId, error }) => {
  console.error(`Error in task ${taskId}: ${error}`);
});

scheduler.on("taskCancelled", ({ taskId }) => {
  console.log(`Task ${taskId} cancelled`);
});

scheduler.on("paused", () => console.log("Scheduler paused"));
scheduler.on("resumed", () => console.log("Scheduler resumed"));
scheduler.on("stopped", () => console.log("Scheduler stopped"));

// Handle user input
function handleUserInput() {
  console.clear();
  console.log("Heartbeat Simulation Started!");
  console.log(
    "Commands: stress (speed up), rest (slow down), rewind (replay), pause, resume, cancel, stop"
  );
  rl.question("Command: ", async (input) => {
    switch (input.toLowerCase()) {
      case "stress":
        scheduler.distort(() => 2); // Double speed (120-240 BPM)
        console.log("Stress mode activated!");
        break;
      case "rest":
        scheduler.distort(() => 0.5); // Half speed (30-60 BPM)
        console.log("Rest mode activated!");
        break;
      case "rewind":
        await scheduler.rewind(taskId, 0);
        break;
      case "pause":
        scheduler.pause();
        break;
      case "resume":
        scheduler.resume();
        break;
      case "cancel":
        scheduler.cancelTask(taskId);
        console.log("Heartbeat task cancelled");
        break;
      case "stop":
        scheduler.stop();
        console.log("Simulation stopped.");
        console.log("Heartbeat history:", scheduler.exportHistory());
        rl.close();
        return;
      default:
        console.log(
          "Unknown command. Use: stress, rest, rewind, pause, resume, cancel, stop"
        );
    }
    handleUserInput();
  });
}

// Export history on process termination
process.on("SIGINT", async () => {
  console.log("Heartbeat history:", scheduler.exportHistory());
  scheduler.stop();
  rl.close();
  process.exit();
});

// Start simulation
handleUserInput();
