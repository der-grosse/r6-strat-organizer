const fs = require("fs");
const { parse } = require("csv-parse");

let data = [];
fs.createReadStream("./strats.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    let [map, site, name, fullName, rotationIndex, powerOPs, notes, url] = row;

    rotationIndex = rotationIndex
      ? rotationIndex.split(".").map((r) => parseInt(r))
      : null;
    powerOPs = powerOPs ? powerOPs.split(",").map((op) => op.trim()) : [];
    const drawingID = url.split("?id=")[1];
    const previewURL = `https://docs.google.com/drawings/d/${drawingID}/preview`;
    const editURL = `https://docs.google.com/drawings/d/${drawingID}/preview`;

    data.push({
      id: data.length + 1,
      map,
      site,
      name,
      rotationIndex,
      powerOPs,
      notes,
      previewURL,
      editURL,
    });
  })
  .on("end", function () {
    fs.writeFileSync("strats.json", JSON.stringify(data, null, 2), "utf-8");
  })
  .on("error", function (error) {
    console.error(error.message);
  });

// const strats = fs
//   .readFileSync("strats.csv", "utf-8")
//   .split("\n")
//   .slice(1)
//   .map((row, index) => {
//     const regex = /(?:"([^"]*)"|([^,]*))(?:,|$)/g;
//     let matches = [];
//     let match;
//     while ((match = regex.exec(row)) !== null) {
//       matches.push(match[1] !== undefined ? match[1] : match[2]);
//     }

//     let [map, site, name, fullName, rotationIndex, powerOPs, notes, url] =
//       matches;

//     if (notes.startsWith("https://")) {
//       url = notes;
//       notes = "";
//     }

//     rotationIndex = rotationIndex
//       ? rotationIndex.split(".").map((r) => parseInt(r))
//       : null;
//     powerOPs = powerOPs ? powerOPs.split(",").map((op) => op.trim()) : [];
//     const drawingID = url.split("?id=")[1];
//     const previewURL = `https://docs.google.com/drawings/d/${drawingID}/preview`;
//     const editURL = `https://docs.google.com/drawings/d/${drawingID}/preview`;

//     return {
//       id: index + 1,
//       map,
//       site,
//       name,
//       rotationIndex,
//       powerOPs,
//       notes,
//       previewURL,
//       editURL,
//     };
//   });

// fs.writeFileSync("strats.json", JSON.stringify(strats, null, 2), "utf-8");
