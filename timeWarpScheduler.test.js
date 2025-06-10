const { TimeWarpScheduler } = require("./time-warp-scheduler");

describe("TimeWarpScheduler", () => {
  let scheduler;

  beforeEach(() => {
    scheduler = new TimeWarpScheduler();
  });

  afterEach(() => {
    scheduler.stop(); // Ensure scheduler is stopped after each test
  });

  test("should add and execute a task", (done) => {
    scheduler.on("taskExecuted", ({ taskId }) => {
      expect(taskId).toBe(0);
      scheduler.stop();
      done();
    });

    scheduler.warpTask(() => {}, {
      curve: "linear",
      duration: 1000,
      amplitude: 100,
    });
  });
  test("should throw error for invalid curve", async () => {
    await expect(
      scheduler.warpTask(() => {}, {
        curve: "invalid",
        duration: 1000,
        amplitude: 100,
      })
    ).rejects.toThrow(
      "Unsupported curve type: invalid. Use linear, sinusoidal, exponential, logarithmic, or custom."
    );
  });

  test("should apply distortion", (done) => {
    scheduler.on("distortionChanged", ({ factor }) => {
      expect(factor).toBe(0.5);
      scheduler.stop();
      done();
    });

    scheduler.distort(() => 0.5);
  });

  test("should handle async tasks", (done) => {
    scheduler.on("taskExecuted", ({ taskId }) => {
      expect(taskId).toBe(0);
      scheduler.stop();
      done();
    });

    scheduler.warpTask(
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      },
      {
        curve: "linear", // Ensure valid curve
        duration: 1000,
        amplitude: 100,
      }
    );
  });

  test("should pause and resume scheduler", (done) => {
    let executionCount = 0;
    scheduler.on("taskExecuted", () => {
      executionCount++;
    });

    scheduler.on("paused", () => {
      expect(executionCount).toBe(1); // Should execute once before pause
      scheduler.resume();
    });

    scheduler.on("resumed", () => {
      setTimeout(() => {
        expect(executionCount).toBeGreaterThan(1); // Should resume and execute more
        scheduler.stop();
        done();
      }, 300); // Increased timeout for robustness
    });

    scheduler.warpTask(() => {}, {
      curve: "linear",
      duration: 100,
      amplitude: 100,
    });

    setTimeout(() => scheduler.pause(), 200); // Pause after one execution
  });

  test("should cancel a task", (done) => {
    scheduler.on("taskCancelled", ({ taskId }) => {
      expect(taskId).toBe(0);
      expect(scheduler.getTaskStatus(0)).toBe("cancelled");
      scheduler.stop();
      done();
    });

    scheduler.warpTask(() => {}, {
      curve: "linear",
      duration: 1000,
      amplitude: 100,
    });

    scheduler.cancelTask(0);
  });

  test("should export and import history", () => {
    scheduler.warpTask(() => {}, {
      curve: "linear",
      duration: 1000,
      amplitude: 30,
    });

    const history = scheduler.exportHistory();
    const newScheduler = new TimeWarpScheduler();
    newScheduler.importHistory(history);
    expect(newScheduler.history).toEqual(JSON.parse(history));
  });
});
