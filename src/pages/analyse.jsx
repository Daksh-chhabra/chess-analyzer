import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, WHITE } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Sidebars from "../components/sidebar";
import { Form, useLocation } from "react-router-dom";
import Ansidebar from "../components/ansidebar";
import iconMap from "../components/icons";
import Evalbar from "../components/evalbar";
import analyse from "./pages-css/analyse.css";
import GameSummaryBox from "../components/startingevals.jsx";

const Analytics = () => {
    const location = useLocation();
    const { pgn = "", moves = [], bestmoves = [] ,grading =[] ,evalbar =[],cpbar =[],userevalrating ="",oppevalrating ="",userrated = "",opprated ="",userusername ="",oppusername ="" } = location.state || {};
    const [whiteuname, setwhiteuname] = useState("White Player");
    const [blackuname, setblackuname] = useState("Black Player");
    const [Count, setCount] = useState(0);
    const [arrows, setarrows] = useState([]);
    const [showIcon, setShowIcon] = useState(false);
    const [displyansidebar,setdisplayansidebar] =useState("none");

useEffect(() => {
  const timer = setTimeout(() => setShowIcon(true), 3000); 
  return () => clearTimeout(timer);
}, []);




    let anotate = [];
    function gradestoanotations(array) {
      for (const g of array) {
        if (typeof g === "string" && g === "Best") {
          const IconComponent = iconMap[g];
          anotate.push(< IconComponent className="icon-svg" />);
        }
        if (typeof g === "string" && g === "Great") {
          const IconComponent = iconMap[g];
          anotate.push(< IconComponent className="icon-svg" />);
        }
        if (typeof g === "string" && g === "Good") {
          const IconComponent = iconMap[g];
          anotate.push(< IconComponent className="icon-svg" />);
        }
        if (typeof g === "string" && g === "Okay") {
          const IconComponent = iconMap[g];
          anotate.push(< IconComponent className="icon-svg" />);
        }
        if (typeof g === "string" && g === "Inaccuracy") {
          const IconComponent = iconMap[g];
          anotate.push(< IconComponent className="icon-svg" />);
        }
        if (typeof g === "string" && g === "Mistake") {
          const IconComponent = iconMap[g];
          anotate.push(< IconComponent className="icon-svg" />);
        }
        if (typeof g === "string" && g === "Blunder") {
          const IconComponent = iconMap[g];
          anotate.push(< IconComponent className="icon-svg" />);
        }
      }
    }
const userrealrating = Math.round(((0.4 * userrated) + (0.6 * userevalrating))/50)*50;
const opprealrating = Math.round(((0.4 * opprated) + (0.6 * oppevalrating))/50 )*50;
console.log("userrealrating",userrealrating);
console.log("opprealrating",opprealrating);




    gradestoanotations(grading);
    useEffect(() => {
        if (!pgn) return;
        try {
            const ma = pgn.match(/\[White\s+"(.+?)"\]/);
            const da = pgn.match(/\[Black\s+"(.+?)"\]/);
            if (ma && ma[1]) {
                const uname = ma[1];
                setwhiteuname(uname);
            }
            if (da && da[1]) {
                const daname = da[1];
                setblackuname(daname);
            }
        } catch (error) {
            console.error("Error parsing PGN:", error);
        }
    }, [pgn]);

    const fens = useMemo(() => {
        if (!moves || moves.length === 0) return [new Chess().fen()];
        const chess = new Chess();
        const arr = [chess.fen()];
        moves.forEach(move => {
            try {
                chess.move(move);
                arr.push(chess.fen());
            } catch (err) {
                console.error("error with position is", err);
            }
        });
        return arr; 
    }, [moves]);

    const{fromSquares ,toSquares} = useMemo(() =>
    {
        const fromSquares = [];
        const toSquares = [];
        for (const move of bestmoves) {
            if (typeof move === "string" && move.length >= 4) {
                fromSquares.push(move.substring(0, 2)); 
                toSquares.push(move.substring(2, 4));   
            } else {
                fromSquares.push(null); 
                toSquares.push(null);
            }
        }
        return {fromSquares ,toSquares};
    },[bestmoves]);

    const increase = () => {
        if (Count < fens.length - 1) {
            setCount(Count + 1);
        }
    };
    const decrease = () => {
        if (Count > 0) {
            setCount(Count - 1);
        }
    };
    const reset = () => setCount(0);
    useEffect(() => {
        const arrowcount = Count - 1;
        if (arrowcount >= 0 &&
            arrowcount < fromSquares.length &&
            fromSquares[arrowcount] &&
            toSquares[arrowcount]) {
            setarrows([{
                startSquare: fromSquares[arrowcount],
                endSquare: toSquares[arrowcount],
                color: "blue"
            }]);
        } else {
            setarrows([]);
        }
    }, [Count, fromSquares, toSquares]);

    if (!fens || fens.length === 0) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <div style={{ color: "white", fontSize: "1.5rem" }}>Loading...</div>
            </div>
        );
    }

    const safeCount = Math.min(Math.max(Count, 0), fens.length - 1);
    const options = { 
        position: fens[safeCount], 
        id: "board", 
        arrows,
    };


