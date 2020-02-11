var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "esri/core/promiseUtils"], function (require, exports, promiseUtils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    promiseUtils = __importStar(promiseUtils);
    var permits = {};
    exports.locationMappings = {};
    var permitLinkTemplate = "https://web.mygov.us/app/#{%22page%22:[{%22url%22:%22/pi/%22,%22params%22:{%22container%22:%22#mn%22,%22value%22:%22pi%22,%22bc%22:%22Permits%20&%20Inspections%22,%22url%22:%22/pi/%22,%22environment%22:%22page%22},%22tabs%22:[]},{%22url%22:%22/pi/projects/details?id=$PROJECTID&list=all%22,%22params%22:{%22container%22:%22#main%22,%22class%22:%22module%22,%22bc%22:%22Project%20Details%20-%20$PERMITNUMBER%22,%22url%22:%22/pi/projects/details?id=$PROJECTID&list=all%22,%22environment%22:%22page%22},%22tabs%22:[{%22url%22:%22/pi/projects/overview?id=$PROJECTID&activetab=0%22,%22params%22:{%22tabContainer%22:%22#project-details-tabs%22,%22container%22:%22#project-tab-overview%22,%22bc%22:%22Overview%22}}]},{%22url%22:%22/pi/projects/overview?id=$PROJECTID&activetab=0%22,%22params%22:{%22tabContainer%22:%22#project-details-tabs%22,%22container%22:%22#project-tab-overview%22,%22bc%22:%22Overview%22}},{%22url%22:%22/pi/projects/details/overview/steps/listing?project_id=$PROJECTID%22,%22params%22:{%22tabContainer%22:%22#project-overview-tabs%22,%22container%22:%22#project-overview-steps%22,%22bc%22:%22Project%20Steps%22}}],%22modal%22:[]}";
    function doPermits() {
        promiseUtils.eachAlways([getLocations(), getPermits()]).then(function (results) {
            var locationData = results[0].value;
            locationData.forEach(function (pair) {
                if ("Property ID" in pair) {
                    if (pair["Property ID"] in exports.locationMappings) {
                        exports.locationMappings[pair["Property ID"]].push(pair["Location ID"]);
                    }
                    else {
                        exports.locationMappings[pair["Property ID"]] = [pair["Location ID"]];
                    }
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
    exports.doPermits = doPermits;
    function getLocations() {
        var _this = this;
        return promiseUtils.create(function (res, rej) {
            var locationsRequest = new XMLHttpRequest();
            locationsRequest.open("GET", "https://planning-permit-db.herokuapp.com/get-locations");
            locationsRequest.setRequestHeader("Content-Type", "application/json");
            locationsRequest.onload = function () {
                if (locationsRequest.readyState === 4 && locationsRequest.status === 200) {
                    res(JSON.parse(locationsRequest.response));
                }
                else {
                    rej({
                        status: _this.status,
                        statusText: locationsRequest.statusText
                    });
                }
            };
            locationsRequest.send();
        });
    }
    function getPermits() {
        var _this = this;
        return promiseUtils.create(function (res, rej) {
            var permitsRequest = new XMLHttpRequest();
            permitsRequest.open("GET", "https://planning-permit-db.herokuapp.com/get-permits");
            permitsRequest.setRequestHeader("Content-Type", "application/json");
            permitsRequest.onload = function () {
                if (permitsRequest.readyState === 4 && permitsRequest.status === 200) {
                    res(JSON.parse(permitsRequest.response));
                }
                else {
                    rej({
                        status: _this.status,
                        statusText: permitsRequest.statusText
                    });
                }
            };
            permitsRequest.send();
        });
    }
    function getPermitsPopup(graphic) {
        var geocode = graphic.attributes["GEOCODE"];
        var locationIDs = exports.locationMappings[geocode];
        var content = document.createElement("table");
        content.classList.add("table", "table-striped", "table-blue");
        var headerRow = content.createTHead().insertRow();
        ["Permit#", "Title", "Address", "Status", "Status Date", "Type", "MyGov#"].forEach(function (title) {
            var headerCell = document.createElement("TH");
            headerCell.innerText = title;
            headerRow.appendChild(headerCell);
        });
        var body = content.createTBody();
        locationIDs.forEach(function (locationID) {
            if (locationID in permits) {
                permits[locationID].forEach(function (permit) {
                    var row = body.insertRow();
                    permit["Permit Description"] = permit["Permit Description"].split("<br>").join("").replace("Created by Import of Legacy Data on May 29, 2019 ", "").replace(" (App Number)", "");
                    ["Permit Description", "Permit Title", "Project Address", "Status", "Status Date", "Template name", "Permit Number"].forEach(function (attribute) {
                        var cell = row.insertCell();
                        cell.innerHTML += permit[attribute];
                    });
                    row.onclick = function () { window.open(permitLinkTemplate.split("$PERMITNUMBER").join(permit["Permit Number"]).split("$PROJECTID").join(permit["Project ID"].toString()), "_blank"); };
                });
            }
        });
        if (content.rows.length <= 1) {
            content = "No permits";
        }
        return content;
    }
    exports.getPermitsPopup = getPermitsPopup;
});
//# sourceMappingURL=permits.js.map