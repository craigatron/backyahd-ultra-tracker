import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { GridComponent } from './grid/grid.component';
import { MainComponent } from './main/main.component';
import { PlaceholderComponent } from './placeholder/placeholder.component';

const routes: Routes = [
  {
    path: '',
    component: PlaceholderComponent,
    pathMatch: 'full',
  },
  {
    path: 'track',
    component: MainComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: GridComponent,
      }, 
      {
        path: 'about',
        component: AboutComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
