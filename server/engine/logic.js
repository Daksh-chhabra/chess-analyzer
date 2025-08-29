import { Chess } from "chess.js";
//import { analyzefen } from "./engineservices.js";
//import { getEvalFromFen, /*gradeMovesFromFens */ } from "./evalservice.js";
import { openings } from "./openings.js";

function addDefaultPromotion(move, chess) {
  if (typeof move !== "string" || move.includes("=")) return move;

  try {
    const from = move.slice(0, 2);
    const to = move.slice(2, 4);
    const piece = chess.get(from);

    if (piece?.type === "p" && (to[1] === "8" || to[1] === "1")) {
      return move + "=Q";
    }
  } catch (e) {
    console.warn("Promotion check failed for move:", move, e.message);
  }

  return move;
}











export async function handlemovelist(mdata) {
  console.log("got data from index.js", mdata);

  const chess = new Chess();
  const fens = [];

  for (const move of mdata) {
    const fixedMove = addDefaultPromotion(move, chess);
    try {
      chess.move(fixedMove);
      fens.push(chess.fen());
    } catch (err) {
      console.warn("Invalid move:", fixedMove, err.message);
      fens.push(null);
    }
  }




  
/*  for (const fen of fens) {
    try {
      const evals = await getEvalFromFen(fen);
      userevals.push(evals);
    }
    catch (error) {
      console.error("error getting evals from user moves", error);
      userevals.push(null);
    }
  } */









 

  const res = await fetch("http://localhost:5000/getAnalysis", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  const { results, bestresults } = await res.json();
      const bestMovesobj = results;
  //console.log("bestmoves for analysis ", bestMovesobj);

const bestMoves = bestMovesobj.map(r => r?.analysis?.bestmove || null);
const pvhistory = bestMovesobj.map(r => r?.analysis?.pvhistory || null);
const evalcp = bestMovesobj.map(r => r?.analysis?.evalCp || null);
let userevals = [...evalcp];
const bestEvalcp = bestresults.map(r => r?.analysis?.evalCp || null);
let bestevalcp =[...bestEvalcp];





function sanToUciMoves(movesSan) {
    const chess = new Chess();
    const uciMoves = [];

    for (const san of movesSan) {
        const move = chess.move(san);
        if (move) {
            uciMoves.push(move.from + move.to + (move.promotion || ""));
        } else {
            console.warn("Invalid SAN:", san);
        }
    }

    return uciMoves;
}

mdata = sanToUciMoves(mdata);

/* let userevals = evalcp.map((cp, idx) => {
  if (cp === null) return null;
  return (idx % 2 === 0) ? cp : -cp; 
}); */
 

  /*const bestfens = [];

  for (let i = 0; i < bestMoves.length - 1; i++) {
    const fen = fens[i];
    const bestmove = bestMoves[i];

    if (!fen || !bestmove) {
      bestfens.push(null);
      continue;
    }

    const chess = new Chess();
    chess.load(fen);


    const moveResult = chess.move(bestmove);

    if (moveResult) {
      bestfens.push(chess.fen());
    } else {
      console.warn(`Invalid best move '${bestmove}' for FEN:`, fen);
      bestfens.push(null);
    }
  } */

  /*const bestevalcp = [];
  for (const bestfen of bestfens) {
    try {
      const bestevals = await getEvalFromFen(bestfen);
      if (!bestevals) {
        bestevalcp.push(null);
      }
      else {
        bestevalcp.push(bestevals);
      }

    }
    catch (error) {
      console.log("error analyzing bestfen");
    }
  } */


  /*const reply = await fetch("http://localhost:5000/getbestAnalysis", {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  const { bestresults } = await reply.json();
      const bestMovesresult = bestresults;
let bestevalCp = bestMovesresult.map(p => p?.bestanalysis?.evalCp || null);
const bestevalcp = [...bestevalCp];*/

















  let diff = [];
  let diffed = []
  for (let i = 0; i < userevals.length; i++) {
    const differ = Math.abs(bestevalcp[i] - userevals[i + 1]);
    diff.push(differ);
  }
  const cleaneddiff = diff.filter(val => val !== null && !isNaN(val));
  //console.log("cleaned diff", cleaneddiff);


  

 let pvfen = [];

for(let i = 0; i< pvhistory.length; i++)
{
  const pvchess = new Chess(fens[i]);
  const pvline = pvhistory[i];
   const thisLineFens = [pvchess.fen()];
  for(const move of pvline){
    pvchess.move(move);
     thisLineFens.push(pvchess.fen());
  }
 

  pvfen.push(thisLineFens);
} 





  function getWinPercentageFromCp(cp) {
    const clamped = Math.max(-1000, Math.min(1000, cp));
    const MULTIPLIER = -0.00368208;
    const winChances = 2 / (1 + Math.exp(MULTIPLIER * clamped)) - 1;
    return 50 + 50 * winChances;
  }


  const userwinpercents = userevals.map(cp => {
    if (typeof cp !== "number") return null;
    return getWinPercentageFromCp(cp);
  });


  for (let i = 0; i < userwinpercents.length -1; i++) {
    if (userwinpercents[i] !== null) {
      if (i % 2 == 0) {
        userwinpercents[i] = 100 - userwinpercents[i];
      }
    } else if(i%2 ==1) {
      userwinpercents[i] = 100
    }
    else{
      userwinpercents[i] = 0;
    }
  }
  userwinpercents[userwinpercents.length - 1] = userwinpercents[userwinpercents.length -2];


  let windiffed =[];
  for (let i = 0; i < userwinpercents.length - 1; i++) {
    const differed = userwinpercents[i] - userwinpercents[i + 1]
    windiffed.push(differed);
  }






  for (let i = 0; i < userevals.length - 1; i++) {
    const differed = bestevalcp[i] - userevals[i + 1]
    diffed.push(differed);
  }


  let actualgrading = [];

for (let i = 0; i < userevals.length - 1; i++) {
  try {
    const cpDiff = Math.abs(bestevalcp[i] - userevals[i + 1]);
    const winDiff = Math.abs(userwinpercents[i] - userwinpercents[i + 1]);

    const useWin = userwinpercents[i] > 90 || userwinpercents[i] < 10;

    const gradingValue = useWin ? winDiff : cpDiff;
    grading(gradingValue, useWin);
  }
  catch (error) {
    console.log("error grading move", error);
  }
}



function grading(value, useWin = false) {
  if (useWin) {
    
    if (value >= 30) actualgrading.push("Blunder");
    else if (value >= 20) actualgrading.push("Mistake");
    else if (value >= 10) actualgrading.push("Inaccuracy");
    else if (value >= 3.5) actualgrading.push("Okay");
    else if (value >= 1.5) actualgrading.push("Good");
    else actualgrading.push("Best");
  } else {
    
    if (value >= 300) actualgrading.push("Blunder");
    else if (value >= 200) actualgrading.push("Mistake");
    else if (value >= 100) actualgrading.push("Inaccuracy");
    else if (value >= 40) actualgrading.push("Okay");
    else if (value >= 15) actualgrading.push("Good");
    else actualgrading.push("Best");
  }
}
  for(let i =0; i<actualgrading.length -1; i++)
  {
if(mdata[i] === bestMoves[i+1])
{
  actualgrading[i] = "Best"
  console.log("mdata",mdata[i]);
}
  }


  for(let i =0; i<actualgrading.length -1; i++)
  {
    if(diff[i] === 0 && Math.abs((userwinpercents[i] - userwinpercents[i+1])) >3  && actualgrading[i] === "Best")
    {
      actualgrading[i] = "Great"
    }
  }


  function trimFen(fen) {
  if (!fen) return null;
  return fen.split(' ')[0]; 
}
const bookfens = openings.map(o=> o.fen);
const openingname = openings.map(o => o.name);
let booknames = [];

for(let i =0; i<fens.length ; i++)
{
  const trimmedfen =trimFen(fens[i]);
    //console.log(`Checking fen[${i}]:`, trimmedfen);
  //console.log(`Is in bookfens?`, bookfens.includes(fens[i]));
  const bookIndex = bookfens.indexOf(trimmedfen);
  if(bookfens.includes(trimmedfen))
  {
    actualgrading[i] = "Book";
    booknames.push(openingname[bookIndex]);
  }
}





  let whiteCP = 0;
  let blackCP = 0;
  let whitemoves = 1;
  let blackmoves = 0;


  function ratings(diff) {

    for (let i = 1; i < diff.length - 1; i++) {
      const iswhite = (i % 2 === 1);


      if (!iswhite) {
        blackCP += diff[i];
        blackmoves++;
      }
      else {
        whiteCP += diff[i];
        whitemoves++;
      }
    }


  }


  ratings(cleaneddiff);

  const whiteACPL = whiteCP / whitemoves;
  const blackACPL = blackCP / blackmoves;




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



  let whitebest = 0;
  let whitegood = 0;
  let whiteblunder = 0;
  let whitemistake = 0;
  let whiteokay = 0;
  let whiteInaccuracy = 0;
  let whitegreat = 0;


  for (let i = 0; i < actualgrading.length - 1; i++) {
    if (i % 2 === 1) {
      const grade = actualgrading[i];

      if (typeof grade === "string" && grade.length > 3) {
        if (grade.includes("Best")) {
          whitebest++;
        }
        if (grade.includes("Blunder")) {
          whiteblunder++;
        }
        if (grade.includes("Mistake")) {
          whitemistake++;
        }
        if (grade.includes("Inaccuracy")) {
          whiteInaccuracy++;
        }
        if (grade.includes("Okay")) {
          whiteokay++;
        }
        if (grade.includes("Great")) {
          whitegreat++;
        }
        if (grade.includes("Good")) {
          whitegood++;
        }

      }
    }
  }


  const grademovenumbers = [whitebest, whitemistake, whiteblunder, whiteokay, whitegood, whitegreat, whiteInaccuracy];



//TODO : add voilitality and weighted standard deviation as in lichess accuracy function and grade moves according to position 


  let blackbest = 0;
  let blackgood = 0;
  let blackblunder = 0;
  let blackmistake = 0;
  let blackokay = 0;
  let blackInaccuracy = 0;
  let blackgreat = 0;

  for (let i = 0; i < actualgrading.length -1; i++) {
    if (i % 2 === 0) {
      const grade = actualgrading[i];

      if (typeof grade === "string" && grade.length > 3) {
        if (grade.includes("Best")) blackbest++;
        if (grade.includes("Blunder")) blackblunder++;
        if (grade.includes("Mistake")) blackmistake++;
        if (grade.includes("Inaccuracy")) blackInaccuracy++;
        if (grade.includes("Okay")) blackokay++;
        if (grade.includes("Great")) blackgreat++;
        if (grade.includes("Good")) blackgood++;
      }
    }
  }

  const blackgradeno = [
    blackbest,
    blackmistake,
    blackblunder,
    blackokay,
    blackgood,
    blackgreat,
    blackInaccuracy,
  ];
  //console.log("blackgrades", blackgradeno);













  //console.log(bestfens);
  //console.log("pvfen",pvfen);
  console.log("userwin percetn ", userwinpercents)
  console.log("cploss", diff);
  //console.log("cploss without absolute value ", diffed);
  console.log("user move evals", userevals);
  console.log("best eval cp ", bestevalcp);
  console.log("Best moves:", bestMoves);
  console.log("actual Grades ", actualgrading);
  console.log("black ACPL", blackACPL);
  console.log("white ACPL", whiteACPL);
  console.log("white rating ", acplToRating(whiteACPL));
  console.log("black rating ", acplToRating(blackACPL));
  //console.log("Grades:", grades);
  return { bestMoves, actualgrading, blackACPL, whiteACPL, blackrating, whiterating, userevals, diffed, grademovenumbers, userwinpercents, blackgradeno ,pvfen ,booknames };
}
