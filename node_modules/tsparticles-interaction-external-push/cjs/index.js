"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadExternalPushInteraction = void 0;
const Pusher_1 = require("./Pusher");
async function loadExternalPushInteraction(engine) {
    await engine.addInteractor("externalPush", (container) => new Pusher_1.Pusher(container));
}
exports.loadExternalPushInteraction = loadExternalPushInteraction;
