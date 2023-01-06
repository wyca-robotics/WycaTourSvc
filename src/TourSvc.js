import { TourFailure } from './lib/TourFailure.js'
/**
 * An AMR tour service
 */
export class TourSvc {
  #client
  #pois
  #currentPoiIndex
  #tourFailure
  #goToThenable

  /**
   * Constructor
   * @param { MockingClient } apiClient
   */
  constructor (apiClient) {
    this.#client = apiClient
    this.#currentPoiIndex = -1
    this.#pois = []
    this.#tourFailure = null
  }

  /**
   * initialize the Tour service with a POI list
   * @param { TourPoi[] } pois - A list of poi
   * @returns { Promise } a Promise wich resolves when the Tour is ready or rejects if something's wrong
   */
  async init (pois) {
    return this.#client.init()
      .then(() => {
        return this.#client.GetCurrentMapData()
      })
      .catch((e) => {
        // return Promise.reject(e)
        return Promise.reject(new TourFailure("Client couldn't be initialized", true))
      })
      .then((mapData) => {
        if (this.#checkPoisInMapData(pois, mapData)) {
          this.#pois = pois
          this.#goToThenable = {}
          return Promise.resolve(true)
        } else {
          return Promise.reject(new TourFailure('Missing POI(s) in current map', true))
        }
      })
  }

  /**
   * Ask the AMR to go to its next destination
   * @returns { Promise<TourPoi> | Promise<null> } A Promise wich resolve with the reached POI or null if going to Docking Station
   */
  next () {
    const nextIndex = this.#currentPoiIndex + 1
    if (nextIndex < this.#pois.length) {
      // Next POI exists, lets go to next POI
      return this.#createGoToPoiPromise(nextIndex)
    } else {
      // The AMR reached its last POI and should go to its Docking station
      return this.#createGoToChargePromise()
    }
  }

  /**
   * Resume an interrupted Tour
   * @returns { Promise<TourPoi> | Promise<null> } A Promise wich resolve with the reached POI or null if going to Docking Station
   */
  resume () {
    if (this.#currentPoiIndex > -1) {
      // Next POI exists, lets go to next POI
      return this.#createGoToPoiPromise(this.#currentPoiIndex)
    } else {
      // The AMR reached its last POI and should go to its Docking station
      return this.#createGoToChargePromise()
    }
  }

  /**
   * Cancels the AMR's tour and send the AMR back to its docking station
   * @returns {Promise<null>}
   */
  cancel () {
    return this.#createGoToChargePromise()
  }

  /**
   *
   * @returns { TourPoi | null } the current POI or null
   */
  getCurrentPoi () {
    return this.#currentPoiIndex < 0 ? null : this.#pois[this.#currentPoiIndex]
  }

  /**
   * Returns the next Poi or null
   * @returns { TourPoi | null }
   */
  getNextPoi () {
    let nextPoi = null
    const nextIndex = this.#currentPoiIndex + 1
    if (nextIndex < this.#pois.length) { nextPoi = this.#pois[nextIndex] }
    return nextPoi
  }

  /**
   * Returns the current tour failure if exists otherwise return null
   * @returns { TourFailure | null }
   */
  getTourFailure () {
    return this.#tourFailure
  }

  /**
   * Check if all Tour's pois are present in the map data
   * @param { TourPoi[] } pois - A list of TourPOI
   * @param { * } mapData - The current AMR map's data
   * @returns { boolean } - true if all tours'poi exist in the Map data otherwise false
   */
  #checkPoisInMapData (pois, mapData) {
    const poiIds = pois.map((p) => p.id)
    const mapPoiIds = mapData.pois.map((p) => p.id_poi)
    let ok = true
    for (const n in poiIds) {
      const poi = poiIds[n]
      if (!mapPoiIds.includes(poi)) {
        ok = false
        // console.info("not found",poi)
      }
    }
    return ok
  }

  /**
   * Resolve the goto Promise from the API Result
   * @param {*} res - API result
   */
  #resolveGoto (res) {
    if (res.A === 0) {
      const currentPoi = this.#currentPoiIndex < 0 ? null : this.#pois[this.#currentPoiIndex]
      this.#goToThenable.resolve(currentPoi)
    } else {
      const failure = this.#failureFromApiResponse(res)
      this.#goToThenable.reject(failure)
    }
  }

  /**
   * Returns a TourFailure from an API response
   * @param {*} res - API result
   * @returns {TourFailure}
   */
  #failureFromApiResponse (res) {
    // TODO: list critical answer codes
    const criticalCodes = [0x001]
    const critical = criticalCodes.includes(res.A)
    return new TourFailure(res.M, critical)
  }

  /**
   * Return a promise on a goto action
   * @returns {Promise} - a Promise wich resolve when the AMR reach its goal
   */
  #createGoToPromise () {
    const gotoProm = new Promise((resolve, reject) => {
      this.#goToThenable.resolve = resolve
      this.#goToThenable.reject = reject
    })
    return gotoProm
  }

  /**
   * Returns a goto POI promise
   * @param {number} index - POI index in the Tour's Pois List
   * @returns {Promise<TourPoi>} - a Promise wich resolve once the Robot reached the indexed POI
   */
  async #createGoToPoiPromise (index) {
    return this.#client.GoToPOI(this.#pois[index].id)
      .then(() => {
        this.#currentPoiIndex = index
        this.#client.onGoToPoiResult = (res) => this.#resolveGoto(res)
        return this.#createGoToPromise()
      })
      .catch((err) => {
        return Promise.reject(err)
      })
  }

  /**
   * Returns a goto docking station promise
   * @returns {Promise} - a Promise wich resolve once the Robot is docked
   */
  async #createGoToChargePromise () {
    return this.#client.GoToCharge(-1)
      .then(() => {
        this.#currentPoiIndex = -1
        this.#client.onGoToChargeResult = (res) => this.#resolveGoto(res)
        return this.#createGoToPromise()
      })
      .catch((err) => {
        return Promise.reject(err)
      })
  }
}
