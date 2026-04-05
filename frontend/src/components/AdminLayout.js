import AdminSidebar from "./AdminSidebar";
import Header from "./Header";
import "./DashboardLayout.css";

function AdminLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-main">
        <Header />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

