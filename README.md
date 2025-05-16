# GC GradVerify

A modern, secure, and intuitive web platform for end-to-end graduation verification, including **award tracking**, **photo integration**, and **faculty-driven document validation**. Designed for seamless workflows, real-time collaboration, and polished outputs for graduation ceremonies.

---

## 🚀 Core Vision

- **End-to-end graduation verification**: From student submission to faculty review and final certificate generation.
- **Award & photo management**: Track honors, upload and review photos, and validate supporting documents.
- **Role-based access**: Superadmins, faculty/admins, and students each have tailored dashboards and workflows.
- **Automated outputs**: Generate PDFs, CSVs, and email invitations for ceremonies.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS (modern UI, dark/light modes)
- **Backend**: Express.js (API, PDF generation, batch processing)
- **Database**: PostgreSQL (Drizzle ORM)
- **Storage**: (Planned) AWS S3 for photos/docs
- **Auth**: Passport.js (role-based access control)
- **PDF Generation**: (Planned) @react-pdf/renderer or PDF-Lib

---

## 🏗️ Project Structure

```
/client         # Frontend (React, Vite, Tailwind)
/server         # Backend (Express, API, PDF, DB logic)
/shared         # Shared types, schema, and utilities
/migrations     # Database migrations (Drizzle)
.env            # Environment variables (DB connection, etc.)
```

---

## ⚡ Getting Started

### 1. **Clone the repository**
```sh
git clone <repo-url>
cd GradVerification
```

### 2. **Install dependencies**
```sh
npm install
```

### 3. **Configure environment variables**

Create a `.env` file in the root directory:
```
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require
NODE_ENV=development
```

### 4. **Set up the database**
```sh
npm run db:push
```
This will apply the schema to your PostgreSQL database.

### 5. **Run the development server**
```sh
npm run dev
```
The app will be available at [http://localhost:5000](http://localhost:5000).

---

## 👤 User Roles & Features

### **Superadmin**
- Manage admins/faculty, set deadlines, view analytics.
- Monitor system-wide stats: verified students, pending awards, rejection rates.

### **Admin/Faculty**
- Review and verify student submissions (PSA, photos, awards).
- Bulk approve/reject, send feedback, and trigger notifications.

### **Student**
- Register, fill out details, upload PSA and graduation photo, enter awards.
- Track status of each submission and respond to feedback.

---

## 🔄 Key Workflows

### **Student Submission**
1. Register and fill in details.
2. Upload PSA and photo, enter awards.
3. System validates files and sends confirmation.

### **Faculty Verification**
1. Review submissions in a unified dashboard.
2. Approve or reject with comments.
3. Students are notified to resolve issues.

### **Post-Approval Automation**
- Generate dynamic PDFs and CSVs for ceremonies.
- Send email invitations with ceremony details and award info.

---

## 🖥️ UI/UX Highlights

- **Student Portal**: Step-by-step wizard, live validation, upload guidelines, status tracker.
- **Admin Dashboard**: Department tree navigation, priority queues, bulk actions.
- **Email Templates**: Responsive, branded, with award badges and ceremony info.

---

## 🛡️ Security & Performance

- File uploads scanned for malware.
- Secure, signed URLs for photo access.
- Image compression and server-side caching for performance.
- Accessibility: alt text, screen-reader-friendly tables.

---

## 📝 Example Scenario

1. **Student** Maria submits PSA, photo, and claims "Dean's Lister."
2. **Admin** approves PSA/photo, requests proof for award.
3. **Student** uploads certificate, admin approves, Maria appears in the ceremony PDF.

---

## 🗺️ Next Steps

- Finalize Tailwind theme and component library.
- Choose and integrate PDF generation library.
- Implement file cleanup jobs for unverified submissions.

---

## 🤝 Contributing

1. Fork the repo and create your branch.
2. Commit your changes and open a pull request.
3. For major changes, open an issue first to discuss.

---

## 📄 License

MIT

---

**Ready for development!**  
For questions or suggestions, open an issue or contact the maintainers. 