import React, { useState } from 'react';
import Sidebars from '../components/sidebar';
import './pages-css/opening.css';

const mockData = {
  metrics: { gamesPlayed: 1247, winPercentage: 67.3, avgAccuracy: 88.2, avgBlunders: 2.1 },
  allOpenings: [
    { id: 1, name: "Queen's Gambit", icon: "♕", games: 156, winRate: 72.4, accuracy: 89.5, blunders: 1.8, whiteWins: 45, blackWins: 23, draws: 32 },
    { id: 2, name: "Italian Game", icon: "♗", games: 134, winRate: 68.7, accuracy: 87.2, blunders: 2.2, whiteWins: 52, blackWins: 28, draws: 20 },
    { id: 3, name: "Sicilian Defense", icon: "♛", games: 198, winRate: 64.1, accuracy: 86.8, blunders: 2.5, whiteWins: 38, blackWins: 42, draws: 20 },
    { id: 4, name: "French Defense", icon: "♞", games: 89, winRate: 71.9, accuracy: 90.1, blunders: 1.6, whiteWins: 35, blackWins: 45, draws: 20 },
    { id: 5, name: "King's Indian", icon: "♚", games: 112, winRate: 69.6, accuracy: 88.7, blunders: 2.0, whiteWins: 40, blackWins: 38, draws: 22 },
    { id: 6, name: "Ruy Lopez", icon: "♜", games: 98, winRate: 65.3, accuracy: 87.9, blunders: 2.3, whiteWins: 42, blackWins: 34, draws: 22 },
    { id: 7, name: "Caro-Kann Defense", icon: "♟", games: 76, winRate: 69.7, accuracy: 89.2, blunders: 1.9, whiteWins: 38, blackWins: 23, draws: 15 },
    { id: 8, name: "English Opening", icon: "♞", games: 67, winRate: 73.1, accuracy: 90.5, blunders: 1.7, whiteWins: 49, blackWins: 18, draws: 0 },
    { id: 9, name: "Nimzo-Indian Defense", icon: "♛", games: 45, winRate: 66.7, accuracy: 88.8, blunders: 2.1, whiteWins: 30, blackWins: 15, draws: 0 },
    { id: 10, name: "Scandinavian Defense", icon: "♕", games: 34, winRate: 61.8, accuracy: 85.4, blunders: 2.8, whiteWins: 21, blackWins: 13, draws: 0 }
  ]
};

