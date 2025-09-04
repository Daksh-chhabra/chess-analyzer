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
    const { pgn = "", moves = [], bestmoves = [], grading = [], evalbar = [], cpbar = [], userevalrating = "", oppevalrating = "", userrating = "", opprating = "", userusername = "", oppusername = "", whiteacpl = "", blackacpl = "", grademovenumber = [], userwinpercents = [], blackgradeno = [],pvfen =[] ,booknames = [],isWhite =""} = location.state || {};
    const [whiteuname, setwhiteuname] = useState("White Player");
    const [blackuname, setblackuname] = useState("Black Player");
    const [Count, setCount] = useState(0);
    const [arrows, setarrows] = useState([]);
    const [showIcon, setShowIcon] = useState(false);
    const [displyansidebar, setdisplayansidebar] = useState("none");
    const[boardOrientation,setboardOrientation] =useState("white");;
    const [mainboard,setmainboard] =useState("");
    const [tryboard,settryboard] =useState("none");
    const [pvtrying,setpvtrying] = useState(false);
    const [pvindex, setpvindex] = useState(0);
    const [pvframe, setpvframe] = useState(0);
    let currentpv = [];
    const [dchess,setdchess] = useState();
    
    //console.log("blackgrades ", blackgradeno);
    //console.log("pvfens",pvfen);

    useEffect(() => {
        const timer = setTimeout(() => setShowIcon(true), 3000);
        return () => clearTimeout(timer);
    }, []);


 useEffect( () =>
{
    if(!pvtrying) return ;
    if(pvfen.length === 0 || !pvfen) return ;
 

    const interval =setInterval(() => {
        setpvframe((prev) =>
        {
            if(prev < Math.min(13, currentpv.length) ) return prev +1;
            clearInterval(interval);
            return prev;
        });
    }, 800);
return () => clearInterval(interval);
},[currentpv ,pvtrying]); 





    function acplToAccuracy(acpl) {
        const k = 0.004; 
        let acc = 100 * Math.exp(-k * acpl);
        return parseFloat(acc.toFixed(2));
    }

    console.log("whiteacpl", whiteacpl);
    console.log("blackacpl", blackacpl);


    const whiteaccuracy = acplToAccuracy(whiteacpl);
    const blackaccuracy = acplToAccuracy(blackacpl);








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
            if (typeof g === "string" && g === "Book") {
                const IconComponent = iconMap[g];
                anotate.push(< IconComponent className="icon-svg" />);
            }if (typeof g === "string" && g === "Brilliant") {
                const IconComponent = iconMap[g];
                anotate.push(< IconComponent className="icon-svg" />);
            }if (typeof g === "string" && g === "Miss") {
                const IconComponent = iconMap[g];
                anotate.push(< IconComponent className="icon-svg" />);
            }
            if (typeof g === "string" && g === "Mate") {
                const IconComponent = iconMap[g];
                anotate.push(< IconComponent className="icon-svg" />);
            }
            
        }
    }




    const userrealrating = Math.round(((0.4 * userrating) + (0.6 * userevalrating)) / 50) * 50;
    const opprealrating = Math.round(((0.4 * opprating) + (0.6 * oppevalrating)) / 50) * 50;
    console.log("iswhite",isWhite);
    console.log("userrealrating",userrealrating);
    console.log("opprealrating",opprealrating);
    



    const flipboard =() =>
    {
        if(boardOrientation === "white")
        {
        setboardOrientation("black");
        const temp =whiteuname;
        setwhiteuname(blackuname);
        setblackuname(temp );
        }
        else{
            setboardOrientation("white");
                const temp = whiteuname;
                setwhiteuname(blackuname);
                setblackuname(temp);
        }
    }




    const showtactic = () =>
    { 
        setpvtrying(prev => !prev);
        setpvindex(Count +1);
            setmainboard(pvtrying ? "" : "none");
            settryboard(pvtrying ? "none" : "");
            setpvframe(0);
    }





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









    const { fromSquares, toSquares } = useMemo(() => {
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
        return { fromSquares, toSquares };
    }, [bestmoves]);






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
        if (arrowcount >= 5 &&
            arrowcount < fromSquares.length &&
            fromSquares[arrowcount] &&
            toSquares[arrowcount] && !pvtrying) {
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

 
 currentpv = pvfen[pvindex -1];
const currentfens =  fens ;


    const safeCount = Math.min(Math.max(Count, 0), fens.length - 1);
    const options = {
        position: currentfens[safeCount],
        id: "board",
        arrows,boardOrientation :boardOrientation
    };

    










    
     const pvoptions = {
        position :pvtrying && currentpv ? currentpv[pvframe] || new Chess().fen() : new Chess().fen(),
        boardOrientation :boardOrientation
    }











    function squareCornerPosition(square, boardSize = 640, iconSize = 36, corner = "top-left") {
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = parseInt(square[1], 10) - 1;
        const squareSize = boardSize / 8;

        let left = file*squareSize;
        let top = (7-rank )*squareSize

          if (boardOrientation === "black") {
            left = (7 - file) * squareSize;
            top = rank * squareSize;
        }


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
            left: left + offsetX,
            top: top + offsetY
        };
    }

    const toSquare = [];
    const tochess = new Chess();
    for (const moved of moves) {
        if (typeof moved === "string" && moved.length >= 2) {
            const result = tochess.move(moved);
            if (result && result.to) {
                toSquare.push(result.to);
            }
        }
    }
    console.log(toSquare);






    

    console.log("count", Count);
    const evaled = Count > 1 ? Math.floor((Count - 1)) : -1;
    console.log("cp bar of cpbar ", cpbar);






    const onstartreview = () => {
        setdisplayansidebar("");
    }

