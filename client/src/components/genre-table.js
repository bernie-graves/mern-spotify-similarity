import React from "react";
import Table from "react-bootstrap/Table";

import "../styles/GenreTable.css";

const GenreTable = ({ genreData, user1, user2 }) => {
  return (
    <div className="table-container">
      <Table className="dark-minimal-table" variant="dark">
        <thead>
          <tr>
            <th>{user1}</th>
            <th>Genre</th>
            <th>{user2}</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(genreData).map(([genre, values], index) => (
            <tr key={index}>
              <td>{values[0]}</td>
              <td>{genre}</td>
              <td>{values[1]}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default GenreTable;
