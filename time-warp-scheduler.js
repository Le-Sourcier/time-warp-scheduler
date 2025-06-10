// const EventEmitter = require("events");

// class TimeWarpScheduler extends EventEmitter {
//   constructor() {
//     super();
//     this.tasks = [];
//     this.isRunning = false;
//     this.distortionFactor = 1;
//     this.history = [];
//     this.minInterval = 50; // Intervalle minimum pour éviter la surcharge CPU
//   }

//   // Valide les options d'une tâche
//   validateOptions(options) {
//     const { curve = "linear", duration = 60000, amplitude = 1000 } = options;
//     if (
//       ![
//         "linear",
//         "sinusoidal",
//         "exponential",
//         "logarithmic",
//         "custom",
//       ].includes(curve)
//     ) {
//       throw new Error(`Courbe non supportée : ${curve}`);
//     }
//     if (typeof duration !== "number" || duration <= 0) {
//       throw new Error("La durée doit être un nombre positif");
//     }
//     if (typeof amplitude !== "number" || amplitude <= 0) {
//       throw new Error("L'amplitude doit être un nombre positif");
//     }
//     return { curve, duration, amplitude };
//   }

//   // Planifie une tâche avec une courbe temporelle
//   warpTask(task, options = {}) {
//     if (typeof task !== "function") {
//       throw new Error("La tâche doit être une fonction");
//     }

//     const { curve, duration, amplitude } = this.validateOptions(options);
//     const taskId = this.tasks.length;
//     const startTime = Date.now();

//     const taskObj = {
//       id: taskId,
//       task,
//       curve,
//       duration,
//       amplitude,
//       lastExecution: startTime,
//       customCurve: options.customCurve || null, // Pour courbes personnalisées
//     };

//     this.tasks.push(taskObj);
//     this.history.push({ id: taskId, executions: [] });
//     this.emit("taskAdded", { taskId, options });

//     if (!this.isRunning) {
//       this.isRunning = true;
//       this.run();
//     }

//     return taskId;
//   }

//   // Calcule l'intervalle en fonction de la courbe
//   getNextInterval(task, currentTime) {
//     const elapsed = currentTime - task.lastExecution;
//     let interval;

//     switch (task.curve) {
//       case "sinusoidal":
//         interval =
//           task.amplitude *
//           Math.abs(Math.sin((elapsed / task.duration) * Math.PI));
//         break;
//       case "exponential":
//         interval = task.amplitude * Math.exp(-elapsed / task.duration);
//         break;
//       case "logarithmic":
//         interval = task.amplitude * Math.log1p(elapsed / task.duration);
//         break;
//       case "custom":
//         if (typeof task.customCurve !== "function") {
//           throw new Error(
//             "Une fonction customCurve est requise pour la courbe personnalisée"
//           );
//         }
//         interval = task.customCurve(elapsed, task.duration, task.amplitude);
//         break;
//       default:
//         interval = task.amplitude; // Linear
//     }

//     return Math.max(this.minInterval, interval * this.distortionFactor);
//   }

//   // Applique une distorsion temporelle
//   distort(factorCallback) {
//     if (typeof factorCallback !== "function") {
//       throw new Error("factorCallback doit être une fonction");
//     }
//     const newFactor = factorCallback();
//     if (typeof newFactor !== "number" || newFactor <= 0) {
//       throw new Error("Le facteur de distorsion doit être un nombre positif");
//     }
//     this.distortionFactor = newFactor;
//     this.emit("distortionChanged", { factor: newFactor });
//   }

//   // Rebobine pour rejouer une tâche
//   rewind(taskId, executionIndex = 0) {
//     const taskHistory = this.history.find((h) => h.id === taskId);
//     if (!taskHistory) {
//       throw new Error(`Aucune tâche trouvée avec l'ID ${taskId}`);
//     }
//     if (!taskHistory.executions[executionIndex]) {
//       throw new Error(`Aucune exécution trouvée à l'index ${executionIndex}`);
//     }
//     const task = this.tasks.find((t) => t.id === taskId);
//     if (task) {
//       try {
//         task.task();
//         taskHistory.executions.push({ time: Date.now() });
//         this.emit("taskRewound", { taskId, executionIndex });
//       } catch (error) {
//         this.emit("error", { taskId, error });
//       }
//     }
//   }

//   // Exporte l'historique
//   exportHistory() {
//     return JSON.stringify(this.history);
//   }

//   // Importe l'historique
//   importHistory(historyJson) {
//     try {
//       this.history = JSON.parse(historyJson);
//       this.emit("historyImported", { history: this.history });
//     } catch (error) {
//       throw new Error(
//         "Échec de l'importation de l'historique : " + error.message
//       );
//     }
//   }

//   // Boucle principale pour exécuter les tâches
//   run() {
//     const loop = () => {
//       if (!this.isRunning || !this.tasks.length) {
//         this.isRunning = false;
//         return;
//       }

//       const currentTime = Date.now();
//       this.tasks.forEach((task) => {
//         try {
//           const interval = this.getNextInterval(task, currentTime);
//           if (currentTime - task.lastExecution >= interval) {
//             task.task();
//             task.lastExecution = currentTime;
//             this.history
//               .find((h) => h.id === task.id)
//               .executions.push({ time: currentTime });
//             this.emit("taskExecuted", { taskId: task.id, time: currentTime });
//           }
//         } catch (error) {
//           this.emit("error", { taskId: task.id, error });
//         }
//       });

