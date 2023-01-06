export class MockingClient {
  #options
  #mapData

  // Callbacks function
  #onGoToPoiResult
  #onGoToChargeResult

  constructor (options = {}) {
    const opt = {
      criticalFailure: false,
      failOnInit: false,
      failOnDock: false,
      failOnGoToCharge: false,
      failOnPoiId: -1,
      failOnGotoPoiId: -1,
      mapDataPath: 'mock/map/map_data.json',
      etaRange: { min: 50, max: 75 }
    }
    this.#options = { ...opt, ...options }
    this.#mapData = {}
  }

  /**
   * @returns {function}
   */
  get onGoToPoiResult () {
    return this.#onGoToPoiResult
  }

  /**
   * @param {function} fn
   */
  set onGoToPoiResult (fn) {
    if (typeof fn === 'function') { this.#onGoToPoiResult = fn } else throw new Error('onGoToPoiResult must be a function')
  }

  /**
   * @returns {function}
   */
  get onGoToChargeResult () {
    return this.#onGoToChargeResult
  }

  /**
   * @param {function} fn
   */
  set onGoToChargeResult (fn) {
    if (typeof fn === 'function') { this.#onGoToChargeResult = fn } else throw new Error('onGoToChargeResult must be a function')
  }

  /**
   * @returns {boolean}
   */
  get failOnInit () {
    return this.#options.failOnInit
  }

  /**
   * @param {boolean} fail
   */
  set failOnInit (fail) {
    this.#options.failOnInit = fail
  }

  /**
   * @returns {boolean}
   */
  get failOnGoToCharge () {
    return this.#options.failOnGoToCharge
  }

  /**
   * @param {boolean} fail
   */
  set failOnGoToCharge (fail) {
    this.#options.failOnGoToCharge = fail
  }

  /**
   * @returns {boolean}
   */
  get failOnDock () {
    return this.#options.failOnDock
  }

  /**
   * @param {boolean} fail
   */
  set failOnDock (fail) {
    this.#options.failOnDock = fail
  }

  /**
   * @returns {number}
   */
  get failOnGotoPoiId () {
    return this.#options.failOnGotoPoiId
  }

  /**
   * @param {number} id
   */
  set failOnGotoPoiId (id) {
    this.#options.failOnGotoPoiId = id
  }

  /**
   * @returns {number}
   */
  get failOnPoiId () {
    return this.#options.failOnPoiId
  }

  /**
   * @param {number} id
   */
  set failOnPoiId (id) {
    this.#options.failOnPoiId = id
  }

  /**
   * Initilize the API and eturns a Promise
   * @returns {Promise<boolean>} - A promise wich resolves once the API initilization is done
   */
  async init () {
    const rejectProm = Promise.reject(new Error("Couldn't initialize the AMR's client API"))
    if (this.#options.failOnInit) {
      return rejectProm
    }
    if (this.#options.mapDataPath !== '') {
      return fetch(this.#options.mapDataPath)
        .then((rawData) => {
          this.#mapData = JSON.parse(rawData)
          return Promise.resolve(true)
        })
        .catch(() => rejectProm)
    } else {
      return Promise.resolve(true)
    }
  }

  /**
   * Returns the AMR current map's data
   * @returns { Promise<*> } - Resolves with the current MapData
   */
  async GetCurrentMapData () {
    return Promise.resolve(this.#mapData)
  }

  /**
   * Ask the AMR to go the POI corresponding to id
   * @param {number} idPoi - the POI's id
   * @returns {Promise} - Resolves if AMR can go to POI otherwise rejects
   */
  async GoToPOI (idPoi) {
    return new Promise((resolve, reject) => {
      if (this.#options.failOnGotoPoiId === idPoi) {
        const msg = this.#options.criticalFailure ? 'Software Stop error' : "Couldn't reach destination"
        reject(new Error(msg))
      } else {
        setTimeout(() => {
          if (this.#onGoToPoiResult !== undefined && typeof this.#onGoToPoiResult === 'function') {
            let res = { A: 0x000, M: '' }
            if (this.#options.failOnPoiId === idPoi) {
              if (this.#options.criticalFailure) { res = { A: 0x001, M: 'Software Stop error' } } else { res = { A: 0x002, M: "Couldn't reach destination" } }
            }
            this.#onGoToPoiResult(res)
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
  async GoToCharge (idDock = -1) {
    idDock++
    return new Promise((resolve, reject) => {
      if (this.#options.failOnGoToCharge) {
        const msg = this.#options.criticalFailure ? 'Software Stop error' : "Couldn't reach destination"
        reject(new Error(msg))
      } else {
        setTimeout(() => {
          if (this.#onGoToChargeResult !== undefined && typeof this.#onGoToChargeResult === 'function') {
            let res = { A: 0x000, M: '' }
            if (this.#options.failOnDock) {
              if (this.#options.criticalFailure) { res = { A: 0x001, M: 'Software Stop error' } } else { res = { A: 0x002, M: "Couldn't reach destination" } }
            }
            this.#onGoToChargeResult(res)
          }
        }, this.#genLatencyMs())
        resolve()
      }
    })
  }

  /**
   * Generate random latency between etaRange option
   * @returns {number} - Latency in ms
   */
  #genLatencyMs () {
    const strictMin = 10
    const min = this.#options.etaRange.min < strictMin ? strictMin : this.#options.etaRange.min
    const max = min < this.#options.etaRange.max ? this.#options.etaRange.max : min
    return (Math.random() * (max - min)) + min
  }

}
