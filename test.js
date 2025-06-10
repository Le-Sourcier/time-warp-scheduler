const { TimeWarpScheduler } = require("./time-warp-scheduler");
const scheduler = new TimeWarpScheduler();

// Courbe personnalisée
scheduler.warpTask(() => console.log("Tâche personnalisée !"), {
  curve: "custom",
  duration: 10000,
  amplitude: 10000,
  customCurve: (elapsed, duration, amplitude) =>
    amplitude * (elapsed / duration),
});

// Écouter les erreurs
scheduler.on("error", ({ taskId, error }) => {
  console.error(`Erreur dans la tâche ${taskId}: ${error.message}`);
});