//       setTimeout(loop, this.minInterval);
//     };

//     loop();
//   }

//   // Arrête le planificateur
//   stop() {
//     this.isRunning = false;
//     this.emit("stopped");
//   }
// }

// module.exports = { TimeWarpScheduler };

const EventEmitter = require("events");

class TimeWarpScheduler extends EventEmitter {
  constructor() {
    super();
    this.tasks = [];
    this.isRunning = false;
    this.distortionFactor = 1;
    this.history = [];
    this.minInterval = 100; // Augmenté à 100ms pour éviter la surcharge
  }

  validateOptions(options) {
    const { curve = "linear", duration = 60000, amplitude = 1000 } = options;
    if (
      ![
        "linear",
        "sinusoidal",
        "exponential",
        "logarithmic",
        "custom",
      ].includes(curve)
    ) {
      throw new Error(`Courbe non supportée : ${curve}`);
    }
    if (typeof duration !== "number" || duration <= 0) {
      throw new Error("La durée doit être un nombre positif");
    }
    if (typeof amplitude !== "number" || amplitude <= 0) {
      throw new Error("L'amplitude doit être un nombre positif");
    }
    return { curve, duration, amplitude };
  }

  warpTask(task, options = {}) {
    if (typeof task !== "function") {
      throw new Error("La tâche doit être une fonction");
    }

    const { curve, duration, amplitude } = this.validateOptions(options);
    const taskId = this.tasks.length;
    const startTime = Date.now();

    const taskObj = {
      id: taskId,
      task,
      curve,
      duration,
      amplitude,
      lastExecution: startTime,
      customCurve: options.customCurve || null,
    };

    this.tasks.push(taskObj);
    this.history.push({ id: taskId, executions: [] });
    this.emit("taskAdded", { taskId, options });

    if (!this.isRunning) {
      this.isRunning = true;
      this.run();
    }

    return taskId;
  }

  getNextInterval(task, currentTime) {
    const elapsed = currentTime - task.lastExecution;
    let interval;

    switch (task.curve) {
      case "sinusoidal":
        // Ajout d'une base pour éviter des intervalles trop courts
        interval =
          task.amplitude *
          (0.5 + 0.5 * Math.abs(Math.sin((elapsed / task.duration) * Math.PI)));
        break;
      case "exponential":
        interval = task.amplitude * Math.exp(-elapsed / task.duration);
        break;
      case "logarithmic":
        interval = task.amplitude * Math.log1p(elapsed / task.duration);
        break;
      case "custom":
        if (typeof task.customCurve !== "function") {
          throw new Error(
            "Une fonction customCurve est requise pour la courbe personnalisée"
          );
        }
        interval = task.customCurve(elapsed, task.duration, task.amplitude);
        break;
      default:
        interval = task.amplitude;
    }

    return Math.max(this.minInterval, interval * this.distortionFactor);
  }

  distort(factorCallback) {
    if (typeof factorCallback !== "function") {
      throw new Error("factorCallback doit être une fonction");
    }
    const newFactor = factorCallback();
    if (typeof newFactor !== "number" || newFactor <= 0) {
      throw new Error("Le facteur de distorsion doit être un nombre positif");
    }
    this.distortionFactor = newFactor;
    this.emit("distortionChanged", { factor: newFactor });
  }

  rewind(taskId, executionIndex = 0) {
    const taskHistory = this.history.find((h) => h.id === taskId);
    if (!taskHistory) {
      throw new Error(`Aucune tâche trouvée avec l'ID ${taskId}`);
    }
    if (!taskHistory.executions[executionIndex]) {
      throw new Error(`Aucune exécution trouvée à l'index ${executionIndex}`);
    }
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      try {
        task.task();
        taskHistory.executions.push({ time: Date.now() });
        this.emit("taskRewound", { taskId, executionIndex });
      } catch (error) {
        this.emit("error", { taskId, error });
      }
    }
  }

  exportHistory() {
    return JSON.stringify(this.history);
  }

  importHistory(historyJson) {
    try {
      this.history = JSON.parse(historyJson);
      this.emit("historyImported", { history: this.history });
    } catch (error) {
      throw new Error(
        "Échec de l'importation de l'historique : " + error.message
      );
    }
  }

  run() {
    const loop = () => {
      if (!this.isRunning || !this.tasks.length) {
        this.isRunning = false;
        return;
      }

      const currentTime = Date.now();
      this.tasks.forEach((task) => {
        try {
          const interval = this.getNextInterval(task, currentTime);
          if (currentTime - task.lastExecution >= interval) {
            task.task();
            task.lastExecution = currentTime;
            this.history
              .find((h) => h.id === task.id)
              .executions.push({ time: currentTime });
            this.emit("taskExecuted", { taskId: task.id, time: currentTime });
          }
        } catch (error) {
          this.emit("error", { taskId: task.id, error });
        }
      });

      setTimeout(loop, this.minInterval);
    };

    loop();
  }

  stop() {
    this.isRunning = false;
    this.emit("stopped");
  }
}

module.exports = { TimeWarpScheduler };
