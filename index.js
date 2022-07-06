import { DOMParser, /*Element,*/ } from "https://deno.land/x/deno_dom@v0.1.32-alpha/deno-dom-wasm.ts";

import config from "./config.js"



// Functions and data
// Reconstruct links that only contain the path (and not hostname/protocol)
const reconstruct = (link) => {
  if (link.startsWith("http")) {
    return link;
  }
  if (link.indexOf("://") !== -1) {
    return link;
  }

  let newlink = "";
  if (link.startsWith("//")) {
    link = link.replace("//", "/");
    newlink = `https://${workingUrl.host}${link}`;
    return newlink;
  }

  if (link.startsWith("/")) {
    newlink = `https://${workingUrl.host}${link}`;
    return newlink;
  }

  if (link.startsWith("#")) {
    newlink = `${workingUrl.href}${link}`
    return newlink
  }

  if (link[0] !== "/") {  // could be broken
    newlink = `${workingUrl.href}${link}`
    return newlink;
  }
}

const data = [/*
  { 
    hostname: "en.wikipedia.org",
    visitedAll: false,
    visitedCount: 2,
    links: [
      { link: "https://en.wikipedia.org", visited: true },
      { link: "https://en.wikipedia.org/wiki/Website", visited: true },
    ]
  }*/
]

// Take the hostname, and return it's index in "data"
const getHostIndex = (urlObject) => {
  let found = false;
  let index;

  data.forEach((host, i) => {
    if (host.hostname === urlObject.hostname) {
      found = true;
      index = i;
    }
  })

  if (found === false) {
    return null;
  } 
  else return index
}

// Change working url
const changeWorkingUrl = (/*urlObject*/) => {
  data.every((el) => {
    let changed = false

    // switch website if visisted more times than "switchiness"
    if (el.visitedCount >= config.switchiness) return true

    el.links.every(link => {
      if (link.visited === false) { 
        workingUrl = new URL(link.link);
        link.visited = true;
        changed = true;
        return false;
      }
      else {
        return true;
      }
    })

    if (changed === true) return false
    else return true
  })
}



// Main app

const entry = new URL(config.entry)
let workingUrl = entry;


// Start crawl loop 
while (true) {  
  let fetchResponse; 
  try { fetchResponse = await fetch(workingUrl.href) } catch { continue }
  const rawdoc = await fetchResponse.text()

  //DEBUG
  console.log(fetchResponse.headers.get("content-type"))
  console.log(workingUrl.href)

  if (!fetchResponse.headers.get("content-type").startsWith("text/html")) {
    changeWorkingUrl(workingUrl);
    continue;
  }
  
  
  const document = new DOMParser().parseFromString(rawdoc, "text/html");
  


  // forEach element with a href attribute
  // should run once per link
  document?.querySelectorAll('[href]')?.forEach(el => {
    // get full path of link
    let looplink = reconstruct(el.getAttribute("href"))
    
    // skip iteration if getting full path fails
    try {
      looplink = new URL(looplink)
    }
    catch {
      return;
    }


    // Checks
    // Check if hostname exists in "data". if so, check if looplink is duplicate. if not, push looplink
    let hostExists = false;
    let hostIndex;
    let linkExists = false;
    data.forEach((host, i) => {
      // check if hostname exists
      if (host.hostname === looplink.hostname) {
        hostExists = true;
        hostIndex = i;

        host.links.forEach(linkObj => {
          if (linkObj.link === looplink.href) {
            linkExists = true
          }
        })
      }
    })

    // Create new object in "data" if hostname does not already exist
    // new object contains looplink
    if (!hostExists) {
      data.push({
        hostname: looplink.hostname,
        visitedAll: false,
        visitedCount: 0,
        links: [
          { link: looplink.href, visited: false }
        ]
      })
    }

    if (linkExists === false && hostIndex != null) {
      data[hostIndex].links.push({ link: looplink.href, visited: false })
    }
  })  // end of forEach


  // Increment visited counter
  data[getHostIndex(workingUrl)].visitedCount++
  console.log("visitedCount:", data[getHostIndex(workingUrl)].visitedCount )

  // Change working URL
  changeWorkingUrl(workingUrl);


  // Write to file
  Deno.writeTextFileSync("./files/file.json", JSON.stringify(data))
}