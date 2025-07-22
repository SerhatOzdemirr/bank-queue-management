export class User {
  private lastNumber = 0;
  private userToNumber = new Map<string, number>();

  constructor() {
    this.userToNumber.clear(); 
    this.loadFromStorage();
  }
  isEmailOrPasswordTaken(
    email: string,
    password: string,
    identityKey: string
  ): boolean {
    const existingKeys = Array.from(this.userToNumber.keys());

    console.log(existingKeys);
    return existingKeys.some((key) => {
      if (key === identityKey) return false; // kendi girişiyse sorun yok

      const [, storedEmail, storedPassword] = key.split('|');

      // Email veya şifre başka kullanıcı tarafından kullanılmışsa engelleriz
      return storedEmail === email.toLowerCase() || storedPassword === password;
    });
  }
  private loadFromStorage() {
    const data = localStorage.getItem('userMap');
    const last = localStorage.getItem('lastNumber');

    if (data) {
      const parsed = JSON.parse(data);
      Object.entries(parsed).forEach(([key, value]) => {
        this.userToNumber.set(key, value as number);
      });
    }

    if (last) {
      this.lastNumber = +last;
    }
  }

  private saveToStorage() {
    const obj: Record<string, number> = {};
    this.userToNumber.forEach((value, key) => {
      obj[key] = value;
    });

    localStorage.setItem('userMap', JSON.stringify(obj));
    localStorage.setItem('lastNumber', this.lastNumber.toString());
  }

  assignNumber(identityKey: string): number {
    if (this.userToNumber.has(identityKey)) {
      return this.userToNumber.get(identityKey)!;
    }

    this.lastNumber += 1;
    this.userToNumber.set(identityKey, this.lastNumber);
    this.saveToStorage();

    return this.lastNumber;
  }
}
