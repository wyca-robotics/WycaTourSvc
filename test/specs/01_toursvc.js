import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { TourSvc } from '../../src/TourSvc.js'
import { TourPoi } from '../../src/lib/TourPoi.js'
import { MockingClient } from '../../src/lib/MockingClient.js'
import * as fs from 'fs'
import { TourFailure } from '../../src/lib/TourFailure.js'

chai.use(chaiAsPromised)
const assert = chai.assert
const expect = chai.expect

async function fetch (fn) {
  return await fs.promises.readFile(fn)
}

global.fetch = fetch
const __mockpath = './mock'

console.info(__mockpath)

describe('TourSvc', () => {
  describe('constructor', () => {
    it('should instantiate with MockingClient', () => {
      const mc = new MockingClient({ mapDataPath: __mockpath + '/map/map_data.json' })
      const svc = new TourSvc(mc)
    })
  })

  describe('#init()', () => {
    it('Should resolve with true', () => {
      const jsonPath = __mockpath + '/map/map_data.json'
      const mc = new MockingClient({ mapDataPath: jsonPath })
      const pois = []
      pois.push(new TourPoi(12, 'POI 12', '', ''))
      pois.push(new TourPoi(13, 'POI 13', '', ''))
      pois.push(new TourPoi(14, 'POI 14', '', ''))
      const svc = new TourSvc(mc)
      return expect(svc.init(pois)).to.eventually.be.true
    })

    it('Should reject with missing poi in map failure', () => {
      const mc = new MockingClient({ mapDataPath: __mockpath + '/map/map_data.json' })
      const pois = []
      pois.push(new TourPoi(12, 'POI 12', '', ''))
      pois.push(new TourPoi(13, 'POI 13', '', ''))
      pois.push(new TourPoi(4, 'POI 14', '', ''))
      const svc = new TourSvc(mc)
      return expect(svc.init(pois)).to.be.rejectedWith(TourFailure, 'Missing POI(s) in current map')
    })

    it('Should reject with client init failure', () => {
      const mc = new MockingClient({ mapDataPath: __mockpath + '/map/map_data.json', failOnInit: true })
      const pois = []
      pois.push(new TourPoi(12, 'POI 12', '', ''))
      pois.push(new TourPoi(13, 'POI 13', '', ''))
      pois.push(new TourPoi(14, 'POI 14', '', ''))
      const svc = new TourSvc(mc)
      return expect(svc.init(pois)).to.be.rejectedWith(TourFailure, "Client couldn't be initialized")
    })
  })

  describe('#next()', () => {
    let svc
    let pois
    const jsonPath = __mockpath + '/map/map_data.json'
    before(() => {
      const mc = new MockingClient({ mapDataPath: jsonPath })
      pois = []
      pois.push(new TourPoi(12, 'POI 12', '', ''))
      pois.push(new TourPoi(13, 'POI 13', '', ''))
      pois.push(new TourPoi(14, 'POI 14', '', ''))
      svc = new TourSvc(mc)
      return svc.init(pois)
    })

    it('should resolve with 1st TourPoi when reached', () => {
      return expect(svc.next()).to.eventually.be.deep.equal(pois[0])
    })

    it('should resolve with 2nd TourPoi when reached', () => {
      return expect(svc.next()).to.eventually.be.deep.equal(pois[1])
    })

    it('should resolve with 3rd TourPoi when reached', () => {
      return expect(svc.next()).to.eventually.be.deep.equal(pois[2])
    })

    it('should resolve with null (Docking Station) when reached', () => {
      return expect(svc.next()).to.eventually.be.null
    })

    it('should resolve with first POI when reached (new Loop)', () => {
      return expect(svc.next()).to.eventually.be.deep.equal(pois[0])
    })
  })

  describe('#next() with non critical failure', () => {
    let svc
    let pois
    const jsonPath = __mockpath + '/map/map_data.json'

    before(() => {
      const mc = new MockingClient({ mapDataPath: jsonPath, failOnPoiId: 12, failOnDock: true })
      pois = []
      pois.push(new TourPoi(12, 'POI 12', '', ''))
      pois.push(new TourPoi(13, 'POI 13', '', ''))
      svc = new TourSvc(mc)
      return svc.init(pois)
    })

    it('should reject the 1st POI on its way when asked...', () => {
      return expect(svc.next()).to.be.rejectedWith(TourFailure, "Couldn't reach destination")
    })

    it('... and should resolve with the 2nd POI when reached ...', () => {
      return expect(svc.next()).to.eventually.be.deep.equal(pois[0])
    })

    it('... and should reject going back to Docking station on its way when asked', () => {
      return expect(svc.next()).to.be.rejectedWith(TourFailure, "Couldn't reach destination")
    })
  })

  describe('#resume()', () => {
    let svc
    let pois
    let mc
    const jsonPath = __mockpath + '/map/map_data.json'

    before(() => {
      mc = new MockingClient({ mapDataPath: jsonPath, failOnPoiId: 12, failOnDock: true })
      pois = []
      pois.push(new TourPoi(12, 'POI 12', '', ''))
      svc = new TourSvc(mc)
      return svc.init(pois)
    })

    it('next reject the 1st POI on its way when asked...', () => {
      return expect(svc.next()).to.be.rejectedWith(TourFailure, "Couldn't reach destination")
    })

    it('... and resume should resolve with the 1st POI when reached ...', () => {
      mc.failOnPoiId = -1
      return expect(svc.resume()).to.eventually.be.deep.equal(pois[0])
    })

    it('... and next should reject going back to Docking station on its way when asked', () => {
      return expect(svc.next()).to.be.rejectedWith(TourFailure, "Couldn't reach destination")
    })

    it('... and resume should resolve going back to Docking station', () => {
      mc.failOnDock = false
      return expect(svc.resume()).to.eventually.be.null
    })
  })
})
