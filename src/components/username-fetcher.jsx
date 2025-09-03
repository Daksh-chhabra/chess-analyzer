import React, { use, useState } from "react";
import './css/card.css';
import { Navigate, useNavigate } from "react-router-dom";
import Matchpage from "../pages/matches";
import { Chess } from "chess.js";
import { API_URL } from "../pathconfig";
import { saveFile, readFile, deleteFile,deleteDB } from '../utils/fileStorage';



function CreateCards(props) {
    const [loading, setLoading] = useState(false)
    const Navigate = useNavigate();
    const [username, setusername] = useState("");
    const [pgnfromuser, setpgnfromuser] = useState("");
    const handleclick = async () => {

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
                    await deleteDB(); 
                    await saveFile(`${username}.json`, userData);







                    const replied = await fetch (`${API_URL}/statsuser`,{
                        method : "POST",
                        headers : {"Content-Type" : "application/json"},
                        body : JSON.stringify({username}),
                    });


                    localStorage.setItem("currentUser", username);
                    
                    Navigate("/matches");
                }
                catch (error) {
                    console.log("errorws",error);
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
                    const currentUser = localStorage.getItem("currentUser");
                    const dep = await fetch(`${API_URL}/pgnfromuser`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ pgnfromuser : pgnfromuser,username : currentUser })
                    });

                    if(!dep.ok)
                    {
                        const msg = await dep.text();
                        alert("invalid PGN");
                        return ;
                    }
                    const result = await dep.json();
                    
                    
                    //console.log("pgn",result.pgn);
                    const whiteName = result.pgn.match(/\[White\s+"([^"]+)"\]/)[1];
                   const blackName = result.pgn.match(/\[Black\s+"([^"]+)"\]/)[1];
                     const isWhite = whiteName.toLowerCase() === currentUser.toLowerCase();
                     
                        const userevalrating =  isWhite ? result.whiterating : result.blackrating
                        const oppevalrating = isWhite ? result.blackrating  :result.whiterating
                        const userrated = isWhite ?  result.pgn.match(/\[WhiteElo\s+"(\d+)"\]/)[1] :  result.pgn.match(/\[BlackElo\s+"(\d+)"\]/)[1]
                        const opprated = isWhite ? result.pgn.match(/\[BlackElo\s+"(\d+)"\]/)[1] : result.pgn.match(/\[WhiteElo\s+"(\d+)"\]/)[1]
                        console.log("userrated",userrated);
                        console.log("opprated",opprated);
                    Navigate("/analysis" ,{state : {pgn :pgnfromuser , bestmoves : result.bestmoves, moves :result.moves ,whiteacpl : result.whiteacpl ,blackacpl : result.blackacpl ,grading : result.grades , evalbar : result. cpforevalbar ,cpbar :result.cpbar ,userwinpercents : result.userwinpercents , userevalrating :userevalrating ,oppevalrating:oppevalrating ,pvfen : result.pvfen,booknames: result.booknames ,grademovenumber : result.grademovenumber ,blackgradeno :result.blackgradeno ,userevalrating : userevalrating ,oppevalrating :oppevalrating, userusername : whiteName ,oppusername :blackName ,userrating :userrated ,opprating :opprated } });
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