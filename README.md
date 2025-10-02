
# BankNumerator — Bank Queue Management System

> **Frontend:** Angular 20 + Chart.js • **Backend:** ASP.NET Core 9 Web API • **DB:** PostgreSQL

---

### Intro
**BankNumerator** bankacılık şubeleri için sıra yönetim sistemidir. Müşteriler numara alır/iptal eder, **ajanlar** (agents) yeteneklerine göre biletleri işler, **yöneticiler** (admins) servisleri/ajanları/kullanıcıları ve istatistikleri yönetir.

- JWT + salted/hashed parola
- Öncelik farkındalıklı kuyruk (servis önceliği + kullanıcı önceliği + bekleme süresi yaşlandırma)
- Agent skill & ticket routing
- Chart.js ile admin panelleri

---

### Key Features
- **Role-based model:** Default User, Admin, Agent  
- **Ticket issuing & cancel:** günlük limit, sayaç artış/azalış, zaman damgası  
- **Dynamic priority:** servis önceliği + kullanıcı önceliği + bekleme yaşlandırma  
- **Admin controls:** servis CRUD, de/aktivasyon, limit, kullanıcı **PriorityScore (1–5)**  
- **Agent ops:** kendi bekleyen biletlerini önceliğe göre görme, **accept / reject / release / route**  
- **Analytics:** servis başına bilet sayıları, ajan aktivitesi (pending/accepted/rejected)  
- **Clean REST API:** Auth, Services, Numerator, Admin, Admin/Agents, Agent/Tickets

---

### Architecture
```

Angular 20 SPA (Auth/Guards, Services, Components)     Chart.js
│                          ▲
│ HTTP (JWT)               │ Charts Data
▼                          │
ASP.NET Core 9 Web API (Controllers + Domain Services)
│
▼
PostgreSQL (EF Core ORM)

```

**Tiers**
- **Client:** Login, Signup, Numerator, Admin Dashboard/Service/Agents/Tickets, Agent Tickets
- **Server:** ASP.NET Core 9 (JWT, DI, Swagger, PostgreSQL)
- **Data:** Users, Agents, AgentSkills, ServiceItems, ServiceCounters, Tickets, TicketAssignments

---

### Tech Stack
- **Frontend:** Angular 20, RxJS, Chart.js
- **Backend:** .NET 9 (ASP.NET Core Web API), EF Core (Npgsql)
- **Database:** PostgreSQL
- **Testing:** Karma/Jasmine (unit), Playwright (E2E)

---

### Directory Structure
```

bank-queue-management/
├─ backend/
│  └─ BankNumerator.Api/
│     ├─ Controllers/        # Auth, Services, Numerator, Admin, AgentTickets, AdminAgents
│     ├─ Services/           # AuthService, NumeratorService, AdminService, AgentTicketsService, ...
│     ├─ Models/             # User, Agent, ServiceItem, Ticket, AgentSkill, TicketAssignment, ...
│     └─ Data/               # BankNumeratorContext (DbContext)
├─ frontend/
│  ├─ src/                   # Angular app (components, services, guards, interceptor)
│  ├─ package.json           # Angular 20 + Chart.js + Playwright deps
│  └─ playwright.config.ts
└─ BankNumerator_Sofware_Design_Document.pdf

````

---

### Getting Started

#### Prerequisites
- **Backend:** .NET SDK 9, PostgreSQL
- **Frontend:** Node.js ≥ 18, npm, Angular CLI v20 (`npm i -g @angular/cli`)

#### Clone
```bash
git clone https://github.com/SerhatOzdemirr/bank-queue-management.git
cd bank-queue-management
````

#### Backend Setup

```bash
cd backend/BankNumerator.Api
dotnet restore
# Migrations (varsa atla, yoksa ekle)
dotnet ef migrations add InitialCreate
dotnet ef database update
# Run
dotnet run
```

> Varsayılan port örn. `https://localhost:5001` (Development’ta Swagger açık)

#### Frontend Setup

```bash
cd ../../frontend
npm install
# src/environments/environment.ts içinde API Base URL: http://localhost:5000/api (ör.)
ng serve
```

