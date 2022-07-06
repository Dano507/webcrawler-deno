# About
In this project, I made a web crawler with the Deno runtime.

This web crawler is not super effecient (it uses JSON alone), 
so I don't recommend using it professionally.



# How to run
## Prerequisites
- Have [deno](https://deno.land) installed
- Clone this repository

## Steps
- `cd` into the project folder
- Change `config.js` to your liking, documented below
- run `deno run --allow-net --allow-write index.js`



# Configuration
Configuration options are available through the `config.js` 
file

- `entry`: required
  - The website that the crawler will use as a starting point
    to find more links
  - Typically, the links found will be similar to the entry

- `switchiness`: required
  - The amount of times the crawler visits a hostname before 
    switching to a different host
  - Low values prefer finding new websites, while high values 
    prefer finding links on the same website




# Todo
- [ ] Replace hostname searches with `getHostIndex`
- [ ] Replace JSON with SQLite to improve speed

