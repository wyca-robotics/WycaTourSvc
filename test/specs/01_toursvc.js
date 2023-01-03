import { strict as assert } from 'assert'
import { TourSvc } from '../../src/TourSvc.js'
import { TourPoi } from '../../src/lib/TourPoi.js'
import { MockingClient } from '../../src/lib/MockingClient.js'
import * as fs from 'fs';

async function fetch(fn)
{
  return await fs.promises.readFile(fn);
}
global.fetch = fetch
const __mockpath = "./mock"

console.info(__mockpath)

describe("TourSvc", () =>
{
  describe("constructor", () =>
  {
    it("should instantiate with MockingClient", async () =>
    {
      const mc = new MockingClient({ mapDataPath: __mockpath + "/map/map_data.json" })
      await mc.init()
      const svc = new TourSvc(mc)
    })
  })

  describe("#init()", () =>
  {
    it("Should reject with wrong poi ids", async () =>
    {
      const mc = new MockingClient({ mapDataPath: __mockpath + "/map/map_data.json" })
      const pois = []
      pois.push(new TourPoi(12, "POI 12", "", ""))
      pois.push(new TourPoi(13, "POI 13", "", ""))
      pois.push(new TourPoi(4, "POI 14", "", ""))
      await mc.init()
      const svc = new TourSvc(mc)
      return svc.init(pois)
        .then(() => assert(false)
        .then((f) => assert.equal(f.label, 'Missing POI(s) in current map')))
    })

    it("Should resolve true", async () =>
    {
      const mc = new MockingClient({ mapDataPath: __mockpath + "/map/map_data.json" })
      const pois = []
      pois.push(new TourPoi(12, "POI 12", "", ""))
      pois.push(new TourPoi(13, "POI 13", "", ""))
      pois.push(new TourPoi(14, "POI 14", "", ""))
      await mc.init()
      const svc = new TourSvc(mc)
      return svc.init(pois).then(() => assert(true), () => assert(false))
    })
  })
})