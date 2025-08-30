import { UciEngine } from "./engine/logic.js";
import { Chess } from "chess.js";
import { API_URL } from "./pathconfig.js";

console.log("Imported createStockfishService =", UciEngine);

async function analyte() {
    let stockfishService;
    try {
        //console.log("Calling /analyzewithstockfish...");
        const response = await fetch(`${API_URL}/analyzewithstockfish`, {
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({})
        });

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        //console.log("Data received from /analyzewithstockfish:", data);

        stockfishService = await UciEngine.create("stockfish-17.js", 2);
        const { fens } = data;
        const results = [];

        for (const fen of fens) {
           // console.log("Analyzing FEN with Stockfish:", fen);
            const analysis = await stockfishService.analyzeFen(fen, { depth: 15 });
            results.push({ fen, analysis });
        }

        const bestfens = [];
for (let i = 0; i < results.length; i++) {
    if (i === results.length - 1) {
        //console.log("Skipping last fen in bestfens");
        continue;
    }

    const r = results[i];
    const bestmove = r.analysis?.bestmove;

    if (!r.fen || !bestmove) {
        bestfens.push(null);
        continue;
    }

    const chess = new Chess();
    chess.load(r.fen);
    const moveResult = chess.move(bestmove);

    if (moveResult) {
        bestfens.push(chess.fen());
    } else {
        console.warn(`Invalid best move '${bestmove}' for FEN:`, r.fen);
        bestfens.push(null);
    }
}

        const bestresults = [];
        for (const bestfen of bestfens) {
            if (!bestfen) {
                bestresults.push(null);
                continue;
            }
            const bestanalysis = await stockfishService.analyzeFen(bestfen, { depth: 15 });
            bestresults.push({ fen: bestfen, analysis: bestanalysis });
        }
        await fetch(`${API_URL}/wasmresults`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                fens, 
                results, 
                bestfens, 
                bestresults 
            }),
        });
        console.log("All WASM results sent to backend");

    } catch (err) {
        console.error("Error in analyte():", err);
    } finally {
        console.log("Analysis finished (no quit available on stockfishService).");
    }
}

export default analyte;
