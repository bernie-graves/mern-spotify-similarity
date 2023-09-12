import React from "react";

function Tab({ label, active, onClick }) {
  return (
    <div className={`tab ${active ? "active" : ""}`} onClick={onClick}>
      {label}
    </div>
  );
}

export default Tab;
