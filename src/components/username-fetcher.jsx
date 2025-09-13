import React, { useState } from "react";
import './css/card.css';
import { useNavigate } from "react-router-dom";
import { Chess } from "chess.js";
import { API_URL } from "../pathconfig";
import { saveFile, readFile, deleteFile, deleteDB } from '../utils/fileStorage';
import analyteUser from "../wasmanalysisfromuser";

function CreateCards(props) {
    const [loading, setLoading] = useState(false);
    const Navigate = useNavigate();
    const [username, setusername] = useState("");
    const [pgnfromuser, setpgnfromuser] = useState("");

    const handleclick = async () => {
        // ... (your existing handleclick logic remains unchanged)
        if (props.action === "fetch") {
            setLoading(true);
            if (typeof username === "string") {
                try {
                    const oldUsername = localStorage.getItem("currentUser");
                    if (oldUsername && oldUsername !== username) {
                        await deleteFile(`${oldUsername}.json`);
                        console.log(`Deleted old file for ${oldUsername}`);
                    }
                    const res = await fetch(`${API_URL}/username`, {
                        method: "POST", headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ username }),
                    });
                    if (!res.ok) {
                        const msg = await res.text();
                        alert(`error ${msg || "inavlid Username or user doesnt exist"}`);
                        setLoading(false);
                        return;
                    }
                    const userData = await res.json();
                    await saveFile(`${username}.json`, userData);
                    if ("storage" in navigator && "estimate" in navigator.storage) {
                        const estimate = await navigator.storage.estimate();
                        console.log(`Usage: ${estimate.usage} bytes`);
                        console.log(`Quota: ${estimate.quota} bytes`);
                        if (estimate.usage && estimate.quota) {
                            const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(2);
                            console.log(`Used: ${percentUsed}% of quota`);
                        }
                    } else {
                        console.log("Storage estimation not supported in this browser");
                    }
                    localStorage.setItem("currentUser", username);
                    const replied = await fetch(`${API_URL}/statsuser`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username }),
                    });
                    Navigate("/matches");
                }
                catch (error) {
                    console.log("errorws", error);
                }
            } else {
                alert("username need to be non empty text");
                setLoading(false);
            }
        }
        else if (props.action === "analyze") {
            const chess = new Chess();
            setLoading(true);
            console.log("Before calling analyteUser");
            analyteUser();
            console.log("After calling analyteUser");
            if (typeof pgnfromuser === "string") {
                try {
                    const currentUser = localStorage.getItem("currentUser");
                    const dep = await fetch(`${API_URL}/pgnfromuser`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ pgnfromuser: pgnfromuser, username: currentUser })
                    });
                    if (!dep.ok) {
                        const msg = await dep.text();
                        alert("invalid PGN");
                        return;
                    }
                    const result = await dep.json();
                    console.log("result", result);
                    const pgnString = result.pgn?.pgnfromuser;
                    if (!pgnString || typeof pgnString !== "string") {
                        console.error("PGN string is missing or invalid", result.pgn);
                        return;
                    }
                    const whiteName = pgnString.match(/\[White\s+"([^"]+)"\]/)[1];
                    const blackName = pgnString.match(/\[Black\s+"([^"]+)"\]/)[1];
                    const isWhite = whiteName.toLowerCase() === currentUser.toLowerCase();
                    const userevalrating = isWhite ? result.whiterating : result.blackrating;
                    const oppevalrating = isWhite ? result.blackrating : result.whiterating;
                    const userrated = isWhite
                        ? (pgnString.match(/\[WhiteElo\s+"(\d+)"\]/)?.[1] || 0)
                        : (pgnString.match(/\[BlackElo\s+"(\d+)"\]/)?.[1] || 0);
                    const opprated = isWhite
                        ? (pgnString.match(/\[BlackElo\s+"(\d+)"\]/)?.[1] || 0)
                        : (pgnString.match(/\[WhiteElo\s+"(\d+)"\]/)?.[1] || 0);
                    const key = Date.now();
                    console.log("userrated", userrated);
                    console.log("opprated", opprated);
                    Navigate("/analysis", { state: { key, pgn: pgnfromuser, bestmoves: result.bestmoves, moves: result.moves, whiteacpl: result.whiteacpl, blackacpl: result.blackacpl, grading: result.grades, evalbar: result.cpforevalbar, cpbar: result.cpbar, userwinpercents: result.userwinpercents, userevalrating: userevalrating, oppevalrating: oppevalrating, pvfen: result.pvfen, booknames: result.booknames, grademovenumber: result.grademovenumber, blackgradeno: result.blackgradeno, userevalrating: userevalrating, oppevalrating: oppevalrating, userusername: whiteName, oppusername: blackName, userrating: userrated, opprating: opprated } });
                }
                catch (Error) {
                    console.error("Error :", Error);
                }
            }
        }
    }

    return (
        <>
            {loading && (
                <div className="loading-overlay">
                    {props.action === "fetch"
                        ? "Fetching Matches... Please wait."
                        : props.action === "analyze"
                            ? "Analyzing PGN... Please wait."
                            : "Loading..."}
                </div>
            )}
            <div className="card" style={{backgroundColor : " #290e0eff"}}>
                <img src={props.image} className="card-image" alt={props.platform}></img>
                <h2 className="card-title">{props.platform}</h2>
                {props.action === "fetch" && (
                    <input
                        type="text"
                        placeholder={`${props.platform} username`}
                        onChange={(e) => setusername(e.target.value)}
                        value={username}
                        className="card-input"
                    />
                )}
                {props.action === "analyze" && (
                    <input
                        type="text"
                        placeholder="Paste PGN here"
                        onChange={(e) => setpgnfromuser(e.target.value)}
                        value={pgnfromuser}
                        className="card-input"
                    />
                )}
                <button className="btn" onClick={handleclick}>
                    {props.action === "fetch" ? "Fetch Matches" : props.action === "analyze" ? "Analyze" : ""}
                </button>
            </div>
        </>
    );
}

export default CreateCards;