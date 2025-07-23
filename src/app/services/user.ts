export class User {
  private lastNumber = 0;
  private userToNumber = new Map<string, number>();

  constructor() {
    this.userToNumber.clear();
    this.loadFromStorage();
  }

  isEmailTaken(email: string, identityKey: string): boolean {
    return Array.from(this.userToNumber.keys()).some((key) => {
      if (key === identityKey) return false;
      const [, storedEmail] = key.split("|");
      return storedEmail === email.toLowerCase();
    });
  }

  isRegistered(identityKey: string): boolean {
    return this.userToNumber.has(identityKey);
  }

  registerUser(identityKey: string): number {
    if (!this.userToNumber.has(identityKey)) {
      this.lastNumber += 1;
      this.userToNumber.set(identityKey, this.lastNumber);
      this.saveToStorage();
    }
    return this.userToNumber.get(identityKey)!;
  }

  assignNumber(identityKey: string): number {
    return this.userToNumber.get(identityKey) ?? -1;
  }

  private loadFromStorage() {
    const data = localStorage.getItem("userMap");
    const last = localStorage.getItem("lastNumber");

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

    localStorage.setItem("userMap", JSON.stringify(obj));
    localStorage.setItem("lastNumber", this.lastNumber.toString());
  }
}
