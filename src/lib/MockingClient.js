export class MockingClient
{
  #options
  #mapData

  constructor(options = {})
  {
    const opt = {
      criticalfailure: false,
      failOnInit: false,
      failOnDock: false,
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
        const msg = this.#options.criticalfailure ? "Software Stop error" : "Couldn't reach destination"
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
              if (this.#options.criticalfailure)
                res = { A: 0x001, M: "Software Stop error" }
              else
                res = { A: 0x002, M: "Couldn't reach destination" }
            }
            this.onGoToPoiResult(res);
          }
        }, Math.random() * 1000)
        resolve()
      }
    })
  }

  async GoToCharge(idDock)
  {
    return new Promise((resolve, reject) =>
    {
      if (this.#options.failOnPoiId === idPoi)
      {
        const msg = this.#options.criticalfailure ? "Software Stop error" : "Couldn't reach destination"
        reject(new Error(msg))
      }
      else
      {
        setTimeout(() =>
        {
          if (this.onGoToChargeResult !== undefined && typeof this.onGoToChargeResult === "function")
          {
            if (this.#options.criticalfailure)
              res = { A: 0x001, M: "Software Stop error" }
            else
              res = { A: 0x002, M: "Couldn't reach destination" }
            this.onGoToChargeResult(res);
          }
        }, Math.random() * 1000)
        resolve()
      }
    })
  }
}