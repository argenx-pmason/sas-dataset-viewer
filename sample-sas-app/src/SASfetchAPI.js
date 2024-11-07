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

const webr = new WebR();
await webr.init(); // Initialize webr
console.log("Loading R packages, this may take a moment...");
await webr.evalR(SASImportCode);
console.log("Loaded.");

async function fetchFileAsArrayBuffer(url) {
  try {
    // Fetch the file from the URL
    const response = await fetch(url);

    // Ensure the response is successful (status code 200-299)
    if (!response.ok) {
      throw new Error("Failed to fetch the file");
    }

    // Convert the response body to an ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // Return the ArrayBuffer
    return arrayBuffer;
  } catch (error) {
    console.error("Error fetching the file:", error);
  }
}

export async function fetchSASasJSON(url, start = null, end = null) {
  const arrayBuffer = await fetchFileAsArrayBuffer(url);
  try {
    webr.FS.mkdir("/working");
  } catch (e) {
    if (e.code !== "EEXIST") throw e; // Ignore error if the directory already exists
  }
  // Mount the file in WebR's filesystem
  await webr.FS.writeFile(`/working/temp`, new Uint8Array(arrayBuffer));
  // Run R code to read the file contents
  console.log("About to call Read SAS");
  const startString = start === null ? "0L" : `${start}L`;
  const endString = end === null ? "Inf" : `${end}L`;
  const callString = `read_sas_from_fs("/working/temp", ${startString}, ${endString})`;
  const result = await webr.evalRString(callString);
  console.log("Output array:", result);
  const resultObject = JSON.parse(result);
  return resultObject;
}

const DATAURL = "http://www.principlesofeconometrics.com/sas/pizza.sas7bdat";
