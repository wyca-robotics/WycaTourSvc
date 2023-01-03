
import { strict as assert } from 'assert'
import { MockingClient } from '../../src/lib/MockingClient.js'

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
})