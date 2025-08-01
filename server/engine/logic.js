import { Chess } from "chess.js";
import { analyzefen } from "./engineservices.js";
import { getEvalFromFen, /*gradeMovesFromFens */} from "./evalservice.js"; 

export async function handlemovelist(mdata) {
  console.log("got data from index.js", mdata);

  const chess = new Chess();
  const fens = [];

  for (const move of mdata) {
    chess.move(move);
    fens.push(chess.fen());
  }




  let userevals = [];
  for (const fen of fens )
  {
    try{
      const evals = await getEvalFromFen(fen);
      userevals.push(evals);
    }
    catch(error)
    {
      console.error("error getting evals from user moves",error);
      userevals.push(null);
    }
  } 











  const bestMoves = await Promise.all(
    fens.map(async (fen) => {
      try {
        return await analyzefen(fen);
      } catch (err) {
        console.error("Error analyzing FEN:", err);
        return null;
      }
    })
  );




const bestfens = [];

for (let i = 0; i < bestMoves.length ; i++) {
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
}

const bestevalcp = [];
for (const bestfen of bestfens)
{
  try{
    const bestevals = await getEvalFromFen(bestfen);
    if(!bestevals)
    {
      bestevalcp.push(null);
    }
    else{
      bestevalcp.push(bestevals);
    }
    
  }
  catch(error)
  {
    console.log("error analyzing bestfen");
  }
}

let diff = [];
let diffed = []
for(let i =0; i< userevals.length  ; i++)
{
  const differ = Math.abs(bestevalcp[i] - userevals[i +1]);
  diff.push(differ);
}


for(let i =0 ; i<userevals.length; i++)
{
  const differed = bestevalcp[i] - userevals[i+1]
  diffed.push(differed);
}


let actualgrading = [];

for (const difference of diff)
{
  try {
    grading(difference);
  }
  catch(error)
  {
    console.log("error with something idk ");
  }
}


function grading(diff)
{
  if(diff >=200)
  {
    actualgrading.push("Blunder");
  }
  else if (diff >= 100) {
        actualgrading.push("Mistake");
  }
    else if (diff >= 50) {
        actualgrading.push("Inaccuracy");
  }
    else if (diff >= 20) {
        actualgrading.push("Okay");
  }
    else if (diff >= 10) {
        actualgrading.push("Good");
  }
    else if (diff > 0) {
        actualgrading.push("Great");
  }
    else {
        actualgrading.push("Best");
  }


}


  let whiteCP =0;
  let blackCP = 0;
  let whitemoves = 1;
  let blackmoves = 0 ;


function ratings(diff)
{

  for(let i =1; i < diff.length -1 ;i++ )
  {
  const iswhite = (i % 2 === 1);


  if(!iswhite)
  {
    blackCP  += diff[i];
    blackmoves++;
  }
  else{
    whiteCP += diff[i];
    whitemoves++;
  }
  }

  
}


ratings(diff);

const whiteACPL = whiteCP/whitemoves ;
const blackACPL = blackCP/blackmoves ;




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









  //console.log(bestfens);

  console.log("cploss",diff);
  console.log("cploss without absolute value ",diffed);
  console.log("user move evals",userevals);
  console.log( "best eval cp ", bestevalcp);
  console.log("Best moves:", bestMoves);
  console.log("actual Grades ",actualgrading);
  console.log("black ACPL",blackACPL);
  console.log("white ACPL",whiteACPL);
  console.log("white rating ",acplToRating(whiteACPL));
  console.log("black rating ",acplToRating(blackACPL));
  //console.log("Grades:", grades);
  return { bestMoves,actualgrading ,blackACPL,whiteACPL,blackrating,whiterating,userevals,diffed} ;
}
