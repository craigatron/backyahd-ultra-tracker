import firebase from 'firebase';
import { Injectable } from '@angular/core';
import { Runner } from './models';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private firestore;

  constructor() {
    this.firestore = firebase.firestore();
   }

   async getRunners(): Promise<Runner[]> {
     const runners = await this.firestore.collection('runners').get();
     return runners.docs.map(x => {
       return new Runner(
         x.get('callsign'), 
         x.get('loop_miles'),
         x.get('profile_img'), 
         new Map(Object.entries(x.get('loops')) as any),
         !!x.get('quit'),
         x.get('instagram_username'),
         x.get('facebook_username'),
         x.get('twitter_username'),
         x.get('strava_username'));
     });
   }

   async getStartTime(): Promise<firebase.firestore.Timestamp> {
     const config = await this.firestore.collection('config');
     return (await config.doc('config').get()).get('start_time');
   }

   async getDonations(): Promise<{amount: number, lastUpdated: DateTime}> {
     const donations = await this.firestore.collection('donations').doc('donations').get();
     return {amount: donations.get('amount'), lastUpdated: DateTime.fromMillis(donations.get('last_updated').toMillis())};
   }
}
