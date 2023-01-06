import * as fs from 'fs'
// replace web browser's fetch method for node
async function fetch (fn) {
    return await fs.promises.readFile(fn)
}
global.fetch = fetch
  