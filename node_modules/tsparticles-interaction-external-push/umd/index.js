(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Pusher"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadExternalPushInteraction = void 0;
    const Pusher_1 = require("./Pusher");
    async function loadExternalPushInteraction(engine) {
        await engine.addInteractor("externalPush", (container) => new Pusher_1.Pusher(container));
    }
    exports.loadExternalPushInteraction = loadExternalPushInteraction;
});
