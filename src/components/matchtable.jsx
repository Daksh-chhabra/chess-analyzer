import React, { useEffect, useState } from "react";
import "./css/table.css"
import { useLocation, useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
// import { data } from "react-router-dom";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import analyte from "../wasmanalysis";

let Moves = [];


function Matchtable(rf) {

  const [userrated, setuserrated] = useState("");
  const [opprated, setopprated] = useState("");
  const[userusername ,setuserusername] =useState("");
  const [oppusername ,setoppusername] = useState("");

  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const username = localStorage.getItem("currentUser");
    setCurrentUser(`${username}`);
    if (username) {
      fetch(`http://localhost:5000/userdata/${username}`)
        .then(res => res.json())
        .then(reply => {
          setGames(reply.games);

        })
        .catch(err => console.error("couldnt get Data", err));
    }
  }, [rf]);

  const analyze = async (game) => {

    const isWhite = game.white.username.toLowerCase() === currentUser.toLowerCase();
    console.log('isWhite',isWhite);
  const userrated = isWhite ? game.white.rating : game.black.rating;
  const opprated = isWhite ? game.black.rating : game.white.rating;
  const userusername = game.white.username 
  const oppusername = game.black.username ;

    NProgress.start();
    setLoading(true);

    try {
      const pgn = game.pgn;
      const resp = await fetch(`http://localhost:5000/pgn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pgn })
      });
      if (!resp.ok) {
        throw new Error(`PGN save failed: ${await resp.text()}`);
      }
      const dataweget = await resp.json();
      const Movesweget = dataweget.moves;
      const bestmoves = dataweget.bestmoves;
      const grading = dataweget.grades;
      const cpforevalbar = dataweget.cpforevalbar
      const cpbar =dataweget.cpbar
      const userevalrating = isWhite ?  dataweget.whiterating : dataweget.blackrating
      const oppevalrating =isWhite ? dataweget.blackrating :dataweget.whiterating
      const whiteacpl = dataweget.whiteacpl;
      const blackacpl = dataweget.blackacpl;
      const grademovenumber =dataweget.grademovenumber;
      const userwinpercents =dataweget.userwinpercents;
      const blackgradeno =dataweget.blackgradeno;
      const pvfen = dataweget.pvfen
      console.log("data in matchtable that is coming", dataweget);
      //console.log(Movesweget);
      console.log("blackgrade no" ,blackgradeno);
      console.log("grading here ", grading);
      (navigate('/analysis', { state: { pgn: pgn, moves: Movesweget, bestmoves: bestmoves, userrating: userrated, grading: grading, opprating: opprated, evalbar: cpforevalbar ,cpbar : cpbar ,userevalrating : userevalrating , oppevalrating :oppevalrating ,userusername :userusername ,oppusername :oppusername,whiteacpl :whiteacpl,blackacpl:blackacpl ,grademovenumber : grademovenumber,userwinpercents :userwinpercents,blackgradeno :blackgradeno ,pvfen:pvfen,isWhite : isWhite } }));
    }
    catch (error) {
      console.error("couldnt SAVE PGN", error);
    } finally {
      NProgress.done();
      setLoading(false)

    }


  };



  return (
    <>
      {loading && <div style={{
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
        zIndex: 9999
      }}>Analyzing with Stockfish... Please wait.</div>}
      <table className="table" border="1">

        <thead>
          <tr>

            <th>Date</th>
            <th>Players</th>
            <th>Result</th>
            <th>Rating</th>
            <th>Game Link</th>
            <th> Analyse</th>
          </tr>
        </thead>
        <tbody>
          {games.slice().reverse().map((game, index) => {


            const isWhite = game.white.username.toLowerCase() === currentUser.toLowerCase();


            return (
              <tr key={index}>
                <td>{new Date(game.end_time * 1000).toLocaleDateString()}</td>
                <td>{`${game.white.username} vs ${game.black.username}`}</td>
                <td>{isWhite ? game.white.result : game.black.result}</td>
                <td>{isWhite ? game.white.rating : game.black.rating}</td>
                <td><a href={game.url} rel="noopener noreferrer" target="_blank">View Game</a></td>
<td>
  <button onClick={() => {
    console.log("Button clicked!");
    analyze(game);
    analyte();
  }}>
    Analyse
  </button>
</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default Matchtable;
