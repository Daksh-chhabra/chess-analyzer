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
    const currentKey = useRef(null);
    
    const {
        key = `analytics_${Date.now()}_${Math.random()}`,
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

    const [isInitialized, setIsInitialized] = useState(false);
    const [sessionKey, setSessionKey] = useState(null);

    const createFreshState = () => ({
        whiteuname: "White Player",
        blackuname: "Black Player",
        Count: 0,
        arrows: [],
        showIcon: false,
        displyansidebar: "none",
        boardOrientation: "white",
        mainboard: "",
        tryboard: "none",
        pvtrying: false,
        pvindex: 0,
        pvframe: 0,
        dchess: undefined,
        boardSize: 640,
        windowWidth: window.innerWidth,
        reviewStarted: false
    });

    const [state, setState] = useState(() => createFreshState());
    const boardRef = useRef(null);
    let currentpv = [];

    useEffect(() => {
        if (currentKey.current !== key) {
            currentKey.current = key;
            setSessionKey(key);
            setState(createFreshState());
            setIsInitialized(false);
            
            setTimeout(() => {
                setIsInitialized(true);
            }, 100);
        }
    }, [key]);

    const shouldRender = useMemo(() => {
        const hasValidData = moves && moves.length > 0 && pgn;
        const isCurrentSession = sessionKey === key;
        const isReady = isInitialized;
        
        return hasValidData && isCurrentSession && isReady;
    }, [moves, pgn, sessionKey, key, isInitialized]);

    useEffect(() => {
        if (!shouldRender) return;
        
        const timer = setTimeout(() => {
            setState(prev => ({ ...prev, showIcon: true }));
        }, 3000);
        
        return () => clearTimeout(timer);
    }, [shouldRender, sessionKey]);

    useEffect(() => {
        if (!shouldRender) return;
        
        const handleResize = () => {
            setState(prev => ({ ...prev, windowWidth: window.innerWidth }));
        };
        
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [shouldRender]);

    useEffect(() => {
        if (!shouldRender || !boardRef.current) return;
        
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                setState(prev => ({ ...prev, boardSize: entry.contentRect.width }));
            }
        });
        
        observer.observe(boardRef.current);
        return () => observer.disconnect();
    }, [shouldRender]);

    useEffect(() => {
        if (!shouldRender || !pgn) return;
        
        try {
            const whiteMatch = pgn.match(/\[White\s+"(.+?)"\]/);
            const blackMatch = pgn.match(/\[Black\s+"(.+?)"\]/);
            
            setState(prev => ({
                ...prev,
                whiteuname: whiteMatch?.[1] || "White Player",
                blackuname: blackMatch?.[1] || "Black Player"
            }));
        } catch (error) {
            console.error("Error parsing PGN:", error);
        }
    }, [pgn, shouldRender, sessionKey]);

    const fens = useMemo(() => {
        if (!shouldRender) return [new Chess().fen()];
        
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
    }, [moves, shouldRender, sessionKey]);

    const { fromSquares, toSquares } = useMemo(() => {
        if (!shouldRender) return { fromSquares: [], toSquares: [] };
        
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
    }, [bestmoves, shouldRender, sessionKey]);

    useEffect(() => {
        if (!shouldRender || !state.pvtrying || !pvfen.length) return;

        const interval = setInterval(() => {
            setState(prev => {
                const newFrame = prev.pvframe < Math.min(13, currentpv.length) ? prev.pvframe + 1 : prev.pvframe;
                if (newFrame === prev.pvframe) {
                    clearInterval(interval);
                }
                return { ...prev, pvframe: newFrame };
            });
        }, 800);
        
        return () => clearInterval(interval);
    }, [state.pvtrying, shouldRender, sessionKey]);

    useEffect(() => {
        if (!shouldRender) return;
        
        const arrowcount = state.Count - 1;
        if (arrowcount >= 5 &&
            arrowcount < fromSquares.length &&
            fromSquares[arrowcount] &&
            toSquares[arrowcount] && 
            !state.pvtrying) {
            setState(prev => ({
                ...prev,
                arrows: [{
                    startSquare: fromSquares[arrowcount],
                    endSquare: toSquares[arrowcount],
                    color: "blue"
                }]
            }));
        } else {
            setState(prev => ({ ...prev, arrows: [] }));
        }
    }, [state.Count, fromSquares, toSquares, state.pvtrying, shouldRender]);

    if (!shouldRender) {
        return (
            <div className="analytics-loading-container">
                <div className="analytics-loading-text">Loading analysis...</div>
            </div>
        );
    }

    function acplToAccuracy(acpl) {
        const k = 0.004;
        let acc = 100 * Math.exp(-k * acpl);
        return parseFloat(acc.toFixed(2));
    }

    const whiteaccuracy = acplToAccuracy(whiteacpl);
    const blackaccuracy = acplToAccuracy(blackacpl);

    const handlecount = (value) => {
        setState(prev => ({ ...prev, Count: value }));
        setTimeout(() => {
            setState(prev => ({ ...prev, Count: prev.Count + 1 }));
        }, 10);
    };

    const flipboard = () => {
        setState(prev => ({
            ...prev,
            boardOrientation: prev.boardOrientation === "white" ? "black" : "white",
            whiteuname: prev.blackuname,
            blackuname: prev.whiteuname
        }));
    };

    const showtactic = () => {
        setState(prev => ({
            ...prev,
            pvtrying: !prev.pvtrying,
            pvindex: prev.Count,
            mainboard: prev.pvtrying ? "" : "none",
            tryboard: prev.pvtrying ? "none" : "",
            pvframe: 0
        }));
    };

    const increase = () => {
        if (state.Count < fens.length - 1) {
            setState(prev => ({ ...prev, Count: prev.Count + 1 }));
        }
    };

    const decrease = () => {
        if (state.Count > 0) {
            setState(prev => ({ ...prev, Count: prev.Count - 1 }));
        }
    };

    const reset = () => setState(prev => ({ ...prev, Count: 0 }));

    const onstartreview = () => {
        setState(prev => ({
            ...prev,
            reviewStarted: true,
            displyansidebar: ""
        }));
    };

    const userrealrating = Math.round(((0.5 * userrating) + (0.5 * userevalrating)) / 50) * 50;
    const opprealrating = Math.round(((0.5 * opprating) + (0.5 * oppevalrating)) / 50) * 50;

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

    function squareCornerPosition(square, boardSize, iconSize = 0.05625 * boardSize, corner = "top-left") {
        const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
        const rank = parseInt(square[1], 10) - 1;
        const squareSize = boardSize / 8;

        let left = file * squareSize;
        let top = (7 - rank) * squareSize;

        if (state.boardOrientation === "black") {
            left = (7 - file) * squareSize;
            top = rank * squareSize;
        }

        let offsetX = 0.65 * squareSize;
        let offsetY = 0.3125 * squareSize;
        
        if (corner === "top-right") {
            offsetX = squareSize - iconSize - 0.1 * squareSize;
            offsetY = 0.125 * squareSize;
        } else if (corner === "bottom-left") {
            offsetX = 0.15 * squareSize;
            offsetY = squareSize - iconSize - 0.125 * squareSize;
        } else if (corner === "bottom-right") {
            offsetX = squareSize - iconSize - 0.1 * squareSize;
            offsetY = squareSize - iconSize - 0.125 * squareSize;
        }
        
        return { left: left + offsetX, top: top + offsetY };
    }

    currentpv = pvfen[state.pvindex - 1] || [];
    const safeCount = Math.min(Math.max(state.Count, 0), fens.length - 1);
    const evaled = state.Count > 1 ? Math.floor((state.Count - 1)) : -1;

    const options = {
        position: fens[safeCount],
        id: "board",
        arrows: state.arrows,
        boardOrientation: state.boardOrientation
    };

    const pvoptions = {
        position: state.pvtrying && currentpv ? currentpv[state.pvframe] || new Chess().fen() : new Chess().fen(),
        boardOrientation: state.boardOrientation
    };

    return (
        <div key={`analytics-root-${sessionKey}`} className="analytics-root">
            {state.windowWidth > 768 ? (<Sidebars />) : (<UniqueSidebars />)}

            <div className="boardplusside">
                <div className="boardpluseval">
                    <div className="analytics-evalbar">
                        <Evalbar cp={userwinpercents[evaled] ?? 53} />
                    </div>
                    <div className={`analytics-board-container${state.mainboard === "none" ? " analytics-board-hidden" : ""}`} ref={boardRef}>
                        <div className="analytics-board-header">
                            <header>{state.blackuname}</header>
                        </div>
                        <Chessboard options={options} />
                        <div className="analytics-board-footer">
                            <footer>{state.whiteuname}</footer>
                        </div>
                        {state.Count > 1 && (() => {
                            const moveindex = state.Count - 1;
                            if (moveindex < 0) return null;
                            const square = toSquare[moveindex];
                            const grade = grading[moveindex - 1];
                            const Icon = iconMap[grade];
                            if (state.pvtrying) return null;
                            if (!square || !Icon) return null;
                            const iconSize = 0.05 * state.boardSize;
                            const { left, top } = squareCornerPosition(square, state.boardSize, iconSize, "top-left");
                            return (
                                <div
                                    key={`icon-${moveindex}-${sessionKey}`}
                                    className="analytics-icon-container"
                                    style={{
                                        left: left,
                                        top: top,
                                        width: iconSize,
                                        height: iconSize
                                    }}
                                >
                                    {state.showIcon && (
                                        <Icon className="analytics-move-icon-svg" style={{ width: iconSize, height: iconSize }} />
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {state.pvtrying && (
                        <div className="analytics-board-container">
                            <div className="analytics-board-header">
                                <header>{state.blackuname}</header>
                            </div>
                            <Chessboard options={pvoptions} />
                            <div className="analytics-board-footer">
                                <footer>{state.whiteuname}</footer>
                            </div>
                        </div>
                    )}
                </div>
                <div className="anbar">
                    {state.windowWidth > 768 ? (
                        <Ansidebar
                            onIncrease={increase}
                            onDecrease={decrease}
                            onReset={reset}
                            movelist={moves}
                            pgn={pgn}
                            counting={state.Count}
                            display={state.displyansidebar}
                            onflip={flipboard}
                            showtactic={showtactic}
                            pvtrying={state.pvtrying}
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
                            counting={state.Count}
                            display={state.displyansidebar}
                            onflip={flipboard}
                            showtactic={showtactic}
                            pvtrying={state.pvtrying}
                            booknames={booknames}
                            handlecount={handlecount}
                        />
                    )}
                </div>
            </div>
            {!state.reviewStarted && (
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
