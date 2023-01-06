import { MockingClient } from '@wyca-robotics/wyca-tour-svc/src/lib/MockingClient.js'
import { TourPoi } from '@wyca-robotics/wyca-tour-svc/src/lib/TourPoi.js'
import { TourSvc } from '@wyca-robotics/wyca-tour-svc'

// default options with a path to MapData
const options = {
    criticalFailure: false, // Should simulated failure be critical
    failOnInit: false, // Simulate a failure on Init
    failOnDock: false, // Simulate a failure on its way to the docking station
    failOnGoToCharge: false, // Simulate a failure when asking to go to dock
    failOnPoiId: -1, // Simulate a failure on its way to a POI'sid (-1 for none)
    failOnGotoPoiId: -1, // Simulate a failure when asking to go to a POI'sid (-1 for none)
    mapDataPath: "mock/map/map_data.json", // MapData json file to simulate the robot's current MapData
    etaRange: {min: 50, max: 75} // The ranged duration of goto (POI & Charge) actions'simulation.
}

document.addEventListener('DOMContentLoaded', onDocumentLoaded)

function onDocumentLoaded()
{
    const mc = new MockingClient(options)
    const svc = new TourSvc(mc)

    // Initialize the TourSvc with a list of TourPoi wich returns a Promise once the service is initialized
    let pois = []
    pois.push(new TourPoi(12, "POI 1", "img/poi_1.png", "video/poi_1.mp4"))
    pois.push(new TourPoi(13, "POI 2", "img/poi_2.png", "video/poi_2.mp4"))
    pois.push(new TourPoi(14, "POI 3", "img/poi_3.png", "video/poi_3.mp4"))
    // Of course ToutPoi id must match the MapData's pois id_poi otherwise it will be rejected

    svc.init(pois)
    .then(()=> {
        console.log("All's set, ready to go !")
    })
    .catch((failure) => {
        console.log("Uho ! Something went wrong.", failure)
    })
}