let currentturn ='w';
if(fens[safeCount])
{
    try{
    const chessinstance = new Chess(fens[safeCount]);
    currentturn = chessinstance.turn();
    }
    catch(e)
    {
        console.log("invalid fen or something ",e);
    }
}







function squareCornerPosition(square, boardSize = 640, iconSize = 36, corner = "top-left") {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(square[1], 10);
  const squareSize = boardSize / 8;
  let offsetX = 52, offsetY = 25; 
  if (corner === "top-left") {
    
  } else if (corner === "top-right") {
    offsetX = squareSize - iconSize - 8;
    offsetY = 10;
  } else if (corner === "bottom-left") {
    offsetX = 12;
    offsetY = squareSize - iconSize - 10;
  } else if (corner === "bottom-right") {
    offsetX = squareSize - iconSize - 8;
    offsetY = squareSize - iconSize - 10;
  }
  return {
    left: file * squareSize + offsetX,
    top: rank * squareSize + offsetY
  };
}

    const toSquare = [];
    const tochess = new Chess();
    for(const moved of moves)
    {
        if(typeof moved === "string" && moved.length>=2)
        {
            const result = tochess.move(moved);
            if(result && result.to)
            {
                toSquare.push(result.to);
            }
        }
    } 
    console.log(toSquare);

    console.log("count",Count);
const evaled = Count >1 ? Math.floor((Count -1))  : -1;
console.log( "cp bar of cpbar ",cpbar);






const onstartreview = () =>
{
    setdisplayansidebar("");
}

    return (
        <div style={{ display: "flex", justifyContent: "space-between", position : "absolute" ,width: "100%"}}>
            <Sidebars />
            <div className="evalbar">
           <Evalbar cp = {evalbar[evaled] ?? 0} turn = {currentturn} /> 
           </div>
            <div style={{ height: "640px", width: "640px", marginTop: "1.5%", flexShrink: "0" ,position :"relative"}}>
                <div style={{ color: "WHITE", fontSize: "1.5rem", display: "flex" }}>
                    <header>{blackuname}</header>
                </div>
                <Chessboard options={options} />
                <div style={{ color: "WHITE", fontSize: "1.5rem", display: "flex" }}>
                    <footer>{whiteuname}</footer>
                </div>
                {Count >1 && (() => {
                    const moveindex = Count -1;
                    if (moveindex < 0) return null;
                    const square = toSquare[moveindex ];
                    const grade = grading[moveindex -1];
                    const Icon = iconMap[grade];
                    if (!square || !Icon) return null;
                    const iconSize = 32;
                    const { left, top } = squareCornerPosition(square, 640, iconSize, "top-left");
                    return (
                        <div
                            style={{
                                position: "absolute",
                                left: left,
                                top: top,
                                width: iconSize,
                                height: iconSize,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 100000,
                                pointerEvents: "none",
                                boxShadow: "0 0 2px rgba(0,0,0,0.3)"
                            }}
                        >
                        {showIcon && (
                            <Icon style={{ width: iconSize , height: iconSize , fill: "#fff" }} /> )}
                        </div>
                    );
                })()}
            </div>

                <GameSummaryBox white = {{name : `${userusername}`,accuracy : "85" ,elo :`${userrealrating}`,good :{Sigma :2,Awesome:2,best :2,Nice :3},bad :{Strange :0,Bad:1,Clown :0}}}

                         black = {{name : `${oppusername}`,accuracy : "85" ,elo :`${opprealrating}`,good :{Sigma :2,Awesome:2,best :2,Nice :3},bad :{Strange :0,Bad:1,Clown :0}}}

                         onreview = {onstartreview}

                />







            <Ansidebar 
                onIncrease={increase} 
                onDecrease={decrease} 
                onReset={reset} 
                movelist={moves} 
                pgn={pgn} 
                counting={Count}
                display = {displyansidebar}
            />
        </div>
    );
};

export default Analytics;