const Opening = () => {
  const [selectedOpening, setSelectedOpening] = useState(mockData.allOpenings[0]);
  const [activeFilter, setActiveFilter] = useState('winRate');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filters = [
    { id: 'accuracy', label: 'Accuracy', icon: '🎯' },
    { id: 'winRate', label: 'Win %', icon: '📈' },
    { id: 'blunders', label: 'Blunders', icon: '⚠️' }
  ];

  const getSortedOpenings = () => {
    return [...mockData.allOpenings]
      .sort((a, b) => {
        if (activeFilter === 'accuracy') return b.accuracy - a.accuracy;
        if (activeFilter === 'blunders') return a.blunders - b.blunders;
        return b.winRate - a.winRate;
      })
      .slice(0, 5);
  };

  // Search handlers
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const suggestions = mockData.allOpenings.filter(o =>
        o.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (opening) => {
    setSelectedOpening(opening);
    setSearchQuery('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };

  const handleSearchBlur = () => setTimeout(() => setShowSuggestions(false), 200);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = mockData.allOpenings.find(o =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (found) {
      setSelectedOpening(found);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleOpeningClick = (opening) => setSelectedOpening(opening);

  const PieChart = ({ opening }) => {
    const total = opening.whiteWins + opening.blackWins + opening.draws;
    const whitePercent = total ? (opening.whiteWins / total) * 100 : 0;
    const blackPercent = total ? (opening.blackWins / total) * 100 : 0;
    const drawPercent = total ? (opening.draws / total) * 100 : 0;

    return (
      <div className="chess-opening-pie-chart-container">
        <div
          className="chess-opening-pie-chart"
          style={{
            '--white-percent': whitePercent,
            '--black-percent': blackPercent,
            '--draw-percent': drawPercent
          }}
        >
          <div className="chess-opening-pie-slice chess-opening-white-wins" style={{ '--rotation': 0 }} />
          <div className="chess-opening-pie-slice chess-opening-black-wins" style={{ '--rotation': whitePercent * 3.6 }} />
          <div className="chess-opening-pie-slice chess-opening-draws" style={{ '--rotation': (whitePercent + blackPercent) * 3.6 }} />
          <div className="chess-opening-pie-center">
            <span className="chess-opening-pie-total">{total}</span>
            <span className="chess-opening-pie-label">Games</span>
          </div>
        </div>

        <div className="chess-opening-pie-legend">
          <div className="chess-opening-legend-item">
            <div className="chess-opening-legend-color chess-opening-legend-white"></div>
            <span>White Wins ({opening.whiteWins})</span>
          </div>
          <div className="chess-opening-legend-item">
            <div className="chess-opening-legend-color chess-opening-legend-black"></div>
            <span>Black Wins ({opening.blackWins})</span>
          </div>
          <div className="chess-opening-legend-item">
            <div className="chess-opening-legend-color chess-opening-legend-draw"></div>
            <span>Draws ({opening.draws})</span>
          </div>
        </div>
      </div>
    );
  };

  const isSidebarCollapsed = false; 

  return (
    <div className={`opening-layout ${isSidebarCollapsed ? 'opening-layout--collapsed' : ''}`}>
      <Sidebars />

      <main className="opening-main">
      <div className="opening-content">
        <div className="chess-opening-dashboard">
          <div className="chess-opening-main-content">
            <header className="chess-opening-dashboard-header">
              <h1>Chess Openings Dashboard</h1>
              <p className="chess-opening-header-subtitle">Analyze your opening performance and statistics</p>
            </header>

            <div className="chess-opening-metrics-grid">
              <div className="chess-opening-metric-card">
                <div className="chess-opening-metric-icon">📊</div>
                <div className="chess-opening-metric-content">
                  <span className="chess-opening-metric-value">{mockData.metrics.gamesPlayed.toLocaleString()}</span>
                  <span className="chess-opening-metric-label">Games Played</span>
                </div>
              </div>

              <div className="chess-opening-metric-card">
                <div className="chess-opening-metric-icon">🎯</div>
                <div className="chess-opening-metric-content">
                  <span className="chess-opening-metric-value">{mockData.metrics.avgAccuracy}%</span>
                  <span className="chess-opening-metric-label">Avg Accuracy</span>
                </div>
              </div>

              <div className="chess-opening-metric-card">
                <div className="chess-opening-metric-icon">📈</div>
                <div className="chess-opening-metric-content">
                  <span className="chess-opening-metric-value">{mockData.metrics.winPercentage}%</span>
                  <span className="chess-opening-metric-label">Win Rate</span>
                </div>
              </div>

              <div className="chess-opening-metric-card">
                <div className="chess-opening-metric-icon">⚠️</div>
                <div className="chess-opening-metric-content">
                  <span className="chess-opening-metric-value">{mockData.metrics.avgBlunders}</span>
                  <span className="chess-opening-metric-label">Avg Blunders</span>
                </div>
              </div>
            </div>

            <div className="chess-opening-dashboard-content">
              <div className="chess-opening-left-panel">
                <div className="chess-opening-search-section">
                  <h3>Search Opening</h3>
                  <form onSubmit={handleSearch} className="chess-opening-search-form">
                    <div className="chess-opening-search-input-container">
                      <input
                        type="text"
                        placeholder="e.g. Queen's Gambit, Sicilian..."
                        value={searchQuery}
                        onChange={handleSearchInput}
                        onBlur={handleSearchBlur}
                        className="chess-opening-search-input"
                      />
                      <button type="submit" className="chess-opening-search-button">🔍</button>

                      {showSuggestions && (
                        <div className="chess-opening-search-suggestions">
                          {searchSuggestions.length > 0 ? (
                            searchSuggestions.map((opening) => (
                              <div
                                key={opening.id}
                                className="chess-opening-search-suggestion-item"
                                onMouseDown={(e) => { e.preventDefault(); selectSuggestion(opening); }}
                              >
                                <span className="chess-opening-suggestion-icon">{opening.icon}</span>
                                <div className="chess-opening-suggestion-info">
                                  <span className="chess-opening-suggestion-name">{opening.name}</span>
                                  <span className="chess-opening-suggestion-games">{opening.games} games</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="chess-opening-search-no-results">
                              No openings found matching "{searchQuery}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </form>
                </div>

                <div className="chess-opening-filters-section">
                  <h3>Sort By</h3>
                  <div className="chess-opening-filter-buttons">
                    {filters.map(filter => (
                      <button
                        key={filter.id}
                        className={`chess-opening-filter-button ${activeFilter === filter.id ? 'chess-opening-filter-active' : ''}`}
                        onClick={() => setActiveFilter(filter.id)}
                      >
                        <span className="chess-opening-filter-icon">{filter.icon}</span>
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="chess-opening-openings-list">
                  <h3>Top 5 Openings</h3>
                  <div className="chess-opening-openings-items">
                    {getSortedOpenings().map((opening, index) => (
                      <div
                        key={opening.id}
                        className={`chess-opening-opening-item ${selectedOpening.id === opening.id ? 'chess-opening-opening-selected' : ''}`}
                        onClick={() => handleOpeningClick(opening)}
                      >
                        <div className="chess-opening-opening-rank">#{index + 1}</div>
                        <div className="chess-opening-opening-icon">{opening.icon}</div>
                        <div className="chess-opening-opening-info">
                          <span className="chess-opening-opening-name">{opening.name}</span>
                          <span className="chess-opening-opening-stat">
                            {activeFilter === 'accuracy' && `${opening.accuracy}% accuracy`}
                            {activeFilter === 'winRate' && `${opening.winRate}% win rate`}
                            {activeFilter === 'blunders' && `${opening.blunders} avg blunders`}
                          </span>
                        </div>
                        <div className="chess-opening-opening-arrow">→</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="chess-opening-right-panel">
                <div className="chess-opening-opening-details">
                  <div className="chess-opening-opening-header">
                    <div className="chess-opening-opening-title">
                      <span className="chess-opening-opening-emoji">{selectedOpening.icon}</span>
                      <h2>{selectedOpening.name}</h2>
                    </div>
                    <div className="chess-opening-opening-games">{selectedOpening.games} games played</div>
                  </div>

                  <div className="chess-opening-opening-stats">
                    <div className="chess-opening-stat-card">
                      <div className="chess-opening-stat-value">{selectedOpening.winRate}%</div>
                      <div className="chess-opening-stat-label">Win Rate</div>
                    </div>
                    <div className="chess-opening-stat-card">
                      <div className="chess-opening-stat-value">{selectedOpening.accuracy}%</div>
                      <div className="chess-opening-stat-label">Accuracy</div>
                    </div>
                    <div className="chess-opening-stat-card">
                      <div className="chess-opening-stat-value">{selectedOpening.blunders}</div>
                      <div className="chess-opening-stat-label">Avg Blunders</div>
                    </div>
                    <div className="chess-opening-stat-card">
                      <div className="chess-opening-stat-value">{selectedOpening.games}</div>
                      <div className="chess-opening-stat-label">Games</div>
                    </div>
                  </div>

                  <div className="chess-opening-chart-section">
                    <h3>Results Distribution</h3>
                    <PieChart opening={selectedOpening} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Opening;
