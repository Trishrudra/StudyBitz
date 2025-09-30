import React, { useState, useEffect, useRef } from "react";
import { auth } from "../../firebase"; // <-- make sure path is correct
import { signInWithEmailAndPassword } from "firebase/auth";

import "../global.css";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      document.location = "/main";
      // ✅ Optional: redirect to dashboard with React Router
      // navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Try again.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="nata  login">
      <Starfield numStars={600} />
      <section className="actual">
        <p className="sign_up_heading">LOGIN</p>

        <form onSubmit={handleLogin}>
          <article className="email">
            <p className="email_heading">Email:</p>
            <input
              type="email"
              className="email_input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <button type="submit" className="login_button">
              Login
            </button>
            <br />
            <a href="/signup" className="to_sign_up">
              Don&apos;t have an account?
            </a>
          </article>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
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

export default Login;
