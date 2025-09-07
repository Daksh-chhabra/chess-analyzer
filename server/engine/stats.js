import axios from "axios"
import { Chess } from "chess.js";
import { Ecoopenings } from "./ecocompletebaseOpenings.js";
import { wikiopening } from "./cleanWikipediaOpenings.js";
import { cleanopenings } from "./ecoOpenings.js";

let statsweget;
//let pollingInterval;
const stats = async(username ,Sessionuser) =>
{
    try{
        //const userResponse = await fetch(`http://localhost:5000/statsuser?username=${encodeURIComponent(usedname)}`);
        //const user = await userResponse.json();
        //const username = user.usedname;
        //console.log("usedname",username);

        const reply = await axios.get(`http://localhost:5000/pgnd?username=${encodeURIComponent(username)}`)
        statsweget =  reply.data;
        //console.log("stats we get",statsweget);

            if (statsweget && statsweget.cachedPGNData ) {
            //console.log("Data received successfully. Stopping poll.");
            //clearInterval(pollingInterval); 
            dataextraction(username,Sessionuser); 
        } else {
           
            console.log("Data not yet available. Retrying...");
        }
    }
    catch(err)
    {
        console.log("error in stats is ",err);
    }
}


const dataextraction = async(username,sessionUser) =>
{
    //await stats();
    //const response = await fetch('http://localhost:5000/statsuser');
    //const user = await response.json();
    const uname = username ;
    const pgn = statsweget.cachedPGNData.pgn.pgn;
    //console.log("pgn",pgn );
    //console.log("username",uname);
    const whiteMatch = pgn.match(/\[White\s+"([^"]+)"\]/);
    const white = whiteMatch[1];
    const isWhite = white.toLowerCase() === uname.toLowerCase()
    //console.log("ishwhite ",isWhite);
    const moves = statsweget.cachedPGNData.moves;
    const grades = statsweget.cachedPGNData.grades;
    const cploss = statsweget.cachedPGNData.cpbar;
    let captures = [];
    const chess = new Chess();
    for(const move of moves)
    {
        const result = chess.move(move);
        if(!result.captured)
        {
            captures.push("no capture")
        }
        else
        {
            captures.push(result.captured);
        }

    }
    console.log("captures",captures);
    /*let badknight_x_Bishop = 0;
    let goodknight_x_Bishop =0;
    let badbishop_x_Knight =0;
    let goodbishop_x_Knight= 0; 
    let goodknight_x_Knight =0;
    let badknight_x_Knight =0;*/
    

let badKnight_x_Queen = 0;
let goodKnight_x_Queen = 0;
let badKnight_x_Rook = 0;
let goodKnight_x_Rook = 0;
let badKnight_x_Bishop = 0;
let goodKnight_x_Bishop = 0;
let badKnight_x_Knight = 0;
let goodKnight_x_Knight = 0;
let badKnight_x_Pawn =0;
let  goodKnight_x_Pawn =0;

let badBishop_x_Queen = 0;
let goodBishop_x_Queen = 0;
let badBishop_x_Rook = 0;
let goodBishop_x_Rook = 0;
let badBishop_x_Bishop = 0;
let goodBishop_x_Bishop = 0;
let badBishop_x_Knight = 0;
let goodBishop_x_Knight = 0;
let badBishop_x_Pawn=0;
let goodBishop_x_Pawn=0;

let badRook_x_Queen = 0;
let goodRook_x_Queen = 0;
let badRook_x_Rook = 0;
let goodRook_x_Rook = 0;
let badRook_x_Bishop = 0;
let goodRook_x_Bishop = 0;
let badRook_x_Knight = 0;
let goodRook_x_Knight = 0;
let badRook_x_Pawn=0;
let goodRook_x_Pawn=0;

let badQueen_x_Queen = 0;
let goodQueen_x_Queen = 0;
let badQueen_x_Rook = 0;
let goodQueen_x_Rook = 0;
let badQueen_x_Bishop = 0;
let goodQueen_x_Bishop = 0;
let badQueen_x_Knight = 0;
let goodQueen_x_Knight = 0;
let goodQueen_x_Pawn =0;
let badQueen_x_Pawn =0;

let badPawn_x_Queen = 0;
let goodPawn_x_Queen = 0;
let badPawn_x_Rook = 0;
let goodPawn_x_Rook = 0;
let badPawn_x_Bishop = 0;
let goodPawn_x_Bishop = 0;
let badPawn_x_Knight = 0;
let goodPawn_x_Knight = 0;
let badPawn_x_Pawn = 0;
let goodPawn_x_Pawn = 0;


const startIndex = isWhite ? 0 : 1;

for (let i = startIndex ; i < moves.length; i += 2) {
    const grade = grades[i - 1];
    const capture = captures[i];

    let piece = moves[i][0]; // N, B, R, Q, K, or a-h for pawn
    if (!['N','B','R','Q','K'].includes(piece)) piece = 'P'; 

    const isBad = ["Blunder","Mistake","Inaccuracy"].includes(grade);
    const isGood = ["Best","Great","Good"].includes(grade);

    if (piece === 'N') {
        if (isBad) {
            if (capture === "b") badKnight_x_Bishop++;
            else if (capture === "r") badKnight_x_Rook++;
            else if (capture === "q") badKnight_x_Queen++;
            else if (capture === "n") badKnight_x_Knight++;
            else if (capture === "p") badKnight_x_Pawn++;
        } else if (isGood) {
            if (capture === "b") goodKnight_x_Bishop++;
            else if (capture === "r") goodKnight_x_Rook++;
            else if (capture === "q") goodKnight_x_Queen++;
            else if (capture === "n") goodKnight_x_Knight++;
            else if (capture === "p") goodKnight_x_Pawn++;
        }
    } else if (piece === 'B') {
        if (isBad) {
            if (capture === "b") badBishop_x_Bishop++;
            else if (capture === "r") badBishop_x_Rook++;
            else if (capture === "q") badBishop_x_Queen++;
            else if (capture === "n") badBishop_x_Knight++;
            else if (capture === "p") badBishop_x_Pawn++;
            
        } else if (isGood) {
            if (capture === "b") goodBishop_x_Bishop++;
            else if (capture === "r") goodBishop_x_Rook++;
            else if (capture === "q") goodBishop_x_Queen++;
            else if (capture === "n") goodBishop_x_Knight++;
            else if (capture === "p") goodBishop_x_Pawn++;
            
        }
    } else if (piece === 'R') {
        if (isBad) {
            if (capture === "b") badRook_x_Bishop++;
            else if (capture === "r") badRook_x_Rook++;
            else if (capture === "q") badRook_x_Queen++;
            else if (capture === "n") badRook_x_Knight++;
            else if (capture === "p") badRook_x_Pawn++;
        } else if (isGood) {
            if (capture === "b") goodRook_x_Bishop++;
            else if (capture === "r") goodRook_x_Rook++;
            else if (capture === "q") goodRook_x_Queen++;
            else if (capture === "n") goodRook_x_Knight++;
            else if (capture === "p") goodRook_x_Pawn++;
        }
    } else if (piece === 'Q') {
        if (isBad) {
            if (capture === "b") badQueen_x_Bishop++;
            else if (capture === "r") badQueen_x_Rook++;
            else if (capture === "q") badQueen_x_Queen++;
            else if (capture === "n") badQueen_x_Knight++;
            else if (capture === "p") badQueen_x_Pawn++;
        } else if (isGood) {
            if (capture === "b") goodQueen_x_Bishop++;
            else if (capture === "r") goodQueen_x_Rook++;
            else if (capture === "q") goodQueen_x_Queen++;
            else if (capture === "n") goodQueen_x_Knight++;
            else if (capture === "p") goodQueen_x_Pawn++;
        }
    } 
     else if (piece === 'P') {
        if (isBad) {
            if (capture === "b") badPawn_x_Bishop++;
            else if (capture === "r") badPawn_x_Rook++;
            else if (capture === "q") badPawn_x_Queen++;
            else if (capture === "n") badPawn_x_Knight++;
            else if (capture === "p") badPawn_x_Pawn++;
        } else if (isGood) {
            if (capture === "b") goodPawn_x_Bishop++;
            else if (capture === "r") goodPawn_x_Rook++;
            else if (capture === "q") goodPawn_x_Queen++;
            else if (capture === "n") goodPawn_x_Knight++;
            else if (capture === "p") goodPawn_x_Pawn++;
        }
    }
}



const piecemovenumber = () =>
{
    let opening =[];
    let middlegame =[];
    let endgame =[];
    let openinggrades=[];
    let middlegamegrades=[];
    let endgamegrades =[];
    let xCount =0;
        moves.forEach((move, idx) => {
        if (move.includes("x")) {
            xCount++;
        }

        if (xCount <= 6) {
            opening.push(move);
            openinggrades.push(grades[idx]);
        } else if (xCount <= 12) {
            middlegame.push(move);
            middlegamegrades.push(grades[idx]);
        } else {
            endgame.push(move);
            endgamegrades.push(grades[idx]);
        }
    });


let openingcpsum =0;
let openingcount = 0;
for(let i = isWhite ? 1 : 0 ; i<opening.length; i+=2)
{
    if(cploss[i] !== null && cploss[i] !== undefined && !isNaN(cploss[i])){
     openingcpsum += Math.abs(cploss[i]);
     openingcount++;
     
    }
}
let avgopeningcp = opening.length > 0 ?  openingcpsum/openingcount: 0;

let midgamecpsum =0;
let middlegamecount = 0;
for(let i = isWhite && opening.length % 2 === 0 ?  opening.length +1 : opening.length + 2; i<opening.length + middlegame.length; i+=2)
{
    if(cploss[i] !== null && cploss[i] !== undefined && !isNaN(cploss[i])){
     midgamecpsum += Math.abs(cploss[i]);
     middlegamecount++;
     
    }
}
let avgmidgamecp = middlegame.length > 0 ? midgamecpsum/middlegamecount: 0;

let endgamecpsum =0;
let endgamecount =0;
for(let i =isWhite && (opening.length + middlegame.length) % 2 === 0?  opening.length +middlegame.length +1 : opening.length +middlegame.length + 2; i<opening.length + middlegame.length + endgame.length; i+=2)
{
    if(cploss[i] !== null && cploss[i] !== undefined && !isNaN(cploss[i])) {
     endgamecpsum += Math.abs(cploss[i]);
     endgamecount++
     console.log("endgamecp`${i}`",cploss[i]);
    }
}
let avgendgamecp = endgame.length > 0 ? endgamecpsum/endgamecount : 0;

console.log('cpbar',cploss);
console.log("\n");

console.log("openingacp",avgopeningcp);
console.log("midgamecp",avgmidgamecp);
console.log("endgamecp",avgendgamecp);


console.log("endgame",endgame);
console.log("openinggrade",openinggrades);
}



piecemovenumber();



    function parseheader(pgntext)
    {
        const headers ={};
        const regex = /\[(\w+)\s+"([^"]+)"\]/g;
        let match;
    while ((match = regex.exec(pgntext)) !== null) {
        headers[match[1]] = match[2];
    }
    return headers;
    }

    function getBaseOpening(headers) {
    if (!headers.ECO) return null;
    console.log("eco code z",headers.ECO);
    return headers.ECO;
    }

    function getWinner(headers) {
    const result = headers.Result;
    if (result === "1-0") return headers.White;
    if (result === "0-1") return headers.Black;
    if (result === "1/2-1/2") return "Draw";
    return "Unknown";
    }




    function openingstats(){
    const headers = parseheader(pgn);
    const ECOcodepgn = getBaseOpening(headers);
    const opening = cleanopenings.filter(o => o.eco === ECOcodepgn);

      if (opening.length > 0) {
    console.log("opening(s) played:", opening.map(o => o.name));
  } else {
    console.log("unknown opening (eco:", ecoCode, ")");
  }

    //console.log("opening played",openingplayed);
    const resultofgame = getWinner(headers);
    if(resultofgame.toLowerCase() === uname.toLowerCase())
    {
        console.log("user won",);
        
    }
    }


