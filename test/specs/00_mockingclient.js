import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
// import { strict as assert } from 'assert'
import { MockingClient } from '../../src/lib/MockingClient.js'

chai.use(chaiAsPromised)
const assert = chai.assert
const expect = chai.expect

const __mockpath = './mock'

describe('MockingClient', () => {
  describe('constructor', () => {
    it('should instantiate without options', () => {
      const mc = new MockingClient()
    })

    it('should instantiate with options', () => {
      const mc = new MockingClient(
        {
          criticalfailure: false,
          failOnInit: false,
          failOnDock: false,
          failOnPoiId: -1,
          failOnGotoPoiId: -1,
          mapDataPath: ''
        }
      )
    })
  })

  describe('#init()', () => {
    it('should resolve by default with true', () => {
      const mc = new MockingClient()
      return expect(mc.init()).to.be.fulfilled
    })

    it('should reject if asked to', () => {
      const mc = new MockingClient({ failOnInit: true })
      return expect(mc.init()).to.be.rejected
    })
  })

  describe('#getCurrentMapData()', () => {
    it('should return mocked mapData', () => {
      const jsonPath = __mockpath + '/map/map_data.json'
      const mc = new MockingClient({ mapDataPath: jsonPath })
      let mockdata = null
      return fetch(jsonPath)
        .then(rawData => rawData.json())
        .then((json) => {
          mockdata = json
          // console.info(mockdata)
          return mc.init()
        })
        .then((inited) => {
          // console.info("mc inited", inited)
          return mc.GetCurrentMapData()
        })
        .then((mapdata) => {
          // console.info("mapData", mapdata)
          return assert.deepEqual(mapdata, mockdata)
        })
        .catch((err) => {
          console.info(err)
          return assert(false)
        })
    })
  })

  describe('#GoToPOI()', () => {
    it('should resolve with true by default', () => {
      const mc = new MockingClient()
      return expect(mc.GoToPOI(0)).to.be.fulfilled
    })

    it('should reject with non critical error if asked to fail at a specific POI', () => {
      const mc = new MockingClient({ failOnGotoPoiId: 3 })
      return expect(mc.GoToPOI(3)).to.be.rejectedWith(Error, "Couldn't reach destination")
    })

    it('should resolve if asked to fail at another POI', () => {
      const mc = new MockingClient({ failOnGotoPoiId: 3 })
      return expect(mc.GoToPOI(0)).to.be.fulfilled
    })

    it('should reject with critical error message if asked to fail criticaly at a specific POI', () => {
      const mc = new MockingClient({ failOnGotoPoiId: 3, criticalFailure: true })
      return expect(mc.GoToPOI(3)).to.be.rejectedWith(Error, 'Software Stop error')
    })
  })

  describe('setting onGoToPoiResult callback', () => {
    const mc = new MockingClient({ failOnPoiId: 3 })
    before(() => {
      return mc.GoToPOI(3)
    })

    it('should throw an error if not set with a function', () => {
      const test = () => {
        mc.onGoToPoiResult = 'notAFunction'
      }
      expect(test).to.throw(Error)
    })

    it('should be called back with an error response', (done) => {
      mc.onGoToPoiResult = (res) => {
        assert.deepEqual(res, { A: 0x002, M: "Couldn't reach destination" })
        done()
      }
    })
  })

  describe('#GoToCharge()', () => {
    it('should resolve with true by default', () => {
      const mc = new MockingClient()
      return expect(mc.GoToCharge(-1)).to.be.fulfilled
    })

    it('should reject with non critical error message if asked to fail docking', () => {
      const mc = new MockingClient({ failOnGoToCharge: true })
      return expect(mc.GoToCharge(-1)).to.be.rejectedWith(Error, "Couldn't reach destination")
    })

    it('should reject with critical error message if asked to fail criticaly at Docking', () => {
      const mc = new MockingClient({ failOnGoToCharge: true, criticalFailure: true })
      return expect(mc.GoToCharge(-1)).to.be.rejectedWith(Error, 'Software Stop error')
    })
  })

  describe('setting onGoToChargeResult callback', () => {
    const mc = new MockingClient({ failOnDock: true })

    it('should throw an error if not set with a function', () => {
      const test = () => {
        mc.onGoToChargeResult = 'notAFunction'
      }
      expect(test).to.throw(Error)
    })

    before(() => {
      return mc.GoToCharge(-1)
    })

    it('should be called back with an error response', (done) => {
      mc.onGoToChargeResult = (res) => {
        assert.deepEqual(res, { A: 0x002, M: "Couldn't reach destination" })
        done()
      }
    })
    
  })

  describe('StopMove GotoPOI', () => {
    const mc = new MockingClient( {etaRange: {min: 200, max: 250}})

    before(() => {
      return mc.GoToPOI(1)
    })

    it('should cancel GotoPOI and gotoPOI shoudl return a cancel response (0x0c9)', (done) => {
      mc.onGoToPoiResult = (r) => {
        // console.info("gotopoi",r)
        assert.deepEqual(r, {
          A : 0x0CA,
          D : 
          {
            A : 0x0CA,
            M : ""
          },
          M : "",
          E:9
        })
        done()
      }
      setTimeout(() => mc.StopMove(), 100)
    })
  })

  describe('StopMove GotoCharge', () => {
    const mc = new MockingClient( {etaRange: {min: 200, max: 250}})

    before(() => {
      return mc.GoToCharge(-1)
    })

    it('should cancel GotoCharge and gotoChargeResult shoudl return a cancel response (0x0c9)', (done) => {
      mc.onGoToChargeResult = (r) => {
        // console.info("gotocharge", r)
        assert.deepEqual(r, {
          A : 0x0CA,
          D : 
          { 
            A : 0x0CA,
            M : ""
          },
          M : "",
          E:7
        })
        done()
      }
      setTimeout(() => mc.StopMove(), 100)
      
    })
  })
})
