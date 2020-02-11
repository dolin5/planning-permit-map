var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/Map", "esri/Basemap", "esri/layers/VectorTileLayer", "esri/layers/TileLayer", "esri/layers/FeatureLayer", "esri/views/SceneView", "esri/core/watchUtils", "./permits"], function (require, exports, Map_1, Basemap_1, VectorTileLayer_1, TileLayer_1, FeatureLayer_1, SceneView_1, watchUtils_1, permits_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Map_1 = __importDefault(Map_1);
    Basemap_1 = __importDefault(Basemap_1);
    VectorTileLayer_1 = __importDefault(VectorTileLayer_1);
    TileLayer_1 = __importDefault(TileLayer_1);
    FeatureLayer_1 = __importDefault(FeatureLayer_1);
    SceneView_1 = __importDefault(SceneView_1);
    watchUtils_1 = __importDefault(watchUtils_1);
    var parcelLayerView;
    var highlight;
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
        center: [-111.10, 45.7],
        zoom: 11,
        highlightOptions: {
            color: "orange"
        }
    });
    view.whenLayerView(parcelsLayer).then(function (layerView) { return parcelLayerView = layerView; });
    view.when().then(function () {
        view.popup.autoOpenEnabled = false;
        //view.popup.dockOptions = {position:"top-right"};
        view.on("click", function (e) {
            view.popup.close();
            if (highlight) {
                highlight.remove();
            }
            view.popup.location = e.mapPoint;
            view.hitTest(e).then(getParcel);
        });
        watchUtils_1.default.whenFalse(view.popup, "visible", function () {
            if (highlight) {
                highlight.remove();
            }
        });
    });
    function getParcel(response) {
        var _a;
        if (response.results.length) {
            var graphic = response.results.filter(function (result) {
                return result.graphic.layer === parcelsLayer;
            })[0].graphic;
            highlight = parcelLayerView.highlight(graphic);
            if (((_a = graphic) === null || _a === void 0 ? void 0 : _a.attributes["GEOCODE"]) in permits_1.locationMappings) {
                var content = permits_1.getPermitsPopup(graphic);
                view.popup.open({ content: content });
            }
            else {
                view.popup.open({ content: "No permits" });
            }
        }
        else {
            view.popup.open({ content: "No permits" });
        }
    }
    permits_1.doPermits();
});
//# sourceMappingURL=main.js.map