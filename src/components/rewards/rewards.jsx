import React, { useState, useEffect } from "react";
import { ref, get, onValue, update, set } from "firebase/database";
import { db, auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

import "../global.css";
import "./rewards.css";

export default function Rewards() {
  const [XP, setXP] = useState(0);
  const [TaskCount, setTaskCount] = useState(0);
  const [badges, setBadges] = useState([]);
  const [theme, setTheme] = useState("default");

  // Fetch badges once
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const badgeRef = ref(db, `users/${user.uid}/badges`);
      const snapshot = await get(badgeRef);

      if (snapshot.exists()) {
        setBadges(snapshot.val());
      } else {
        setBadges([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch XP in real time
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const xpRef = ref(db, `users/${user.uid}/xp`);
      const unsubscribeXP = onValue(xpRef, (snapshot) => {
        setXP(snapshot.exists() ? snapshot.val() : 0);
      });

      return () => unsubscribeXP();
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch TaskCount in real time
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const taskRef = ref(db, `users/${user.uid}/task_count`);
      const unsubscribeTasks = onValue(taskRef, (snapshot) => {
        setTaskCount(snapshot.exists() ? snapshot.val() : 0);
      });

      return () => unsubscribeTasks();
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch theme in real time
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const themeRef = ref(db, `users/${user.uid}/theme`);
      const unsubscribeTheme = onValue(themeRef, (snapshot) => {
        setTheme(snapshot.exists() ? snapshot.val() : "default");
      });

      return () => unsubscribeTheme();
    });

    return () => unsubscribeAuth();
  }, []);

  // Unlock XP badges
  useEffect(() => {
    if (!Array.isArray(badges) || badges.length < 2) return;

    const xpBadges = badges[1];
    if (!Array.isArray(xpBadges)) return;

    const thresholds = [100, 500, 1000, 5000, 10000, 25000, 50000];

    let updated = false;
    const newBadges = badges.map((group, gIndex) =>
      group.map((badge, bIndex) => {
        if (gIndex === 1 && XP >= thresholds[bIndex] && !badge.unlocked) {
          updated = true;
          return { ...badge, unlocked: true };
        }
        return badge;
      })
    );

    if (updated) {
      setBadges(newBadges);
      const user = auth.currentUser;
      if (user) {
        set(ref(db, `users/${user.uid}/badges`), newBadges);
      }
    }
  }, [XP, badges]);

  useEffect(() => {
    if (!Array.isArray(badges) || badges.length < 1) return;

    const taskBadges = badges[0];
    if (!Array.isArray(taskBadges)) return;

    const thresholds = [5, 50, 100, 200];

    let updated = false;
    const newBadges = badges.map((group, gIndex) =>
      group.map((badge, bIndex) => {
        if (
          gIndex === 0 &&
          TaskCount >= thresholds[bIndex] &&
          !badge.unlocked
        ) {
          updated = true;
          alert(
            `🎉 You unlocked "${badge.name}" and earned ${badge.reward} XP!`
          );
          // Add XP reward when unlocking
          const user = auth.currentUser;
          if (user) {
            update(ref(db, `users/${user.uid}`), {
              xp: XP + parseInt(badge.reward, 10),
            });
          }
          return { ...badge, unlocked: true };
        }
        return badge;
      })
    );

    if (updated) {
      setBadges(newBadges);
      const user = auth.currentUser;
      if (user) {
        set(ref(db, `users/${user.uid}/badges`), newBadges);
      }
    }
  }, [TaskCount, badges, XP]);

  return (
    <div className={`nata rewards theme_${theme}`}>
      <header>
        <h1 className="heading">StudyBitz</h1>
        <section className="stats">
          <p>XP: {XP}</p>
          <p>Tasks Completed: {TaskCount}</p>
        </section>
        <button
          className="go_to_rewards"
          onClick={() => (document.location = "/main")}
        >
          BACK
        </button>
      </header>

      <main className="group">
        <p className="rewards_heading">* REWARDS *</p>

        <section className="rewards_main">
          <section className="badges">
            <p className="badges_heading">BADGES</p>
            <article className="badges_main">
              {Array.isArray(badges) &&
                badges.map(
                  (group, gIndex) =>
                    Array.isArray(group) &&
                    group.map((badge, bIndex) => (
                      <li
                        key={`${gIndex}-${bIndex}`}
                        className="badge_item"
                        style={{
                          backgroundColor:
                            gIndex === 0
                              ? "oklch(79.96% 0.1148 19.91)" // Task badges
                              : gIndex === 1
                              ? "oklch(90.62% 0.1613 133.5)" // XP badges
                              : "oklch(84.23% 0.0705 232.53)",
                        }}
                      >
                        <div className="badge_name">
                          <p>{badge.name}</p>
                        </div>
                        <div className="badge_description">
                          <p>{badge.description}</p>
                        </div>
                        <div className="badge_reward">
                          <p>
                            Reward:{" "}
                            <span style={{ fontWeight: 800 }}>
                              {badge.reward}
                            </span>{" "}
                            XP
                          </p>
                        </div>
                        <div className="badge_done">
                          {badge.unlocked ? "Unlocked ✅" : "Locked 🔒"}
                        </div>
                      </li>
                    ))
                )}
            </article>
          </section>
        </section>
      </main>
    </div>
  );
}
