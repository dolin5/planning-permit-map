import EsriMap from "esri/Map";
import Basemap from "esri/Basemap";
import VectorTileLayer from "esri/layers/VectorTileLayer";
import TileLayer from "esri/layers/TileLayer";
import FeatureLayer from "esri/layers/FeatureLayer";
import SceneView from "esri/views/SceneView";
import * as promiseUtils from "esri/core/promiseUtils";
import { getLocations, getPermits } from "./permits";
import {locations } from "./types";
import esri = __esri;


let permits={};
let locations:locations={};

let permitLinkTemplate = "https://web.mygov.us/app/#{%22page%22:[{%22url%22:%22/pi/%22,%22params%22:{%22container%22:%22#mn%22,%22value%22:%22pi%22,%22bc%22:%22Permits%20&%20Inspections%22,%22url%22:%22/pi/%22,%22environment%22:%22page%22},%22tabs%22:[]},{%22url%22:%22/pi/projects/details?id=$PROJECTID&list=all%22,%22params%22:{%22container%22:%22#main%22,%22class%22:%22module%22,%22bc%22:%22Project%20Details%20-%20$PERMITNUMBER%22,%22url%22:%22/pi/projects/details?id=$PROJECTID&list=all%22,%22environment%22:%22page%22},%22tabs%22:[{%22url%22:%22/pi/projects/overview?id=$PROJECTID&activetab=0%22,%22params%22:{%22tabContainer%22:%22#project-details-tabs%22,%22container%22:%22#project-tab-overview%22,%22bc%22:%22Overview%22}}]},{%22url%22:%22/pi/projects/overview?id=$PROJECTID&activetab=0%22,%22params%22:{%22tabContainer%22:%22#project-details-tabs%22,%22container%22:%22#project-tab-overview%22,%22bc%22:%22Overview%22}},{%22url%22:%22/pi/projects/details/overview/steps/listing?project_id=$PROJECTID%22,%22params%22:{%22tabContainer%22:%22#project-overview-tabs%22,%22container%22:%22#project-overview-steps%22,%22bc%22:%22Project%20Steps%22}}],%22modal%22:[]}"

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
  center: [-111.16, 45.752],
  zoom: 11
});

function doPermits(){
  promiseUtils.eachAlways([getLocations(),getPermits()]).then((results)=>{
    let locationData = results[0].value;
    locationData.forEach(pair=>{
      if (pair["Property ID"] in locations){
        locations[pair["Property ID"]].push(pair["Location ID"]);
      }
      else {
        locations[pair["Property ID"]]= [pair["Location ID"]];
      }      
    })
    let permitData = results[1].value;
    permitData.forEach((permit)=>{
      if (permit["Location ID"] in permits){
        permits[permit["Location ID"]].push(permit);
      }
      else {
        permits[permit["Location ID"]]= [permit];
      }      
    })
  })
}



view.when().then(()=>{
  view.popup.autoOpenEnabled = false;
  //view.popup.dockOptions = {position:"top-right"};
  view.on("click",e=>{
    view.hitTest(e).then(getParcel)
  })
})

function getParcel(response:esri.HitTestResult){
  if (response.results.length){
    const graphic = response.results.filter(function(result) {
      return result.graphic.layer === parcelsLayer;
    })[0].graphic;
    if (graphic?.attributes["GEOCODE"] in locations){
      showPermits(graphic);
    }
  }
}


function showPermits(graphic){
  let geocode = graphic.attributes["GEOCODE"];
  const locationIds = locations[geocode];
  let contentContainer = document.createElement("div");
  let content = document.createElement("table");
  contentContainer.appendChild(content);

  locationIds.forEach(locationId=>{
    if (locationId in permits){
      permits[locationId].forEach(permit => {  
        let row = content.insertRow();      
        permit["Permit Description"] = permit["Permit Description"].split("<br>").join("");
        for (const attribute in permit){
          if (["Project ID","Location ID"].indexOf(attribute)>-1){
            continue;
          }
          let cell = row.insertCell();
          cell.innerHTML += attribute +":"+ permit[attribute] + " ";
        }
        let cell = row.insertCell();
        cell.innerHTML += "<a target=\"_blank\" href="+permitLinkTemplate.split("$PERMITNUMBER").join(permit["Permit Number"]).split("$PROJECTID").join(permit["Project ID"])+">Permit</a>"        
        //cell.appendChild(span);
      });

    }    
  })
  //view.popup.set("content",contentContainer);
  //view.popup.open({title:"Permits",content,location:graphic.geometry})
  //view.popup.dockOptions={position:"top-right"};
  view.popup.open({content:contentContainer,location:graphic.geometry.centroid});

}



doPermits();