export default function DirectTabs() {
  return (
    <html>
      <head>
        <title>Direct Tabs Test</title>
        <style>{`
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
            background: #f5f5f5;
          }
          .header { 
            background: white; 
            padding: 20px; 
            margin-bottom: 20px; 
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .tabs-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .tabs {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
          }
          .tab {
            padding: 12px 8px;
            text-align: center;
            border-right: 1px solid #e9ecef;
            cursor: pointer;
            background: #f8f9fa;
            font-weight: 500;
            font-size: 14px;
          }
          .tab:last-child {
            border-right: none;
          }
          .tab.active {
            background: #007bff;
            color: white;
          }
          .tab:hover {
            background: #e9ecef;
          }
          .tab.active:hover {
            background: #0056b3;
          }
          .content {
            padding: 20px;
          }
          .title {
            color: #333;
            margin: 0 0 10px 0;
          }
          .company {
            color: #666;
            margin: 0;
          }
        `}</style>
      </head>
      <body>
        <div className="header">
          <h1 className="title">Rob & Son Scaffolding Services Ltd</h1>
          <p className="company">Scaffolding Contractor • Test Account</p>
        </div>
        
        <div className="tabs-container">
          <div className="tabs">
            <div className="tab active">Dashboard</div>
            <div className="tab">Generate</div>
            <div className="tab">Recommended</div>
            <div className="tab">Upload</div>
            <div className="tab">Library</div>
            <div className="tab">Users</div>
            <div className="tab">Billing</div>
            <div className="tab">Settings</div>
          </div>
          
          <div className="content">
            <h2>Dashboard Content</h2>
            <p>This is a direct HTML implementation of the 8 tabs that should appear in the customer dashboard.</p>
            <p>If you can see all 8 tabs above (Dashboard, Generate, Recommended, Upload, Library, Users, Billing, Settings), then the layout works and the issue is with React components.</p>
          </div>
        </div>
      </body>
    </html>
  );
}