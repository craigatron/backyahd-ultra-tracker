import firebase from 'firebase';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  private db: any;

  constructor() { }

  ngOnInit(): void {
    this.db = firebase.firestore();
  }

}
