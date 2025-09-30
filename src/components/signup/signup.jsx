import React, { useState, useRef, useEffect } from "react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

import "../global.css";
import "./signup.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // optional: store separately

  const now = new Date();
  const date = now.toDateString();

  const handleSignUp = async (e) => {
    e.preventDefault(); // prevent page refresh
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Get the user object
      const user = userCredential.user;

      // 3. Store extra info in Realtime Database
      await set(ref(db, "users/" + user.uid), {
        email: user.email,
        username: username,
        xp: 0,
        last_logged_in: date,
        tasks: [
          { id: 1, name: "taska", done: false },
          { id: 2, name: "taskb", done: true },
        ],
        kanban: {
          not_started: ["taska", "taskb"],
          in_progress: ["taskc", "taskd"],
          done: ["taske", "taskf"],
        },
        badges: [
          // Task
          [
            {
              name: "Task Novice",
              description: "Complete 5 tasks on your todo list.",
              reward: "50",
              unlocked: false,
            },
            {
              name: "Task Apprentice",
              description: "Complete 50 tasks on your todo list.",
              reward: "250",
              unlocked: false,
            },
            {
              name: "Task Champion",
              description: "Complete 100 tasks on your todo list.",
              reward: "1000",
              unlocked: false,
            },
            {
              name: "Task Master",
              description: "Complete 200 tasks on your todo list.",
              reward: "2500",
              unlocked: false,
            },
          ],
          // XP
          [
            {
              name: "XP Novice",
              description: "Get 100 XP.",
              reward: "50",
              unlocked: false,
            },
            {
              name: "XP Apprentice",
              description: "Get 500 XP.",
              reward: "250",
              unlocked: false,
            },
            {
              name: "XP Champion",
              description: "Get 1000 XP.",
              reward: "1000",
              unlocked: false,
            },
            {
              name: "XP Master",
              description: "Get 5000 XP.",
              reward: "2500",
              unlocked: false,
            },
          ],
        ],
        theme: "green",
        task_count: 0,
      });

      alert("Account created and saved in database!");
      document.location = "/main";
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("Sorry, this email is already in use!");
      } else if (error.code === "auth/weak-password") {
        alert("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        alert("Email is invalid");
      } else {
        alert("Something went wrong: " + error.message);
      }
    }
  };

  return (
    <div className="nata signup">
      <Starfield numStars={600} />
      <section className="actual">
        <p className="sign_up_heading">SIGN UP</p>

        <form onSubmit={handleSignUp}>
          <article className="username">
            <p className="username_heading">Username:</p>
            <input
              type="text"
              className="username_input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </article>

          <article className="email">
            <p className="email_heading">Email:</p>
            <input
              type="email"
              className="email_input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@doe.com"
              required
            />
          </article>

          <article className="password">
            <p className="password_heading">Password:</p>
            <input
              type="password"
              className="password_input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </article>

          <article className="final_buttons">
            <button type="submit" className="signup_button">
              Sign Up
            </button>
            <br />
            <a href="/login" className="to_log_in">
              Already have an account?
            </a>
          </article>
        </form>
      </section>
    </div>
  );
}

const Starfield = ({ numStars = 400 }) => {
  const canvasRef = useRef(null);
  const stars = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // initialize stars
    stars.current = Array.from({ length: numStars }).map(() => ({
      x: (Math.random() - 0.5) * canvas.width,
      y: (Math.random() - 0.5) * canvas.height,
      z: Math.random() * canvas.width,
    }));

    const animate = () => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.current.forEach((star) => {
        star.z -= 2;
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas.width;
          star.y = (Math.random() - 0.5) * canvas.height;
          star.z = canvas.width;
        }

        const k = 128 / star.z;
        const px = star.x * k + canvas.width / 2;
        const py = star.y * k + canvas.height / 2;

        if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
          const size = (1 - star.z / canvas.width) * 3;
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [numStars]);

  return (
    <div className="starfield">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default Signup;
