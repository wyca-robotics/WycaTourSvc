export const ERobotAction = {
  STOPPED: 'Stopped',
  MOVING_TO_POI: 'Going to POI',
  MOVING_TO_DOCK: 'Going to Dock'
}

export class MockingClient {
  #options
  #mapData
  #gotoTimer

  // Callbacks function
  #onGoToPoiResult
  #onGoToChargeResult
  #robotAction

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
    this.#gotoTimer = null
    this.#robotAction = ERobotAction.STOPPED
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
    const errorMsg = "Couldn't initialize the AMR's client API"
    if (this.#options.failOnInit) {
      return Promise.reject(new Error(errorMsg))
    } else {
      if (this.#options.mapDataPath !== '') {
        return fetch(this.#options.mapDataPath)
          .then(rawData => rawData.json())
          .then(json => {
            this.#mapData = json
            // console.log(json)
            return Promise.resolve(true)
          })
          .catch((e) => {
            return Promise.reject(e)
          })
      } else {
        return Promise.resolve(true)
      }
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
        this.#robotAction = ERobotAction.MOVING_TO_POI
        this.#gotoTimer = setTimeout(() => {
          if (this.#onGoToPoiResult !== undefined && typeof this.#onGoToPoiResult === 'function') {
            let res = { A: 0x000, M: '' }
            if (this.#options.failOnPoiId === idPoi) {
              if (this.#options.criticalFailure) { res = { A: 0x001, M: 'Software Stop error' } } else { res = { A: 0x002, M: "Couldn't reach destination" } }
            }
            this.#robotAction = ERobotAction.STOPPED
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
        this.#robotAction = ERobotAction.MOVING_TO_DOCK
        this.#gotoTimer = setTimeout(() => {
          if (this.#onGoToChargeResult !== undefined && typeof this.#onGoToChargeResult === 'function') {
            let res = { A: 0x000, M: '' }
            if (this.#options.failOnDock) {
              if (this.#options.criticalFailure) { res = { A: 0x001, M: 'Software Stop error' } } else { res = { A: 0x002, M: "Couldn't reach destination" } }
            }
            this.#robotAction = ERobotAction.STOPPED
            this.#onGoToChargeResult(res)
          }
        }, this.#genLatencyMs())
        resolve()
      }
    })
  }

  /**
   * Stop the AMR and interrupt any of its ongoing Action
   * @returns {Promise<boolean>}
   */
  StopMove () {
    // console.info("StopMove", this.#robotAction, this.#onGoToPoiResult, this.#onGoToChargeResult)
    clearTimeout(this.#gotoTimer)
    const res = {
      A: 0x0CA,
      D: {
        A: 0x0CA,
        M: ''
      },
      M: ''
    }
    switch (this.#robotAction) {
      case ERobotAction.MOVING_TO_POI:
        res.E = 0x0009
        if (this.#onGoToPoiResult !== undefined && typeof this.#onGoToPoiResult === 'function') {
          // console.log("Canceling GOTO_POI", res);
          this.#onGoToPoiResult(res)
        }
        break

      case ERobotAction.MOVING_TO_DOCK:
        res.E = 0x0007
        if (this.#onGoToChargeResult !== undefined && typeof this.#onGoToChargeResult === 'function') {
          // console.log("Canceling GOTO_DOCK", res);
          this.#onGoToChargeResult(res)
        }
        break
    }
    this.#robotAction = ERobotAction.STOPPED
    return Promise.resolve(true)
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
