import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getEvalFromFen(fen) {
  return new Promise((resolve, reject) => {
    const stockfishPath = path.join(__dirname, "stockfish.exe");
    const engine = spawn(stockfishPath);

    let evalCp = null;

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");
    engine.stdin.write(`position fen ${fen}\n`);
    engine.stdin.write("go depth 20\n");
    

    engine.stdout.on("data", (data) => {
      const output = data.toString();
      const lines = output.split("\n");

      for (const line of lines) {
        if (line.includes("score cp")) {
          const match = line.match(/score cp (-?\d+)/);
          if (match) {
            evalCp = parseInt(match[1]);
          }
        }

        if (line.startsWith("bestmove")) {
          engine.kill();
          if (evalCp !== null) {
            resolve(evalCp);
          } else {
            reject("Eval not found.");
          }
        }
      }
    });

    engine.stderr.on("data", (err) => {
      console.error("Stockfish error:", err.toString());
    });

    engine.on("close", () => {
      if (evalCp === null) {
        reject("Stockfish closed before returning eval.");
      }
    });
  });
}

function normalizeEval(cp, moveIndex) {
  return (moveIndex % 2 === 0) ? cp : -cp;
}

{/* export async function gradeMovesFromFens(fens) {
  if (!Array.isArray(fens) || fens.length < 2) {
    throw new Error("Need at least two FENs to compare evaluations.");
  }

  const evals = [];
  for (const fen of fens) {
    try {
      const evalCp = await getEvalFromFen(fen);
      evals.push(evalCp);
    } catch (err) {
      console.error("Eval error:", err);
      evals.push(null);
    }
  }
  console.log(evals);
  const grades = [];
  let whiteCPL = 0;
  let blackCPL = 0;
  let whiteMoves = 0;
  let blackMoves = 0;

  for (let i = 1; i < evals.length; i++) {
    const curr = evals[i];
    const prev = evals[i - 1];

    if (prev !== null && curr !== null) {
        const iswhitemove = (i % 2 === 1);
        const currNorm = normalizeEval(curr, i);
      const prevNorm = normalizeEval(prev, i - 1);
        let currentscore = currNorm;
        let bestscore = prevNorm;
        if(!iswhitemove)
        {
            currentscore = -currentscore;
            bestscore = -bestscore;
        }

      const diff = Math.abs(currentscore - bestscore);

      if (iswhitemove) {
                blackCPL += diff;
        blackMoves++;

      } else {
        whiteCPL += diff;
        whiteMoves++;
      }

      if (diff >= 200) {
        grades.push("Blunder");
      } else if (diff >= 100) {
        grades.push("Mistake");
      } else if (diff >= 50) {
        grades.push("Inaccuracy");
      } else if (diff >= 20) {
        grades.push("Okay");
      } else if(diff>=10){ 
        grades.push("Good")
      }else if (diff > 5) {
        grades.push("Great");
      } else if (diff >0) {
        grades.push("Best");
      }
    } else {
      grades.push("");
    }
  }

  const whiteACPL = whiteMoves > 0 ? whiteCPL / whiteMoves : null;
  const blackACPL = blackMoves > 0 ? blackCPL / blackMoves : null;

  //console.log("White ACPL:", whiteACPL);
  //console.log("Black ACPL:", blackACPL);

function acplToRating(acpl) {
  if (acpl === null) return "N/A";

  if (acpl < 15) return 2700; 
  if (acpl < 25) return 2500; 
  if (acpl < 35) return 2200; 
  if (acpl < 45) return 2000; 
  if (acpl < 60) return 1800; 
  if (acpl < 80) return 1600; 
  if (acpl < 70) return 1500;
  if (acpl < 100) return 1400; 
  if (acpl < 125) return 1200;
  if (acpl < 150) return 1000;
  if (acpl < 175) return 900;
  if (acpl < 200) return 800; 
  if (acpl < 250) return 500; 
  if (acpl < 300) return 300;   

  return 100; 
}
const whiterating = acplToRating(whiteACPL);
const blackrating = acplToRating(blackACPL);

  //console.log("White estimated rating:", acplToRating(whiteACPL));
  //console.log("Black estimated rating:", acplToRating(blackACPL));

  return {grades , whiteACPL, blackACPL,whiterating,blackrating };
} */}
