import { DateTime } from "luxon";

export class Runner {
    constructor(
        readonly callsign: string, 
        readonly loopMiles: number,
        readonly profileImgUrl: string,
        readonly loops: Map<string,  {quit: boolean, finishTime?: DateTime, trackerLink?: string}>,
        readonly quit: boolean,
        readonly instagramUsername?: string,
        readonly facebookUsername?: string,
        readonly twitterUsername?: string) {}

    get totalMiles(): number {
        return Array.from(this.loops.values()).filter((l) => !l.quit).length * this.loopMiles;
    }

    get lastCompletedLoop(): number {
        return Math.max(...Array.from(this.loops.entries()).filter(e => !e[1].quit).map(e => parseInt(e[0])))
    }
}