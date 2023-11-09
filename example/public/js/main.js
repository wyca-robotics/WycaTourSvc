// import { WycaAPI, WycaWsClient } from '../node_modules/@wyca-robotics/lib-wyca-api/src/WycaAPI.js'
import { MockingClient } from '../node_modules/@wyca-robotics/wyca-tour-svc/src/lib/MockingClient.js'

import { TourPoi } from '../node_modules/@wyca-robotics/wyca-tour-svc/src/lib/TourPoi.js'
import { TourSvc } from '../node_modules/@wyca-robotics/wyca-tour-svc/src/TourSvc.js'

// For real use, you should use the WycaWsClient
// const wsClient = new WycaWsClient({ host: 'ws://wyca.run:9094'})
// const mc = new WycaAPI(wsClient, { topKey: 'zsEV6A4BdemVQefnoUj48fGwxeJbsYWChNEXKPcwHxaAIE' })

// default options with a path to MapData for mocking purpose
const options = {
  criticalFailure: false, // Should simulated failure be critical
  failOnInit: false, // Simulate a failure on Init
  failOnDock: false, // Simulate a failure on its way to the docking station
  failOnGoToCharge: false, // Simulate a failure when asking to go to dock
  failOnPoiId: -1, // Simulate a failure on its way to a POI'sid (-1 for none)
  failOnGotoPoiId: -1, // Simulate a failure when asking to go to a POI'sid (-1 for none)
  mapDataPath: 'mock/map/map_data.json', // MapData json file to simulate the robot's current MapData
  etaRange: { min: 1000, max: 2000 } // The ranged duration of goto (POI & Charge) actions'simulation.
}
const mc = new MockingClient(options)

const svc = new TourSvc(mc)

document.addEventListener('DOMContentLoaded', onDocumentLoaded)

/**
 * Tour initialization on document loaded.
 */
function onDocumentLoaded () {
  // Initialize the TourSvc with a list of TourPoi wich returns a Promise once the service is initialized
  const pois = []
  // pois.push(new TourPoi(90, 'POI 1', 'img/poi_1.png', 'video/poi_1.mp4'))
  // pois.push(new TourPoi(91, 'POI 2', 'img/poi_2.png', 'video/poi_2.mp4'))
  // pois.push(new TourPoi(92, 'POI 3', 'img/poi_3.png', 'video/poi_3.mp4'))
  pois.push(new TourPoi(12, 'POI 1', 'img/poi_1.png', 'video/poi_1.mp4'))
  pois.push(new TourPoi(13, 'POI 2', 'img/poi_2.png', 'video/poi_2.mp4'))
  pois.push(new TourPoi(14, 'POI 3', 'img/poi_3.png', 'video/poi_3.mp4'))

  // Of course ToutPoi id must match the MapData's pois id_poi otherwise it will be rejected

  svc.init(pois)
    .then(() => {
      console.log("All's set, ready to go !")
      bindBtn()
    })
    .catch((failure) => {
      console.log('Uho ! Something went wrong.', failure)
    })
}

/**
 * Go to next POI
 */
function onNextBtnClick () {
  svc.next()
    .then((poi) => {
      console.log('Reached the POI, now i can play its video', poi.videoPath)
    })
    .catch((failure) => {
      if (failure.critical) {
        console.log("Oh no the Robot's got a problem, call a technician !", failure)
      } else {
        console.log(failure.label)
      }
    })
}

/**
 * Resume the tour on None critical error
 */
function onResumeBtnClick () {
  svc.resume()
    .then((poi) => {
      console.log('Reached the POI, now i can play its video', poi.videoPath)
    })
    .catch((failure) => {
      console.log('Oh no ! Not again :(', failure)
    })
}

/**
 * Cancel the tour and send the AMR back to its docking station
 */
function onCancelBtnClick () {
  svc.cancel()
    .then(() => {
      console.log('AMR is back on its docking')
    })
    .catch((failure) => {
      console.log("AMR couldn't reach its docking station", failure)
    })
}

/**
 * Skip the current POI
 */
function onSkipBtnClick () {
  svc.skip()
    .then(() => {
      console.log('AMR skipped POI')
    })
    .catch((failure) => {
      console.log("AMR couldn't reach POI", failure)
    })
}

/**
 * Bind the buttons
 */
function bindBtn () {
  document.querySelector('#nextBtn').addEventListener('click', onNextBtnClick)
  document.querySelector('#cancelBtn').addEventListener('click', onCancelBtnClick)
  document.querySelector('#resumeBtn').addEventListener('click', onResumeBtnClick)
  document.querySelector('#skipBtn').addEventListener('click', onSkipBtnClick)
}
