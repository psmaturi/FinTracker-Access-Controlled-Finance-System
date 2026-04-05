import "../user/UserPages.css";

function ReportsAnalytics() {
  const handleDownloadReport = (type) => {
    alert(`Downloading ${type} report (frontend-only action - requires backend integration)`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Comprehensive financial reports and analytics</p>
      </div>

      <div className="content-section">
        <div className="section-card">
          <h2>Monthly Reports</h2>
          <p className="empty-state">
            Monthly reports are not available at this time.
            <br />
            <small>Report generation requires backend integration to aggregate data across all users and time periods.</small>
          </p>
        </div>

        <div className="section-card">
          <h2>Analytics Charts</h2>
          <p className="empty-state">
            Analytics charts will appear here once sufficient data is available.
            <br />
            <small>Charts require aggregated data from the backend to display trends, distributions, and comparisons.</small>
          </p>
        </div>

        <div className="section-card">
          <h2>Export Reports</h2>
          <div className="export-options">
            <button 
              className="btn-primary" 
              onClick={() => handleDownloadReport("Full Report (PDF)")}
              title="Requires backend integration"
            >
              📥 Download Full Report (PDF)
            </button>
            <button 
              className="btn-primary" 
              onClick={() => handleDownloadReport("Analytics Data (CSV)")}
              title="Requires backend integration"
            >
              📊 Export Analytics Data (CSV)
            </button>
            <button 
              className="btn-primary" 
              onClick={() => handleDownloadReport("Custom Report")}
              title="Requires backend integration"
            >
              📈 Generate Custom Report
            </button>
          </div>
          <p style={{ marginTop: "16px", fontSize: "14px", color: "var(--text-secondary)" }}>
            <small>Note: Export functionality requires backend API integration to generate and download reports.</small>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReportsAnalytics;
