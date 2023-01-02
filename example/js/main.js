import { TourSvc } from "../../src/TourSvc";
import { MockingClient } from "../../src/lib/MockingClient";

document.addEventListener('DOMContentLoaded', onDocumentLoaded)

function onDocumentLoaded()
{
    const client = new MockingClient()
    const tourSvc = new TourSvc()
}