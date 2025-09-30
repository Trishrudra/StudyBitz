import React, { useState, useEffect } from "react";
import "../global.css";
import "./settings.css";
import { signOut, deleteUser, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import { ref, remove, onValue } from "firebase/database";

function Settings() {
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTheme("default");
        return;
      }

      const themeRef = ref(db, `users/${user.uid}/theme`);
      const unsubscribeTheme = onValue(themeRef, (snapshot) => {
        if (snapshot.exists()) {
          setTheme(snapshot.val());
        } else {
          setTheme("default");
        }
      });

      return () => unsubscribeTheme();
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.location = "/";
    } catch (error) {
      alert(`Log out error! ${error.message}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure? This will permanently delete your account."
      )
    ) {
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await remove(ref(db, "users/" + user.uid)); // delete RTDB data
        await deleteUser(user); // delete Auth account
        alert("Account deleted and user data removed!");
        document.location = "/";
      }
    } catch (error) {
      alert(`Delete account error! ${error.message}`);
    }
  };

  return (
    <div className={`settings theme_${theme}`}>
      <header>
        <h1 className="heading">StudyBitz</h1>
        <button
          className="go_to_rewards"
          onClick={() => (document.location = "/rewards")}
        >
          Rewards
        </button>
        <button
          className="go_to_home"
          onClick={() => (document.location = "/main")}
        >
          Home
        </button>
      </header>
      <main>
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
        <button className="deleteaccount" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </main>
    </div>
  );
}

export default Settings;