> Uygulama: `http://localhost:4200/`

---

### Configuration

#### Backend (`appsettings.json` or env vars)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=banknumerator;Username=postgres;Password=yourpassword"
  },
  "JwtSettings": {
    "Key": "your-very-strong-secret",
    "Issuer": "BankNumerator",
    "Audience": "BankNumeratorClients",
    "DurationInMinutes": 60
  }
}
```

#### Frontend (`src/environments/environment.ts`)

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000/api'
};
```

---

### API Overview

#### Auth (`/api/auth`)

* `POST /signup` — default user kaydı
* `POST /login` — JWT al
* `POST /signup-admin` — admin kaydı (Admin role)

#### Services (`/api/services`)

* `GET /` — aktif servisler (anonymous)

#### Numerator (`/api/numerator`) — *Authenticated*

* `GET /next?service={serviceKey}` — servis için bilet ver
* `DELETE /{ticketId}` — kullanıcının biletini iptal et

#### Admin (`/api/admin`) — *Admin only*

* **Services:** create/update/deactivate/limit, sayaçlarla listele
* **Tickets:** tümünü listele (servise göre filtrele), composite ile iptal
* **Users:** hepsini listele, **PriorityScore (1–5)** güncelle

#### Admin Agents (`/api/admin/agents`) — *Admin only*

* `GET /` — ajan + yetenek listesi
* `POST /` — benzersiz e-posta/kullanıcı + yeteneklerle ajan oluştur (transactional)
* `DELETE /{id}` — ajan sil

#### Agent Tickets (`/api/agent/tickets`) — *Agent only*

* `GET /` — bekleyen biletler (etkin önceliğe göre sıralı)
* `POST /accept` • `POST /reject` • `POST /release`
* `POST /route` — başka yetenekli ajana yönlendir
* `GET /route-candidates/{serviceKey}` — uygun ajanları listele

---

### Roles & Workflows

#### Default Users

* Sign up / log in
* Aktif servisleri gör
* Günlük limit uygunsa bilet al
* Bilet no / servis / atanan ajanı gör
* Kendi biletini iptal et

#### Administrators

* **Services:** key/label/active/max/priority (1–5)
* **Users:** **PriorityScore** ayarla
* **Agents:** yeteneklerle ajan oluştur, benzersiz kimlikleri koru
* **Tickets:** listele, filtrele, iptal et
* **Analytics:** servis sayıları & ajan aktivitesi

#### Agents

* Kendi bekleyen biletlerini **servis önceliği + kullanıcı önceliği + bekleme yaşlandırma** ile sıralı gör
* **Accept / Reject / Release**
* **Route** (hedef ajanın ilgili yeteneği olmalı)

---

### Analytics

* **Service ticket counts:** bugün / 7g / 30g aralıkları
* **Agent activity:** pending / accepted / rejected + son biletler
  *(Chart.js ile Admin Dashboard’da görselleştirilir.)*

---

### Testing

#### Frontend

```bash
# E2E (Playwright)
npx playwright test

# Unit (Karma/Jasmine)
ng test
```

> Backend testleri eklenmemiştir; services & controllers için xUnit önerilir.

---

### Deployment

#### Frontend (Angular)

```bash
ng build --configuration production
# dist/ içeriğini reverse proxy / web server arkasından servis edin
```

#### Backend (ASP.NET Core)

```bash
dotnet publish -c Release
# Ortam değişkenleriyle bağlantı dizesi ve JWT ayarlarını prod'da yapılandırın
```

---

### Contributing

1. Fork + feature branch
2. Konvansiyonel commit mesajları
3. Backend build + frontend testleri geçmeli
4. Açıklayıcı Pull Request aç

---

### License

Lisans dosyası yok. Üretimde kullanacaksanız uygun bir açık kaynak lisansı (örn. MIT) ekleyin veya maintainer ile iletişime geçin.

---

### Acknowledgements

Developed by **Serhat Özdemir**.
Detaylı mimari/ veri tasarımı / UI akışları için depodaki **Software Design Document**’a bakınız.

