import * as fs from 'fs'
// replace web browser's fetch method for node
async function fetch (fn) {
  return fs.promises.readFile(fn).then((rawdata) => {
    const buff = {}
    buff.json = () => {
      return JSON.parse(rawdata)
    }
    return buff
  })
}
global.fetch = fetch
