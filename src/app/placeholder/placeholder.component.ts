import { Component, OnDestroy, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Subscription, interval } from 'rxjs';
import * as humanizeDuration from 'humanize-duration';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

const START_TIME = DateTime.fromISO('2021-04-10T08:00', {zone: 'America/New_York'});

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrls: ['./placeholder.component.scss']
})
export class PlaceholderComponent implements OnInit, OnDestroy {

  private subscription?: Subscription;
  
  diff?: string;

  constructor(private readonly router: Router, private readonly titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Road Hazahds | Backyahd Ultra');
    this.subscription = interval(1000).subscribe(() => {this.updateTime();})
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private updateTime() {
    if (START_TIME < DateTime.local()) {
      this.router.navigate(['/track']);
    }
    this.diff = humanizeDuration(START_TIME.diffNow(['days', 'hours', 'minutes', 'seconds', 'milliseconds']).as('milliseconds'), {round: true});
  }
}