console.log("pvindex",pvindex);
console.log("pvfen",pvfen[pvindex]);




















    
    return (
        <div style={{ display: "flex", justifyContent: "space-between", position: "absolute", width: "100%" }}>
            <Sidebars />
            <div className="evalbar">
                <Evalbar cp={userwinpercents[evaled] ?? 53} />
            </div>
            <div style={{ height: "640px", width: "640px", marginTop: "1.5%", flexShrink: "0", position: "relative" ,display :`${mainboard}` }}>
                <div style={{ color: "WHITE", fontSize: "1.5rem", display: "flex" }}>
                    <header>{blackuname}</header>
                </div>
                <Chessboard options={options} />
                <div style={{ color: "WHITE", fontSize: "1.5rem", display: "flex" }}>
                    <footer>{whiteuname}</footer>
                </div>
                {Count > 1 && (() => {
                    const moveindex = Count - 1;
                    if (moveindex < 0) return null;
                    const square = toSquare[moveindex];
                    const grade = grading[moveindex - 1];
                    const Icon = iconMap[grade];
                    if(pvtrying) return null;
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
                                <Icon style={{ width: iconSize, height: iconSize, fill: "#fff" }} />)}
                        </div>
                    );
                })()}
            </div>






            <GameSummaryBox white={{ name: `${userusername}`, accuracy: `${whiteaccuracy}`, elo: `${isWhite ? userrealrating : opprealrating}`, good: { Best: grademovenumber[0], Great: grademovenumber[5], Okay: grademovenumber[3], Good: grademovenumber[4],Brilliant : grademovenumber[7] }, bad: { Mistake: grademovenumber[1], Inaccuracy: grademovenumber[6], Blunder: grademovenumber[2],Miss:grademovenumber[8] ,Mate :grademovenumber[9] } }}

                black={{ name: `${oppusername}`, accuracy: `${blackaccuracy}`, elo: `${isWhite ? opprealrating : userrealrating}`, good: { Best: blackgradeno[0], Great: blackgradeno[5], Okay: blackgradeno[3], Good: blackgradeno[4] ,Brilliant : blackgradeno[7] }, bad: { Mistake: blackgradeno[1], Inaccuracy: blackgradeno[6], Blunder: blackgradeno[2],Miss:blackgradeno[8],Mate:blackgradeno[9] } }}

                onreview={onstartreview}

            />






                
                {pvtrying && (

            <div style={{ height: "640px", width: "640px", marginTop: "1.5%", flexShrink: "0", position: "relative" ,/*display :`${tryboard}`*/ }}>

                <div style={{ color: "WHITE", fontSize: "1.5rem", display: "flex" }}>
                    <header>{blackuname}</header>
                </div>
                <Chessboard options ={pvoptions}/>
                <div style={{ color: "WHITE", fontSize: "1.5rem", display: "flex" }}>
                <footer>{whiteuname}</footer>
                </div>
                

            </div>
            )}







            <Ansidebar
                onIncrease={increase}
                onDecrease={decrease}
                onReset={reset}
                movelist={moves}
                pgn={pgn}
                counting={Count}
                display={displyansidebar}
                onflip ={flipboard}
                showtactic ={showtactic}
                pvtrying ={pvtrying}
                booknames = {booknames}
            />
        </div>
    );
};

export default Analytics;