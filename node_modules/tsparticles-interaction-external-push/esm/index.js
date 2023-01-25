import { Pusher } from "./Pusher";
export async function loadExternalPushInteraction(engine) {
    await engine.addInteractor("externalPush", (container) => new Pusher(container));
}
