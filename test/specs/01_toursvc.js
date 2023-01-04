import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
//import { strict as assert } from 'assert'
import { TourSvc } from '../../src/TourSvc.js'
import { TourPoi } from '../../src/lib/TourPoi.js'
import { MockingClient } from '../../src/lib/MockingClient.js'
import * as fs from 'fs';

chai.use(chaiAsPromised)
const assert = chai.assert
const expect = chai.expect
//const should = chai.should

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
    it("should instantiate with MockingClient", () =>
    {
      const mc = new MockingClient({ mapDataPath: __mockpath + "/map/map_data.json" })
      const svc = new TourSvc(mc)
    })
  })

  describe("#init()", () =>
  {
    it("Should resolve with true", () =>
    {
      const jsonPath = __mockpath + "/map/map_data.json"
      const mc = new MockingClient({ mapDataPath: jsonPath })
      const pois = []
      pois.push(new TourPoi(12, "POI 12", "", ""))
      pois.push(new TourPoi(13, "POI 13", "", ""))
      pois.push(new TourPoi(14, "POI 14", "", ""))
      const svc = new TourSvc(mc)
      svc.init(pois)
      .then(() =>{
        console.info("Inited !")
        return assert(true)
      },
      (f) => {
          console.info("failure :", f.label)
          return assert(false)
      })
    })

    it("Should reject with wrong poi ids", () =>
    {
      const mc = new MockingClient({ mapDataPath: __mockpath + "/map/map_data.json" })
      const pois = []
      pois.push(new TourPoi(12, "POI 12", "", ""))
      pois.push(new TourPoi(13, "POI 13", "", ""))
      pois.push(new TourPoi(4, "POI 14", "", ""))
      const svc = new TourSvc(mc)
      svc.init(pois)
      .then(
        () => assert(false),
        (f) => assert.equal(f.label, 'Missing POI(s) in current map')
      )
      // .then(() =>{
      //   return assert(false);
      // })
      // .catch((f) => {
      //   console.info("failure", f.label)
      //   return assert.equal(f.label, 'Missing POI(s) in current map');
      // })
    })

    it("Should reject with client init failure", () =>
    {
      const mc = new MockingClient({ mapDataPath: __mockpath + "/map/map_data.json", failOnInit: true })
      const pois = []
      pois.push(new TourPoi(12, "POI 12", "", ""))
      pois.push(new TourPoi(13, "POI 13", "", ""))
      pois.push(new TourPoi(14, "POI 14", "", ""))
      const svc = new TourSvc(mc)
      svc.init(pois)
      .then(() => assert(false),
        (f) => {
          return assert.equal(f.label, "Client couldn't be initialized");
        }
      )
    })
  })
})