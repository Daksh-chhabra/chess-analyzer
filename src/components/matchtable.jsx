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

let Moves = [];


function Matchtable() {

  const [userrated, setuserrated] = useState("");
  const [opprated, setopprated] = useState("");

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
  }, []);

  const analyze = async (game) => {

    const isWhite = game.white.username === currentUser;
    if (isWhite) {
      setuserrated(game.white.rating);
      setopprated(game.black.rating);
    }
    else {
      setuserrated(game.black.rating);
      setopprated(game.white.rating);
    }


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
      console.log("data in matchtable that is coming", dataweget);
      console.log(Movesweget);
      console.log("grading here ", grading);
      (navigate('/analysis', { state: { pgn: pgn, moves: Movesweget, bestmoves: bestmoves, userrating: userrated, grading: grading, opprating: opprated, evalbar: cpforevalbar ,cpbar : cpbar } }));
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


            const isWhite = game.white.username === currentUser;


            return (
              <tr key={index}>
                <td>{new Date(game.end_time * 1000).toLocaleDateString()}</td>
                <td>{`${game.white.username} vs ${game.black.username}`}</td>
                <td>{isWhite ? game.white.result : game.black.result}</td>
                <td>{isWhite ? game.white.rating : game.black.rating}</td>
                <td><a href={game.url}>View Game</a></td>
                <td><button onClick={() => analyze(game)}>Analyse</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default Matchtable;
