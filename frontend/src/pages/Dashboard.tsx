

function Dashboard() {


  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");


  return (
    <div className="dashboard">


      <main>

        <h2>Welcome 👋</h2>

        <div className="user-info">

          <p>
            <strong>Email:</strong> {email}
          </p>

          <p>
            <strong>Role:</strong> {role}
          </p>

        </div>

        <div className="modules">

          <div className="module-card">
            <h3>Prospects</h3>
            <p>Manage prospects</p>
          </div>

          <div className="module-card">
            <h3>Interactions</h3>
            <p>Manage interactions</p>
          </div>

          <div className="module-card">
            <h3>Account Requests</h3>
            <p>Manage account requests</p>
          </div>

          <div className="module-card">
            <h3>Clients</h3>
            <p>Manage clients</p>
          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;