import { useEffect, useState } from "react";
import api from "../../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/admin/users").then((res) => {
      setUsers(res.data);
    });
  }, []);

  return (
    <div>
      <h2>Users (MANAGER)</h2>

      {users.map((u: any) => (
        <div key={u.id}>
          {u.email} - {u.role}
        </div>
      ))}
    </div>
  );
}