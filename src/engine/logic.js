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
      await this.spawnWorker();
    }
  }

  async spawnWorker() {
    const worker = getEngineWorker(this.enginePath);
    await sendCommandsToWorker(worker, ["uci"], "uciok");
    await sendCommandsToWorker(worker, ["isready"], "readyok");
    await sendCommandsToWorker(worker, ["ucinewgame", "isready"], "readyok");
    worker.isReady = true;
    this.workers.push(worker);
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
    while (true) {
      const nextJob = this.workerQueue.shift();
      if (!nextJob) {
        worker.isReady = true;
        return;
      }
      let res;
      try {
        res = await sendCommandsToWorker(
          worker,
          nextJob.commands,
          nextJob.finalMessage,
          nextJob.onNewMessage
        );
      } catch (e) {
        nextJob.resolve(null);
        continue;
      }
      nextJob.resolve(this.parseResult(res));
    }
  }

  parseResult(results) {
    if (!results) return null;
    let bestmove = null;
    let pvhistory = [];
    let evalCp = null;
    for (const line of results) {
      if (line.includes("score mate")) {
        const m = line.match(/score mate (-?\d+)/);
        if (m) evalCp = { type: "mate", value: parseInt(m[1], 10) };
      } else if (line.includes("score cp")) {
        const m = line.match(/score cp (-?\d+)/);
        if (m) evalCp = { type: "cp", value: parseInt(m[1], 10) };
      }
      if (line.includes(" pv ")) {
        pvhistory = line.split(" pv ")[1].trim().split(" ");
      }
      if (line.startsWith("bestmove")) {
        bestmove = line.split(" ")[1];
      }
    }
    if (!bestmove) return null;
    return { bestmove, pvhistory, evalCp };
  }

  async analyzeFen(fen, { movetime = 2000, depth = null, retries = 3 } = {}) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      const worker = this.acquireWorker();
      const commands = depth
        ? [`position fen ${fen}`, `go depth ${depth}`]
        : [`position fen ${fen}`, `go movetime ${movetime}`];
      const finalMessage = "bestmove";

      if (!worker) {
        return new Promise((resolve) => {
          this.workerQueue.push({
            commands,
            finalMessage,
            resolve: (res) => resolve(res),
          });
        });
      }

      let results;
      try {
        results = await sendCommandsToWorker(worker, commands, finalMessage);
      } catch (err) {
        this.terminateWorker(worker);
        await this.spawnWorker();
        if (attempt === retries) {
          return null;
        }
        continue;
      }

      const parsed = this.parseResult(results);
      await this.releaseWorker(worker);
      if (parsed) return parsed;
      if (attempt === retries) return null;
    }
  }

  terminateWorker(worker) {
    try {
      worker.uci("quit");
    } catch (e) {}
    try {
      worker.terminate();
    } catch (e) {}
    this.workers = this.workers.filter((w) => w !== worker);
  }

  terminate() {
    for (const w of this.workers) this.terminateWorker(w);
    this.workers = [];
    this.workerQueue = [];
  }
}
