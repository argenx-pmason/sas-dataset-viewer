import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { WebR } from "webr";

const SASImportCode = `
webr::install("haven")
webr::install("jsonlite")
library("haven")
library("jsonlite")

read_sas_from_fs <- function(file_path, start, end) {
    if (file.exists(file_path)) {
        # Read file contents line by line
        data <- read_sas(file_path, skip=start, n_max=end)
        jsonData <- toJSON(data)
        return(jsonData) # Join lines into a string
    } else {
        stop("File not found!")
    }
}
`;

async function testR(webr) {
  console.log("Testing R execution:");
  let testResults = await webr.evalR("10 + 10");
  testResults = await testResults.toArray();
  console.log("Results of 10+10: ", testResults[0]);
  return testResults;
}

function SASReader({ dataSetter, start = null, end = null }) {
  //A component to read in sas data and enter the returned json into
  //Ensure R code is correctly running:
  // Handle file selection and mounting
  const [webr, setWebr] = useState(null); // Store webr instance here
  const [isWebrLoaded, setIsWebrLoaded] = useState(false); // Track loading status
  const urlRef = useRef();

  useEffect(() => {
    // Initialize webr asynchronously
    const loadWebrAndFunctions = async () => {
      try {
        const webr = new WebR();
        await webr.init(); // Initialize webr
        console.log("Loading R packages, this may take a moment...");
        await webr.evalR(SASImportCode);
        console.log("Loaded.");
        await testR(webr);
        setWebr(webr); // Store webr in state
        setIsWebrLoaded(true); // Set as loaded
      } catch (error) {
        console.error("Failed to load webr:", error);
      }
    };
    loadWebrAndFunctions();
  }, []); // Run once on mount

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!webr) {
      console.log("No webr instance yet");
      return;
    }
    if (file) {
      console.log("Have file");
      // Read the file as an ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      try {
        webr.FS.mkdir("/working");
      } catch (e) {
        if (e.code !== "EEXIST") throw e; // Ignore error if the directory already exists
      }

      // Mount the file in WebR's filesystem
      await webr.FS.writeFile(
        `/working/${file.name}`,
        new Uint8Array(arrayBuffer)
      );
      // Run R code to read the file contents
      console.log("About to call Read SAS");
      const startString = start === null ? "0L" : `${start}L`;
      const endString = end === null ? "Inf" : `${end}L`;
      const callString = `read_sas_from_fs("/working/${file.name}", ${startString}, ${endString})`;
      const result = await webr.evalRString(callString);
      console.log("Output array:", result);
      const resultObject = JSON.parse(result);
      dataSetter(resultObject);
    } else {
      console.log("No file");
    }
  };

  const handleUrlChange = async () => {
    console.log("URL to load:", urlRef.current.value);
    const fileUrl = urlRef.current.value;
    if (!webr) {
      console.log("No webr instance yet");
      return;
    }
    if (fileUrl) {
      const filename = fileUrl.split("/").pop();
      console.log("Have file", filename);
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      try {
        webr.FS.mkdir("/working");
      } catch (e) {
        if (e.code !== "EEXIST") throw e; // Ignore error if the directory already exists
      }

      // Mount the file in WebR's filesystem
      await webr.FS.writeFile(
        `/working/${filename}`,
        new Uint8Array(arrayBuffer)
      );
      // Run R code to read the file contents
      console.log("About to call Read SAS");
      const startString = start === null ? "0L" : `${start}L`;
      const endString = end === null ? "Inf" : `${end}L`;
      const callString = `read_sas_from_fs("/working/${filename}", ${startString}, ${endString})`;
      const result = await webr.evalRString(callString);
      console.log("Output array:", result);
      const resultObject = JSON.parse(result);
      dataSetter(resultObject);
    } else {
      console.log("No file");
    }
  };

  return (
    <>
      <label htmlFor="url">Enter an https:// URL:</label>
      <input
        type="url"
        name="url"
        id="url"
        defaultValue={
          "https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/jobs/gadam_ongoing_studies/dev/output/dm_current.sas7bdat"
        }
        placeholder="https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/jobs/gadam_ongoing_studies/dev/output/dm_current.sas7bdat"
        pattern="https://.*"
        size="120"
        ref={urlRef}
      />
      <button onClick={handleUrlChange}>Load</button>
      <input disabled={!isWebrLoaded} type="file" onChange={handleFileChange} />
    </>
  );
}
SASReader.propTypes = {
  dataSetter: PropTypes.func.isRequired,
  start: PropTypes.number,
  end: PropTypes.number,
};

export default SASReader;
