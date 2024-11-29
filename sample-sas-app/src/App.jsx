import { useEffect, useState } from "react";
import "./App.css";
import SASReader from "./SASReader";
import DataTable from "./DataTable";
import { fetchSASasJSON } from "./SASfetchAPI";

const proxyUrl = "https://cors-anywhere.herokuapp.com/";
const DATAURL = "http://www.principlesofeconometrics.com/sas/pizza.sas7bdat";

function App() {
  const [data, setData] = useState(null);

  // useEffect(() => {
  //   const doEffect = async () => {
  //     const results = await fetchSASasJSON(proxyUrl + DATAURL);
  //     setData(results);
  //   };
  //   doEffect();
  // }, []);

  return (
    <>
    <h1>View SAS dataset in browser</h1>
    <h2>Using R with Haven</h2>
      <SASReader dataSetter={setData} start={3} />
      <DataTable data={data} />
      {/* {JSON.stringify(data)} */}
    </>
  );
}

export default App;
