
import { strict as assert } from 'assert'
import { MockingClient } from '../../src/lib/MockingClient.js'
import * as fs from 'fs';

async function fetch(fn)
{
  return await fs.promises.readFile(fn);
}
global.fetch = fetch
const __mockpath = "./mock"

describe("MockingClient", () =>
{
  describe("constructor", () =>
  {
    it("should instantiate without options", () =>
    {
      const mc = new MockingClient()
    })

    it("should instantiate with options", () =>
    {
      const mc = new MockingClient(
        {
          criticalfailure: false,
          failOnInit: false,
          failOnDock: false,
          failOnPoiId: -1,
          failOnGotoPoiId: -1,
          mapDataPath: "",
        }
      )
    })
  })

  describe("#init()", () =>
  {
    it("should resolve by default with true", () =>
    {
      let mc = new MockingClient()
      mc.init().then(() => assert(true), () => assert(false));
    })

    it("should reject if asked to", () =>
    {
      const mc = new MockingClient({ failOnInit: true })
      return mc.init().then(() => assert(false), () => assert(true));
    })
  })

  describe("#getCurrentMapData()", () =>
  {
    it("should return mocked mapData", () =>
    {
      const jsonPath = __mockpath + "/map/map_data.json"
      const mc = new MockingClient({ mapDataPath: jsonPath })
      let mockdata = null
      return fetch(jsonPath)
        .then((json) =>
        {
          mockdata = JSON.parse(json)
          //console.info(mockdata)
          return mc.init()
        })
        .then((inited) =>
        {
          //console.info("mc inited", inited)
          return mc.GetCurrentMapData()
        })
        .then((mapdata) =>
        {
          //console.info("mapData", mapdata)
          return assert.deepEqual(mapdata, mockdata)
        })
        .catch((err) =>
        {
          console.info(err)
          return assert(false)
        })
    })
  })
})