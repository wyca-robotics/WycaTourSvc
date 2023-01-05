export class MockingClient
{
  #options
  #mapData

  // Callbacks function
  #onGoToPoiResult
  #onGoToChargeResult

  constructor(options = {})
  {
    const opt = {
      criticalFailure: false,
      failOnInit: false,
      failOnDock: false,
      failOnGoToCharge: false,
      failOnPoiId: -1,
      failOnGotoPoiId: -1,
      mapDataPath: "",
    }
    this.#options = { ...opt, ...options }
    this.#mapData = {}
  }

  /**
   * @param {function} fn
   */
  set onGoToPoiResult(fn)
  {
    if (typeof fn === "function")
      this.#onGoToPoiResult = fn
    else throw new Error("onGoToPoiResult must be a function")
  }

  /**
   * @param {function} fn
   */
  set onGoToChargeResult(fn)
  {
    if (typeof fn === "function")
      this.#onGoToChargeResult = fn
    else throw new Error("onGoToChargeResult must be a function")
  }

  /**
   * @param {boolean} fail
   */
  set failOnInit(fail)
  {
    this.#options.failOnInit = fail
  }

  /**
   * @param {boolean} fail
   */
  set failOnGoToChargek(fail)
  {
    this.#options.failOnGoToChargek = fail
  }
  /**
   * @param {boolean} fail
   */
  set failOnDock(fail)
  {
    this.#options.failOnDock = fail
  }

  /**
   * @param {number} id
   */
  set failOnGotoPoiId(id)
  {
    this.#options.failOnGotoPoiId = id
  }

  /**
   * @param {number} id
   */
  set failOnPoiId(id)
  {
    this.#options.failOnPoiId = id
  }

  /**
   * Initilize the API and eturns a Promise 
   * @returns {Promise<boolean>} - A promise wich resolves once the API initilization is done
   */
  async init()
  {
    const rejectProm = Promise.reject(new Error("Couldn't initialize the AMR's client API"))
    if (this.#options.failOnInit)
    {
      return rejectProm
    }
    if (this.#options.mapDataPath !== "")
    {
      return fetch(this.#options.mapDataPath)
        .then((rawData) =>
        {
          this.#mapData = JSON.parse(rawData)
          return Promise.resolve(true)
        })
        .catch(() => rejectProm)
    }
    else
    {
      return Promise.resolve(true)
    }
  }

  /**
   * Returns the AMR current map's data
   * @returns { Promise<*> } - Resolves with the current MapData
   */
  async GetCurrentMapData()
  {
    return Promise.resolve(this.#mapData)
  }

  /**
   * Ask the AMR to go the POI corresponding to id
   * @param {number} idPoi - the POI's id
   * @returns {Promise} - Resolves if AMR can go to POI otherwise rejects
   */
  async GoToPOI(idPoi)
  {
    return new Promise((resolve, reject) =>
    {
      if (this.#options.failOnGotoPoiId === idPoi)
      {
        const msg = this.#options.criticalFailure ? "Software Stop error" : "Couldn't reach destination"
        reject(new Error(msg))
      }
      else
      {
        setTimeout(() =>
        {
          if (this.#onGoToPoiResult !== undefined && typeof this.#onGoToPoiResult === "function")
          {
            let res = { A: 0x000, M: "" }
            if (this.#options.failOnPoiId === idPoi)
            {
              if (this.#options.criticalFailure)
                res = { A: 0x001, M: "Software Stop error" }
              else
                res = { A: 0x002, M: "Couldn't reach destination" }
            }
            this.#onGoToPoiResult(res);
          }
        }, this.#genLatencyMs())
        resolve()
      }
    })
  }

  /**
   * Ask the AMR to go to a docking station for charging correponding to id
   * @param {number} idDock - the docking station id (default -1 for nearest docking station)
   * @returns {Promise} - Resolves if AMR can go to the docking station otherwise rejects
   */
  async GoToCharge(idDock = -1)
  {
    idDock++
    return new Promise((resolve, reject) =>
    {
      if (this.#options.failOnGoToCharge)
      {
        const msg = this.#options.criticalFailure ? "Software Stop error" : "Couldn't reach destination"
        reject(new Error(msg))
      }
      else
      {
        setTimeout(() =>
        {
          if (this.#onGoToChargeResult !== undefined && typeof this.#onGoToChargeResult === "function")
          {
            let res = { A: 0x000, M: "" }
            if (this.#options.failOnDock)
            {
              if (this.#options.criticalFailure)
                res = { A: 0x001, M: "Software Stop error" }
              else
                res = { A: 0x002, M: "Couldn't reach destination" }
            }
            this.#onGoToChargeResult(res);
          }
        }, this.#genLatencyMs())
        resolve()
      }
    })
  }

  /**
   * Generate a 100-200 ms ranged latency
   * @returns {number} - Latency in ms
   */
  #genLatencyMs()
  {
    return (Math.random() * 100) + 100
  }
}