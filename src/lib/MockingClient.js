export class MockingClient
{
  #options
  #mapData

  constructor(options = {})
  {
    const opt = {
      criticalfailure: flase,
      failOnInit: false,
      failOnDock: false,
      failOnPoiId: -1,
      failOnGotoPoiId: -1,
      mapDataPath: "",
    }
    this.#options = { ...opt, ...options }
    this.#mapData = {}
  }

  async init()
  {
    if (this.#options.mapDataPath !== "")
      this.#mapData = JSON.parse(await fetch(this.#options.mapDataPath))
    return new Promise((resolve, reject) =>
    {
      if (this.#options.failOnInit)
      {
        reject(new Error("Couldn't initialize the AMR's client API"))
      }
      else
      {
        resolve(true)
      }
    })
  }

  async GetCurrentMapData()
  {
    return new Promise.resolve(this.#options.mapData)
  }

  async GoToPOI(idPoi)
  {
    return new Promise((resolve, reject) =>
    {
      if (this.#option.failOnGotoPoiId === idPoi)
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
            if (this.#option.failOnPoiId === idPoi)
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
      if (this.#option.failOnPoiId === idPoi)
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