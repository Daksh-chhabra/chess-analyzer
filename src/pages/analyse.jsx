import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, WHITE } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Sidebars from "../components/sidebar";
import { Form, useLocation } from "react-router-dom";
import Ansidebar from "../components/ansidebar";
import iconMap from "../components/icons";
import Evalbar from "../components/evalbar";
import GameSummaryBox from "../components/startingevals.jsx";
import "./pages-css/analyse.css"; 
import AnsidebarHorizontal from "../components/horizontalansidebar.jsx";
import UniqueSidebars from "../components/verticalsidebar.jsx";

const Analytics = () => {
    const location = useLocation();
    const {
        key = `analytics_${Date.now()}_${Math.random()}`, // Provide fallback key
        pgn = "", 
        moves = [], 
        bestmoves = [], 
        grading = [], 
        evalbar = [], 
        cpbar = [], 
        userevalrating = "", 
        oppevalrating = "", 
        userrating = "", 
        opprating = "", 
        userusername = "", 
        oppusername = "", 
        whiteacpl = "", 
        blackacpl = "", 
        grademovenumber = [], 
        userwinpercents = [], 
        blackgradeno = [],
        pvfen = [],
        booknames = [],
        isWhite = ""
    } = location.state || {};

    // State declarations with initial values
    const [whiteuname, setwhiteuname] = useState("White Player");
    const [blackuname, setblackuname] = useState("Black Player");
    const [Count, setCount] = useState(0);
    const [arrows, setarrows] = useState([]);
    const [showIcon, setShowIcon] = useState(false);
    const [displyansidebar, setdisplayansidebar] = useState("none");
    const [boardOrientation, setboardOrientation] = useState("white");
    const [mainboard, setmainboard] = useState("");
    const [tryboard, settryboard] = useState("none");
    const [pvtrying, setpvtrying] = useState(false);
    const [pvindex, setpvindex] = useState(0);
    const [pvframe, setpvframe] = useState(0);
    const [dchess, setdchess] = useState();
    const [boardSize, setBoardSize] = useState(640);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [reviewStarted, setReviewStarted] = useState(false);
    const [isDataReady, setIsDataReady] = useState(false);

    const boardRef = useRef(null);
    let currentpv = [];

    // CRITICAL: Reset all state when key changes to prevent stale data
    useEffect(() => {
        // Reset all state to initial values
        setwhiteuname("White Player");
        setblackuname("Black Player");
        setCount(0);
        setarrows([]);
        setShowIcon(false);
        setdisplayansidebar("none");
        setboardOrientation("white");
        setmainboard("");
        settryboard("none");
        setpvtrying(false);
        setpvindex(0);
        setpvframe(0);
        setReviewStarted(false);
        setIsDataReady(false);

        // Small delay to ensure state is reset before marking as ready
        const readyTimeout = setTimeout(() => {
            setIsDataReady(true);
        }, 50);

        // Set up the icon timer after reset
        const iconTimer = setTimeout(() => setShowIcon(true), 3000);

        return () => {
            clearTimeout(readyTimeout);
            clearTimeout(iconTimer);
        };
    }, [key]); // This runs every time key changes

    // Validate essential data
    const hasValidData = useMemo(() => {
        return moves && moves.length > 0 && pgn && isDataReady;
    }, [moves, pgn, isDataReady]);

    // Window resize handler
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Board size observer
    useEffect(() => {
        if (!hasValidData) return;
        
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                setBoardSize(entry.contentRect.width); 
            }
        });
        
        if (boardRef.current) observer.observe(boardRef.current);
        return () => observer.disconnect();
    }, [hasValidData]);

    // PV animation effect
    useEffect(() => {
        if (!pvtrying || !hasValidData) return;
        if (pvfen.length === 0 || !pvfen) return;

        const interval = setInterval(() => {
            setpvframe((prev) => {
                if (prev < Math.min(13, currentpv.length)) return prev + 1;
                clearInterval(interval);
                return prev;
            });
        }, 800);
        
        return () => clearInterval(interval);
    }, [currentpv, pvtrying, hasValidData]);

    // Parse usernames from PGN
    useEffect(() => {
        if (!pgn || !hasValidData) return;
        
        try {
            const whiteMatch = pgn.match(/\[White\s+"(.+?)"\]/);
            const blackMatch = pgn.match(/\[Black\s+"(.+?)"\]/);
            
            if (whiteMatch && whiteMatch[1]) setwhiteuname(whiteMatch[1]);
            if (blackMatch && blackMatch[1]) setblackuname(blackMatch[1]);
        } catch (error) {
            console.error("Error parsing PGN:", error);
        }
    }, [pgn, hasValidData]);

    // Calculate FENs from moves
    const fens = useMemo(() => {
        if (!hasValidData || !moves || moves.length === 0) {
            return [new Chess().fen()];
        }
        
        const chess = new Chess();
        const arr = [chess.fen()];
        
        moves.forEach(move => {
            try {
                chess.move(move);
                arr.push(chess.fen());
            } catch (err) {
                console.error("Error with position:", err);
            }
        });
        
        return arr;
    }, [moves, hasValidData]);

    // Calculate square positions for best moves
    const { fromSquares, toSquares } = useMemo(() => {
        if (!hasValidData || !bestmoves) {
            return { fromSquares: [], toSquares: [] };
        }
        
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
    }, [bestmoves, hasValidData]);

    // Arrow management
    useEffect(() => {
        if (!hasValidData) return;
        
        const arrowcount = Count - 1;
        if (arrowcount >= 5 &&
            arrowcount < fromSquares.length &&
            fromSquares[arrowcount] &&
            toSquares[arrowcount] && 
            !pvtrying) {
            setarrows([{
                startSquare: fromSquares[arrowcount],
                endSquare: toSquares[arrowcount],
                color: "blue"
            }]);
        } else {
            setarrows([]);
        }
    }, [Count, fromSquares, toSquares, pvtrying, hasValidData]);

    // Helper functions
    function acplToAccuracy(acpl) {
        const k = 0.004;
        let acc = 100 * Math.exp(-k * acpl);
        return parseFloat(acc.toFixed(2));
    }

    const whiteaccuracy = acplToAccuracy(whiteacpl);
    const blackaccuracy = acplToAccuracy(blackacpl);

    const handlecount = (value) => {
        setCount(value);
        setTimeout(() => {
            setCount((prev) => prev + 1);
        }, 10);
    };

    let anotate = [];
    function gradestoanotations(array) {
        for (const g of array) {
            if (typeof g === "string" && iconMap[g]) {
                const IconComponent = iconMap[g];
                anotate.push(<IconComponent className="icon-svg" key={g} />);
            }
        }
    }

    const userrealrating = Math.round(((0.5 * userrating) + (0.5 * userevalrating)) / 50) * 50;
    const opprealrating = Math.round(((0.5 * opprating) + (0.5 * oppevalrating)) / 50) * 50;

    const flipboard = () => {
        if (boardOrientation === "white") {
            setboardOrientation("black");
            const temp = whiteuname;
            setwhiteuname(blackuname);
            setblackuname(temp);
        } else {
            setboardOrientation("white");
            const temp = whiteuname;
            setwhiteuname(blackuname);
            setblackuname(temp);
        }
    };

    const showtactic = () => { 
        setpvtrying(prev => !prev);
        setpvindex(Count);
        setmainboard(pvtrying ? "" : "none");
        settryboard(pvtrying ? "none" : "");
        setpvframe(0);
    };

    const increase = () => {
        if (Count < fens.length - 1) setCount(Count + 1);
    };

    const decrease = () => {
        if (Count > 0) setCount(Count - 1);
    };

    const reset = () => setCount(0);

    const onstartreview = () => {
        setReviewStarted(true);
        setdisplayansidebar("");
    };

    function squareCornerPosition(square, boardSize, iconSize = 0.05625 * boardSize, corner = "top-left") {
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = parseInt(square[1], 10) - 1;
        const squareSize = boardSize / 8;

        let left = file * squareSize;
        let top = (7 - rank) * squareSize;

        if (boardOrientation === "black") {
            left = (7 - file) * squareSize;
            top = rank * squareSize;
        }

        let offsetX = 0.65 * squareSize;
        let offsetY = 0.3125 * squareSize;
        
        if (corner === "top-left") {
            // Use default offsets
        } else if (corner === "top-right") {
            offsetX = squareSize - iconSize - 0.1 * squareSize;
            offsetY = 0.125 * squareSize;
        } else if (corner === "bottom-left") {
            offsetX = 0.15 * squareSize;
            offsetY = squareSize - iconSize - 0.125 * squareSize;
        } else if (corner === "bottom-right") {
            offsetX = squareSize - iconSize - 0.1 * squareSize;
            offsetY = squareSize - iconSize - 0.125 * squareSize;
        }
        
        return {
            left: left + offsetX,
            top: top + offsetY
        };
    }

    // Early return for loading state
    if (!hasValidData) {
        return (
            <div className="analytics-loading-container">
                <div className="analytics-loading-text">Loading analysis...</div>
            </div>
        );
    }

    // Process grade annotations
    gradestoanotations(grading);

    // Calculate move squares
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

    // Set up current PV
    currentpv = pvfen[pvindex - 1] || [];
    const safeCount = Math.min(Math.max(Count, 0), fens.length - 1);
    const evaled = Count > 1 ? Math.floor((Count - 1)) : -1;

    // Board options
    const options = {
        position: fens[safeCount],
        id: "board",
        arrows,
        boardOrientation: boardOrientation
    };

    const pvoptions = {
        position: pvtrying && currentpv ? currentpv[pvframe] || new Chess().fen() : new Chess().fen(),
        boardOrientation: boardOrientation
    };

    return (
        <div key={`analytics-root-${key}`} className="analytics-root">
            {windowWidth > 768 ? (<Sidebars />) : (<UniqueSidebars />)}

            <div className="boardplusside">
                <div className="boardpluseval">
                    <div className="analytics-evalbar">
                        <Evalbar cp={userwinpercents[evaled] ?? 53} />
                    </div>
                    <div className={`analytics-board-container${mainboard === "none" ? " analytics-board-hidden" : ""}`} ref={boardRef}>
                        <div className="analytics-board-header">
                            <header>{blackuname}</header>
                        </div>
                        <Chessboard options={options} />
                        <div className="analytics-board-footer">
                            <footer>{whiteuname}</footer>
                        </div>
                        {Count > 1 && (() => {
                            const moveindex = Count - 1;
                            if (moveindex < 0) return null;
                            const square = toSquare[moveindex];
                            const grade = grading[moveindex - 1];
                            const Icon = iconMap[grade];
                            if (pvtrying) return null;
                            if (!square || !Icon) return null;
                            const iconSize = 0.05 * boardSize;
                            const { left, top } = squareCornerPosition(square, boardSize, iconSize, "top-left");
                            return (
                                <div
                                    className="analytics-icon-container"
                                    style={{
                                        left: left,
                                        top: top,
                                        width: iconSize,
                                        height: iconSize
                                    }}
                                >
                                    {showIcon && (
                                        <Icon className="analytics-move-icon-svg" style={{ width: iconSize, height: iconSize }} />
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {pvtrying && (
                        <div className="analytics-board-container">
                            <div className="analytics-board-header">
                                <header>{blackuname}</header>
                            </div>
                            <Chessboard options={pvoptions} />
                            <div className="analytics-board-footer">
                                <footer>{whiteuname}</footer>
                            </div>
                        </div>
                    )}
                </div>
                <div className="anbar">
                    {windowWidth > 768 ? (
                        <Ansidebar
                            onIncrease={increase}
                            onDecrease={decrease}
                            onReset={reset}
                            movelist={moves}
                            pgn={pgn}
                            counting={Count}
                            display={displyansidebar}
                            onflip={flipboard}
                            showtactic={showtactic}
                            pvtrying={pvtrying}
                            booknames={booknames}
                            handlecount={handlecount}
                        />
                    ) : (
                        <AnsidebarHorizontal                      
                            onIncrease={increase}
                            onDecrease={decrease}
                            onReset={reset}
                            movelist={moves}
                            pgn={pgn}
                            counting={Count}
                            display={displyansidebar}
                            onflip={flipboard}
                            showtactic={showtactic}
                            pvtrying={pvtrying}
                            booknames={booknames}
                            handlecount={handlecount}
                        />
                    )}
                </div>
            </div>
            {!reviewStarted && (
                <div className="gamebox">      
                    <GameSummaryBox 
                        white={{ 
                            name: `${isWhite ? userusername : oppusername}`, 
                            accuracy: `${whiteaccuracy}`, 
                            elo: `${isWhite ? userrealrating : opprealrating}`, 
                            good: { 
                                Best: grademovenumber[0], 
                                Great: grademovenumber[5], 
                                Okay: grademovenumber[3], 
                                Good: grademovenumber[4],
                                Brilliant: grademovenumber[7] 
                            }, 
                            bad: { 
                                Mistake: grademovenumber[1], 
                                Inaccuracy: grademovenumber[6], 
                                Blunder: grademovenumber[2],
                                Miss: grademovenumber[8],
                                Mate: grademovenumber[9] 
                            } 
                        }}
                        black={{ 
                            name: `${isWhite ? oppusername : userusername}`, 
                            accuracy: `${blackaccuracy}`, 
                            elo: `${isWhite ? opprealrating : userrealrating}`, 
                            good: { 
                                Best: blackgradeno[0], 
                                Great: blackgradeno[5], 
                                Okay: blackgradeno[3], 
                                Good: blackgradeno[4],
                                Brilliant: blackgradeno[7] 
                            }, 
                            bad: { 
                                Mistake: blackgradeno[1], 
                                Inaccuracy: blackgradeno[6], 
                                Blunder: blackgradeno[2],
                                Miss: blackgradeno[8],
                                Mate: blackgradeno[9] 
                            } 
                        }}
                        onreview={onstartreview}
                    />
                </div> 
            )}
        </div>
    );
};

export default Analytics;
