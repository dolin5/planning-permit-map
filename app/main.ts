import EsriMap from "esri/Map";
import Basemap from "esri/Basemap";
import VectorTileLayer from "esri/layers/VectorTileLayer";
import TileLayer from "esri/layers/TileLayer";
import FeatureLayer from "esri/layers/FeatureLayer";
import SceneView from "esri/views/SceneView";
import watchUtils from "esri/core/watchUtils";
import { doPermits, getPermitsPopup, locationMappings } from "./permits";
import esri = __esri;

let parcelLayerView:esri.FeatureLayerView;
let highlight:esri.Handle;

const basemap = new Basemap({
  baseLayers:[
    new TileLayer({
      portalItem: {
        id: "1b243539f4514b6ba35e7d995890db1d" // World Hillshade
      }
    }),
    new VectorTileLayer({
      portalItem:{
        id:"790572843907492f867bdbaa7b70ecd2"
      }
    })
  ]
})

const parcelsLayer = new FeatureLayer({
  url:"https://gis.gallatin.mt.gov/arcgis/rest/services/MapServices/Planning/MapServer/7",
  opacity:.5,
  minScale:100000,
  outFields:["GEOCODE"]
})

const map = new EsriMap({
  basemap,
  layers:[parcelsLayer],
  ground: "world-elevation"
});

const view = new SceneView({
  map,
  container: "viewDiv",
  center: [-111.10, 45.7],
  zoom: 11,
  highlightOptions: {
    color: "orange"
  }  
});

view.whenLayerView(parcelsLayer).then(layerView=>parcelLayerView = layerView);


view.when().then(()=>{
  view.popup.autoOpenEnabled = false;
  //view.popup.dockOptions = {position:"top-right"};
  view.on("click",e=>{
    view.popup.close();
    if (highlight){
      highlight.remove();
    }
    view.popup.location=e.mapPoint;
    view.hitTest(e).then(getParcel)
  })
  watchUtils.whenFalse(view.popup,"visible",()=>{
    if (highlight){
      highlight.remove();
    }        
  })
})

function getParcel(response:esri.SceneViewHitTestResult){
  if (response.results.length){
    const graphic = response.results.filter(function(result) {
      return result.graphic.layer === parcelsLayer;
    })[0].graphic;
    highlight = parcelLayerView.highlight(graphic);
    if (graphic?.attributes["GEOCODE"] in locationMappings){
      let content = getPermitsPopup(graphic);    
      view.popup.open({content});
    } else {
      view.popup.open({content:"No permits"});
    }
  } else {
    view.popup.open({content:"No permits"});
  }
}

doPermits();