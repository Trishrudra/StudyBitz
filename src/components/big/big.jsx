import React, { useRef, useEffect } from "react";
import "./big.css";

function Big() {
  return (
    <div className="big" style={{ fontFamily: '"Pixelify Sans", sans-serif' }}>
      <Starfield numStars={600} />
      <div className="mainbig">
        <section className="littlebig">
          <p className="bigs">S</p>
          <p className="little">study bitz</p>
          <p className="littletext">
            Begin your journey to productivity today.
          </p>
          <secion className="auth">
            <button
              className="login"
              onClick={() => (document.location = "/login")}
            >
              Login
            </button>
            <button
              className="register"
              onClick={() => (document.location = "/signup")}
            >
              Register
            </button>
          </secion>
        </section>
      </div>
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

export default Big;
