import { TourPoi } from "./lib/TourPoi.js"
import { TourFailure } from "./lib/TourFailure.js"

/**
 * An AMR tour service
 */
export class TourSvc
{
  #client
  #pois
  #currentPoiIndex
  #tourFailure
  #goToThenable

  /**
   * Constructor
   * @param { WycaApiClient } wycaApiClient 
   */
  constructor(wycaApiClient)
  {
    this.#client = wycaApiClient
    this.#currentPoiIndex = -1
    this.#pois = []
    this.#tourFailure = null
  }

  /**
   * initialize the Tour service with a POI list
   * @param { TourPoi[] } pois - A list of poi
   * @returns { Promise } a Promise wich resolves when the Tour is ready or rejects if something's wrong
   */
  init(pois)
  {
    const initProm = new Promise((resolve, reject) =>
    {
      if (this.#checkPoisExist(pois))
        resolve(true)
      else reject(new TourFailure("Missing POI in current map", true))
    })
    return this.wycaApiClient.init().then(initProm)
  }

  /**
   * Ask the AMR to go to its next destination
   * @return { Promise<TourPoi> | Promise<null> } A Promise wich resolve with the reached POI or null if going to Docking Station
   */
  async next()
  {
    let nextIndex = this.#currentPoiIndex + 1
    if (nextIndex < this.#pois.length)
    {
      // Next POI exists, lets go to next POI
      return this.#client.GoToPOI(nextIndex)
        .then(() =>
        {
          this.#currentPoiIndex ++
          return new Promise((resolve, reject) =>
          {
            this.#goToThenable.resolve = resolve
            this.#goToThenable.reject = reject
          })
        })
        .catch((err) =>
        {
          return Promise.reject(err)
        })
    }
    else
    {
      // The AMR reached its last POI and should go to its Docking station
      return this.#client.GoToCharge(-1).then()
    }
  }

  /**
   * Resume an interrupted tour 
   */
  async resume()
  {
    return this.#client.GoToPOI(this.#currentPoiIndex)
  }

  /**
   * Cancel the AMR's tour and send the AMR to its docking station
   */
  cancel()
  {
    return this.#client.GoToCharge(-1).then()
  }

  /**
   * 
   * @returns { TourPoi | null } the current POI or null
   */
  getCurrentPoi()
  {
    return this.#currentPoiIndex > 0 ? this.#pois[this.#currentPoiIndex] : null
  }

  /**
   * Returns the next Poi or null
   * @returns { TourPoi | null }
   */
  getNextPoi()
  {
    let nextPoi = null
    let nextIndex = this.#currentPoiIndex + 1
    if (nextIndex < this.#pois.length)
      nextPoi = this.#pois[nextIndex]
    return nextPoi
  }

  /**
   * Return the current tour failure if exists otherwise return null
   * @returns { TourFailure | null }
   */
  getTourFailure()
  {
    return this.#tourFailure
  }

  /**
   * Returns true if all tours'poi exist in the current Map data
   * @param { TourPoi[] } pois 
   * @returns { boolean }
   */
  async #checkPoisExist(pois)
  {
    const mapData = await this.wycaApiClient.getCurrentMapData()
    const poiIds = pois.map((p) => p.id)
    const mapPoiIds = mapData.pois.map((p) => p.id_poi)
    let ok = true
    for (poi in poiIds)
    {
      if (!mapPoiIds.includes(poi))
        ok = false
    }
    return ok
  }

  /**
   * Resolve go to Promise from the API Result
   * @param {*} res - API result
   */
  async #resolveGoto(res)
  {
    if (res.A === 0)
    {
      this.#goToThenable.resolve(this.#pois[this.#currentPoiIndex])
    }
    else
    {
      const failure = this.#failureFromApiResponse(res)
      this.#goToThenable.reject(failure)
    }
  }

  /**
   * Returns a TourFailure from an API response
   * @param {*} res - API result
   * @returns {TourFailure} 
   */
  #failureFromApiResponse(res)
  {
    let failure;
    // TODO: list critical answer codes
    const criticalCodes = [0x001]
    const critical = criticalCodes.includes(res.A)
    return new TourFailure(res.M, critical);
  }

}