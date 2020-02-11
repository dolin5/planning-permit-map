import * as promiseUtils from "esri/core/promiseUtils";

export function getLocations(){
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

export function getPermits(){
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