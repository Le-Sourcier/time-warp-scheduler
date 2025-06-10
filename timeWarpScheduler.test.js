const { TimeWarpScheduler } = require("./timeWarpScheduler");

describe("TimeWarpScheduler", () => {
  let scheduler;

  beforeEach(() => {
    scheduler = new TimeWarpScheduler();
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

  test("should throw error for invalid curve", () => {
    expect(() => {
      scheduler.warpTask(() => {}, { curve: "invalid" });
    }).toThrow("Courbe non supportée");
  });

  test("should apply distortion", (done) => {
    scheduler.on("distortionChanged", ({ factor }) => {
      expect(factor).toBe(0.5);
      scheduler.stop();
      done();
    });

    scheduler.distort(() => 0.5);
  });
});
