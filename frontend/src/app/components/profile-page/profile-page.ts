import { Component } from '@angular/core';
import { ProfileHeader } from '../profile-header/profile-header';
import { ProfileStatistics } from '../profile-statistics/profile-statistics';

@Component({
  selector: 'app-profile-page',
  imports: [ProfileHeader ,ProfileStatistics],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})
export class ProfilePage {

}
