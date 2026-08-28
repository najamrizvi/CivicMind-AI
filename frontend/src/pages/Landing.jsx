import { useNavigate } from "react-router-dom";

import "../App.css";

function Landing() {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="app">
      {/* Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <button
            className="brand"
            type="button"
            onClick={() => scrollToSection("home")}
          >
            <div className="brand-icon">C</div>

            <div className="brand-name">
              <strong>CivicMind</strong>
              <span>AI</span>
            </div>
          </button>

          <nav className="nav-links">
            <button
              type="button"
              onClick={() => scrollToSection("home")}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("solutions")}
            >
              Solutions
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
            >
              How It Works
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("about")}
            >
              About
            </button>
          </nav>

          <div className="nav-actions">
            <button
              className="login-button"
              type="button"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>

            <button
              className="register-button"
              type="button"
              onClick={() => navigate("/register")}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section id="home" className="hero">
          <div className="hero-background"></div>

          <div className="hero-content">
            <div className="hero-label">
              <span></span>
              AI-POWERED CIVIC INTELLIGENCE
            </div>

            <h1>
              Smarter cities.
              <br />
              <span>Stronger communities.</span>
            </h1>

            <p>
              CivicMind AI transforms civic complaints into intelligent,
              actionable insights — helping citizens report issues and
              administrators make better decisions.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-button"
                type="button"
                onClick={() => navigate("/register")}
              >
                Get Started
                <span>→</span>
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={() => scrollToSection("how-it-works")}
              >
                Explore CivicMind
                <span>↓</span>
              </button>
            </div>

            <div className="hero-trust">
              <div className="trust-line"></div>

              <div>
                <strong>Intelligence for better civic services</strong>

                <p>
                  AI-powered classification, prioritization and routing.
                </p>
              </div>
            </div>
          </div>

          {/* Crystal Visual */}
          <div className="hero-visual">
            <div className="sun-glow"></div>

            <div className="crystal-orbit crystal-orbit-one"></div>
            <div className="crystal-orbit crystal-orbit-two"></div>

            <div className="crystal">
              <div className="crystal-face crystal-face-left"></div>
              <div className="crystal-face crystal-face-right"></div>
              <div className="crystal-face crystal-face-top"></div>

              <div className="crystal-light"></div>

              <div className="crystal-logo">
                <strong>C</strong>
                <span>AI</span>
              </div>
            </div>

            <div className="floating-card floating-card-top">
              <span className="floating-icon">✦</span>

              <div>
                <strong>AI Analysis</strong>
                <small>Insight generated</small>
              </div>
            </div>

            <div className="floating-card floating-card-bottom">
              <span className="online-dot"></span>

              <div>
                <strong>Real-time intelligence</strong>
                <small>Civic data analyzed</small>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions */}
        <section id="solutions" className="section">
          <div className="section-heading">
            <span className="section-label">CIVIC INTELLIGENCE</span>

            <h2>
              From complaints
              <br />
              <span>to meaningful action.</span>
            </h2>

            <p>
              CivicMind AI connects citizens and administration through an
              intelligent complaint-management workflow.
            </p>
          </div>

          <div className="solution-grid">
            <article className="glass-card">
              <span className="card-number">01</span>

              <div className="solution-icon">⌁</div>

              <h3>Smart Classification</h3>

              <p>
                AI understands civic complaints and automatically identifies
                the relevant category.
              </p>
            </article>

            <article className="glass-card">
              <span className="card-number">02</span>

              <div className="solution-icon">◈</div>

              <h3>Priority Prediction</h3>

              <p>
                Important complaints are identified so urgent civic issues can
                receive attention first.
              </p>
            </article>

            <article className="glass-card">
              <span className="card-number">03</span>

              <div className="solution-icon">↗</div>

              <h3>Department Routing</h3>

              <p>
                Complaints are intelligently directed toward the department
                responsible for resolving them.
              </p>
            </article>

            <article className="glass-card">
              <span className="card-number">04</span>

              <div className="solution-icon">✧</div>

              <h3>AI Insights</h3>

              <p>
                Administrative analytics become practical recommendations for
                better civic decision-making.
              </p>
            </article>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="section workflow-section">
          <div className="section-heading">
            <span className="section-label">HOW IT WORKS</span>

            <h2>
              One report.
              <br />
              <span>Intelligent action.</span>
            </h2>

            <p>
              A simple citizen experience powered by intelligent
              administrative automation.
            </p>
          </div>

          <div className="workflow">
            <div className="workflow-card">
              <span className="workflow-number">01</span>

              <div className="workflow-icon">+</div>

              <h3>Citizen reports</h3>

              <p>
                A citizen submits a complaint describing a civic issue.
              </p>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-card">
              <span className="workflow-number">02</span>

              <div className="workflow-icon">✦</div>

              <h3>AI understands</h3>

              <p>
                CivicMind AI classifies the complaint, predicts priority and
                identifies the relevant department.
              </p>
            </div>

            <div className="workflow-line"></div>

            <div className="workflow-card">
              <span className="workflow-number">03</span>

              <div className="workflow-icon">↗</div>

              <h3>Administration acts</h3>

              <p>
                Departments receive structured information and administrators
                gain actionable intelligence.
              </p>
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="about-section">
          <div className="about-glow"></div>

          <div className="about-card">
            <div className="about-content">
              <span className="section-label">CIVICMIND AI</span>

              <h2>
                Technology
                <br />
                <span>with purpose.</span>
              </h2>

              <p>
                Better civic services begin with better information. CivicMind
                AI brings intelligence into the complaint-management process
                so communities can move forward together.
              </p>

              <button
                className="primary-button"
                type="button"
                onClick={() => navigate("/register")}
              >
                Create Your Account
                <span>→</span>
              </button>
            </div>

            <div className="about-crystal">
              <div className="mini-crystal">
                <span>C</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-brand">
          <div className="footer-icon">C</div>

          <div>
            <strong>CivicMind AI</strong>
            <span>Intelligent civic services</span>
          </div>
        </div>

        <p>
          © 2026 CivicMind AI. Built for better communities.
        </p>

        <div className="footer-status">
          <span></span>
          Systems ready
        </div>
      </footer>
    </div>
  );
}

export default Landing;