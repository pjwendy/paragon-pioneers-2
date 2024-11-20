import React, { useState, useEffect, useMemo } from "react";

const JsonTree = ({ data, name = "root" }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const renderNode = (key, value) => {
    if (typeof value === "object" && value !== null) {
      return <JsonTree key={key} name={key} data={value} />;
    }
    return (
      <div style={{ marginLeft: "20px" }}>
        <strong>{key}:</strong> {String(value)}
      </div>
    );
  };

  return (
    <div style={{ marginLeft: "20px" }}>
      <div onClick={toggleCollapse} style={{ cursor: "pointer", color: "blue" }}>
        {isCollapsed ? "▶" : "▼"} <strong>{name}</strong>
      </div>
      {!isCollapsed && (
        <div>
          {Object.entries(data).map(([key, value]) => renderNode(key, value))}
        </div>
      )}
    </div>
  );
};

const Grid = ({ rows, columns, gridData }) => {
  // Initialize the grid with default colors and text
  const defaultGrid = Array.from({ length: rows * columns }, () => ({
    color: "#ddd",
    text: "",
  }));

  // Update the grid based on the gridData
  gridData?.forEach((gridElement) => {
    const { Type, Coordinate } = gridElement;
    if (Coordinate && Coordinate.length === 2) {
      const [x, y] = Coordinate;      
      const flippedY = rows - 1 - y; // Flip Y to place (0,0) at the bottom-left
      const index = flippedY * columns + x; // Convert (x, flippedY) to linear index
      defaultGrid[index] = {
        color: Type === 2 ? "blue" : "#ddd",
        text: `(${x}, ${y})`,
      };
    }
  });

  // Create the grid layout
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 64px)`,
    gridTemplateRows: `repeat(${rows}, 64px)`,
    gap: "1px",
    backgroundColor: "#000",
  };

  const cellStyle = (color) => ({
    width: "64px",
    height: "64px",
    backgroundColor: color,
    border: "1px solid #aaa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
  });

  return (
    <div style={gridStyle}>
      {defaultGrid.map((cell, index) => (
        <div key={index} style={cellStyle(cell.color)}>
          {cell.text}
        </div>
      ))}
    </div>
  );
};

const DetailsWithSubTabs = ({ islands }) => {
  const subTabs = ["Islands", "Ships", "Research", "Trade Routes", "Storage", "Population", "Garrison"];
  const [activeSubTab, setActiveSubTab] = useState(subTabs[0]);
  const [selectedIslandIndex, setSelectedIslandIndex] = useState(0);

  // Get the MapSize for the selected island
  const selectedIsland = useMemo(() => islands[selectedIslandIndex] || {}, [islands, selectedIslandIndex]);
  const mapSize = selectedIsland.MapSettings?.MapSize || [1, 1];
  const rows = mapSize[1];
  const columns = mapSize[0];
  const gridData = selectedIsland.Grid || {};
  const depositPool = selectedIsland.MapSettings.DepositPool || {};
  const [fertilities, setFertilities] = useState(Array(8).fill(false)); // Array of 8 booleans
  const [deposits, setDeposits] = useState(Array(7).fill(false)); // Array of 7 booleans

  useEffect(() => {
    const fertilityPool = selectedIsland.MapSettings.FertilityPool || [];
    const updatedFertilities = Array(8).fill(false);
    if (fertilityPool.includes(11)) updatedFertilities[0] = true; // Checkbox 1 corresponds to value 11
    // Add other mappings here if needed
    setFertilities(updatedFertilities);
  }, [selectedIsland]);

  const toggleFertility = (index) => {
    const updatedFertilities = [...fertilities];
    updatedFertilities[index] = !updatedFertilities[index];
    setFertilities(updatedFertilities);
  };

  const toggleDeposit = (index) => {
    const updatedDeposits = [...deposits];
    updatedDeposits[index] = !updatedDeposits[index];
    setDeposits(updatedDeposits);
  };

  const fertilityLabels = ["Apples", "Wheat", "Hops", "Strawberries", "Honey", "Roses", "Grapes"];
  const depositLabels = ["Copper", "Coal", "Halite", "Iron", "Marble"];

  return (
    <div>
      {/* Island selection */}
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="island-select">Select Island:</label>
        <select
          id="island-select"
          value={selectedIslandIndex}
          onChange={(e) => setSelectedIslandIndex(Number(e.target.value))}
          style={{ marginLeft: "10px", padding: "5px" }}
        >
          {islands.map((island, index) => (
            <option key={index} value={index}>
              {island.Name || `Unnamed Island ${index}`}
            </option>
          ))}
        </select>
      </div>

      {/* Fertilities checkboxes */}
      <div style={{ marginBottom: "10px", display: "flex", flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ marginRight: "10px" }}>Fertilities:</label>
        {fertilities.map((checked, index) => (
          <label key={index} style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleFertility(index)}
              style={{ marginRight: "5px" }}
            />
            {fertilityLabels[index]}
          </label>
        ))}
      </div>

      {/* Deposits checkboxes */}
      <div style={{ marginBottom: "10px", display: "flex", flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ marginRight: "10px" }}>Deposits:</label>
        {deposits.map((checked, index) => (
          <label key={index} style={{ display: "flex", alignItems: "center", marginRight: "10px" }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggleDeposit(index)}
              style={{ marginRight: "5px" }}
            />
            {depositLabels[index]}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", marginBottom: "10px" }}>
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            style={{
              padding: "10px 15px",
              cursor: "pointer",
              backgroundColor: activeSubTab === tab ? "#ddd" : "#f9f9f9",
              border: "1px solid #ccc",
              borderBottom: activeSubTab === tab ? "none" : "1px solid #ccc",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {activeSubTab === "Islands" && (
        <div>
          <h4>Selected Island: {islands[selectedIslandIndex]?.Name || `Unnamed Island ${selectedIslandIndex}`}</h4>          
          <Grid rows={rows} columns={columns} gridData={gridData}/>
        </div>
      )}
      {activeSubTab !== "Islands" && (
        <div style={{ marginTop: "10px" }}>
          <h3>{activeSubTab}</h3>
          <p>Content for {activeSubTab} will go here.</p>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("rawData");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setJsonData(json);
        setError("");
      } catch (err) {
        setError("Failed to parse the file. Ensure it's valid JSON content.");
        setJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  const islands = jsonData?.IslandManager?.islands || [];

  const renderTabContent = () => {
    if (activeTab === "rawData") {
      return (
        <div>
          <h3>Raw Data:</h3>
          <pre style={{ background: "#f4f4f4", padding: "10px" }}>
            {jsonData ? JSON.stringify(jsonData, null, 2) : "No data loaded yet."}
          </pre>
        </div>
      );
    } else if (activeTab === "details") {
      return <DetailsWithSubTabs islands={islands} />;
    } else if (activeTab === "tree") {
      return (
        <div>
          <h3>Tree View:</h3>
          {jsonData ? (
            <JsonTree data={jsonData} />
          ) : (
            <p>No data loaded yet. Please upload a file.</p>
          )}
        </div>
      );
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Paragon Pioneers 2 Saved Game Editor</h1>
      <input type="file" onChange={handleFileChange} accept=".json,.dat" />
      <br />
      <br />
      {error && <p style={{ color: "red" }}>{error}</p>}

      {jsonData && (
        <div>
          <div style={{ display: "flex", marginBottom: "10px" }}>
            <button
              onClick={() => setActiveTab("rawData")}
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                backgroundColor: activeTab === "rawData" ? "#ddd" : "#f9f9f9",
                border: "1px solid #ccc",
                borderBottom: activeTab === "rawData" ? "none" : "1px solid #ccc",
              }}
            >
              Raw Data
            </button>
            <button
              onClick={() => setActiveTab("tree")}
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                backgroundColor: activeTab === "tree" ? "#ddd" : "#f9f9f9",
                border: "1px solid #ccc",
                borderBottom: activeTab === "tree" ? "none" : "1px solid #ccc",
              }}
            >
              Tree
            </button>
            <button
              onClick={() => setActiveTab("details")}
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                backgroundColor: activeTab === "details" ? "#ddd" : "#f9f9f9",
                border: "1px solid #ccc",
                borderBottom: activeTab === "details" ? "none" : "1px solid #ccc",
              }}
            >
              Details
            </button>
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              backgroundColor: "#f9f9f9",
            }}
          >
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
