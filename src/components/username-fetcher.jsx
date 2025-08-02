import React, { use, useState } from "react";
import './css/card.css';
import { Navigate, useNavigate } from "react-router-dom";
import Matchpage from "../pages/matches";
import { Chess } from "chess.js";



function CreateCards(props) {
    const [loading, setLoading] = useState(false)
    const Navigate = useNavigate();
    const [username, setusername] = useState("")
    const [pgnfromuser, setpgnfromuser] = useState("")
    const handleclick = async () => {

        if (props.action === "fetch") {
            setLoading(true);
            if (typeof username === "string") {
                try {
                    const res = await fetch("http://localhost:5000/username", {
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
                    localStorage.setItem("currentUser", username);
                    setLoading(false);
                    Navigate("/matches");
                }
                catch (error) {
                    console.log("errorws");
                }


            }
            else {
                alert("username need to be non empty text");
                setLoading(false);
            }
        }

        else if (props.action === "analyze") {
            const chess = new Chess();
            setLoading(true);

            if (typeof pgnfromuser === "string" ) {
                try {
                    const dep = await fetch("http://localhost:5000/pgnfromuser", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ pgnfromuser,username })
                    });

                    if(!dep.ok)
                    {
                        const msg = await dep.text();
                        alert("invalid PGN");
                        return ;
                    }
                    const result = await dep.json();
                        const userrated =  result.whiterating 
                        const opprated = result.blackrating 
                    Navigate("/analysis" ,{state : {pgn :pgnfromuser , bestmoves : result.bestmoves, moves :result.moves ,whiteacpl : result.whiteacpl ,blackacpl : result.blackacpl ,grading : result.grades , evalbar : result. cpforevalbar ,cpbar :result.cpbar ,userwinpercents : result.userwinpercents , userrated :userrated ,opprated :opprated} });
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
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        color: "white",
                        fontSize: "1.5rem",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >    {props.action === "fetch"
                ? "Fetching Matches... Please wait."
                    : props.action === "analyze"
                     ? "Analyzing PGN... Please wait."
                    : "Loading..."}
                    
                </div>
            )}
            <div className="card" style={{ width: "200px", height: "350px", backgroundColor: "#290e0eff" }}>
                <img src={props.image} style={{ width: "200px", height: "200px" }}></img>
                <h2 style={{ color: "white", justifyContent: "center" }}> {props.platform}</h2>
                {props.action === "fetch" && (
                    <input
                        type="text"
                        placeholder={`${props.platform} username`}
                        onChange={(e) => setusername(e.target.value)}
                        value={username}
                    />
                )}

                {props.action === "analyze" && (
                    <input
                        type="text"
                        placeholder="Paste PGN here"
                        onChange={(e) => setpgnfromuser(e.target.value)}
                        value={pgnfromuser}
                    />
                )}
                <button className="btn" onClick={handleclick} > {props.action === "fetch" ? "Fetch Matches" : props.action === "analyze" ? "Analyze" : ""}</button>
            </div>
        </>
    );
}
export default CreateCards;