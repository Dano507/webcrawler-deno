/*
  This script takes all separate hosts from "files/file.json",
  and outputs them as a single, line separated text file
*/


let hosts = "";

const json = JSON.parse(Deno.readTextFileSync("./files/file.json"));
json.forEach(e => {
  hosts += `${e.hostname}\n`
});



Deno.writeTextFileSync("./files/hosts.txt", hosts)
console.log("Done")
