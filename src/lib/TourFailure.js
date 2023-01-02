/**
 * 
 */
export class TourFailure {
  #label
  #critical
  /**
   * 
   * @param { string } label 
   * @param { boolean } critical 
   */
  constructor (label, critical) {
    this.#label = label
    this.#critical = critical
  }

  /**
   * The failure label
   * @returns { string } 
   */
  get label () {
    return this.#label
  }

  /**
   * returns if the failure is critical and the tour cannot be resumed
   * @returns { boolean }
   */
  get critical () {
    return this.#critical
  }

}