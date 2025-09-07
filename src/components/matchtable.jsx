import React, { useEffect, useState, useMemo } from "react";
import "./css/table.css";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import analyte from "../wasmanalysis";
import { API_URL } from "../pathconfig";
import { readFile } from "../utils/fileStorage";

function Matchtable(rf) {
  const [userrated, setuserrated] = useState("");
  const [opprated, setopprated] = useState("");
  const [userusername, setuserusername] = useState("");
  const [oppusername, setoppusername] = useState("");

  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [playerSearchTerm, setPlayerSearchTerm] = useState("");
  const [pendingPlayerSearchTerm, setPendingPlayerSearchTerm] = useState("");
  const [playerFilterActive, setPlayerFilterActive] = useState(false);

  const [resultFilter, setResultFilter] = useState("");
  const [resultFilterActive, setResultFilterActive] = useState(false);

  const [timeControlFilter, setTimeControlFilter] = useState("");
  const [timeControlFilterActive, setTimeControlFilterActive] = useState(false);

  const [previousPlayerSearch, setPreviousPlayerSearch] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("currentUser");
    setCurrentUser(`${username}`);
    if (username) {
      readFile(`${username}.json`)
        .then((reply) => {
          if (reply) {
            setGames(reply.games);
          } else {
            console.warn("No data found in IndexedDB for", username);
          }
        })
        .catch((err) => console.error("Couldn't get data from IndexedDB", err));
    }
  }, [rf]);

  // close filters on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (playerFilterActive && !event.target.closest(".player-filter-container")) {
        setPlayerFilterActive(false);
        setPlayerSearchTerm(previousPlayerSearch);
      }
      if (resultFilterActive && !event.target.closest(".dropdown")) {
        setResultFilterActive(false);
      }
      if (timeControlFilterActive && !event.target.closest(".dropdown")) {
        setTimeControlFilterActive(false);
      }
    };
    if (playerFilterActive || resultFilterActive || timeControlFilterActive) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [playerFilterActive, resultFilterActive, timeControlFilterActive, previousPlayerSearch]);

  function mapTimeControl(raw) {
    if (!raw) return "Unknown";
    const [base] = raw.split("+").map(Number);
    const baseSeconds = base || 0;
    if (baseSeconds <= 60) return "Bullet";
    if (baseSeconds <= 180) return "Blitz";
    if (baseSeconds <= 1800) return "Rapid";
    return "Classical";
  }

  const analyze = async (game) => {
    if (!currentUser) return;

    const isWhite = game.white.username.toLowerCase() === currentUser.toLowerCase();
    const userrated = isWhite ? game.white.rating : game.black.rating;
    const opprated = isWhite ? game.black.rating : game.white.rating;
    const userusername = isWhite ? game.white.username : game.black.username;
    const oppusername = isWhite ? game.black.username : game.white.username;

    NProgress.start();
    setLoading(true);

    try {
      const currentUser = localStorage.getItem("currentUser");
      const pgn = game.pgn;
      const resp = await fetch(`${API_URL}/pgn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pgn, username: currentUser }),
      });

      if (!resp.ok) throw new Error(`PGN save failed: ${await resp.text()}`);
      const dataweget = await resp.json();

      navigate("/analysis", {
        state: {
          key: Date.now(),
          pgn,
          moves: dataweget.moves,
          bestmoves: dataweget.bestmoves,
          userrating: userrated,
          grading: dataweget.grades,
          opprating: opprated,
          evalbar: dataweget.cpforevalbar,
          cpbar: dataweget.cpbar,
          userevalrating: isWhite ? dataweget.whiterating : dataweget.blackrating,
          oppevalrating: isWhite ? dataweget.blackrating : dataweget.whiterating,
          userusername,
          oppusername,
          whiteacpl: dataweget.whiteacpl,
          blackacpl: dataweget.blackacpl,
          grademovenumber: dataweget.grademovenumber,
          userwinpercents: dataweget.userwinpercents,
          blackgradeno: dataweget.blackgradeno,
          pvfen: dataweget.pvfen,
          isWhite,
        },
      });
    } catch (error) {
      console.error("couldnt SAVE PGN", error);
    } finally {
      NProgress.done();
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "end_time",
        header: "Date",
        cell: (info) => new Date(info.getValue() * 1000).toLocaleDateString(),
      },
      {
        accessorFn: (row) => {
          const isWhite = row.white.username.toLowerCase() === currentUser?.toLowerCase();
          return isWhite
            ? `${row.white.username} vs ${row.black.username}`
            : `${row.black.username} vs ${row.white.username}`;
        },
        id: "players",
        header: () => (
          <div className="filter-header">
            Players
            <span className="filter-button" onClick={() => setPlayerFilterActive(true)}>
              ⏷
            </span>
          </div>
        ),
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => {
          const isWhite = row.white.username.toLowerCase() === currentUser?.toLowerCase();
          return isWhite ? row.white.result : row.black.result;
        },
        id: "result",
        header: () => (
          <div className="filter-header">
            Result
            <span className="filter-button" onClick={() => setResultFilterActive(true)}>
              ⏷
            </span>
          </div>
        ),
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => {
          const isWhite = row.white.username.toLowerCase() === currentUser?.toLowerCase();
          return isWhite ? row.white.rating : row.black.rating;
        },
        id: "rating",
        header: "Rating",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "url",
        header: "Game Link",
        cell: (info) => (
          <a href={info.getValue()} rel="noopener noreferrer" target="_blank">
            View Game
          </a>
        ),
      },
      {
        accessorFn: (row) => {
          const tags = {};
          const tagRegex = /\[(\w+)\s+"([^"]+)"\]/g;
          let match;
          while ((match = tagRegex.exec(row.pgn)) !== null) {
            tags[match[1]] = match[2];
          }
          return mapTimeControl(tags.TimeControl);
        },
        id: "timecontrol",
        header: () => (
          <div className="filter-header">
            Time Control
            <span className="filter-button" onClick={() => setTimeControlFilterActive(true)}>
              ⏷
            </span>
          </div>
        ),
        cell: (info) => info.getValue(),
      },
      {
        id: "analyse",
        header: "Analyse",
        cell: (info) => (
          <button className="analyse-button" onClick={() => { analyze(info.row.original); analyte(); }}>
            Analyse
          </button>
        ),
      },
    ],
    [currentUser]
  );

  const table = useReactTable({
    data: games,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredRows = useMemo(() => {
    let rows = table.getCoreRowModel().rows.slice().reverse();

    if (playerSearchTerm) {
      rows = rows.filter((row) => {
        const whiteName = row.original.white.username.toLowerCase();
        const blackName = row.original.black.username.toLowerCase();
        const searchLower = playerSearchTerm.toLowerCase();
        return whiteName.includes(searchLower) || blackName.includes(searchLower);
      });
    }

    if (resultFilter) {
      rows = rows.filter((row) => {
        const isWhite = row.original.white.username.toLowerCase() === currentUser?.toLowerCase();
        const result = isWhite
          ? row.original.white.result.toLowerCase()
          : row.original.black.result.toLowerCase();
        return result === resultFilter.toLowerCase();
      });
    }

    if (timeControlFilter) {
      rows = rows.filter((row) => {
        const tags = {};
        const tagRegex = /\[(\w+)\s+"([^"]+)"\]/g;
        let match;
        while ((match = tagRegex.exec(row.original.pgn)) !== null) {
          tags[match[1]] = match[2];
        }
        const tc = mapTimeControl(tags.TimeControl);
        return tc.toLowerCase() === timeControlFilter.toLowerCase();
      });
    }

    return rows;
  }, [table.getCoreRowModel().rows, playerSearchTerm, resultFilter, timeControlFilter, currentUser]);

  const handlePlayerSearch = () => {
    setPlayerSearchTerm(pendingPlayerSearchTerm);
    setPlayerFilterActive(false);
  };

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
        >
          Analyzing with Stockfish... Please wait.
        </div>
      )}

      <table className="table" border="1">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.id === "players" && playerFilterActive ? (
                    <div className="player-filter-container dropdown">
                      <input
                        type="text"
                        placeholder="Search opponent"
                        value={pendingPlayerSearchTerm}
                        onChange={(e) => setPendingPlayerSearchTerm(e.target.value)}
                      />
                      <button onClick={handlePlayerSearch}>Search</button>
                    </div>
                  ) : header.id === "result" && resultFilterActive ? (
                    <div className="dropdown">
                      <select
                        value={resultFilter}
                        onChange={(e) => {
                          setResultFilter(e.target.value);
                          setResultFilterActive(false);
                        }}
                      >
                        <option value="">All</option>
                        <option value="win">Win</option>
                        <option value="loss">Loss</option>
                        <option value="draw">Draw</option>
                        <option value="resigned">Resigned</option>
                        <option value="checkmated">Checkmated</option>
                        <option value="timeout">Timeout</option>
                        <option value="insufficient">Insufficient</option>
                        <option value="repetition">Repetition</option>
                      </select>
                    </div>
                  ) : header.id === "timecontrol" && timeControlFilterActive ? (
                    <div className="dropdown">
                      <select
                        value={timeControlFilter}
                        onChange={(e) => {
                          setTimeControlFilter(e.target.value);
                          setTimeControlFilterActive(false);
                        }}
                      >
                        <option value="">All</option>
                        <option value="bullet">Bullet</option>
                        <option value="blitz">Blitz</option>
                        <option value="rapid">Rapid</option>
                        <option value="classical">Classical</option>
                      </select>
                    </div>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {filteredRows.map((row, index) => (
            <tr key={index}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Matchtable;
