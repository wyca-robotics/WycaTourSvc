# Wyca Tour Service

A simple service to manage an AMR touring based on POIs sequence.

## installation
```bash
npm i @wyca-robotics/wyca-tour-svc --save
```

## Using in a web browser

You need an ApiClient to instantiate the TourSvc, a MockingClient is provided for testing purpose.

This MockingClient should be instantiated with an URI to a mapData.json file in an options dictionnary, other options a commented below :

```js
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

```



Once the service is initalized you can ask the AMR to go to its next destination, it will return a Promise that resolves with the readched POI or NULL if there is no more POI to go next and will go back to its docking station for charging.

```js
svc.next()
.then((poi) => {
    console.log("Reached the POI, now i can play its video", poi.videoPath)
})
.catch((failure) => {
    if (failure.critical)
    {
        console.log("Oh no the Robot's got a problem, call a technician !")
    }
    else
    {
        console.log("Something's blocking the way, try again ? Or skip to next POI ?")
    }
})
```
if the failure wasn't critical you can ask to resume its interupted journey, a new promise is returned like the next method.

```js
svc.resume()
.then((poi) => {
    console.log("Reached the POI, now i can play its video", poi.videoPath)
})
.catch((failure) => {
    console.log("Oh no ! Not again :(")
})
```

#Version
0.0.8