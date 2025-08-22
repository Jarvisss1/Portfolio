"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Github, Linkedin, Mail, ExternalLink, MapPin, Calendar, Code, Brain, Database, Smartphone } from "lucide-react"

const CATEGORY_MAP: Record<string, string> = {
  // Web
  "JavaScript": "web",
  "TypeScript": "web",
  "HTML": "web",
  "CSS": "web",
  "SCSS": "web",
  // Databases
  "SQL": "db",
  "PLpgSQL": "db",
  // Backend/DB
  "Python": "db",
  "Java": "db",
  "Go": "db",
  "Ruby": "db",
  "PHP": "web",
  "C#": "db",
  // AI/ML & Cloud
  "Jupyter Notebook": "ai",
  "Jupyter": "ai",
  "C++": "ai",
  "C": "ai",
  "Shell": "ai",
  "Dockerfile": "ai",
  "Makefile": "ai",
  "TeX": "ai",
  "R": "ai",
};

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("hero")

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const [languageStats, setLanguageStats] = useState<Record<string, number>>(
    {}
  );
  const [loadingLangs, setLoadingLangs] = useState(true);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    fetchLanguages().then((stats) => {
      setLanguageStats(stats);
      setLoadingLangs(false);
    });
  }, []);

   useEffect(() => {
     const handleScroll = () => {
       const sections = [
         "hero",
         "about",
         "experience",
         "projects",
         "skills",
         "contact",
       ];
       const scrollPosition = window.scrollY + 100;

       for (const section of sections) {
         const element = document.getElementById(section);
         if (element) {
           const { offsetTop, offsetHeight } = element;
           if (
             scrollPosition >= offsetTop &&
             scrollPosition < offsetTop + offsetHeight
           ) {
             setActiveSection(section);
             break;
           }
         }
       }
     };

     window.addEventListener("scroll", handleScroll);
     return () => window.removeEventListener("scroll", handleScroll);
   }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");
    // Example: Use Formspree endpoint
    const res = await fetch("https://formspree.io/f/mkgzdvaa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setStatus("Message sent!");
      setForm({ name: "", email: "", message: "" });
    } else {
      setStatus("Failed to send. Try again.");
    }
  };

 function getCategoryPercent(category: string) {
   const total = Object.values(languageStats).reduce((a, b) => a + b, 0);
   if (total === 0) return 0;
   const categoryTotal = Object.entries(languageStats)
     .filter(([lang]) => CATEGORY_MAP[lang] === category)
     .reduce((sum, [, bytes]) => sum + bytes, 0);
   return Math.round((categoryTotal / total) * 100);
 }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN; // Store securely in .env for production

  async function fetchLanguages() {
    // Try cache first
    const cached = localStorage.getItem("languageStats");
    if (cached) {
      return JSON.parse(cached);
    }

    const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
    const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

    // Fetch only first 10 repos (adjust per your needs)
    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=10`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );
    const repos = await reposRes.json();
    const languageTotals: Record<string, number> = {};

    // Only fetch languages for top 10 repos
    for (const repo of repos) {
      if (repo.fork) continue;
      const langRes = await fetch(repo.languages_url, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      });
      const langs = await langRes.json();
      for (const [lang, bytes] of Object.entries(langs)) {
        languageTotals[lang] = (languageTotals[lang] || 0) + (bytes as number);
      }
    }

    // Cache for 1 hour
    localStorage.setItem("languageStats", JSON.stringify(languageTotals));
    setTimeout(() => localStorage.removeItem("languageStats"), 3600 * 1000);

    return languageTotals;
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="font-serif font-bold text-xl text-primary">
                YS
              </div>
              <button
                onClick={toggleDarkMode}
                className="ml-4 px-3 py-1 rounded transition-colors border border-border bg-background hover:bg-muted text-muted-foreground"
                aria-label="Toggle dark mode"
              >
                {darkMode ? "🌙" : "☀️"}
              </button>
            </div>
            <div className="hidden md:flex space-x-8">
              {["About", "Experience", "Projects", "Skills", "Contact"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      activeSection === item.toLowerCase()
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="pt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6">
              Yatharth <span className="text-primary">Shivhare</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Computer Science Student at IIT Vadodara • AI/ML Enthusiast •
              Full-Stack Developer
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                onClick={() => scrollToSection("projects")}
                className="bg-primary hover:bg-primary/90 cursor-pointer"
              >
                View My Work
              </Button>
              <a
                href="/resume.pdf"
                download
                className="flex-1 sm:flex-none w-full sm:w-auto"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="
                  sm:w-auto cursor-pointer"
                >
                  Download Resume
                </Button>
              </a>
              <Button
                // variant="outline"
                size="lg"
                onClick={() => scrollToSection("contact")}
                className="bg-primary hover:bg-primary/90 cursor-pointer"
              >
                Get In Touch
              </Button>
            </div>
            <div className="flex justify-center space-x-6">
              <a
                href="https://github.com/Jarvisss1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github size={24} />
              </a>
              <a
                href="https://www.linkedin.com/in/yatharth-shivhare-3ba239250/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin size={24} />
              </a>
              <a
                href="mailto:yshivhare413@gmail.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={24} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              About Me
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Passionate about creating innovative solutions through code and
              artificial intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 mb-8">
                <h3 className="font-serif text-2xl font-semibold mb-4">
                  Education
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">
                      Indian Institute of Information Technology, Vadodara
                    </h4>
                    <p className="text-muted-foreground">
                      B.Tech in Computer Science & Engineering
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar size={16} />
                      <span>Dec 2022 - May 2026</span>
                      <MapPin size={16} className="ml-2" />
                      <span>Gandhinagar, Gujarat</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-2xl font-semibold">
                  Achievements
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • Solved 500+ DSA problems with 1687 rating on LeetCode
                  </li>
                  <li>• Top 13.91% ranking in competitive programming</li>
                  <li>• Content Strategist at Finance and Consulting Club</li>
                  <li>• NVIDIA DLI Certificate in Computer Vision</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="text-primary" size={24} />
                    AI/ML Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Specialized in computer vision and machine learning with
                    hands-on experience in TensorFlow.js, building intelligent
                    applications that solve real-world problems.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="text-primary" size={24} />
                    Full-Stack Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Proficient in modern web technologies including React,
                    Node.js, and cloud platforms, with experience building
                    scalable applications from frontend to backend.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Experience
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional journey and internships
            </p>
          </div>

          <div className="space-y-8">
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Software Developer Intern
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-primary">
                      Bridgeness Technologies Pvt. Ltd.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    May 2025 - July 2025
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • Spearheaded the team to build onboarded examples and
                    creator onboarding for influencer marketing
                  </li>
                  <li>
                    • Engineered 8+ reusable React components optimized UX with
                    query param-based filters and automatic URL boosting
                    navigation for 30% performance boost
                  </li>
                  <li>
                    • Integrated predictive ML module for real-time pricing,
                    accelerating decisions and reducing manual inputs
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Frontend Developer Intern
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-accent">
                      Code Inbound LLP
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    Dec 2024 - Apr 2025
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • Enhanced Network Monitoring System (NMS) UI for real-time
                    device tracking using React and TypeScript
                  </li>
                  <li>
                    • Engineered 10+ reusable components for visualizing metrics
                    like latency and uptime; optimized API handling with Redux
                    Saga
                  </li>
                  <li>
                    • Collaborated with backend and UI teams to enforce a
                    modular frontend architecture, reducing integration-phase
                    bugs by 50%
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-chart-1">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Teaching Assistant
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-chart-1">
                      IIIT Vadodara
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    Aug 2024 - Dec 2024
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • Supervised lab sessions for 200+ students on Data
                    Structures like graphs, trees, and binary search
                  </li>
                  <li>
                    • Assisted in planning and evaluating sessions, quizzes, and
                    tutorials to support student learning outcomes
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Featured Projects
            </h2>
            <p className="text-lg text-muted-foreground">
              Innovative solutions built with cutting-edge technologies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Smartphone className="text-primary" size={32} />
                  <div className="flex gap-2">
                    <a
                      href="https://github.com/Jarvisss1/Dripline-frontend"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github size={20} />
                    </a>
                    {/* <ExternalLink size={20} className="text-muted-foreground" /> */}
                  </div>
                </div>
                <CardTitle className="text-xl">
                  Dripline - AI Fashion Advisor
                </CardTitle>
                <CardDescription>Personal Project • Mar 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Full-stack mobile application providing personalized outfit
                  recommendations using computer vision and ML.
                </p>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium">Key Features:</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>
                        • TensorFlow.js for automatic clothing classification
                      </li>
                      <li>• Rule-based recommendation engine</li>
                      <li>• AWS S3 integration for image storage</li>
                      <li>• Real-time outfit suggestions</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React Native</Badge>
                  <Badge variant="secondary">TensorFlow.js</Badge>
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">MongoDB</Badge>
                  <Badge variant="secondary">AWS S3</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Database className="text-accent" size={32} />
                  <a
                    href="https://github.com/Jarvisss1/Microsoft-Hackathon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github size={20} />
                  </a>
                </div>
                <CardTitle className="text-xl">
                  CrisisConnect - Disaster Reporter
                </CardTitle>
                <CardDescription>Team Project • Mar 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Disaster response platform with real-time reporting, mapping,
                  and role-based access control.
                </p>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium">Key Features:</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>
                        • Real-time disaster reporting with 60% faster response
                      </li>
                      <li>• Interactive maps with Azure Cognitive Services</li>
                      <li>• Role-based access for 3 user types</li>
                      <li>• Processed 800+ reports efficiently</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Azure</Badge>
                  <Badge variant="secondary">MERN Stack</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">AI Insights</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Code className="text-chart-1" size={32} />
                  <div className="flex gap-2">
                    <a
                      href="https://github.com/Jarvisss1/Shawty"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github size={20} />
                    </a>
                    <a
                      href="https://shawtyy.netlify.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>
                <CardTitle className="text-xl">
                  Shawtyy - URL Shortener
                </CardTitle>
                <CardDescription>Personal Project • Aug 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Full-stack URL shortener with analytics, QR generation, and
                  custom aliases.
                </p>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium">Key Features:</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Less than 100ms redirection with custom aliases</li>
                      <li>• Real-time analytics and QR generation</li>
                      <li>• Responsive dashboard design</li>
                      <li>• Dynamic charting with Recharts</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Tailwind CSS</Badge>
                  <Badge variant="secondary">Recharts</Badge>
                  <Badge variant="secondary">Shadcn</Badge>
                  <Badge variant="secondary">Netlify</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Brain className="text-chart-2" size={32} />
                  <div className="flex gap-2">
                    <a
                      href="https://github.com/Jarvisss1/ChatterBox"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Github size={20} />
                    </a>
                    <a
                      href="https://chatter-box-theta.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink size={20} className="" />
                    </a>
                  </div>
                </div>
                <CardTitle className="text-xl">ChatterBox Chat App</CardTitle>
                <CardDescription>Personal Project • Apr 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Real-time chat application with Firebase authentication and
                  global messaging.
                </p>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium">Key Features:</p>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Real-time messaging for 1000+ users</li>
                      <li>• Firebase authentication integration</li>
                      <li>• Optimized UI responsiveness with Zustand</li>
                      <li>• Emoji support and chat history</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React.js</Badge>
                  <Badge variant="secondary">Firebase</Badge>
                  <Badge variant="secondary">Express</Badge>
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Zustand</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Technical Skills
            </h2>
            <p className="text-lg text-muted-foreground">
              Technologies and tools I work with
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="text-primary" size={24} />
                  Programming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loadingLangs ? (
                    <span className="text-sm text-muted-foreground">
                      Loading...
                    </span>
                  ) : (
                    Object.entries(languageStats)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5) // top 5 languages
                      .map(([lang, bytes]) => {
                        const total = Object.values(languageStats).reduce(
                          (a, b) => a + b,
                          0
                        );
                        const percent = Math.round((bytes / total) * 100);
                        return (
                          <div key={lang}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{lang}</span>
                              <span className="text-sm text-muted-foreground">
                                {percent}%
                              </span>
                            </div>
                            <Progress value={percent} className="h-2" />
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="text-accent" size={24} />
                  Web Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">
                        React.js, Tailwind CSS, EJS
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {loadingLangs ? "..." : `${getCategoryPercent("web")}%`}
                      </span>
                    </div>
                    <Progress
                      value={getCategoryPercent("web")}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="text-chart-1" size={24} />
                  Databases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">
                        MongoDB, MySQL, Firebase, Supabase
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {loadingLangs ? "..." : `${getCategoryPercent("db")}%`}
                      </span>
                    </div>
                    <Progress
                      value={getCategoryPercent("db")}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-chart-2" size={24} />
                  AI/ML & Cloud
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">
                        Azure, Docker, HuggingFace
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {loadingLangs ? "..." : `${getCategoryPercent("ai")}%`}
                      </span>
                    </div>
                    <Progress
                      value={getCategoryPercent("ai")}
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-12" />

          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif text-xl font-semibold mb-4">
                Frameworks
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Next.js</Badge>
                <Badge variant="outline">FastAPI</Badge>
                <Badge variant="outline">LangChain</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold mb-4">
                Libraries/APIs
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">React</Badge>
                <Badge variant="outline">Zustand</Badge>
                <Badge variant="outline">Redux</Badge>
                <Badge variant="outline">HuggingFace</Badge>
              </div>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold mb-4">
                Areas of Interest
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">MERN Stack</Badge>
                <Badge variant="outline">Image Processing</Badge>
                <Badge variant="outline">LLMs</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-muted-foreground">
              Let&apos;s discuss opportunities and collaborate on exciting
              projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-serif text-2xl font-semibold mb-6">
                Let&apos;s Connect
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Mail className="text-primary" size={24} />
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href="mailto:yshivhare413@gmail.com"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      yshivhare413@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Linkedin className="text-primary" size={24} />
                  <div>
                    <p className="font-medium">LinkedIn</p>
                    <a
                      href="https://www.linkedin.com/in/yatharth-shivhare-3ba239250/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      linkedin.com/in/yatharth-shivhare-3ba239250
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Github className="text-primary" size={24} />
                  <div>
                    <p className="font-medium">GitHub</p>
                    <a
                      href="https://github.com/Jarvisss1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      github.com/Jarvisss1
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="text-primary" size={24} />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">
                      Gandhinagar, Gujarat, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>
                  I&apos;m always open to discussing new opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium mb-2"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Your message..."
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={status === "Sending..."}
                  >
                    {status === "Sending..." ? "Sending..." : "Send Message"}
                  </Button>
                  {status && <p className="text-sm mt-2">{status}</p>}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              © 2025 Yatharth Shivhare. Built with Next.js and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
