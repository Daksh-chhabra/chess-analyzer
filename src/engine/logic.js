import { getEngineWorker, sendCommandsToWorker, getRecommendedWorkersNb } from "./worker/worker";

export class UciEngine {
  constructor(enginePath) {
    this.enginePath = enginePath;
    this.workers = [];
    this.workerQueue = [];
  }

  static async create(enginePath, workersNb = 1) {
    const engine = new UciEngine(enginePath);
    await engine.init(workersNb);
    return engine;
  }

  async init(workersNb = 1) {
    const nb = Math.min(workersNb, getRecommendedWorkersNb());
    for (let i = 0; i < nb; i++) {
      const worker = getEngineWorker(this.enginePath);
      await sendCommandsToWorker(worker, ["uci", "isready"], "readyok");
      worker.isReady = true;
      this.workers.push(worker);
    }
  }

  acquireWorker() {
    for (const w of this.workers) {
      if (w.isReady) {
        w.isReady = false;
        return w;
      }
    }
    return null;
  }

  async releaseWorker(worker) {
    const nextJob = this.workerQueue.shift();
    if (!nextJob) {
      worker.isReady = true;
      return;
    }
    const res = await sendCommandsToWorker(
      worker,
      nextJob.commands,
      nextJob.finalMessage,
      nextJob.onNewMessage
    );
    nextJob.resolve(res);
    this.releaseWorker(worker);
  }

  async analyzeFen(fen, { movetime = 2000, depth = null } = {}) {
    const worker = this.acquireWorker();

    let commands;
    if (depth) {
      commands = [`position fen ${fen}`, `go depth ${depth}`];
    } else {
      commands = [`position fen ${fen}`, `go movetime ${movetime}`];
    }

    const finalMessage = "bestmove";

    if (!worker) {
      return new Promise((resolve) => {
        this.workerQueue.push({ commands, finalMessage, resolve });
      });
    }

    const results = await sendCommandsToWorker(worker, commands, finalMessage);

    let bestmove = null;
    let pvhistory = [];
    let evalCp = null;

    for (const line of results) {
      if (line.includes("score mate")) {
        const match = line.match(/score mate (-?\d+)/);
        if (match) evalCp = match[1].startsWith("-") ? null: null;
      } else if (line.includes("score cp")) {
        const match = line.match(/score cp (-?\d+)/);
        if (match) evalCp = parseInt(match[1], 10);
      }
      if (line.includes(" pv ")) {
        pvhistory = line.split(" pv ")[1].trim().split(" ");
      }
      if (line.startsWith("bestmove")) {
        bestmove = line.split(" ")[1];
      }
    }

    this.releaseWorker(worker);
    return { bestmove, pvhistory, evalCp };
  }

  terminate() {
    for (const w of this.workers) w.terminate();
    this.workers = [];
    this.workerQueue = [];
  }
}
