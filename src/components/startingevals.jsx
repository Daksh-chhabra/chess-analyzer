import React, {  useState } from "react";


const GameSummaryBox = ({ white, black ,onreview }) => {
  const [display,setdisplay] = useState("");
  return (
    <div style={{...styles.container ,display : display}}>
      {/* Top Header */}
      <div style={styles.header}>
        <div style={styles.playerBox}>
          <div style={styles.nameWhite}>{white.name}</div>
          <div style={styles.label}>White</div>
        </div>
        <div style={styles.vs}>vs</div>
        <div style={styles.playerBox}>
          <div style={styles.nameBlack}>{black.name}</div>
          <div style={styles.label}>Black</div>
        </div>
      </div>

      {/* Accuracy Scores */}
      <div style={styles.metricsRow}>
        <div style={styles.metric}>
          <div style={styles.bigValue}>{white.accuracy}</div>
          <div style={styles.meterBar(white.accuracy)} />
        </div>
        <div style={styles.metric}>
          <div style={styles.bigValue}>{black.accuracy}</div>
          <div style={styles.meterBar(black.accuracy)} />
        </div>
      </div>

      {/* ELO Row */}
      <div style={styles.eloRow}>
        <div style={styles.elo}>{white.elo}</div>
        <div style={styles.eloLabel}>ELO</div>
        <div style={styles.elo}>{black.elo}</div>
      </div>

      {/* Good Moves Section */}
      <div style={styles.moveSection}>
        <div style={styles.sectionHeader}>Good  <span style={{marginLeft : "88%",color : "#fff", }}>W</span>    <span>B</span></div>
        {["Great", "Best", "Good", "Okay","Brilliant"].map((type) => (
          <div style={styles.row} key={type}>
            <div style={styles.labelMove}>{type}</div>
            <div style={styles.count}>{white.good[type] || 0}</div>
            <div style={styles.count}>{black.good[type] || 0}</div>
          </div>
        ))}
      </div>

      {/* Bad Moves Section */}
      <div style={styles.moveSectionRed}>
        <div style={styles.sectionHeaderRed}>Bad</div>
        {["Inaccuracy", "Mistake", "Blunder","Miss","Mate"].map((type) => (
          <div style={styles.row} key={type}>
            <div style={styles.labelMove}>{type}</div>
            <div style={styles.count}>{white.bad[type] || 0}</div>
            <div style={styles.count}>{black.bad[type] || 0}</div>
          </div>
        ))}
      </div>

      {/* Start Review Button */}
      <button onClick={  () => {setdisplay("none"); onreview();}} style={styles.reviewButton}>Start Review</button>
    </div>
  );
};

const styles = {
  container: {
    width: "350px",
    backgroundColor: "#0e0e0e",
    color: "white",
    borderRadius: "12px",
    padding: "16px",
    fontFamily: "sans-serif",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },
  playerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1
  },
  nameWhite: {
     color: "#ffffff",
    fontWeight: "bold",
    fontSize: "1rem"
  },
  nameBlack: {
        color: "#90ee90",
    fontWeight: "bold",
    fontSize: "1rem"

  },
  label: {
    fontSize: "0.8rem",
    color: "#aaa"
  },
  vs: {
    color: "#888",
    margin: "0 8px",
    fontSize: "1.2rem"
  },
  metricsRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px"
  },
  metric: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "5px"
  },
  bigValue: {
    fontSize: "1.4rem",
    fontWeight: "bold",
    marginBottom: "4px"
  },
  meterBar: (val) => ({
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    background: `linear-gradient(to right, #5f5 ${val}%, #800 0%)`
  }),
  eloRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },
  elo: {
    fontSize: "1.1rem",
    fontWeight: "bold"
  },
  eloLabel: {
    fontSize: "0.8rem",
    color: "#aaa"
  },
  moveSection: {
    backgroundColor: "#1e1e1e",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px"
  },
  moveSectionRed: {
    backgroundColor: "#1e1e1e",
    padding: "10px",
    borderRadius: "8px"
  },
  sectionHeader: {
    color: "#90ee90",
    fontWeight: "bold",
    marginBottom: "8px"
  },
  sectionHeaderRed: {
    color: "#ff6961",
    fontWeight: "bold",
    marginBottom: "8px"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px"
  },
  labelMove: {
    flex: 1
  },
  count: {
    width: "24px",
    textAlign: "center"
  },
  reviewButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "12px",
    transition: "background-color 0.3s ease"
  }
};

export default GameSummaryBox;
