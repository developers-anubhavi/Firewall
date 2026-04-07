import '../ET-Finalgate/user_details.css';

import {
  useEffect,
  useState,
} from 'react';

import deleteIcon from '../assets/delete.png';

interface UserDetailsProps {
  onClose: () => void;
}

interface UserRow {
  id: number;
  username: string;
  userid: string;
  usertype: string;
}

export default function UserDetails({ onClose }: UserDetailsProps) {
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [usertype, setUsertype] = useState("USER");
  const [password, setPassword] = useState("");

  const [users, setUsers] = useState<UserRow[]>([]);
  const [toast, setToast] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "error") => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(""), 2500);
  };

  const refreshUsers = () => {
    fetch("http://192.168.0.20:4001/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const addUser = () => {
    if (users.some((u) => u.username === username)) {
      showToast("Username already exists", "error");
      return;
    }
    if (users.some((u) => u.userid === userid)) {
      showToast("User ID already exists", "error");
      return;
    }

    const payload = { username, userid, usertype, password };

    fetch("http://192.168.0.20:4001/api/users/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          showToast(data.message, "error");
          return;
        }

        refreshUsers();
        setUsername("");
        setUserid("");
        setPassword("");
        setUsertype("USER");

        showToast("User created successfully", "success");
      });
  };

  const deleteUser = (id: number) => {
    fetch(`http://192.168.0.20:4001/api/users/delete/${id}`, {
      method: "DELETE",
    }).then(() => {
      refreshUsers();
      showToast("User deleted", "success");
    });
  };

  return (
    <div className="overlay-bg">
      <div className="overlay-card">

        <div className="overlay-header">
          <h2>USER DETAILS</h2>

          <button className="overlay-close" onClick={onClose}>
            X
          </button>
        </div>

        <div className="overlay-body">

          <div className="left-form">
            <h3>Create New User</h3>

            <select value={usertype} onChange={(e) => setUsertype(e.target.value)}>
              <option value="SUPER ADMIN">SUPER ADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>

            <input type="text" placeholder="Username"
              value={username} onChange={(e) => setUsername(e.target.value)} />

            <input type="text" placeholder="User ID"
              value={userid} onChange={(e) => setUserid(e.target.value)} />

            
            <input type="password" placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)} />

            <button className="create-btn" onClick={addUser}>
              Create User
            </button>
          </div>

          <div className="right-table">
            <h3>Existing Users</h3>

            <table>
              <thead>
                <tr>
                  <th>Sl. No</th>
                  <th>Username</th>
                  <th>User ID</th>
                  <th>User Type</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u, index) => (
                  <tr key={u.id}>
                    <td>{index + 1}</td>
                    <td>{u.username}</td>
                    <td>{u.userid}</td>
                    <td>{u.usertype}</td>
                    <td>
                      <img
                        src={deleteIcon}
                        alt="delete"
                        className="delete-icon"
                        onClick={() => deleteUser(u.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>
      </div>

      {toast && (
        <div className={`toast ${toastType === "success" ? "toast-success" : "toast-error"}`}>
          {toast}
        </div>
      )}

    </div>
  );
}
