import { TourPoi } from "./lib/TourPoi.js"
import { TourFailure } from "./lib/TourFailure.js"
import { MockingClient } from "./lib/MockingClient.js"

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
   * @param { MockingClient } apiClient 
   */
  constructor(apiClient)
  {
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
  async init(pois)
  {
    return this.#client.init()
    .then (() => {
      return this.#client.GetCurrentMapData()
    })
    .catch((e) =>{
      //return Promise.reject(e)
      return Promise.reject(new TourFailure("Client couldn't be initialized", true))
    })
    .then((mapData) => {
        if (this.#checkPoisInMapData(pois, mapData))
        {
          this.#pois = pois
          this.#goToThenable = {}
          return Promise.resolve(true)
        }
        else
        {
          return Promise.reject(new TourFailure("Missing POI(s) in current map", true))
        }
    })
  }

  /**
   * Ask the AMR to go to its next destination
   * @return { Promise<TourPoi> | Promise<null> } A Promise wich resolve with the reached POI or null if going to Docking Station
   */
  async next()
  {
    let gotoProm = new Promise((resolve, reject) =>
    {
      this.#goToThenable.resolve = resolve
      this.#goToThenable.reject = reject
    })
    let nextIndex = this.#currentPoiIndex + 1
    if (nextIndex < this.#pois.length)
    {
      // Next POI exists, lets go to next POI
      return this.#client.GoToPOI(this.#pois[nextIndex].id)
        .then(() =>
        {
          this.#currentPoiIndex ++
          this.#client.onGoToPoiResult = (res) => this.#resolveGoto(res)
          return gotoProm
        })
        .catch((err) =>
        {
          return Promise.reject(err)
        })
    }
    else
    {
      // The AMR reached its last POI and should go to its Docking station
      return this.#client.GoToCharge(-1)
        .then(() => {
          this.#currentPoiIndex = -1
          this.#client.onGoToChargeResult = (res) => this.#resolveGoto(res)
          return gotoProm
        })
        .catch((err) =>
        {
          return Promise.reject(err)
        })
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
   * Returns true if all tours'poi exist in the Map data
   * @param { TourPoi[] } pois
   * @param { * } mapData 
   * @returns { boolean }
   */
  #checkPoisInMapData(pois, mapData)
  {
    const poiIds = pois.map((p) => p.id)
    const mapPoiIds = mapData.pois.map((p) => p.id_poi)
    let ok = true
    for (let n in poiIds)
    {
      const poi = poiIds[n]
      if (!mapPoiIds.includes(poi))
      {
        ok = false
        // console.info("not found",poi)
      }
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
      const currentPoi = this.#currentPoiIndex <  0 ? null : this.#pois[this.#currentPoiIndex]
      this.#goToThenable.resolve(currentPoi)
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