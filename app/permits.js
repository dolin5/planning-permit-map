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
    function getLocations() {
        var _this = this;
        return promiseUtils.create(function (res, rej) {
            var locationsRequest = new XMLHttpRequest();
            locationsRequest.responseType = "json";
            locationsRequest.open("GET", "https://planning-permit-db.herokuapp.com/get-locations");
            locationsRequest.onload = function () {
                if (locationsRequest.readyState == 4 && locationsRequest.status == 200) {
                    res(locationsRequest.response);
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
    exports.getLocations = getLocations;
    function getPermits() {
        var _this = this;
        return promiseUtils.create(function (res, rej) {
            var permitsRequest = new XMLHttpRequest();
            permitsRequest.responseType = "json";
            permitsRequest.open("GET", "https://planning-permit-db.herokuapp.com/get-permits");
            permitsRequest.onload = function () {
                if (permitsRequest.readyState == 4 && permitsRequest.status == 200) {
                    res(permitsRequest.response);
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
    exports.getPermits = getPermits;
});
//# sourceMappingURL=permits.js.map