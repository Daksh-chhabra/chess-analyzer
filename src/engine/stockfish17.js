import { UciEngine } from "./logic.js";
import { isMultiThreadSupported, isWasmSupported } from "./checker.js"; 

export class Stockfish17 {

  static async create(lite = false, workersNb = 1) {
    if (!Stockfish17.isSupported()) {
      throw new Error("Stockfish 17 is not supported in this environment");
    }

    const multiThread = isMultiThreadSupported();
    if (!multiThread) console.log("Single thread mode");

        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) lite = true;

    const enginePath =  `stockfish-17${lite ? "-lite" : ""}${multiThread ? "" : "-single"}.js`;


    const engineName = lite ? "Stockfish17Lite" : "Stockfish17";

  
    return UciEngine.create(enginePath, workersNb, engineName);
  }


  static isSupported() {
    return isWasmSupported();
  }
}
