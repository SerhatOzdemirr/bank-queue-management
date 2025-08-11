import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BootstrapStyleService {
  private href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css';
  private id = 'bn-bootstrap-css';

  enable() {
    if (document.getElementById(this.id)) return;
    const link = document.createElement('link');
    link.id = this.id;
    link.rel = 'stylesheet';
    link.href = this.href;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }

  disable() {
    const link = document.getElementById(this.id);
    if (link) link.remove();
  }
}
