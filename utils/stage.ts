import fs from "fs/promises";

async function jsonjoiner() {
  let [example, data] = await Promise.all([
    fs.readFile("utils/example.json"),
    fs.readFile("utils/data.json"),
  ]);

  let exampleJson = JSON.parse(example.toString());
  let dataJson = JSON.parse(data.toString());

  console.log(exampleJson.items.length);
  console.log(dataJson.items.length);

  exampleJson.items = exampleJson.items.concat(dataJson.items);
  console.log(exampleJson.items.length);
}

jsonjoiner();
