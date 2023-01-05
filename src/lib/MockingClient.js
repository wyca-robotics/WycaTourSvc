export class MockingClient
{
  #options
  #mapData

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
   * Returns a Promise wih resolve once the initilization is done
   * @returns {Promise<boolean>}
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
        .then((rawData) => {
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
   * Returns the current map's data
   * @returns { Promise<*> } - A promise wich resolve with the current MapData
   */
  async GetCurrentMapData()
  {
    return Promise.resolve(this.#mapData)
  }

  /**
   * Ask the AMR to go the POI corresponding to id
   * @param {*} idPoi - the POI's id
   * @returns {Promise} - resolves if AMR can go to POI otherwise rejects
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
          if (this.onGoToPoiResult !== undefined && typeof this.onGoToPoiResult === "function")
          {
            let res = {A: 0x000, M: ""}
            if (this.#options.failOnPoiId === idPoi)
            {
              if (this.#options.criticalFailure)
                res = { A: 0x001, M: "Software Stop error" }
              else
                res = { A: 0x002, M: "Couldn't reach destination" }
            }
            this.onGoToPoiResult(res);
          }
        }, this.#genLatencyMs())
        resolve()
      }
    })
  }

  async GoToCharge(idDock)
  {
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
          if (this.onGoToChargeResult !== undefined && typeof this.onGoToChargeResult === "function")
          {
            let res = {A: 0x000, M: ""}
            if (this.#options.failOnDock)
            {
              if (this.#options.criticalFailure)
                res = { A: 0x001, M: "Software Stop error" }
              else
                res = { A: 0x002, M: "Couldn't reach destination" }
            }
            this.onGoToChargeResult(res);
          }
        }, this.#genLatencyMs())
        resolve()
      }
    })
  }

  /**
   * Generate a 100-200ms ranged latency
   * @returns {number} - Latency in ms
   */
  #genLatencyMs()
  {
    return (Math.random() * 100) + 100
  }
}