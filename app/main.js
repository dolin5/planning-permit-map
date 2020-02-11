var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "esri/Map", "esri/Basemap", "esri/layers/VectorTileLayer", "esri/layers/TileLayer", "esri/layers/FeatureLayer", "esri/views/SceneView", "esri/core/promiseUtils", "./permits"], function (require, exports, Map_1, Basemap_1, VectorTileLayer_1, TileLayer_1, FeatureLayer_1, SceneView_1, promiseUtils, permits_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Map_1 = __importDefault(Map_1);
    Basemap_1 = __importDefault(Basemap_1);
    VectorTileLayer_1 = __importDefault(VectorTileLayer_1);
    TileLayer_1 = __importDefault(TileLayer_1);
    FeatureLayer_1 = __importDefault(FeatureLayer_1);
    SceneView_1 = __importDefault(SceneView_1);
    promiseUtils = __importStar(promiseUtils);
    var permits = {};
    var locations = {};
    var permitLinkTemplate = "https://web.mygov.us/app/#{%22page%22:[{%22url%22:%22/pi/%22,%22params%22:{%22container%22:%22#mn%22,%22value%22:%22pi%22,%22bc%22:%22Permits%20&%20Inspections%22,%22url%22:%22/pi/%22,%22environment%22:%22page%22},%22tabs%22:[]},{%22url%22:%22/pi/projects/details?id=$PROJECTID&list=all%22,%22params%22:{%22container%22:%22#main%22,%22class%22:%22module%22,%22bc%22:%22Project%20Details%20-%20$PERMITNUMBER%22,%22url%22:%22/pi/projects/details?id=$PROJECTID&list=all%22,%22environment%22:%22page%22},%22tabs%22:[{%22url%22:%22/pi/projects/overview?id=$PROJECTID&activetab=0%22,%22params%22:{%22tabContainer%22:%22#project-details-tabs%22,%22container%22:%22#project-tab-overview%22,%22bc%22:%22Overview%22}}]},{%22url%22:%22/pi/projects/overview?id=$PROJECTID&activetab=0%22,%22params%22:{%22tabContainer%22:%22#project-details-tabs%22,%22container%22:%22#project-tab-overview%22,%22bc%22:%22Overview%22}},{%22url%22:%22/pi/projects/details/overview/steps/listing?project_id=$PROJECTID%22,%22params%22:{%22tabContainer%22:%22#project-overview-tabs%22,%22container%22:%22#project-overview-steps%22,%22bc%22:%22Project%20Steps%22}}],%22modal%22:[]}";
    var basemap = new Basemap_1.default({
        baseLayers: [
            new TileLayer_1.default({
                portalItem: {
                    id: "1b243539f4514b6ba35e7d995890db1d" // World Hillshade
                }
            }),
            new VectorTileLayer_1.default({
                portalItem: {
                    id: "790572843907492f867bdbaa7b70ecd2"
                }
            })
        ]
    });
    var parcelsLayer = new FeatureLayer_1.default({
        url: "https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/7",
        opacity: .5,
        minScale: 100000,
        outFields: ["GEOCODE"]
    });
    var map = new Map_1.default({
        basemap: basemap,
        layers: [parcelsLayer],
        ground: "world-elevation"
    });
    var view = new SceneView_1.default({
        map: map,
        container: "viewDiv",
        center: [-111.16, 45.752],
        zoom: 11
    });
    function doPermits() {
        promiseUtils.eachAlways([permits_1.getLocations(), permits_1.getPermits()]).then(function (results) {
            var locationData = results[0].value;
            locationData.forEach(function (pair) {
                if (pair["Property ID"] in locations) {
                    locations[pair["Property ID"]].push(pair["Location ID"]);
                }
                else {
                    locations[pair["Property ID"]] = [pair["Location ID"]];
                }
            });
            var permitData = results[1].value;
            permitData.forEach(function (permit) {
                if (permit["Location ID"] in permits) {
                    permits[permit["Location ID"]].push(permit);
                }
                else {
                    permits[permit["Location ID"]] = [permit];
                }
            });
        });
    }
    view.when().then(function () {
        view.popup.autoOpenEnabled = false;
        //view.popup.dockOptions = {position:"top-right"};
        view.on("click", function (e) {
            view.hitTest(e).then(getParcel);
        });
    });
    function getParcel(response) {
        var _a;
        if (response.results.length) {
            var graphic = response.results.filter(function (result) {
                return result.graphic.layer === parcelsLayer;
            })[0].graphic;
            if (((_a = graphic) === null || _a === void 0 ? void 0 : _a.attributes["GEOCODE"]) in locations) {
                showPermits(graphic);
            }
        }
    }
    function showPermits(graphic) {
        var geocode = graphic.attributes["GEOCODE"];
        var locationIds = locations[geocode];
        var contentContainer = document.createElement("div");
        var content = document.createElement("table");
        contentContainer.appendChild(content);
        locationIds.forEach(function (locationId) {
            if (locationId in permits) {
                permits[locationId].forEach(function (permit) {
                    var row = content.insertRow();
                    permit["Permit Description"] = permit["Permit Description"].split("<br>").join("");
                    for (var attribute in permit) {
                        if (["Project ID", "Location ID"].indexOf(attribute) > -1) {
                            continue;
                        }
                        var cell_1 = row.insertCell();
                        cell_1.innerHTML += attribute + ":" + permit[attribute] + " ";
                    }
                    var cell = row.insertCell();
                    cell.innerHTML += "<a target=\"_blank\" href=" + permitLinkTemplate.split("$PERMITNUMBER").join(permit["Permit Number"]).split("$PROJECTID").join(permit["Project ID"]) + ">Permit</a>";
                    //cell.appendChild(span);
                });
            }
        });
        //view.popup.set("content",contentContainer);
        //view.popup.open({title:"Permits",content,location:graphic.geometry})
        //view.popup.dockOptions={position:"top-right"};
        view.popup.open({ content: contentContainer, location: graphic.geometry.centroid });
    }
    doPermits();
});
//# sourceMappingURL=main.js.map