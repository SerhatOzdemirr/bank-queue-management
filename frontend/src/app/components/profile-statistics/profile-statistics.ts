import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService, ProfileStatisticsDto, TicketHistoryDto } from '../../services/profile.service';

@Component({
  selector: 'app-profile-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-statistics.html',
  styleUrl: './profile-statistics.css'
})
export class ProfileStatistics implements OnInit {
  stats?: ProfileStatisticsDto;
  history: TicketHistoryDto[] = [];

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.getProfileStatistics().subscribe(data => this.stats = data);
    this.profileService.getTicketHistory().subscribe(data => this.history = data);
  }
}
