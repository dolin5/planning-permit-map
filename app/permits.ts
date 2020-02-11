import * as promiseUtils from "esri/core/promiseUtils";
import {permits,permit, locations,locationPair } from "./types";
import esri = __esri;

let permits:permits = {};
export let locationMappings:locations={};
let permitLinkTemplate = "https://web.mygov.us/app/#{%22page%22:[{%22url%22:%22/pi/%22,%22params%22:{%22container%22:%22#mn%22,%22value%22:%22pi%22,%22bc%22:%22Permits%20&%20Inspections%22,%22url%22:%22/pi/%22,%22environment%22:%22page%22},%22tabs%22:[]},{%22url%22:%22/pi/projects/details?id=$PROJECTID&list=all%22,%22params%22:{%22container%22:%22#main%22,%22class%22:%22module%22,%22bc%22:%22Project%20Details%20-%20$PERMITNUMBER%22,%22url%22:%22/pi/projects/details?id=$PROJECTID&list=all%22,%22environment%22:%22page%22},%22tabs%22:[{%22url%22:%22/pi/projects/overview?id=$PROJECTID&activetab=0%22,%22params%22:{%22tabContainer%22:%22#project-details-tabs%22,%22container%22:%22#project-tab-overview%22,%22bc%22:%22Overview%22}}]},{%22url%22:%22/pi/projects/overview?id=$PROJECTID&activetab=0%22,%22params%22:{%22tabContainer%22:%22#project-details-tabs%22,%22container%22:%22#project-tab-overview%22,%22bc%22:%22Overview%22}},{%22url%22:%22/pi/projects/details/overview/steps/listing?project_id=$PROJECTID%22,%22params%22:{%22tabContainer%22:%22#project-overview-tabs%22,%22container%22:%22#project-overview-steps%22,%22bc%22:%22Project%20Steps%22}}],%22modal%22:[]}"


export function doPermits(){
  promiseUtils.eachAlways([getLocations(),getPermits()]).then((results:esri.EachAlwaysResult)=>{
    let locationData:Array<locationPair> = results[0].value;
    locationData.forEach(pair=>{
      if ("Property ID" in pair){
        if (pair["Property ID"] in locationMappings){
          locationMappings[pair["Property ID"]].push(pair["Location ID"]);
        }
        else {
          locationMappings[pair["Property ID"]]= [pair["Location ID"]];
        } 
      }           
    })
    let permitData:Array<permit> = results[1].value;
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


function getLocations(){
  return promiseUtils.create((res,rej)=>{
    const locationsRequest = new XMLHttpRequest();
    locationsRequest.responseType = "json";
    locationsRequest.open("GET","https://planning-permit-db.herokuapp.com/get-locations")
    locationsRequest.onload = ()=>{
      if (locationsRequest.readyState==4 && locationsRequest.status==200) {
        res(locationsRequest.response);
      } else {
          rej({
              status: this.status,
              statusText: locationsRequest.statusText
          });
      }
    }
    locationsRequest.send();
  })
}

function getPermits(){
  return promiseUtils.create((res,rej)=>{
    const permitsRequest = new XMLHttpRequest();
    permitsRequest.responseType = "json";
    permitsRequest.open("GET","https://planning-permit-db.herokuapp.com/get-permits")
    permitsRequest.onload = ()=>{
      if (permitsRequest.readyState==4 && permitsRequest.status==200) {
        res(permitsRequest.response);
      } else {
        rej({
            status: this.status,
            statusText: permitsRequest.statusText
        });
      }
    }
    permitsRequest.send();
  })
}

export function getPermitsPopup(graphic:esri.Graphic){
  let geocode = graphic.attributes["GEOCODE"];
  const locationIDs = locationMappings[geocode];
  let content:HTMLTableElement|string = document.createElement("table");
  content.classList.add("table","table-striped","table-blue");
  let headerRow = content.createTHead().insertRow();
  ["Permit#","Title","Address","Status","Status Date","Type","MyGov#"].forEach(title=>{
    let headerCell = document.createElement("TH");
    headerCell.innerText = title;
    headerRow.appendChild(headerCell);
  })
  let body = content.createTBody();
  locationIDs.forEach((locationID:number)=>{
    if (locationID in permits){
      permits[locationID].forEach((permit:permit) => {  
        let row = body.insertRow();      
        permit["Permit Description"] = permit["Permit Description"].split("<br>").join("");
        ["Permit Description","Permit Title","Project Address","Status","Status Date","Template name","Permit Number"].forEach((attribute:string)=>{
          let cell = row.insertCell();
          cell.innerHTML += permit[attribute];
        })
        row.onclick = ()=>{window.open(permitLinkTemplate.split("$PERMITNUMBER").join(permit["Permit Number"]).split("$PROJECTID").join(permit["Project ID"].toString()),"_blank")};

      });

    }    
  })
  if (content.rows.length<=1){
    content = "No permits";
  }
  return content;
}
