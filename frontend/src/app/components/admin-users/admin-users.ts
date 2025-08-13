import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  AdminUsersService,
  UserSummaryDto,
} from "../../services/admin-users.service";
import { BootstrapStyleService } from "../../services/bootstrap-styles.service";
@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./admin-users.html",
  styleUrl: "./admin-users.css",
})
export class AdminUsers implements OnInit , OnDestroy {
  private adminuserservice = inject(AdminUsersService);
  private bs = inject(BootstrapStyleService);
  users: UserSummaryDto[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.bs.enable();
    this.adminuserservice.getUsers().subscribe({
      next: (res) => (this.users = res),
      error: (err) => (this.error = err?.message ?? "Error occured"),
      complete: () => (this.loading = false),
    });
  }

  updatePriority(userId: number, score: number) {
  if (score < 1 || score > 5) {
    alert('Priority must be between 1 and 5');
    return;
  }

  this.adminuserservice.updatePriority(userId, score).subscribe(() => {
    const user = this.users.find(u => u.id === userId);
    if (user) user.priorityScore = score;
  });
}

  ngOnDestroy(): void {
    this.bs.disable();
  }
}
