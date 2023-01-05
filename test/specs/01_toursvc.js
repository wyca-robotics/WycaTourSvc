import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
//import { strict as assert } from 'assert'
import { TourSvc } from '../../src/TourSvc.js'
import { TourPoi } from '../../src/lib/TourPoi.js'
import { MockingClient } from '../../src/lib/MockingClient.js'
import * as fs from 'fs';
import { TourFailure } from '../../src/lib/TourFailure.js'

chai.use(chaiAsPromised)
const assert = chai.assert
const expect = chai.expect

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
      return expect(svc.init(pois)).to.eventually.be.true
    })

    it("Should reject with missing poi in map failure", () =>
    {
      const mc = new MockingClient({ mapDataPath: __mockpath + "/map/map_data.json" })
      const pois = []
      pois.push(new TourPoi(12, "POI 12", "", ""))
      pois.push(new TourPoi(13, "POI 13", "", ""))
      pois.push(new TourPoi(4, "POI 14", "", ""))
      const svc = new TourSvc(mc)
      return expect(svc.init(pois)).to.be.rejectedWith(TourFailure,'Missing POI(s) in current map')
    })

    it("Should reject with client init failure", () =>
    {
      const mc = new MockingClient({ mapDataPath: __mockpath + "/map/map_data.json", failOnInit: true })
      const pois = []
      pois.push(new TourPoi(12, "POI 12", "", ""))
      pois.push(new TourPoi(13, "POI 13", "", ""))
      pois.push(new TourPoi(14, "POI 14", "", ""))
      const svc = new TourSvc(mc)
      return expect(svc.init(pois)).to.be.rejectedWith(TourFailure, "Client couldn't be initialized");
    })
  })
  describe("#next()", () => {
    let svc
    let pois
    before(() => {
      const jsonPath = __mockpath + "/map/map_data.json"
      const mc = new MockingClient({ mapDataPath: jsonPath })
      pois = []
      pois.push(new TourPoi(12, "POI 12", "", ""))
      pois.push(new TourPoi(13, "POI 13", "", ""))
      pois.push(new TourPoi(14, "POI 14", "", ""))
      svc = new TourSvc(mc)
      return svc.init(pois)
    })

    it("should resolve with 1st TourPoi", ()=> {
      return expect(svc.next()).to.eventually.be.deep.equal(pois[0])
    })

    it("should resolve with 2nd TourPoi", ()=> {
      return expect(svc.next()).to.eventually.be.deep.equal(pois[1])
    })

    it("should resolve with 3rd TourPoi", ()=> {
      return expect(svc.next()).to.eventually.be.deep.equal(pois[2])
    })

    it("should resolve with null (Docking Station)", ()=> {
      return expect(svc.next()).to.eventually.be.null
    })

    it("should resolve with first POI (new Loop)", ()=> {
      return expect(svc.next()).to.eventually.be.deep.equal(pois[0])
    })

  })
})