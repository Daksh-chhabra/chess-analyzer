import React from "react";
import { Chessboard } from "react-chessboard";

const Test = () => {
  return (
    <div style={{ height: "600px", width: "600px", margin: "2rem auto" }}>
      <Chessboard position="rnbqkb1r/pppp1ppp/5n2/8/4Pp2/2N5/PPPP2PP/R1BQKBNR w KQkq - 0 4" />
    </div>
  );
};

export default Test;