openingstats();










/* console.log("\n \n");
console.log("badKnight_x_Queen:", badKnight_x_Queen);
console.log("goodKnight_x_Queen:", goodKnight_x_Queen);
console.log("badKnight_x_Rook:", badKnight_x_Rook);
console.log("goodKnight_x_Rook:", goodKnight_x_Rook);
console.log("badKnight_x_Bishop:", badKnight_x_Bishop);
console.log("goodKnight_x_Bishop:", goodKnight_x_Bishop);
console.log("badKnight_x_Knight:", badKnight_x_Knight);
console.log("goodKnight_x_Knight:", goodKnight_x_Knight);
console.log("badKnight_x_Pawn:", badKnight_x_Pawn);
console.log("goodKnight_x_Pawn:", goodKnight_x_Pawn);

console.log("\n\n");

console.log("badBishop_x_Queen:", badBishop_x_Queen);
console.log("goodBishop_x_Queen:", goodBishop_x_Queen);
console.log("badBishop_x_Rook:", badBishop_x_Rook);
console.log("goodBishop_x_Rook:", goodBishop_x_Rook);
console.log("badBishop_x_Bishop:", badBishop_x_Bishop);
console.log("goodBishop_x_Bishop:", goodBishop_x_Bishop);
console.log("badBishop_x_Knight:", badBishop_x_Knight);
console.log("goodBishop_x_Knight:", goodBishop_x_Knight);
console.log("badBishop_x_Pawn:", badBishop_x_Pawn);
console.log("goodBishop_x_Pawn:", goodBishop_x_Pawn);

console.log("\n\n");

console.log("badRook_x_Queen:", badRook_x_Queen);
console.log("goodRook_x_Queen:", goodRook_x_Queen);
console.log("badRook_x_Rook:", badRook_x_Rook);
console.log("goodRook_x_Rook:", goodRook_x_Rook);
console.log("badRook_x_Bishop:", badRook_x_Bishop);
console.log("goodRook_x_Bishop:", goodRook_x_Bishop);
console.log("badRook_x_Knight:", badRook_x_Knight);
console.log("goodRook_x_Knight:", goodRook_x_Knight);
console.log("badRook_x_Pawn:", badRook_x_Pawn);
console.log("goodRook_x_Pawn:", goodRook_x_Pawn);

console.log("\n\n");

console.log("badQueen_x_Queen:", badQueen_x_Queen);
console.log("goodQueen_x_Queen:", goodQueen_x_Queen);
console.log("badQueen_x_Rook:", badQueen_x_Rook);
console.log("goodQueen_x_Rook:", goodQueen_x_Rook);
console.log("badQueen_x_Bishop:", badQueen_x_Bishop);
console.log("goodQueen_x_Bishop:", goodQueen_x_Bishop);
console.log("badQueen_x_Knight:", badQueen_x_Knight);
console.log("goodQueen_x_Knight:", goodQueen_x_Knight);
console.log("badQueen_x_Pawn:", badQueen_x_Pawn);
console.log("goodQueen_x_Pawn:", goodQueen_x_Pawn);

console.log("\n\n");

console.log("badPawn_x_Queen:", badPawn_x_Queen);
console.log("goodPawn_x_Queen:", goodPawn_x_Queen);
console.log("badPawn_x_Rook:", badPawn_x_Rook);
console.log("goodPawn_x_Rook:", goodPawn_x_Rook);
console.log("badPawn_x_Bishop:", badPawn_x_Bishop);
console.log("goodPawn_x_Bishop:", goodPawn_x_Bishop);
console.log("badPawn_x_Knight:", badPawn_x_Knight);
console.log("goodPawn_x_Knight:", goodPawn_x_Knight);
console.log("badPawn_x_Pawn:", badPawn_x_Pawn);
console.log("goodPawn_x_Pawn:", goodPawn_x_Pawn);
*/


}
//pollingInterval = setInterval(stats, 5000); 
//dataextraction();





















export default stats;