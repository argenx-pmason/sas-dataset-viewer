import React from "react";

const DataTable = ({ data }) => {
  // If data is empty, show a message instead of the table
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  // Get the headings from the keys of the first object
  const headings = Object.keys(data[0]);

  return (
    <div>
      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading} style={{ padding: "8px", textAlign: "left" }}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {headings.map((heading) => (
                <td key={heading} style={{ padding: "8px" }}>
                  {row[heading]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
