import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DateTime } from 'luxon';
import { FirebaseService } from '../firebase.service';
import { Runner } from '../models';
import * as humanizeDuration from 'humanize-duration';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  @ViewChild('innerTable') innerTable?: ElementRef;

  runners: Runner[] = [];
  runnerLoops: Map<string, Array<{quit: boolean, finishTime?: DateTime, trackerLink?: string, submitted: boolean}>> = new Map();
  loops: Array<{loopNum: number, timeRange: string}> = [];

  startTime?: DateTime;
  donationAmount?: number;
  donationLastUpdated?: string;
  status?: string;
  finalLoop?: number;

  constructor(private readonly firebaseService: FirebaseService, private readonly titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle('Road Hazahds | RHBU Tracker');
    this.firebaseService.getDonations().then((donations) => {
      this.donationAmount = donations.amount;
      this.donationLastUpdated = donations.lastUpdated.toLocaleString(DateTime.DATETIME_FULL);
    });
    const runnersPromise = this.firebaseService.getRunners();
    const startTimePromise = this.firebaseService.getStartTime();
    Promise.all([runnersPromise, startTimePromise]).then(([runners, startTime]) => {
      this.runners = runners.sort((a, b) => {
        if (a.quit === b.quit) {
          const aMaxLoop = a.lastCompletedLoop;
          const bMaxLoop = b.lastCompletedLoop;
          return aMaxLoop === bMaxLoop ? a.callsign.localeCompare(b.callsign) : bMaxLoop - aMaxLoop;
        }
        return a.quit ? 1 : -1;
      });
      this.startTime = DateTime.fromMillis(startTime.toMillis());

      if (runners.every((r) => r.quit)) {
        let lastLoop = 0;
        runners.forEach((r) => {
          const runnerLast = Math.max(...Array.from(r.loops.keys()).map((n) => parseInt(n)));
          if (runnerLast > lastLoop) {
            lastLoop = runnerLast;
          }
        });
        this.finalLoop = lastLoop;
      }

      this.loops = this.getLoops();

      this.runnerLoops = new Map();
      this.runners.forEach((r) => {
        this.runnerLoops.set(r.callsign, this.loops.map((l) => {
          const runnerLoop = r.loops.get(l.loopNum.toString());
          if (runnerLoop) {
            return {quit: runnerLoop.quit, finishTime: runnerLoop.finishTime, submitted: true};
          } else {
            // use the most recent quit value
            return {quit: r.quit, submitted: false};
          }
        }));
      });

      this.status = this.calculateCurrentStatus();
    });
  }

  private getLoops() {
    if (!this.startTime) {
      throw new Error('wtf?');
    }

    const startTime = this.startTime;

    const numHours = startTime.diffNow('hours').hours;
    // >= 0 - event hasn't started yet!
    const numLoops = this.finalLoop ? this.finalLoop : numHours >= 0 ? 1 : Math.ceil(Math.abs(numHours));

    return Array.from(Array(numLoops).keys()).map(
      n => {
        const loopStart = startTime.plus({hours: n});
        const loopEnd = loopStart.plus({hours: 1});
        return {
          loopNum: n + 1,
          timeRange: `(${loopStart.toFormat('HH:00')}-${loopEnd.toFormat('HH:00')})`,
        };
      }
    ).reverse();
  }

  scrollHorizontally(event: WheelEvent) {
    if (this.innerTable) {
      const oldValue = this.innerTable.nativeElement.scrollLeft;
      this.innerTable.nativeElement.scrollLeft += event.deltaY;
      if (oldValue !== this.innerTable.nativeElement.scrollLeft) {
        event.preventDefault();
      }
    }
  }

  private calculateCurrentStatus(): string {
    if (!this.startTime) {
      throw new Error('start time not set');
    }

    if (this.finalLoop) {
      return `All runners dropped out by loop ${this.finalLoop}`;
    }

    const now = DateTime.local().setZone('America/New_York');
    const diff = now.diff(this.startTime, ['hours', 'minutes']);
    if (now > this.startTime) {
      const currentLoop = diff.hours + 1;
      return `Loop ${currentLoop} started ${Math.round(diff.minutes)} minutes ago`;
    }

    if (now.month === this.startTime.month && now.day === this.startTime.day) {
      return `First loop starts in ${humanizeDuration(diff.as('milliseconds'), {units: ['h', 'm'], round: true})}`
    }

    return `First loop starts ${this.startTime.toFormat('MMMM d')} at ${this.startTime.toFormat('t')}`
  }
}
