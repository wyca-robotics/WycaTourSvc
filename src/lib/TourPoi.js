export class TourPoi {
  #id
  #label
  #imagePath
  #videoPath

  /**
   *
   * @param { number } id
   * @param { string } label
   * @param { string } imgPath
   * @param { string } videoPath
   */
  constructor (id, label, imgPath, videoPath) {
    this.#id = id
    this.#label = label
    this.#imagePath = imgPath
    this.#videoPath = videoPath
  }

  /**
   * The POI's id matching a poi's id in the map
   * @returns { number }
   */
  get id () {
    return this.#id
  }

  /**
   * The POI's label
   * @returns { string }
   */
  get label () {
    return this.#label
  }

  /**
   * The POI's image path to display when the AMR is on its way to the POI
   * @returns { string }
   */
  get imagePath () {
    return this.#imagePath
  }

  /**
   * The POI's video path to play when the POI is reached
   * @returns { string }
   */
  get videoPath () {
    return this.#videoPath
  }
}
