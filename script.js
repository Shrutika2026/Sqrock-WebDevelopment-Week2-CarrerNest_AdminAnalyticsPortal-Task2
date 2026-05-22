// --- STATE MANAGEMENT ---
let isLoginMode = true;
let selectedRole = '';
let otpSent = false;
let generatedOTP = '';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
let applications = JSON.parse(localStorage.getItem('applications')) || [];

// Active view index tracking for dynamic list navigation
let selectedJobIndex = 0;
let selectedJob = null;
let currentResumePreviewUrl = null;
let editingJobId = null;
let editingApplicationId = null;

function normalizeText(text) {
    return String(text || '').trim().toLowerCase();
}

function getStatusBadgeClass(status) {
    if(status === 'Accepted') return 'status-badge-accepted';
    if(status === 'Rejected') return 'status-badge-rejected';
    return 'status-badge-applied';
}

function showApplicantsForJob(jobTitle) {
    const apps = applications.filter(a => a.jobTitle === jobTitle);
    const detailEl = document.getElementById('emp-application-detail-modal');
    const modal = document.getElementById('emp-details-modal');
    if(!apps || apps.length === 0) {
        detailEl.innerHTML = `
            <div style="position:relative;">
                <button class="modal-close-btn" type="button" onclick="closeEmployerApplicationModal()">✕</button>
                <div style="padding:18px;"> <p style="color:var(--grey);">No applications found for this job.</p> </div>
            </div>`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        return;
    }
    detailEl.innerHTML = `
        <div style="position:relative; padding:8px 18px 18px 18px;">
            <button class="modal-close-btn" type="button" onclick="closeEmployerApplicationModal()">✕</button>
            <div style="display:grid; gap:10px;">
                ${apps.map(app => `
                    <div style="background:white; border-radius:10px; padding:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:800; color:var(--dark);">${app.candidateName || app.candidateEmail}</div>
                            <div style="color:var(--grey); font-size:0.9rem;">${app.jobTitle} • ${app.dateApplied}</div>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <button class="btn-secondary" type="button" onclick="showEmployerApplicationDetail('${app.id || app.candidateEmail}')">View Profile</button>
                            <button class="btn-secondary" type="button" onclick="previewApplicationResume('${app.id || app.candidateEmail}')">View Resume</button>
                            <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${app.id || app.candidateEmail}','Accepted')">Accept</button>
                            <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${app.id || app.candidateEmail}','Rejected')">Reject</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// EXACTLY 50 UNIQUE IT/SOFTWARE OPENINGS
const staticJobsDatabase = [
    { title: "Senior React Developer", company: "DevNexus Solutions", type: "Full-Time", cat: "Web Development", salary: "$110k - $140k", loc: "Remote", date: "10/05/2026", logo: "D", desc: "Build enterprise React core systems.", req: ["React Hooks architecture", "State management setups", "REST API integration profiles"], vacancies: 3, lang: "English, JavaScript, TypeScript", exp: "5+ Years", mode: "Online", address: "Tech Park Phase II, Sector 62, Noida, India" },
    { title: "Full Stack Engineer (Node/Vue)", company: "AlphaStream", type: "Full-Time", cat: "Web Development", salary: "$95k - $125k", loc: "New York, NY", date: "11/05/2026", logo: "A", desc: "Develop next-gen full stack tools.", req: ["NodeJS framework layers", "VueJS setup patterns", "NoSQL database architectures"], vacancies: 2, lang: "English, JavaScript", exp: "3+ Years", mode: "Hybrid", address: "555 Broadway, Manhattan, NY 10012, USA" },
    { title: "Frontend UI Developer", company: "PixelCraft Agency", type: "Part-Time", cat: "Web Development", salary: "$60k - $80k", loc: "Austin, TX", date: "12/05/2026", logo: "P", desc: "Convert elegant prototypes into clean responsive layouts.", req: ["Expert HTML/CSS modules", "Tailwind framework fluency", "Cross-browser engine tests"], vacancies: 5, lang: "English", exp: "1-2 Years", mode: "Online", address: "701 Brazos St, Austin, TX 78701, USA" },
    { title: "Backend Systems Lead", company: "CoreLink Global", type: "Full-Time", cat: "Web Development", salary: "$140k - $175k", loc: "San Francisco, CA", date: "14/05/2026", logo: "C", desc: "Architect heavy-traffic microservices infrastructure structures.", req: ["Python system optimizations", "Distributed cloud messaging tracks", "SQL optimization models"], vacancies: 1, lang: "English, Python, SQL", exp: "7+ Years", mode: "Hybrid", address: "100 Pine St, San Francisco, CA 94111, USA" },
    { title: "Senior Java Software Engineer", company: "Enterprise Systems Corp", type: "Full-Time", cat: "Software Engineering", salary: "$130k - $160k", loc: "Chicago, IL", date: "09/05/2026", logo: "E", desc: "Scale enterprise cloud-based application modules.", req: ["Java 17 / Spring Boot ecosystem", "Multi-threaded synchronization models", "Kubernetes engine clusters"], vacancies: 4, lang: "English, Java", exp: "6+ Years", mode: "Hybrid", address: "222 W Adams St, Chicago, IL 60606, USA" },
    { title: "C++ Desktop Application Engineer", company: "Vector Graphics LLC", type: "Full-Time", cat: "Software Engineering", salary: "$120k - $150k", loc: "Remote", date: "08/05/2026", logo: "V", desc: "Build advanced low-latency graphic compilation architectures.", req: ["Modern C++ setups", "Memory optimization profiling layouts", "OpenGL/Vulkan matrix APIs"], vacancies: 2, lang: "English, C++", exp: "4+ Years", mode: "Online", address: "Digital Hub East, Level 4, Berlin, Germany" },
    { title: "Embedded Systems Developer", company: "Quantum Robotics", type: "Full-Time", cat: "Software Engineering", salary: "$115k - $145k", loc: "Boston, MA", date: "07/05/2026", logo: "Q", desc: "Program real-time microcontrollers for autonomous automation setups.", req: ["Embedded C programming control structures", "Hardware driver prototyping routines", "RTOS scheduling tracking"], vacancies: 3, lang: "English, C, Assembly", exp: "3+ Years", mode: "Hybrid", address: "Innovation Way, Building B, Boston, MA 02110, USA" },
    { title: "Senior Data Analyst", company: "Metric Insights", type: "Full-Time", cat: "Data Analytics", salary: "$90k - $115k", loc: "Seattle, WA", date: "13/05/2026", logo: "M", desc: "Interpret data matrices for strategic executive tracking analytics.", req: ["Advanced Tableau design patterns", "Complex nested SQL scripts", "Statistical data mapping rules"], vacancies: 6, lang: "English, SQL", exp: "4+ Years", mode: "Online", address: "500 Westlake Ave N, Seattle, WA 98109, USA" },
    { title: "Business Intelligence Analyst", company: "FinTech Solutions", type: "Full-Time", cat: "Data Analytics", salary: "₹12L - ₹18L", loc: "Mumbai, India", date: "14/05/2026", logo: "F", desc: "Construct operational KPI performance pipeline reports.", req: ["PowerBI suite data configurations", "Data warehousing models", "ETL validation structures"], vacancies: 4, lang: "English, Hindi", exp: "2-5 Years", mode: "Hybrid", address: "Bandra Kurla Complex, G Block, Mumbai, Maharashtra 400051, India" },
    { title: "Marketing Data Analyst", company: "GrowthHacks Corp", type: "Part-Time", cat: "Data Analytics", salary: "$50k - $70k", loc: "Remote", date: "12/05/2026", logo: "G", desc: "Audit web-traffic cross-channel conversion pipelines.", req: ["Google Analytics configurations", "Python data parsing libraries", "A/B setup analytics structures"], vacancies: 2, lang: "English, Python", exp: "2+ Years", mode: "Online", address: "Silicon Tower High Street, Toronto, Canada" },
    { title: "Data Scientist - NLP Specialist", company: "LingoAI Labs", type: "Full-Time", cat: "Data Science", salary: "$150k - $190k", loc: "Remote", date: "13/05/2026", logo: "L", desc: "Build structured text parsing data models.", req: ["Python NLP packages", "Transformer neural structures", "LLM tuning models"], vacancies: 2, lang: "English, Python", exp: "5+ Years", mode: "Online", address: "AI Research Strip, London, EC1A 1BB, UK" },
    { title: "Quantitative Data Scientist", company: "Apex Capital", type: "Full-Time", cat: "Data Science", salary: "$180k - $230k", loc: "New York, NY", date: "10/05/2026", logo: "A", desc: "Invent real-time predictive risk metrics algorithms.", req: ["Predictive math analytics arrays", "Time-series computing layouts", "Python compilation tools"], vacancies: 1, lang: "English, R, Python", exp: "6+ Years", mode: "Hybrid", address: "Wall Street Financial Tower, Suite 400, New York, NY 10005, USA" },
    { title: "Product Data Scientist", company: "SocialSphere Inc", type: "Full-Time", cat: "Data Science", salary: "$140k - $175k", loc: "Los Angeles, CA", date: "06/05/2026", logo: "S", desc: "Model user behavior patterns across active cloud targets.", req: ["Statistical experimental matrices", "PySpark large scale computation", "Big data storage checks"], vacancies: 3, lang: "English, SQL, Python", exp: "4+ Years", mode: "Hybrid", address: "Sunset Blvd, Creative Space 12, Los Angeles, CA 90028, USA" },
    { title: "Information Security Analyst", company: "Shield Network", type: "Full-Time", cat: "Cyber Security", salary: "$105k - $135k", loc: "Washington, DC", date: "12/05/2026", logo: "S", desc: "Monitor infrastructure data streams against breach threats.", req: ["SIEM configuration tool sets", "Incident triage validation tracks", "Security certification guidelines"], vacancies: 4, lang: "English", exp: "3+ Years", mode: "Hybrid", address: "Pennsylvania Ave NW, Washington, DC 20006, USA" },
    { title: "Penetration Tester", company: "RedTeam Defensive", type: "Full-Time", cat: "Cyber Security", salary: "$125k - $160k", loc: "Remote", date: "11/05/2026", logo: "R", desc: "Execute target digital audits via simulated attack strategies.", req: ["Metasploit framework setups", "Network penetration maps", "Script audit procedures"], vacancies: 2, lang: "English, Bash, Python", exp: "4+ Years", mode: "Online", address: "Cyber Defense Hub, Sector 4, Bucharest, Romania" },
    { title: "Cloud Security Architect", company: "SecureCloud Inc", type: "Full-Time", cat: "Cyber Security", salary: "$160k - $200k", loc: "Denver, CO", date: "05/05/2026", logo: "S", desc: "Secure distributed cloud deployments against intrusion vectors.", req: ["AWS IAM control validation steps", "Kubernetes system enforcement policies", "Zero Trust system paths"], vacancies: 1, lang: "English", exp: "8+ Years", mode: "Hybrid", address: "17th Street Skyline Court, Denver, CO 80202, USA" },
    { title: "AWS Cloud Infrastructure Engineer", company: "Skyward Systems", type: "Full-Time", cat: "Cloud Computing", salary: "$120k - $155k", loc: "Dallas, TX", date: "13/05/2026", logo: "S", desc: "Oversee high-availability application cloud operations.", req: ["Terraform tracking scripts", "AWS network configuration topologies", "Cost reduction maps"], vacancies: 3, lang: "English", exp: "3+ Years", mode: "Hybrid", address: "LBJ Freeway Gateway Tower, Dallas, TX 75240, USA" },
    { title: "Azure Cloud Architect", company: "Enterprise Grid", type: "Full-Time", cat: "Cloud Computing", salary: "$150k - $190k", loc: "Remote", date: "10/05/2026", logo: "E", desc: "Migrate traditional legacy system apps to secure hybrid platforms.", req: ["Azure Enterprise cloud topologies", "Active Directory federation setups", "CI/CD server integrations"], vacancies: 2, lang: "English", exp: "6+ Years", mode: "Online", address: "Cloud Network Complex, Amsterdam, Netherlands" },
    { title: "Senior DevOps Engineer", company: "Velocity Software", type: "Full-Time", cat: "DevOps", salary: "$140k - $180k", loc: "San Francisco, CA", date: "13/05/2026", logo: "V", desc: "Optimize deployment build processes across multi-cloud clusters.", req: ["Docker & Kubernetes tracking rules", "GitHub Actions pipeline structures", "Linux kernel shell scripting"], vacancies: 3, lang: "English, Go, Bash", exp: "5+ Years", mode: "Hybrid", address: "Market St, Tech Center Floor 9, San Francisco, CA 94103, USA" },
    { title: "Site Reliability Engineer (SRE)", company: "AlwaysOn Media", type: "Full-Time", cat: "DevOps", salary: "$150k - $195k", loc: "Remote", date: "12/05/2026", logo: "A", desc: "Sustain network uptime across global service infrastructure maps.", req: ["Prometheus metrics layouts", "Python infrastructure coding", "Chaos resilience models"], vacancies: 2, lang: "English, Python", exp: "4+ Years", mode: "Online", address: "Global Server Grid, Dublin, Ireland" },
    { title: "DevSecOps Specialist", company: "DefenseTech Systems", type: "Full-Time", cat: "DevOps", salary: "$135k - $170k", loc: "Atlanta, GA", date: "09/05/2026", logo: "D", desc: "Inject automated compliance scans right inside compilation runs.", req: ["SonarQube script analysis patterns", "Vulnerability mapping metrics", "Infrastructure as Code policies"], vacancies: 2, lang: "English", exp: "3+ Years", mode: "Hybrid", address: "Peachtree St NE, Corporate Square, Atlanta, GA 30309, USA" },
    { title: "Senior Product Designer", company: "ScaleAI", type: "Full-Time", cat: "UI/UX Design", salary: "$160k - $220k", loc: "San Francisco, CA", date: "13/05/2026", logo: "S", desc: "Lead the evolution of core enterprise application workflows.", req: ["Figma design token mapping systems", "Interactive prototyping user loops", "Complex data layouts"], vacancies: 2, lang: "English", exp: "5+ Years", mode: "Hybrid", address: "Mission St, Studio Block A, San Francisco, CA 94105, USA" },
    { title: "UX Researcher", company: "HumanCentric Labs", type: "Full-Time", cat: "UI/UX Design", salary: "$100k - $130k", loc: "Remote", date: "11/05/2026", logo: "H", desc: "Organize dynamic user testing matrices for item feedback metrics.", req: ["User testing strategy structures", "Quantitative survey logic blueprints", "Wireframe evaluation flows"], vacancies: 3, lang: "English", exp: "3+ Years", mode: "Online", address: "Behavior Analytics Block, Stockholm, Sweden" },
    { title: "UI Designer - Mobile Apps", company: "Creative Minds", type: "Part-Time", cat: "UI/UX Design", salary: "$70k - $90k", loc: "Miami, FL", date: "08/05/2026", logo: "C", desc: "Generate asset layouts for mobile interactive applications.", req: ["Mobile style platform rule sets", "Micro-interaction design structures", "Vector graphics design paths"], vacancies: 4, lang: "English", exp: "2+ Years", mode: "Hybrid", address: "Biscayne Blvd, Design District Suite 10, Miami, FL 33137, USA" },
    { title: "Senior iOS Developer (Swift)", company: "AppVantage Studio", type: "Full-Time", cat: "Mobile Development", salary: "$130k - $165k", loc: "Remote", date: "14/05/2026", logo: "A", desc: "Develop advanced user features within consumer iOS utilities.", req: ["SwiftUI design layout frameworks", "CoreData model storage control", "App Store build pipeline processes"], vacancies: 2, lang: "English, Swift", exp: "5+ Years", mode: "Online", address: "Mobile Application Grid, Tokyo, Japan" },
    { title: "Android Engineer (Kotlin)", company: "Mobility Global", type: "Full-Time", cat: "Mobile Development", salary: "$125k - $160k", loc: "Chicago, IL", date: "12/05/2026", logo: "M", desc: "Maintain clean application architectures within native environments.", req: ["Jetpack Compose components", "Kotlin Coroutines async patterns", "Dagger Hilt dependency flows"], vacancies: 3, lang: "English, Kotlin", exp: "4+ Years", mode: "Hybrid", address: "Michigan Ave, Engineering Floor 14, Chicago, IL 60611, USA" },
    { title: "Flutter Cross-Platform Developer", company: "SyncLabs", type: "Full-Time", cat: "Mobile Development", salary: "$100k - $135k", loc: "Remote", date: "10/05/2026", logo: "S", desc: "Unify dual-platform setups with clean, reusable codebase matrices.", req: ["Dart functional programming rules", "State management tracking layouts", "Native mobile bridge controls"], vacancies: 5, lang: "English, Dart", exp: "2+ Years", mode: "Online", address: "CrossPlatform Technology Park, Singapore" },
    { title: "QA Automation Engineer", company: "TestDriven Tech", type: "Full-Time", cat: "QA & Testing", salary: "$95k - $120k", loc: "Phoenix, AZ", date: "13/05/2026", logo: "T", desc: "Program automated testing scripts for tracking software interface states.", req: ["Selenium / Playwright validation scripts", "JavaScript scripting parameters", "CI test configuration pipeline items"], vacancies: 4, lang: "English, JavaScript", exp: "3+ Years", mode: "Hybrid", address: "Camelback Rd Core Center, Phoenix, AZ 85016, USA" },
    { title: "Manual QA Analyst", company: "FirstRelease Corp", type: "Full-Time", cat: "QA & Testing", salary: "$70k - $90k", loc: "Salt Lake City, UT", date: "11/05/2026", logo: "F", desc: "Draft verification plan logs matching complex real-world use tracks.", req: ["Detailed test case layout charts", "Bug lifecycle logging paths", "Regression sequence audits"], vacancies: 6, lang: "English", exp: "1-2 Years", mode: "Hybrid", address: "Main St, Verification Office 300, Salt Lake City, UT 84101, USA" },
    { title: "Performance Testing Engineer", company: "LoadMax Labs", type: "Full-Time", cat: "QA & Testing", salary: "$110k - $140k", loc: "Remote", date: "08/05/2026", logo: "L", desc: "Simulate massive parallel usage sequences against network servers.", req: ["JMeter load script configurations", "Server bottleneck capture routines", "Network throughput diagnostics"], vacancies: 2, lang: "English", exp: "3+ Years", mode: "Online", address: "Automation Infrastructure Strip, Zurich, Switzerland" },
    { title: "Machine Learning Engineer", company: "NeuralSystems AI", type: "Full-Time", cat: "AI/ML", salary: "$160k - $210k", loc: "Boston, MA", date: "14/05/2026", logo: "N", desc: "Train large-scale deep learning models on high-performance vector grids.", req: ["PyTorch application development building blocks", "CUDA environment training loops", "Distributed compute clusters"], vacancies: 2, lang: "English, Python", exp: "4+ Years", mode: "Hybrid", address: "Boylston St, Intelligence Center, Boston, MA 02116, USA" },
    { title: "Computer Vision Researcher", company: "SightTech Labs", type: "Full-Time", cat: "AI/ML", salary: "$170k - $220k", loc: "Remote", date: "11/05/2026", logo: "S", desc: "Implement real-time spatial image parsing patterns.", req: ["OpenCV library setups", "Object segmentation algorithms", "Model quantization workflows"], vacancies: 1, lang: "English, C++, Python", exp: "5+ Years", mode: "Online", address: "Neural Vision Campus, Toronto, Canada" },
    { title: "AI Product Integrator", company: "SmartWork Automation", type: "Full-Time", cat: "AI/ML", salary: "$120k - $155k", loc: "San Jose, CA", date: "07/05/2026", logo: "S", desc: "Embed intelligent model APIs into enterprise product configurations.", req: ["Vector database integrations", "Prompt engineer tuning scripts", "Python server development skills"], vacancies: 3, lang: "English, Python", exp: "2+ Years", mode: "Hybrid", address: "First St Tech Plaza, San Jose, CA 95112, USA" },
    { title: "Network Infrastructure Engineer", company: "Global Connect Communications", type: "Full-Time", cat: "Networking", salary: "$95k - $125k", loc: "Houston, TX", date: "12/05/2026", logo: "G", desc: "Configure resilient secure corporate datalink hardware topologies.", req: ["Cisco routing and switching command profiles", "BGP/OSPF layout configuration rules", "Packet capture network tracking tools"], vacancies: 3, lang: "English", exp: "4+ Years", mode: "Hybrid", address: "Louisiana St Corporate Plaza, Houston, TX 77002, USA" },
    { title: "Wireless Network Specialist", company: "TelcoWaves", type: "Full-Time", cat: "Networking", salary: "$90k - $115k", loc: "Remote", date: "09/05/2026", logo: "T", desc: "Design and optimize wide-area corporate network deployments.", req: ["Enterprise wireless network systems", "RF signal attenuation metrics", "Network security verification steps"], vacancies: 4, lang: "English", exp: "3+ Years", mode: "Online", address: "Telecom Infrastructure Tower, Sydney, Australia" },
    { title: "Database Administrator (Oracle/SQL)", company: "DataFortress Corp", type: "Full-Time", cat: "Database Administration", salary: "$110k - $145k", loc: "Minneapolis, MN", date: "13/05/2026", logo: "D", desc: "Preserve structural database integrity maps and validation tracks.", req: ["Oracle DB cluster administration rules", "Advanced PL/SQL optimization maps", "Disaster recovery scripting metrics"], vacancies: 2, lang: "English, SQL", exp: "5+ Years", mode: "Hybrid", address: "Marquette Ave Data Vault, Minneapolis, MN 55401, USA" },
    { title: "NoSQL Database Architect", company: "CloudScale Data", type: "Full-Time", cat: "Database Administration", salary: "$130k - $165k", loc: "Remote", date: "10/05/2026", logo: "C", desc: "Design high-performance distributed key-value storage grids.", req: ["MongoDB cluster scaling paths", "Cassandra partition control tracks", "Data consistency index models"], vacancies: 3, lang: "English", exp: "4+ Years", mode: "Online", address: "Distributed Storage Strip, Frankfurt, Germany" },
    { title: "IT Support Engineer (Tier 3)", company: "HelpDesk Pros", type: "Full-Time", cat: "Technical Support", salary: "$65k - $85k", loc: "Charlotte, NC", date: "14/05/2026", logo: "H", desc: "Remediate advanced configuration faults escalated from tiers 1 and 2.", req: ["Active Directory configurations", "Network hardware diagnostics", "OS system terminal scripting"], vacancies: 5, lang: "English", exp: "2+ Years", mode: "Hybrid", address: "Tryon St Suite 500, Charlotte, NC 28202, USA" },
    { title: "Enterprise Technical Support Lead", company: "SaaSCorp Global", type: "Full-Time", cat: "Technical Support", salary: "$80k - $105k", loc: "Remote", date: "12/05/2026", logo: "S", desc: "Guide software interface integrations for high-priority business targets.", req: ["API network evaluation metrics", "Linux server shell commands", "SLA control mapping tracking"], vacancies: 2, lang: "English", exp: "3+ Years", mode: "Online", address: "Global Solutions Terminal, Bangalore, India" },
    { title: "Technical Product Manager", company: "FutureProducts Inc", type: "Full-Time", cat: "Product Management", salary: "$140k - $185k", loc: "Seattle, WA", date: "14/05/2026", logo: "F", desc: "Bridge technical agile build cycles with corporate item goals.", req: ["Agile product tracking software use", "Technical system roadmap architectures", "Data-centric feature modeling"], vacancies: 2, lang: "English", exp: "4+ Years", mode: "Hybrid", address: "Pine St Strategy Studio, Seattle, WA 98101, USA" },
    { title: "Product Manager - AI Platform", company: "NextGen AI", type: "Full-Time", cat: "Product Management", salary: "$160k - $210k", loc: "New York, NY", date: "11/05/2026", logo: "N", desc: "Steer functional scope for machine learning development SDK packs.", req: ["AI/ML market pattern insights", "API functional lifecycle maps", "Cross-team scope coordination"], vacancies: 1, lang: "English", exp: "5+ Years", mode: "Hybrid", address: "Fifth Ave Creative Suite, New York, NY 10018, USA" },
    { title: "Web Developer - Angular Specialist", company: "WebWorks Studio", type: "Full-Time", cat: "Web Development", salary: "$90k - $115k", loc: "Remote", date: "06/05/2026", logo: "W", desc: "Maintain single page application user systems.", req: ["Angular 14 framework rules", "TypeScript optimization matrices"], vacancies: 4, lang: "English, TypeScript", exp: "2+ Years", mode: "Online", address: "Web Development Base, Vancouver, Canada" },
    { title: "Go Backend Engineer", company: "FastStream Tech", type: "Full-Time", cat: "Software Engineering", salary: "$135k - $170k", loc: "Denver, CO", date: "05/05/2026", logo: "F", desc: "Build highly concurrent low-latency messaging microservices systems.", req: ["Go channel paradigms", "gRPC data validation rules"], vacancies: 2, lang: "English, Go", exp: "3+ Years", mode: "Hybrid", address: "Broadway Tech Core, Denver, CO 80203, USA" },
    { title: "Systems Administrator", company: "NetOps LLC", type: "Full-Time", cat: "Networking", salary: "$85k - $110k", loc: "Kansas City, MO", date: "04/05/2026", logo: "N", desc: "Manage server room deployment setups.", req: ["Linux server administration structures", "Bash routine automation scripts"], vacancies: 3, lang: "English, Bash", exp: "3+ Years", mode: "Hybrid", address: "Main St Server Building, Kansas City, MO 64105, USA" },
    { title: "Lead QA Automation Specialist", company: "QualityFirst", type: "Full-Time", cat: "QA & Testing", salary: "$120k - $150k", loc: "Remote", date: "03/05/2026", logo: "Q", desc: "Oversee continuous integration performance check tracks.", req: ["Cypress automation code tracks", "Team workflow management patterns"], vacancies: 2, lang: "English, JavaScript", exp: "5+ Years", mode: "Online", address: "Quality Assurance Square, London, UK" },
    { title: "DevOps Release Coordinator", company: "ShipIt Fast", type: "Full-Time", cat: "DevOps", salary: "$100k - $130k", loc: "Austin, TX", date: "02/05/2026", logo: "S", desc: "Manage multi-stage production delivery nodes safely.", req: ["Git deployment tracking paths", "Docker platform build registries"], vacancies: 4, lang: "English", exp: "2+ Years", mode: "Hybrid", address: "Congress Ave Loop 4, Austin, TX 78701, USA" },
    { title: "Junior Data Analyst", company: "Startup Incubator", type: "Full-Time", cat: "Data Analytics", salary: "$65k - $80k", loc: "Chicago, IL", date: "01/05/2026", logo: "S", desc: "Help business product modules compile performance analytics logs.", req: ["SQL relational tracking", "Excel calculation sheets"], vacancies: 5, lang: "English, SQL", exp: "0-1 Years", mode: "Hybrid", address: "Wacker Dr Launch Space, Chicago, IL 60606, USA" },
    { title: "Data Engineer", company: "BigData Pipeline", type: "Full-Time", cat: "Data Science", salary: "$130k - $165k", loc: "Remote", date: "30/04/2026", logo: "B", desc: "Maintain real-time distributed file parsing system pipes.", req: ["Apache Kafka metrics handling", "Hadoop processing node control"], vacancies: 3, lang: "English, Java, Python", exp: "4+ Years", mode: "Online", address: "Data Architecture Block, Paris, France" },
    { title: "Application Security Analyst", company: "SecureApps", type: "Full-Time", cat: "Cyber Security", salary: "$110k - $140k", loc: "Boston, MA", date: "29/04/2026", logo: "S", desc: "Review production application code targets against potential bugs.", req: ["OWASP Top 10 vulnerabilities", "Static script tracking system run logs"], vacancies: 2, lang: "English", exp: "3+ Years", mode: "Hybrid", address: "Beacon St Security Office, Boston, MA 02108, USA" },
    { title: "Cloud Storage Solutions Architect", company: "DataCloud Services", type: "Full-Time", cat: "Cloud Computing", salary: "$145k - $180k", loc: "Remote", date: "28/04/2026", logo: "D", desc: "Design distributed enterprise data array maps globally.", req: ["AWS S3 structure definitions", "Ceph clustering controls"], vacancies: 1, lang: "English", exp: "5+ Years", mode: "Online", address: "Cloud Array Campus, Seattle, WA 98104, USA" },
    { title: "Interaction UI Designer", company: "Studio Fluid", type: "Full-Time", cat: "UI/UX Design", salary: "$95k - $125k", loc: "New York, NY", date: "27/04/2026", logo: "S", desc: "Design smooth digital layout micro-interactions.", req: ["Adobe After Effects rendering tools", "Figma interface variants"], vacancies: 3, lang: "English", exp: "3+ Years", mode: "Hybrid", address: "Varick St Studio Suite, New York, NY 10014, USA" },
    { title: "React Native Mobile Engineer", company: "AppWorks", type: "Full-Time", cat: "Mobile Development", salary: "$115k - $145k", loc: "Remote", date: "26/04/2026", logo: "A", desc: "Deploy fast dual-platform native apps.", req: ["React Native hooks structures", "JavaScript runtime checks"], vacancies: 3, lang: "English, JavaScript", exp: "2+ Years", mode: "Online", address: "Mobile Engineering Terminal, Austin, TX 78704, USA" },
    { title: "PostgreSQL DBA Expert", company: "DBTech Group", type: "Full-Time", cat: "Database Administration", salary: "$120k - $155k", loc: "Dallas, TX", date: "25/04/2026", logo: "D", desc: "Manage relational storage shard and cluster arrays.", req: ["PostgreSQL configuration management", "Connection pool tuneup files"], vacancies: 2, lang: "English, SQL", exp: "4+ Years", mode: "Hybrid", address: "Main St Data Base Tower, Dallas, TX 75201, USA" },
    { title: "Help Desk Technician", company: "OfficeSync", type: "Full-Time", cat: "Technical Support", salary: "$50k - $65k", loc: "Houston, TX", date: "24/04/2026", logo: "O", desc: "Remediate basic user hardware errors and ticketing parameters.", req: ["Windows desktop diagnostic procedures", "Basic network hardware checks"], vacancies: 6, lang: "English", exp: "1+ Year" , mode: "Hybrid", address: "Fannin St Infrastructure Block, Houston, TX 77002, USA" },
    { title: "Associate Product Manager", company: "SaaS Launchpad", type: "Full-Time", cat: "Product Management", salary: "$90k - $115k", loc: "Remote", date: "23/04/2026", logo: "S", desc: "Compile feature update specs based on metrics loops.", req: ["Jira board project tracking use", "User narrative documentation drafting"], vacancies: 2, lang: "English", exp: "1-2 Years", mode: "Online", address: "Product Incubation Base, San Francisco, CA 94107, USA" },
    { title: "MLOps Engineer", company: "ModelScale", type: "Full-Time", cat: "AI/ML", salary: "$145k - $185k", loc: "San Francisco, CA", date: "22/04/2026", logo: "M", desc: "Deploy deep learning models onto cloud scaling structures.", req: ["Kubeflow orchestration platforms", "MLflow metrics validation tracks"], vacancies: 2, lang: "English, Python", exp: "3+ Years", mode: "Hybrid", address: "Howard St Intelligence Terminal, San Francisco, CA 94103, USA" }
];

// --- VIEW CONTROLLER ---
function showView(viewId) {
    closeMobileMenu();
    
    // Hide all views
    document.querySelectorAll('.view').forEach(v => {
        v.style.display = 'none';
    });
    
    // Remove landing-active class first
    if (viewId !== 'landing') {
        document.body.classList.remove('landing-active');
    } else {
        document.body.classList.add('landing-active');
    }
    
    // Show requested view with a small delay to ensure CSS cascade completes
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block';
    } else {
        console.warn(`View with ID "${viewId}" not found`);
        return;
    }
    
    // Update active nav link
    document.querySelectorAll('#nav-links li').forEach(li => li.classList.remove('nav-active'));
    const activeNavItem = document.querySelector(`#nav-links li button[data-view="${viewId}"]`);
    if (activeNavItem) {
        activeNavItem.closest('li').classList.add('nav-active');
    }
    
    // Render page-specific content
    if(viewId === 'job-listings') renderJobs();
    if(viewId === 'dashboard') renderDashboard();
    if(viewId === 'my-applications') renderMyApplicationsView();
    if(viewId === 'profile-page') renderProfilePage();
    if(viewId === 'settings-page') renderSettingsPage();
    if(viewId === 'saved-jobs-page') renderSavedJobsPage();
    if(viewId === 'auth-page') openAuthUI();
    if(viewId === 'admin-dashboard') renderAdminDashboard();
    updateNav();

    // Scroll the page to top on every view change so the user sees the new content immediately.
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // When viewing admin dashboard, hide the document body scrollbar
    // and allow the admin main panel to handle scrolling so there's a single scroll area.
    if (viewId === 'admin-dashboard') {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function openAuthUI() {
    selectedRole = 'candidate';
    document.getElementById('auth-selection').style.display = 'none';
    document.getElementById('auth-form-container').style.display = 'block';
    isLoginMode = true;
    document.getElementById('auth-title').innerText = 'Login';
    document.getElementById('auth-toggle-text').innerText = "Don't have an account? Register";
    document.getElementById('login-fields').style.display = 'block';
    document.getElementById('register-fields').style.display = 'none';
}



function toggleMobileMenu() {
    document.body.classList.toggle('nav-open');
    const icon = document.querySelector('.mobile-nav-toggle i');
    if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    }
}

function closeMobileMenu() {
    document.body.classList.remove('nav-open');
    const icon = document.querySelector('.mobile-nav-toggle i');
    if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    }
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMobileMenu();
});

function attachNavLinkHandlers() {
    const navLinks = document.getElementById('nav-links');
    if (navLinks) {
        navLinks.addEventListener('click', function(event) {
            const target = event.target.closest('[data-view]');
            if (target) {
                event.preventDefault();
                const viewId = target.dataset.view;
                if (viewId) showView(viewId);
            }
        });
    }
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault();
            logout();
        });
    }
}

attachNavLinkHandlers();

function updateNav() {
    const dashboardNavBtn = document.getElementById('dashboard-nav-btn');
    if(currentUser) {
        document.getElementById('auth-btn').style.display = 'none';
        const dashBtn = document.getElementById('dash-btn');
        if(currentUser.role === 'employer') {
            dashBtn.style.display = 'block';
            if(dashboardNavBtn) {
                dashboardNavBtn.dataset.view = 'dashboard';
                dashboardNavBtn.innerText = 'Employer Dashboard';
            }
        } else if(currentUser.role === 'admin') {
            dashBtn.style.display = 'block';
            if(dashboardNavBtn) {
                dashboardNavBtn.dataset.view = 'admin-dashboard';
                dashboardNavBtn.innerText = 'Admin Analytics Dashboard';
            }
            // Hide public site nav items for admin and show admin search
            const hideViews = ['home','about','job-listings','contact'];
            hideViews.forEach(v => {
                const btn = document.querySelector(`#nav-links button[data-view="${v}"]`);
                if(btn) btn.closest('li').style.display = 'none';
            });
            const adminSearchLi = document.getElementById('admin-search-li');
            if(adminSearchLi) adminSearchLi.style.display = 'block';
        } else {
            // restore default nav items when not admin
            ['home','about','job-listings','contact'].forEach(v => {
                const btn = document.querySelector(`#nav-links button[data-view="${v}"]`);
                if(btn) btn.closest('li').style.display = '';
            });
            const adminSearchLi = document.getElementById('admin-search-li');
            if(adminSearchLi) adminSearchLi.style.display = 'none';
            dashBtn.style.display = 'none';
        }
        
        const profileHeader = document.getElementById('user-profile-header');
        const profileName = document.getElementById('user-profile-name');
        profileName.innerText = currentUser.name || currentUser.company;
        profileHeader.style.display = 'block';

        if(currentUser.role === 'candidate') {
            document.getElementById('my-apps-nav-btn').style.display = 'block';
            const savedBtn = document.getElementById('saved-jobs-nav-btn');
            if(savedBtn) savedBtn.style.display = 'block';
        } else {
            document.getElementById('my-apps-nav-btn').style.display = 'none';
            const savedBtn = document.getElementById('saved-jobs-nav-btn');
            if(savedBtn) savedBtn.style.display = 'none';
        }
        
        document.getElementById('logout-btn').style.display = 'block';
        const settingsBtn = document.getElementById('nav-settings-btn');
        if(settingsBtn) settingsBtn.style.display = 'block';
    } else {
        document.getElementById('auth-btn').style.display = 'block';
        document.getElementById('dash-btn').style.display = 'none';
        document.getElementById('user-profile-header').style.display = 'none';
        document.getElementById('my-apps-nav-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';
        const settingsBtn = document.getElementById('nav-settings-btn');
        if(settingsBtn) settingsBtn.style.display = 'none';
        const savedBtn = document.getElementById('saved-jobs-nav-btn');
        if(savedBtn) savedBtn.style.display = 'none';
    }
}

// --- CUSTOM MODAL POP-UPS ---
let modalAction = null;
function triggerPopup(message, type, callback = null) {
    const modal = document.getElementById('custom-modal');
    const msgH3 = document.getElementById('modal-msg');
    const iconDiv = document.getElementById('modal-icon');
    if(!modal || !msgH3 || !iconDiv) {
        window.alert(message);
        if(callback) callback();
        return;
    }
    
    msgH3.innerText = message;
    iconDiv.innerHTML = type === 'success' 
        ? '<i class="fas fa-check-circle" style="color:#22c55e; font-size:3rem;"></i>' 
        : '<i class="fas fa-times-circle" style="color:#ef4444; font-size:3rem;"></i>';
    
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.zIndex = '99999';
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';
    modalAction = callback;

    requestAnimationFrame(() => {
        const computed = window.getComputedStyle(modal);
        if(computed.display !== 'flex' || computed.visibility === 'hidden' || computed.opacity === '0') {
            window.alert(message);
            if(callback) callback();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('custom-modal');
    if(modal) {
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
    }
    document.body.style.overflow = '';
    if(modalAction) modalAction();
}

// --- AUTH FLOW LOGIC ---
function selectRole(role) {
    selectedRole = role;
    document.getElementById('auth-selection').style.display = 'none';
    document.getElementById('auth-form-container').style.display = 'block';
    isLoginMode = false;
    document.getElementById('auth-title').innerText = 'Register';
    document.getElementById('auth-toggle-text').innerText = "Have an account? Login";
    document.getElementById('login-fields').style.display = 'none';
    document.getElementById('register-fields').style.display = 'block';
    document.getElementById('candidate-fields').style.display = selectedRole === 'candidate' ? 'block' : 'none';
    document.getElementById('employer-fields').style.display = selectedRole === 'employer' ? 'block' : 'none';
}

function backToSelection() {
    document.getElementById('auth-selection').style.display = 'block';
    document.getElementById('auth-form-container').style.display = 'none';
}

function toggleAuthMode(forceLogin = false) {
    if(forceLogin) isLoginMode = true;
    else isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "Login" : "Register";
    document.getElementById('auth-toggle-text').innerText = isLoginMode ? "Don't have an account? Register" : "Have an account? Login";

    if(isLoginMode) {
        // show login form directly
        document.getElementById('auth-selection').style.display = 'none';
        document.getElementById('auth-form-container').style.display = 'block';
        document.getElementById('login-fields').style.display = 'block';
        document.getElementById('register-fields').style.display = 'none';
    } else {
        // For register: show role-selection first, then user picks role to continue
        // Clear any previous registration inputs so a fresh form appears
        const regIds = ['reg-name','reg-email','reg-phone','reg-loc','reg-pass','reg-confirm-pass','reg-comp-name','reg-comp-email','reg-comp-phone','reg-comp-web','reg-comp-loc','reg-comp-person'];
        regIds.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
        // clear validation messages
        document.querySelectorAll('.error-msg').forEach(e => e.innerText = '');
        document.getElementById('auth-selection').style.display = 'block';
        document.getElementById('auth-form-container').style.display = 'none';
    }
}

// --- REAL-TIME VALIDATION HELPERS ---
function setErr(id, msg) {
    if(document.getElementById('err-' + id))
    document.getElementById('err-' + id).innerText = msg;
}

function validateLettersOnly(el) {
    el.value = el.value.replace(/[^a-zA-Z\s]/g, '');
    const errId = el.id;
    if (el.value.length < 2) setErr(errId, "Minimum 2 characters required");
    else setErr(errId, "");
}

function validateName(el) {
    el.value = el.value.replace(/[^a-zA-Z\s]/g, '');
    const errId = el.id;
    if (el.value.length < 2) setErr(errId, "Min 2 characters");
    else if (el.value.length > 50) setErr(errId, "Max 50 characters");
    else setErr(errId, "");
}

function validateEmail(el) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errId = el.id;
    if (!emailRegex.test(el.value)) setErr(errId, "Invalid email format");
    else if (users.find(u => u.email === el.value)) setErr(errId, "Email already registered");
    else setErr(errId, "");
}

function validatePhone(el) {
    el.value = el.value.replace(/\D/g, '');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const errId = el.id;
    if (el.value.length !== 10) setErr(errId, "Must be exactly 10 digits");
    else if (users.find(u => u.phone === el.value)) setErr(errId, "Phone already registered");
    else setErr(errId, "");
}

function validateURL(el) {
    const errId = el.id;
    try { new URL(el.value); setErr(errId, ""); } 
    catch { setErr(errId, "Invalid URL (include http://)"); }
}

function validateDigitsOnly(el, maxLength) {
    el.value = el.value.replace(/\D/g, '');
    if(maxLength) el.value = el.value.slice(0, maxLength);
}

function validatePass(el) {
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passRegex.test(el.value)) setErr(el.id, "8+ chars, Upper, Lower, Num, Special");
    else setErr(el.id, "");
}

function validateConfirmPass(el) {
    const pass = document.getElementById('reg-pass').value;
    if (el.value !== pass) setErr(el.id, "Passwords do not match");
    else setErr(el.id, "");
}

function togglePassVisibility(id) {
    const el = document.getElementById(id);
    const icon = el.nextElementSibling;
    if (el.type === "password") {
        el.type = "text";
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        el.type = "password";
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// --- VALIDATION & BACKEND SIMULATION ---
function validateRegistration() {
    const errors = document.querySelectorAll('.error-msg');
    let hasError = false;
    errors.forEach(e => { if(e.innerText !== "") hasError = true; });
    
    const pass = document.getElementById('reg-pass').value;
    const confirmPass = document.getElementById('reg-confirm-pass').value;
    if(pass !== confirmPass || pass === "") return false;

    return !hasError;
}

function handleAuthSubmit() {
    if(isLoginMode) {
        performLogin();
    } else {
        if(validateRegistration()) {
            performRegistration();
        } else {
            triggerPopup("Please fix the validation errors first.", "error");
        }
    }
}

function performRegistration() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let newUser = {
        role: selectedRole,
        pass: document.getElementById('reg-pass').value,
        verified: true,
        linkedin: '',
        portfolio: '',
        summary: '',
        degree: '',
        college: '',
        score: '',
        passyear: '',
        expCompany: '',
        expTitle: '',
        expDuration: '',
        expResponsibilities: '',
        techskills: '',
        softskills: '',
        skillLevel: '',
        certName: '',
        certOrg: '',
        certDate: '',
        projectTitle: '',
        projectDesc: '',
        projectTech: '',
        projectLink: '',
        prefRole: '',
        prefLocation: '',
        prefSalary: '',
        prefEmployment: '',
        notifEmail: false,
        notifSMS: false,
        resumeFileName: '',
        resumeData: '',
        savedJobs: []
    };

    if(selectedRole === 'candidate') {
        newUser.name = document.getElementById('reg-name').value.trim();
        newUser.email = document.getElementById('reg-email').value.trim().toLowerCase();
        newUser.phone = document.getElementById('reg-phone').value.trim();
        newUser.location = document.getElementById('reg-loc').value.trim();
    } else {
        newUser.company = document.getElementById('reg-comp-name').value.trim();
        newUser.email = document.getElementById('reg-comp-email').value.trim().toLowerCase();
        newUser.phone = document.getElementById('reg-comp-phone').value.trim();
        newUser.website = document.getElementById('reg-comp-web').value.trim();
        newUser.industry = '';
        newUser.companySize = '';
        newUser.founded = '';
        newUser.headquarters = document.getElementById('reg-comp-loc').value.trim();
        newUser.description = '';
        newUser.hrName = document.getElementById('reg-comp-person').value.trim();
        newUser.hrEmail = newUser.email;
        newUser.hrPhone = newUser.phone;
        newUser.verificationGST = '';
        newUser.verificationReg = '';
        newUser.notifEmail = false;
        newUser.notifSMS = false;
    }

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    triggerPopup("Registration Successful!", "success", () => {
        toggleAuthMode(true); 
    });
}

function performLogin() {
    const identifier = document.getElementById('login-identifier').value.trim();
    const pass = document.getElementById('login-pass').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Admin hard-coded credentials (only these should open Admin Analytics)
    if(normalizeText(identifier) === 'carrernest@gmail.com' && pass === 'CarrerNestAdmin@123') {
        // Create admin currentUser and attach the password so settings checks work
        currentUser = { role: 'admin', email: 'carrernest@gmail.com', name: 'Admin', pass: pass };
        // Persist currentUser and ensure admin exists in users list for future updates
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        try { saveCurrentUser(); } catch (e) { /* saveCurrentUser may be defined later; safe to ignore errors here */ }
        triggerPopup("Admin Login Successful!", "success", () => {
            showView('admin-dashboard');
        });
        return;
    }

    let user = users.find(u => (normalizeText(u.email) === normalizeText(identifier) || u.phone === identifier) && u.pass === pass);

    if(user) {
        currentUser = user;
        selectedRole = user.role || selectedRole;
        localStorage.setItem('currentUser', JSON.stringify(user));
        triggerPopup("Login Successful!", "success", () => {
            showView('home');
        });
    } else {
        triggerPopup("Invalid credentials or Role mismatch!", "error");
    }
}

// --- ADMIN DASHBOARD RENDERING ---
let adminCharts = {};
function renderAdminDashboard() {
    const cur = JSON.parse(localStorage.getItem('currentUser')) || currentUser;
    adminNavigate('overview');
    updateAdminStatsAndData();
}

function adminNavigate(tab) {
    const tabs = ['overview','jobs','users','applicants'];
    tabs.forEach(t => {
        const el = document.getElementById('admin-' + t);
        if(el) el.style.display = (t === tab) ? 'block' : 'none';
    });
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.adminTab === tab);
    });
    if(tab === 'jobs') renderAdminJobsTable();
    if(tab === 'users') renderAdminUsersTable();
    if(tab === 'applicants') renderAdminApplicantsTable();
    if(tab === 'overview') renderAdminCharts();
}

function updateAdminStatsAndData() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const apps = JSON.parse(localStorage.getItem('applications')) || [];
    const localJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const allJobs = [...localJobs, ...staticJobsDatabase];

    document.getElementById('stat-total-jobs').innerText = allJobs.length;
    document.getElementById('stat-total-apps').innerText = apps.length;
    document.getElementById('stat-total-users').innerText = users.length;
    const activeJobs = allJobs.filter(j => (j.vacancies && Number(j.vacancies) > 0)).length;
    document.getElementById('stat-active-jobs').innerText = activeJobs;

    // populate category filter
    const catSel = document.getElementById('admin-job-filter-cat');
    if(catSel) {
        const cats = Array.from(new Set(allJobs.map(j => j.cat))).sort();
        catSel.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

function renderAdminJobsTable() {
    const tbody = document.getElementById('admin-jobs-table');
    const localJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const allJobs = [...localJobs.map(j=>({...j, _local:true})), ...staticJobsDatabase.map(j=>({...j, _local:false}))];
    const q = (document.getElementById('admin-job-search')?.value || '').toLowerCase();
    const cat = document.getElementById('admin-job-filter-cat')?.value || '';
    const filtered = allJobs.filter(j => j.title.toLowerCase().includes(q) && (cat ? j.cat === cat : true));
    tbody.innerHTML = filtered.map(j => `
        <tr>
            <td style="padding:10px;">${j.title}</td>
            <td style="padding:10px;">${j.company}</td>
            <td style="padding:10px; text-align:center;">${j.cat}</td>
            <td style="padding:10px; text-align:center;">${j.vacancies || ''}</td>
            <td style="padding:10px; text-align:center;">
                <button class="btn-secondary" title="Edit" style="background:none; border:none; font-size:1.2rem; cursor:pointer; padding:5px;" onclick="openEditJobModal('${escapeHtml(j.title)}','${escapeHtml(j.company)}')">✏️</button> <button class="btn-secondary" title="Delete" style="background:none; border:none; font-size:1.2rem; cursor:pointer; padding:5px;" onclick="requestDeleteJob('${escapeHtml(j.title)}','${escapeHtml(j.company)}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function openEditJobModal(title, company) {
    const jobsLocal = JSON.parse(localStorage.getItem('jobs')) || [];
    const job = jobsLocal.find(j => j.title === title && j.company === company);
    if(!job) { triggerPopup('Local job not found for editing','error'); return; }
    editingJobId = { title: job.title, company: job.company };
    document.getElementById('admin-edit-job-title-input').value = job.title || '';
    document.getElementById('admin-edit-job-company-input').value = job.company || '';
    document.getElementById('admin-edit-job-cat-input').value = job.cat || '';
    document.getElementById('admin-edit-job-type-input').value = job.type || job.type || 'Full-Time';
    document.getElementById('admin-edit-job-salary-input').value = job.salary || job.salary || '';
    document.getElementById('admin-edit-job-location-input').value = job.loc || job.loc || 'India';
    document.getElementById('admin-edit-job-vacancies-input').value = job.vacancies || '';
    document.getElementById('admin-edit-job-desc-input').value = job.desc || '';
    document.getElementById('admin-job-edit-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeEditJobModal() {
    document.getElementById('admin-job-edit-modal').style.display = 'none';
    document.body.style.overflow = '';
    editingJobId = null;
}

function saveEditedJob() {
    if(!editingJobId) { triggerPopup('No job selected','error'); return; }
    const title = document.getElementById('admin-edit-job-title-input').value.trim();
    const company = document.getElementById('admin-edit-job-company-input').value.trim();
    const cat = document.getElementById('admin-edit-job-cat-input').value.trim();
    const type = document.getElementById('admin-edit-job-type-input')?.value || '';
    const salary = document.getElementById('admin-edit-job-salary-input')?.value.trim() || '';
    const loc = document.getElementById('admin-edit-job-location-input')?.value.trim() || 'India';
    const vacancies = document.getElementById('admin-edit-job-vacancies-input').value.trim();
    const desc = document.getElementById('admin-edit-job-desc-input').value.trim();
    let jobsLocal = JSON.parse(localStorage.getItem('jobs')) || [];
    const idx = jobsLocal.findIndex(j => j.title === editingJobId.title && j.company === editingJobId.company);
    if(idx === -1) { triggerPopup('Job not found','error'); closeEditJobModal(); return; }
    jobsLocal[idx].title = title || jobsLocal[idx].title;
    jobsLocal[idx].company = company || jobsLocal[idx].company;
    jobsLocal[idx].cat = cat || jobsLocal[idx].cat;
    jobsLocal[idx].type = type || jobsLocal[idx].type;
    jobsLocal[idx].salary = salary || jobsLocal[idx].salary;
    jobsLocal[idx].loc = loc || jobsLocal[idx].loc;
    jobsLocal[idx].vacancies = vacancies || jobsLocal[idx].vacancies;
    jobsLocal[idx].desc = desc || jobsLocal[idx].desc;
    localStorage.setItem('jobs', JSON.stringify(jobsLocal));
    closeEditJobModal();
    renderAdminJobsTable();
    updateAdminStatsAndData();
    triggerPopup('Job updated','success');
}

function renderAdminUsersTable() {
    const tbody = document.getElementById('admin-users-table');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const q = (document.getElementById('admin-user-search')?.value || '').toLowerCase();
    const roleFilter = (document.getElementById('admin-user-filter-role')?.value || '');
    const filtered = users.filter(u => ((u.name||u.company||u.email||'').toLowerCase().includes(q)) && (roleFilter ? u.role === roleFilter : true));
    tbody.innerHTML = filtered.map(u => `
        <tr>
            <td style="padding:10px;">${u.name || u.company || ''}</td>
            <td style="padding:10px; text-align:center;">
                <select class="form-input" onchange="updateUserRoleInline('${escapeHtml(u.email)}', this.value)">
                    <option value="candidate" ${u.role==='candidate' ? 'selected' : ''}>Candidate</option>
                    <option value="employer" ${u.role==='employer' ? 'selected' : ''}>Employer</option>
                    <option value="admin" ${u.role==='admin' ? 'selected' : ''}>Admin</option>
                </select>
            </td>
            <td style="padding:10px;">${u.email || ''}</td>
            <td style="padding:10px;">${u.phone || ''}</td>
            <td style="padding:10px; text-align:center;"><button class="btn-secondary" title="Edit" style="background:none; border:none; font-size:1.2rem; cursor:pointer; padding:5px;" onclick="openEditUserModal('${escapeHtml(u.email)}')">✏️</button> <button class="btn-secondary" title="Delete" style="background:none; border:none; font-size:1.2rem; cursor:pointer; padding:5px;" onclick="requestDeleteUser('${escapeHtml(u.email)}')">🗑️</button></td>
        </tr>
    `).join('');
}

function updateUserRoleInline(email, newRole) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const idx = users.findIndex(u => normalizeText(u.email) === normalizeText(email));
    if(idx === -1) return;
    users[idx].role = newRole;
    if(newRole === 'employer') {
        if(!users[idx].company) users[idx].company = users[idx].name || '';
    } else {
        if(!users[idx].name) users[idx].name = users[idx].company || '';
    }
    localStorage.setItem('users', JSON.stringify(users));
    renderAdminUsersTable();
    updateAdminStatsAndData();
}

function renderAdminApplicantsTable() {
    const tbody = document.getElementById('admin-applicants-table');
    const apps = JSON.parse(localStorage.getItem('applications')) || [];
    const q = (document.getElementById('admin-app-search')?.value || '').toLowerCase();
    const statusFilter = (document.getElementById('admin-app-filter-status')?.value || '');
    const filtered = apps.filter(a => ((a.candidateName||a.candidateEmail||'').toLowerCase().includes(q) || (a.jobTitle||'').toLowerCase().includes(q)) && (statusFilter ? (statusFilter === 'Applied' ? ( (a.status===undefined || a.status==='Pending' || a.status==='Applied') ) : a.status === statusFilter) : true));
    tbody.innerHTML = filtered.map(a => {
        const status = a.status || 'Pending';
        const statusColor = status === 'Accepted' ? '#10b981' : status === 'Rejected' ? '#ef4444' : '#f59e0b';
        const appKey = a.id || a.candidateEmail || '';
        return `
        <tr>
            <td style="padding:10px;">${a.candidateName || ''}</td>
            <td style="padding:10px;">${a.candidateEmail || ''}</td>
            <td style="padding:10px;">${a.jobTitle || ''}</td>
            <td style="padding:10px; text-align:center;">${a.dateApplied || ''}</td>
            <td style="padding:10px; text-align:center;">
                <select class="form-input" onchange="updateApplicationStatus('${escapeHtml(appKey)}', this.value)">
                    <option value="Applied" ${status==='Applied' || status==='Pending' ? 'selected' : ''}>Applied</option>
                    <option value="Accepted" ${status==='Accepted' ? 'selected' : ''}>Accepted</option>
                    <option value="Rejected" ${status==='Rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </td>
            <td style="padding:10px; text-align:center;"><button class="btn-secondary" title="View" style="background:none; border:none; font-size:1.2rem; cursor:pointer; padding:5px;" onclick="previewApplicationResume('${appKey}')">👁️</button> <button class="btn-secondary" title="Delete" style="background:none; border:none; font-size:1.2rem; cursor:pointer; padding:5px;" onclick="requestDeleteApplication('${escapeHtml(appKey)}')">🗑️</button></td>
        </tr>
    `;
    }).join('');
}

let pendingDeleteAction = null;

function requestDeleteJob(title, company) {
    pendingDeleteAction = { type: 'job', title, company };
    document.getElementById('admin-delete-confirm-msg').innerText = `Are you sure you want to delete the job "${title}" from ${company}?`;
    document.getElementById('admin-delete-confirm-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function deleteJobAdmin(title, company) {
    let jobsLocal = JSON.parse(localStorage.getItem('jobs')) || [];
    jobsLocal = jobsLocal.filter(j => !(j.title === title && j.company === company));
    localStorage.setItem('jobs', JSON.stringify(jobsLocal));
    updateAdminStatsAndData();
    renderAdminJobsTable();
}

function requestDeleteUser(email) {
    pendingDeleteAction = { type: 'user', email };
    const user = JSON.parse(localStorage.getItem('users')).find(u => normalizeText(u.email) === normalizeText(email));
    const displayName = user ? (user.name || user.company || user.email) : email;
    document.getElementById('admin-delete-confirm-msg').innerText = `Are you sure you want to delete "${displayName}"?`;
    document.getElementById('admin-delete-confirm-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function deleteUserAdmin(email) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(u => normalizeText(u.email) !== normalizeText(email));
    localStorage.setItem('users', JSON.stringify(users));
    renderAdminUsersTable();
}

function openEditUserModal(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => normalizeText(u.email) === normalizeText(email));
    if(!user) { triggerPopup('User not found','error'); return; }
    document.getElementById('admin-edit-name').value = user.name || user.company || '';
    document.getElementById('admin-edit-email').value = user.email || '';
    document.getElementById('admin-edit-role').value = user.role || 'candidate';
    document.getElementById('admin-edit-phone').value = user.phone || '';
    document.getElementById('admin-user-edit-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeEditUserModal() {
    document.getElementById('admin-user-edit-modal').style.display = 'none';
    document.body.style.overflow = '';
}

function saveEditedUser() {
    const email = document.getElementById('admin-edit-email').value;
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const idx = users.findIndex(u => normalizeText(u.email) === normalizeText(email));
    if(idx === -1) { triggerPopup('User not found','error'); return; }
    const newName = document.getElementById('admin-edit-name').value.trim();
    const newRole = document.getElementById('admin-edit-role').value;
    const newPhone = document.getElementById('admin-edit-phone').value.trim();
    users[idx].role = newRole;
    if(newRole === 'employer') {
        users[idx].company = newName;
        users[idx].name = users[idx].name || '';
    } else {
        users[idx].name = newName;
    }
    users[idx].phone = newPhone;
    localStorage.setItem('users', JSON.stringify(users));
    closeEditUserModal();
    renderAdminUsersTable();
    updateAdminStatsAndData();
    triggerPopup('User updated','success');
}

function requestWithdrawApplication(idOrEmail) {
    const apps = JSON.parse(localStorage.getItem('applications')) || [];
    const app = apps.find(a => a.id === idOrEmail || normalizeText(a.candidateEmail) === normalizeText(idOrEmail));
    const displayName = app ? `${app.jobTitle} at ${app.company}` : 'this application';
    pendingDeleteAction = { type: 'withdrawApplication', idOrEmail };
    document.getElementById('admin-delete-confirm-title').innerText = 'Confirm Withdraw';
    document.getElementById('admin-delete-confirm-action-button').innerText = 'Withdraw';
    document.getElementById('admin-delete-confirm-msg').innerText = `Do you really want to withdraw your application for ${displayName}?`;
    document.getElementById('admin-delete-confirm-action-button').style.background = '#ef4444';
    document.getElementById('admin-delete-confirm-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function requestDeleteApplication(idOrEmail) {
    const apps = JSON.parse(localStorage.getItem('applications')) || [];
    const app = apps.find(a => a.id === idOrEmail || normalizeText(a.candidateEmail) === normalizeText(idOrEmail));
    const displayName = app ? (app.candidateName || app.candidateEmail) : 'this application';
    pendingDeleteAction = { type: 'application', idOrEmail };
    document.getElementById('admin-delete-confirm-title').innerText = 'Confirm Delete';
    document.getElementById('admin-delete-confirm-action-button').innerText = 'Delete';
    document.getElementById('admin-delete-confirm-action-button').style.background = '#ef4444';
    document.getElementById('admin-delete-confirm-msg').innerText = `Are you sure you want to delete the application from ${displayName}?`;
    document.getElementById('admin-delete-confirm-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function requestDeleteJobById(jobId) {
    const job = jobs.find(j => j.id === jobId) || { title: 'this job' };
    pendingDeleteAction = { type: 'employerJob', jobId };
    document.getElementById('admin-delete-confirm-title').innerText = 'Confirm Delete';
    document.getElementById('admin-delete-confirm-action-button').innerText = 'Delete';
    document.getElementById('admin-delete-confirm-action-button').style.background = '#ef4444';
    document.getElementById('admin-delete-confirm-msg').innerText = `Do you really want to delete the posting "${job.title || jobId}"?`;
    document.getElementById('admin-delete-confirm-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function deleteApplicationAdmin(idOrEmail) {
    let apps = JSON.parse(localStorage.getItem('applications')) || [];
    apps = apps.filter(a => !(a.id === idOrEmail || normalizeText(a.candidateEmail) === normalizeText(idOrEmail)));
    localStorage.setItem('applications', JSON.stringify(apps));
    updateAdminStatsAndData();
    renderAdminApplicantsTable();
}

function withdrawApplication(idOrEmail) {
    let apps = JSON.parse(localStorage.getItem('applications')) || [];
    apps = apps.filter(a => !(a.id === idOrEmail));
    localStorage.setItem('applications', JSON.stringify(apps));
    applications = apps;
    if(currentUser && currentUser.role === 'candidate') {
        renderMyApplicationsView();
    }
    updateAdminStatsAndData();
}

function closeDeleteConfirmModal() {
    document.getElementById('admin-delete-confirm-modal').style.display = 'none';
    document.body.style.overflow = '';
    pendingDeleteAction = null;
}
function confirmDeleteAction() {
    if(!pendingDeleteAction) return;
    const action = pendingDeleteAction;
    closeDeleteConfirmModal();
    if(action.type === 'selfDelete') {
        // remove user account and reload
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(u => !(normalizeText(u.email) === normalizeText(action.email)));
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.removeItem('currentUser');
        triggerPopup('Account deleted. Reloading...', 'success', () => location.reload());
        return;
    }
    if(action.type === 'job') {
        deleteJobAdmin(action.title, action.company);
        triggerPopup('Job deleted','success');
    } else if(action.type === 'user') {
        deleteUserAdmin(action.email);
        triggerPopup('User deleted','success');
    } else if(action.type === 'application') {
        deleteApplicationAdmin(action.idOrEmail);
        triggerPopup('Application deleted','success');
    } else if(action.type === 'withdrawApplication') {
        withdrawApplication(action.idOrEmail);
        triggerPopup('Application withdrawn','success');
    } else if(action.type === 'employerJob') {
        // Employer confirmed deletion of their job posting
        const jobId = action.jobId;
        jobs = jobs.filter(j => j.id !== jobId);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        renderDashboard();
        triggerPopup('Job deleted successfully.', 'success');
    }
}

function viewJobAdmin(title, company) {
    triggerPopup(`Manage job: ${title} — ${company}`, 'success');
}

function escapeHtml(str) { return String(str||'').replace(/'/g, "\\'"); }

function renderAdminCharts() {
    updateAdminStatsAndData();
    const apps = JSON.parse(localStorage.getItem('applications')) || [];
    const localJobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const allJobs = [...localJobs, ...staticJobsDatabase];

    const parseJobDate = (dateString) => {
        if(!dateString) return 0;
        const parts = dateString.split('/').map(p => Number(p));
        if(parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(year, month - 1, day).getTime();
        }
        const parsed = Date.parse(dateString);
        return isNaN(parsed) ? 0 : parsed;
    };

    // applications per job
    const counts = {};
    apps.forEach(a => { const key = a.jobTitle || 'Unknown'; counts[key] = (counts[key]||0)+1; });
    const labels = Object.keys(counts).slice(0,20);
    const data = labels.map(l=>counts[l]);
    const ctxA = document.getElementById('applicationsChart').getContext('2d');
    if(adminCharts.applicationsChart) adminCharts.applicationsChart.destroy();
    adminCharts.applicationsChart = new Chart(ctxA, { type: 'bar', data: { labels, datasets:[{ label:'Applications', data, backgroundColor:'#2563eb' }] }, options:{ responsive:true, maintainAspectRatio:false } });

    // jobs by category
    const catCounts = {};
    allJobs.forEach(j => { const c = j.cat || 'Other'; catCounts[c] = (catCounts[c]||0)+1; });
    const catLabels = Object.keys(catCounts);
    const catData = catLabels.map(c=>catCounts[c]);
    // populate textual legend above the chart for better visibility
    const legendEl = document.getElementById('jobsCategoryLegend');
    if(legendEl) {
        legendEl.innerHTML = catLabels.map((c, i) => `<span class="cat-pill" style="background:${['#eff6ff','#ecfdf5','#fffbeb','#faf5ff','#fee2e2'][i%5]}; padding:6px 10px; border-radius:12px; border:1px solid rgba(0,0,0,0.04); font-size:0.9rem;">${c} (${catCounts[c]})</span>`).join(' ');
    }
    const ctxB = document.getElementById('jobsCategoryChart').getContext('2d');
    if(adminCharts.jobsCategoryChart) adminCharts.jobsCategoryChart.destroy();
    adminCharts.jobsCategoryChart = new Chart(ctxB, { type: 'pie', data: { labels: catLabels, datasets:[{ data: catData, backgroundColor: catLabels.map((_,i)=>['#2563eb','#10b981','#f59e0b','#7c3aed','#ef4444'][i%5]) }] }, options:{ responsive:true, maintainAspectRatio:false, plugins: { legend: { position: 'top', labels: { boxWidth:12, padding:8 } } } } });

    const recentJobs = [...allJobs].sort((a,b) => parseJobDate(b.date) - parseJobDate(a.date)).slice(0,6);
    const recentJobsEl = document.getElementById('admin-recent-jobs-list');
    if(recentJobsEl) {
        if(recentJobs.length === 0) {
            recentJobsEl.innerHTML = `<div style="color: var(--grey);">No recent jobs found.</div>`;
        } else {
            recentJobsEl.innerHTML = recentJobs.map(j => `
                <div style="padding:16px; border:1px solid #e2e8f0; border-radius:12px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; background:#ffffff;">
                    <div>
                        <h4 style="margin:0; font-size:1rem;">${j.title}</h4>
                        <p style="margin:6px 0 0 0; color: var(--grey); font-size:0.95rem;">${j.company} • ${j.cat}</p>
                        <p style="margin:4px 0 0 0; color: var(--grey); font-size:0.85rem;">Posted: ${j.date || 'N/A'} • ${j.loc || 'Location not set'}</p>
                    </div>
                    <div style="text-align:right; min-width:160px;">
                        <p style="margin:0; font-weight:700; color: var(--primary);">${j.salary || 'Salary not set'}</p>
                        <p style="margin:8px 0 0 0; color: #475569; font-size:0.85rem;">Vacancies: ${j.vacancies || '0'}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    const parseAppDate = (dateString) => parseJobDate(dateString);
    const recentApps = [...apps].sort((a,b) => parseAppDate(b.dateApplied) - parseAppDate(a.dateApplied)).slice(0,6);
    const recentAppsEl = document.getElementById('admin-recent-applications-list');
    if(recentAppsEl) {
        if(recentApps.length === 0) {
            recentAppsEl.innerHTML = `<div style="color: var(--grey);">No recent applications found.</div>`;
        } else {
            recentAppsEl.innerHTML = recentApps.map(a => `
                <div style="padding:16px; border:1px solid #e2e8f0; border-radius:12px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; background:#ffffff;">
                    <div>
                        <h4 style="margin:0; font-size:1rem;">${a.candidateName || 'Unnamed Applicant'}</h4>
                        <p style="margin:6px 0 0 0; color: var(--grey); font-size:0.95rem;">${a.candidateEmail || 'No email'} • ${a.jobTitle || 'No job title'}</p>
                        <p style="margin:4px 0 0 0; color: var(--grey); font-size:0.85rem;">Applied: ${a.dateApplied || 'N/A'}</p>
                    </div>
                    <div style="text-align:right; min-width:160px;">
                        <span style="background:${a.status === 'Accepted' ? '#10b981' : a.status === 'Rejected' ? '#ef4444' : '#f59e0b'}; color:white; padding:6px 10px; border-radius:999px; font-size:0.85rem;">${a.status || 'Pending'}</span>
                    </div>
                </div>
            `).join('');
        }
    }
}

function logoutAdmin() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    location.reload();
}

function adminPerformSearch() {
    const q = document.getElementById('admin-search-input')?.value || '';
    // close mobile menu if open
    closeMobileMenu();
    // open admin dashboard and navigate to jobs view with query
    showView('admin-dashboard');
    adminNavigate('jobs');
    const jobSearch = document.getElementById('admin-job-search');
    if(jobSearch) {
        jobSearch.value = q;
        renderAdminJobsTable();
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

// --- DYNAMIC SEARCH AND VIEW INTERACTION ---
function resetJobSelectionAndRender() {
    selectedJobIndex = 0; 
    renderJobs();
}

function getInrSalaryRange(job) {
    const salaryMap = {
        'Web Development': '₹8L - ₹16L',
        'Software Engineering': '₹14L - ₹26L',
        'Data Analytics': '₹10L - ₹18L',
        'Data Science': '₹16L - ₹30L',
        'Cyber Security': '₹12L - ₹22L',
        'Cloud Computing': '₹14L - ₹25L',
        'DevOps': '₹12L - ₹22L',
        'UI/UX Design': '₹7L - ₹15L',
        'Mobile Development': '₹10L - ₹20L',
        'QA & Testing': '₹6L - ₹12L',
        'Technical Support': '₹5L - ₹10L',
        'Product Management': '₹14L - ₹28L',
        'Database Administration': '₹12L - ₹20L',
        'Networking': '₹10L - ₹18L',
        'AI/ML': '₹18L - ₹32L'
    };
    return salaryMap[job.cat] || '₹8L - ₹18L';
}

function getJobDescription(job) {
    return `As a ${job.title} at ${job.company}, you will own the delivery of high-impact solutions with a focus on reliability, maintainability, and scalability. This role requires strong collaboration across product, engineering and quality teams to define technical strategy, execute clean architecture, and deliver customer-facing outcomes in a fast-paced environment. You will build modern systems, document best practices, and continuously improve engineering standards.`;
}

function getJobRequirements(job) {
    const primarySkill = job.lang ? job.lang.split(',')[0] : job.cat;
    return [
        `5+ years of proven experience in ${job.cat.toLowerCase()} or a related discipline.`,
        `Hands-on expertise with ${primarySkill.trim()} and modern development practices.`,
        'Strong communication, cross-functional collaboration, and stakeholder management skills.',
        'Ability to work independently, drive ownership, and mentor junior team members.'
    ];
}

function getLocalizedJob(job) {
    if(!staticJobsDatabase.includes(job)) return job;
    const clone = { ...job };
    const cities = ['Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai', 'Gurgaon', 'Noida', 'Kolkata', 'Delhi', 'Ahmedabad'];
    const cityIndex = Math.abs(job.title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % cities.length;
    clone.loc = `${cities[cityIndex]}, India`;
    clone.salary = getInrSalaryRange(job);
    clone.address = `${clone.loc}`;
    clone.desc = getJobDescription(job);
    clone.req = getJobRequirements(job);
    return clone;
}

function renderJobs() {
    jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const allJobs = [...jobs, ...staticJobsDatabase];
    const searchVal = document.getElementById('job-search-input').value.toLowerCase();
    
    const filteredJobs = allJobs.filter(j => 
        j.title.toLowerCase().includes(searchVal) || 
        j.cat.toLowerCase().includes(searchVal) || 
        j.company.toLowerCase().includes(searchVal) ||
        j.lang.toLowerCase().includes(searchVal) ||
        j.mode.toLowerCase().includes(searchVal)
    );

    document.getElementById('jobs-count-text').innerText = `${filteredJobs.length} Jobs Found`;

    const targetContainer = document.getElementById('dynamic-job-view');
    if(filteredJobs.length === 0) {
        targetContainer.innerHTML = `<div class="ui-box" style="text-align:center; padding: 40px; color: var(--grey);">No matching jobs found.</div>`;
        return;
    }

    if(selectedJobIndex >= filteredJobs.length) selectedJobIndex = 0;
    const currentJob = getLocalizedJob(filteredJobs[selectedJobIndex]);

    let requirementsHTML = '';
    currentJob.req.forEach(r => { requirementsHTML += `<li><i class="fas fa-check-circle"></i> ${r}</li>`; });

    let miniJobsHTML = '';
    filteredJobs.forEach((job, index) => {
        if(index !== selectedJobIndex) {
            const displayedJob = getLocalizedJob(job);
            miniJobsHTML += `
                <div class="mini-job-card" onclick="viewJob(${index})">
                    <div class="mini-logo">${displayedJob.logo}</div>
                    <div>
                        <p class="mini-title">${displayedJob.title}</p>
                        <p class="mini-meta">${displayedJob.company} • ${displayedJob.loc}</p>
                        <p class="mini-salary">${displayedJob.salary} • <span style="font-weight:600;">${displayedJob.mode}</span></p>
                        <p class="mini-meta" style="margin-top:6px; font-size:0.75rem;">Posted: ${displayedJob.date}</p>
                    </div>
                </div>
            `;
        }
    });

    targetContainer.innerHTML = `
        <div class="job-detail-card ui-box">
            <div class="job-detail-main-header">
                <div class="company-logo-square">${currentJob.logo}</div>
                <div class="job-title-info">
                    <div class="job-tags-row">
                        <span class="badge-blue">${currentJob.type.toUpperCase()}</span>
                        <span class="badge-purple">${currentJob.cat.toUpperCase()}</span>
                        <span class="badge-orange"><i class="fas fa-laptop-house"></i> ${currentJob.mode.toUpperCase()}</span>
                    </div>
                    <h2 class="job-main-h2">${currentJob.title}</h2>
                    <p class="job-sub-info"><strong>${currentJob.company}</strong> • <i class="fas fa-map-marker-alt"></i> ${currentJob.loc}</p>
                    <p style="font-size:0.85rem; color:var(--grey); margin-top:5px;"><i class="fas fa-calendar-alt"></i> Posted: ${currentJob.date}</p>
                    <p style="font-size:0.85rem; color:var(--grey); margin-top:5px;"><i class="fas fa-building"></i> Address: ${currentJob.address}</p>
                </div>
                <div class="job-action-buttons">
                    <button class="btn-icon" type="button" id="save-job-btn" onclick="toggleSaveCurrentJob()" title="Save job"><i class="${isJobSaved(currentJob) ? 'fas' : 'far'} fa-bookmark"></i></button>
                    <button class="btn-primary" onclick="initiateJobApplicationProcess()">Apply Now</button>
                </div>
            </div>
            <div class="job-stats-grid">
                <div class="stat-item"><p class="stat-label">SALARY</p><p class="stat-value">${currentJob.salary}</p></div>
                <div class="stat-item"><p class="stat-label">EXP</p><p class="stat-value">${currentJob.exp}</p></div>
                <div class="stat-item"><p class="stat-label">STACK</p><p class="stat-value">${currentJob.lang}</p></div>
                <div class="stat-item"><p class="stat-label">VACANCIES</p><p class="stat-value">${currentJob.vacancies}</p></div>
            </div>
            <div class="job-description-split">
                <div class="desc-left">
                    <h3 class="detail-section-title">Job Description</h3>
                    <p class="detail-p">${currentJob.desc}</p>
                    <h3 class="detail-section-title">Requirements</h3>
                    <ul class="requirements-list">${requirementsHTML}</ul>
                </div>
                <div class="desc-right">
                    <h3 class="detail-section-title">Related</h3>
                    <div class="mini-job-list">${miniJobsHTML}</div>
                </div>
            </div>
        </div>
    `;
}

function viewJob(index) {
    selectedJobIndex = index;
    renderJobs();
    const jobSection = document.getElementById('job-listings');
    if (jobSection) {
        jobSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// --- APPLICATION PROCESS ---
function initiateJobApplicationProcess() {
    if(!currentUser || currentUser.role !== 'candidate') {
        triggerPopup("Please login as a Candidate first.", "error");
        return;
    }
    const allJobs = [...jobs, ...staticJobsDatabase];
    const searchVal = document.getElementById('job-search-input').value.toLowerCase();
    const filteredJobs = allJobs.filter(j => 
        j.title.toLowerCase().includes(searchVal) || 
        j.cat.toLowerCase().includes(searchVal) || 
        j.company.toLowerCase().includes(searchVal) ||
        j.lang.toLowerCase().includes(searchVal) ||
        j.mode.toLowerCase().includes(searchVal)
    );
    selectedJob = filteredJobs[selectedJobIndex] || allJobs[0];
    editingApplicationId = null;
    document.getElementById('actual-submit-application-btn').innerText = 'Apply for the Job';

    document.getElementById('target-applying-job-title').innerText = `Applying for: ${selectedJob.title} at ${selectedJob.company}`;
    showView('job-application-form-view');

    // Auto-fill application form from logged-in candidate profile when available
    if(currentUser && currentUser.role === 'candidate') {
        document.getElementById('app-fullname').value = currentUser.name || '';
        document.getElementById('app-email').value = currentUser.email || '';
        document.getElementById('app-phone').value = currentUser.phone || '';
        document.getElementById('app-dob').value = currentUser.dob || '';
        document.getElementById('app-address').value = currentUser.address || '';
        document.getElementById('app-city').value = currentUser.city || '';
        document.getElementById('app-state').value = currentUser.state || '';
        document.getElementById('app-country').value = currentUser.country || '';
        document.getElementById('app-pincode').value = currentUser.pincode || '';
        document.getElementById('app-title').value = currentUser.expTitle || '';

        // If candidate has resume uploaded in profile, enable submit button and preview button if supported
        if(currentUser.resumeData) {
            document.getElementById('resume-warning-msg').style.display = 'none';
            document.getElementById('actual-submit-application-btn').style.display = 'inline-block';
            toggleFormApplyButtonValidity();
        } else {
            toggleFormApplyButtonValidity();
        }
    } else {
        toggleFormApplyButtonValidity();
    }
}

function handleJobResumeChange(input) {
    const previewBtn = document.getElementById('app-resume-preview-btn');
    const infoEl = document.getElementById('app-resume-info');
    const file = input.files[0];

    if(currentResumePreviewUrl) {
        URL.revokeObjectURL(currentResumePreviewUrl);
        currentResumePreviewUrl = null;
    }

    if(file) {
        infoEl.innerText = file.name;
        if(file.type === 'application/pdf') {
            currentResumePreviewUrl = URL.createObjectURL(file);
            previewBtn.style.display = 'inline-block';
        } else {
            previewBtn.style.display = 'none';
        }
    } else {
        infoEl.innerText = currentUser && currentUser.resumeFileName ? currentUser.resumeFileName : '';
        previewBtn.style.display = currentUser && currentUser.resumeData && currentUser.resumeFileName && currentUser.resumeFileName.toLowerCase().endsWith('.pdf') ? 'inline-block' : 'none';
    }

    toggleFormApplyButtonValidity();
}

let activeResumeSrc = '';
let activeResumeFileName = '';

function openPreviewInNewTab() {
    if (!activeResumeSrc) {
        triggerPopup('No active resume to open.', 'error');
        return;
    }
    let url = activeResumeSrc;
    if (url.startsWith('data:application/pdf') && url.includes('base64,')) {
        url = base64ToBlobUrl(url);
    }
    window.open(url, '_blank');
}

function downloadPreviewResume() {
    if (!activeResumeSrc) {
        triggerPopup('No active resume to download.', 'error');
        return;
    }
    const link = document.createElement('a');
    let url = activeResumeSrc;
    if (url.startsWith('data:application/pdf') && url.includes('base64,')) {
        url = base64ToBlobUrl(url);
    }
    link.href = url;
    link.download = activeResumeFileName || 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function base64ToBlobUrl(base64Data, contentType = 'application/pdf') {
    if (!base64Data) return '';
    try {
        const base64Str = base64Data.split(',')[1] || base64Data;
        const byteCharacters = atob(base64Str);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error("Base64 to Blob conversion error", e);
        return base64Data;
    }
}

function isPdfResume(resumeData, fileName) {
    if(!resumeData || typeof resumeData !== 'string') return false;
    const fn = (fileName || '').toLowerCase();
    if(fn.endsWith('.pdf')) return true;
    if(resumeData.startsWith('data:application/pdf')) return true;
    if(resumeData.includes('base64,') && resumeData.length > 200) {
        if(!fn || fn.endsWith('.pdf') || fn === 'resume.pdf') return true;
    }
    return false;
}

function prepareResumeIframeSrc(resumeData) {
    if(!resumeData) return '';
    if(resumeData.startsWith('blob:')) return resumeData;
    if(resumeData.includes('base64,')) {
        let mime = 'application/pdf';
        const match = resumeData.match(/^data:([^;]+);/);
        if(match) {
            mime = match[1] === 'application/octet-stream' ? 'application/pdf' : match[1];
        }
        return base64ToBlobUrl(resumeData, mime);
    }
    return resumeData;
}

function getApplicantResume(appOrId) {
    applications = JSON.parse(localStorage.getItem('applications')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let app = null;
    if(typeof appOrId === 'object' && appOrId) {
        app = appOrId;
    } else if(appOrId) {
        app = applications.find(a => a.id === appOrId || normalizeText(a.candidateEmail) === normalizeText(appOrId) || String(a.appliedAt) === String(appOrId));
    }
    if(app?.resumeData) {
        return { resumeData: app.resumeData, resumeFileName: app.resumeFileName || 'resume.pdf', app };
    }
    const email = app?.candidateEmail || (typeof appOrId === 'string' && appOrId.includes('@') ? appOrId : null);
    if(email) {
        const candidate = users.find(u => u.role === 'candidate' && normalizeText(u.email) === normalizeText(email));
        if(candidate?.resumeData) {
            return { resumeData: candidate.resumeData, resumeFileName: candidate.resumeFileName || 'resume.pdf', app, candidate };
        }
    }
    return { resumeData: '', resumeFileName: '', app };
}

function mountEmployerInlineResume(appOrId) {
    const info = getApplicantResume(appOrId);
    const wrap = document.getElementById('emp-inline-resume-wrap');
    const iframe = document.getElementById('emp-inline-resume-iframe');
    const msg = document.getElementById('emp-inline-resume-msg');
    if(!wrap) return;
    if(!info.resumeData) {
        if(msg) msg.textContent = 'No resume uploaded for this candidate.';
        wrap.style.display = 'block';
        if(iframe) iframe.style.display = 'none';
        return;
    }
    if(isPdfResume(info.resumeData, info.resumeFileName)) {
        if(msg) msg.textContent = info.resumeFileName || 'Resume';
        if(iframe) {
            iframe.style.display = 'block';
            iframe.src = prepareResumeIframeSrc(info.resumeData);
        }
        wrap.style.display = 'block';
    } else {
        if(msg) msg.textContent = (info.resumeFileName || 'Resume') + ' — use Download to open this file.';
        if(iframe) iframe.style.display = 'none';
        wrap.style.display = 'block';
    }
}

function previewApplicationResume(appId = null) {
    if(!appId && editingApplicationId) {
        appId = editingApplicationId;
    }
    const modal = document.getElementById('resume-preview-modal');
    const iframe = document.getElementById('resume-preview-iframe');
    if(!modal || !iframe) {
        triggerPopup('Resume preview is not available.', 'error');
        return;
    }
    let resumeSrc = '';
    let fileName = '';

    if(!appId && editingApplicationId) {
        appId = editingApplicationId;
    }

    if(appId) {
        const info = getApplicantResume(appId);
        if(!info.resumeData) {
            triggerPopup('Resume not found for this application. Ask the candidate to upload a PDF on their profile or application.', 'error');
            return;
        }
        resumeSrc = info.resumeData;
        fileName = info.resumeFileName || 'resume.pdf';
    } else {
        const resumeInput = document.getElementById('app-resume-file');
        const file = resumeInput?.files ? resumeInput.files[0] : null;
        if(file && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
            if(currentResumePreviewUrl) URL.revokeObjectURL(currentResumePreviewUrl);
            currentResumePreviewUrl = URL.createObjectURL(file);
            resumeSrc = currentResumePreviewUrl;
            fileName = file.name;
        } else if(currentUser?.resumeData) {
            resumeSrc = currentUser.resumeData;
            fileName = currentUser.resumeFileName || 'resume.pdf';
        }
    }

    if(!resumeSrc) {
        triggerPopup('No resume available for preview.', 'error');
        return;
    }

    if(!isPdfResume(resumeSrc, fileName)) {
        if(appId) {
            downloadResumeForApplicant(appId);
            triggerPopup('This file is not a PDF. It was downloaded instead.', 'success');
            return;
        }
        triggerPopup('Please upload a PDF resume for preview.', 'error');
        return;
    }

    currentResumePreviewUrl = prepareResumeIframeSrc(resumeSrc);
    iframe.src = currentResumePreviewUrl;
    activeResumeSrc = currentResumePreviewUrl;
    activeResumeFileName = fileName;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeResumePreviewModal() {
    const modal = document.getElementById('resume-preview-modal');
    const iframe = document.getElementById('resume-preview-iframe');
    modal.style.display = 'none';
    document.body.style.overflow = '';
    iframe.src = '';

    if(currentResumePreviewUrl) {
        URL.revokeObjectURL(currentResumePreviewUrl);
        currentResumePreviewUrl = null;
    }
}

function toggleFormApplyButtonValidity() {
    const resumeInput = document.getElementById('app-resume-file');
    const hasLocalFile = resumeInput && resumeInput.files && resumeInput.files.length > 0;
    const hasProfileResume = currentUser && currentUser.resumeData;
    let ok = hasLocalFile || hasProfileResume;
    const previewBtn = document.getElementById('app-resume-preview-btn');
    const infoEl = document.getElementById('app-resume-info');
    let previewVisible = false;
    let previewLabel = '';

    if(hasLocalFile) {
        const file = resumeInput.files[0];
        previewVisible = file.type === 'application/pdf';
        previewLabel = file.name;
    } else if(editingApplicationId) {
        const apps = JSON.parse(localStorage.getItem('applications')) || [];
        const app = apps.find(a => a.id === editingApplicationId || `${a.candidateEmail}::${a.jobTitle}::${a.dateApplied}` === editingApplicationId);
        if(app && app.resumeData) {
            ok = true;
            const isPdf = isPdfResume(app.resumeData, app.resumeFileName);
            previewVisible = isPdf;
            previewLabel = app.resumeFileName || '';
        }
    } else if(hasProfileResume) {
        const isPdf = currentUser.resumeFileName && currentUser.resumeFileName.toLowerCase().endsWith('.pdf');
        previewVisible = isPdf;
        previewLabel = currentUser.resumeFileName || '';
    }

    document.getElementById('resume-warning-msg').style.display = ok ? 'none' : 'block';
    document.getElementById('actual-submit-application-btn').style.display = ok ? 'inline-block' : 'none';
    previewBtn.style.display = previewVisible ? 'inline-block' : 'none';
    infoEl.innerText = previewLabel;
}

function handleJobApplicationSubmit(event) {
    event.preventDefault();
    const targetJob = selectedJob || [...jobs, ...staticJobsDatabase].find((_, index) => index === selectedJobIndex) || {...jobs[0], ...staticJobsDatabase[0]};
    const resumeInput = document.getElementById('app-resume-file');

    let candidateEmailVal = (currentUser && currentUser.role === 'candidate') ? (currentUser.email || '') : document.getElementById('app-email').value.trim();
    candidateEmailVal = candidateEmailVal.trim().toLowerCase();
    const candidateNameVal = (currentUser && currentUser.role === 'candidate') ? (currentUser.name || currentUser.email || '') : document.getElementById('app-fullname').value.trim();
    const candidatePhoneVal = (currentUser && currentUser.role === 'candidate') ? (currentUser.phone || '') : document.getElementById('app-phone').value.trim();
    const candidatePincodeVal = document.getElementById('app-pincode').value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!candidateNameVal) { triggerPopup('Please enter your full name.', 'error'); return; }
    if(!candidateEmailVal || !emailRegex.test(candidateEmailVal)) { triggerPopup('Please enter a valid email address.', 'error'); return; }
    if(!candidatePhoneVal || candidatePhoneVal.replace(/\D/g,'').length !== 10) { triggerPopup('Please enter a valid 10-digit phone number.', 'error'); return; }
    if(!candidatePincodeVal || !/^\d{6}$/.test(candidatePincodeVal)) { triggerPopup('Please enter a valid 6-digit pincode.', 'error'); return; }
    if(!(resumeInput.files && resumeInput.files.length) && !(currentUser && currentUser.resumeData)) { triggerPopup('Please upload your resume to apply.', 'error'); return; }

    const createApplication = (resumeData) => {
        const applicationPayload = {
            id: editingApplicationId ? editingApplicationId : 'APP-' + Date.now(),
            jobId: targetJob.id || `${targetJob.title}|${targetJob.company}|${targetJob.date}`,
            jobTitle: targetJob.title,
            company: targetJob.company,
            employerCompany: targetJob.company,
            candidateName: candidateNameVal,
            candidateEmail: candidateEmailVal,
            candidatePhone: candidatePhoneVal,
            candidateDOB: document.getElementById('app-dob').value,
            candidateGender: document.getElementById('app-gender').value,
            candidateAddress: document.getElementById('app-address').value.trim(),
            candidateCity: document.getElementById('app-city').value.trim(),
            candidateState: document.getElementById('app-state').value.trim(),
            candidateCountry: document.getElementById('app-country').value.trim(),
            candidatePincode: document.getElementById('app-pincode').value.trim(),
            candidatePhotoName: document.getElementById('app-photo').files[0]?.name || '',
            currentJobTitle: document.getElementById('app-title').value.trim(),
            totalExperience: document.getElementById('app-exp').value,
            currentCompany: document.getElementById('app-curr-company').value.trim(),
            currentSalary: document.getElementById('app-curr-salary').value.trim(),
            expectedSalary: document.getElementById('app-exp-salary').value.trim(),
            noticePeriod: document.getElementById('app-notice').value.trim(),
            preferredLocation: document.getElementById('app-pref-loc').value.trim(),
            employmentType: document.getElementById('app-emptype').value,
            highestQualification: document.getElementById('app-qual').value.trim(),
            degreeName: document.getElementById('app-degree').value.trim(),
            specialization: document.getElementById('app-spec').value.trim(),
            university: document.getElementById('app-univ').value.trim(),
            educationStatus: document.getElementById('app-status').value,
            score: document.getElementById('app-score').value.trim(),
            technicalSkills: document.getElementById('app-techskills').value.trim(),
            softSkills: document.getElementById('app-softskills').value.trim(),
            certifications: document.getElementById('app-certs').value.trim(),
            languagesKnown: document.getElementById('app-langsknown').value.trim(),
            resumeFileName: resumeInput.files[0]?.name || (currentUser && currentUser.resumeFileName) || '',
            resumeData: resumeData || (currentUser && currentUser.resumeData) || '',
            coverLetter: document.getElementById('app-coverletter').value.trim(),
            portfolioURL: document.getElementById('app-portfolio').value.trim(),
            linkedinURL: document.getElementById('app-linkedin').value.trim(),
            githubURL: document.getElementById('app-github').value.trim(),
            workExpCompany: document.getElementById('app-exp-comp').value.trim(),
            workExpTitle: document.getElementById('app-exp-title').value.trim(),
            workExpStart: document.getElementById('app-exp-start').value,
            workExpEnd: document.getElementById('app-exp-end').value,
            workExpResponsibilities: document.getElementById('app-exp-resp').value.trim(),
            workExpAchievements: document.getElementById('app-exp-achieve').value.trim(),
            dateApplied: editingApplicationId ? applications.find(a => a.id === editingApplicationId)?.dateApplied || new Date().toLocaleDateString() : new Date().toLocaleDateString(),
            appliedAt: editingApplicationId ? applications.find(a => a.id === editingApplicationId)?.appliedAt || Date.now() : Date.now(),
            status: editingApplicationId ? applications.find(a => a.id === editingApplicationId)?.status || 'Applied' : 'Applied'
        };

        if(editingApplicationId) {
            const idx = applications.findIndex(a => a.id === editingApplicationId);
            if(idx >= 0) {
                applications[idx] = applicationPayload;
            } else {
                applications.push(applicationPayload);
            }
            editingApplicationId = null;
            localStorage.setItem('applications', JSON.stringify(applications));
            triggerPopup(`Updated application for ${targetJob.title} successfully!`, "success", () => {
                selectedJob = null;
                showView('my-applications');
            });
            return;
        }

        applications.push(applicationPayload);
        localStorage.setItem('applications', JSON.stringify(applications));

        triggerPopup(`Applied for ${targetJob.title} successfully!`, "success", () => {
            selectedJob = null;
            showView('my-applications');
        });
    };

    if(resumeInput.files && resumeInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => createApplication(reader.result);
        reader.onerror = () => triggerPopup('Unable to read resume file. Please try again.', 'error');
        reader.readAsDataURL(resumeInput.files[0]);
    } else {
        createApplication(currentUser && currentUser.resumeData ? currentUser.resumeData : '');
    }
}

function renderMyApplicationsView() {
    applications = JSON.parse(localStorage.getItem('applications')) || [];
    const container = document.getElementById('my-applications-list-wrapper');
    const candidateApps = applications.filter(app => normalizeText(app.candidateEmail) === normalizeText(currentUser.email));

    if(candidateApps.length === 0) {
        container.innerHTML = `<div class="ui-box">No applications submitted yet.</div>`;
        return;
    }

    let listHTML = '<div style="display:grid; gap:18px;">';
    candidateApps.forEach(app => {
        const appId = app.id || `${app.candidateEmail}::${app.jobTitle}::${app.dateApplied}`;
        listHTML += `
            <div class="app-status-card" style="flex-direction:column; align-items:flex-start; gap:16px; padding:22px;">
                <div style="display:flex; justify-content:space-between; width:100%; flex-wrap:wrap; gap:10px;">
                    <div>
                        <h3 style="margin:0; font-size:1.1rem;">${app.jobTitle}</h3>
                        <p style="margin:6px 0 0 0; color:var(--primary); font-weight:700;">${app.company}</p>
                    </div>
                    <span class="${getStatusBadgeClass(app.status)}">${app.status}</span>
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:14px; width:100%;">
                    <div><strong>Date Applied</strong><br><span style="color:#475569;">${app.dateApplied}</span></div>
                    <div><strong>Phone</strong><br><span style="color:#475569;">${app.candidatePhone || 'N/A'}</span></div>
                    <div><strong>Education</strong><br><span style="color:#475569;">${app.degreeName || app.highestQualification || 'N/A'}</span></div>
                    <div><strong>Experience</strong><br><span style="color:#475569;">${app.totalExperience || 'N/A'} yrs</span></div>
                </div>
                <div style="width:100%; background:#f8fafc; padding:14px; border-radius:10px; color:#475569;">
                    <p style="margin:0 0 6px 0;"><strong>Cover Letter</strong></p>
                    <p style="margin:0; font-size:0.95rem; line-height:1.6;">${app.coverLetter ? app.coverLetter : 'No cover letter provided.'}</p>
                </div>
                <div style="display:flex; justify-content:flex-end; width:100%; gap:10px; flex-wrap:wrap;">
                    <button class="btn-secondary" type="button" onclick="editMyApplication('${escapeHtml(appId)}')">Edit</button>
                    <button class="btn-secondary" type="button" onclick="requestWithdrawApplication('${escapeHtml(appId)}')">Withdraw</button>
                </div>
            </div>
        `;
    });
    listHTML += '</div>';
    container.innerHTML = listHTML;
}

function editMyApplication(appId) {
    applications = JSON.parse(localStorage.getItem('applications')) || [];
    const app = applications.find(a => a.id === appId || `${a.candidateEmail}::${a.jobTitle}::${a.dateApplied}` === appId);
    if(!app) {
        triggerPopup('Unable to find the selected application.', 'error');
        return;
    }

    editingApplicationId = app.id || appId;
    selectedJob = [...jobs, ...staticJobsDatabase].find(j => j.id === app.jobId || (j.title === app.jobTitle && j.company === app.company)) || { title: app.jobTitle, company: app.company, id: app.jobId };
    document.getElementById('target-applying-job-title').innerText = `Editing application: ${app.jobTitle} at ${app.company}`;
    document.getElementById('app-fullname').value = app.candidateName || '';
    document.getElementById('app-email').value = app.candidateEmail || '';
    document.getElementById('app-phone').value = app.candidatePhone || '';
    document.getElementById('app-dob').value = app.candidateDOB || '';
    document.getElementById('app-gender').value = app.candidateGender || '';
    document.getElementById('app-address').value = app.candidateAddress || '';
    document.getElementById('app-city').value = app.candidateCity || '';
    document.getElementById('app-state').value = app.candidateState || '';
    document.getElementById('app-country').value = app.candidateCountry || '';
    document.getElementById('app-pincode').value = app.candidatePincode || '';
    document.getElementById('app-title').value = app.currentJobTitle || '';
    document.getElementById('app-exp').value = app.totalExperience || '';
    document.getElementById('app-curr-company').value = app.currentCompany || '';
    document.getElementById('app-curr-salary').value = app.currentSalary || '';
    document.getElementById('app-exp-salary').value = app.expectedSalary || '';
    document.getElementById('app-notice').value = app.noticePeriod || '';
    document.getElementById('app-pref-loc').value = app.preferredLocation || '';
    document.getElementById('app-emptype').value = app.employmentType || '';
    document.getElementById('app-qual').value = app.highestQualification || '';
    document.getElementById('app-degree').value = app.degreeName || '';
    document.getElementById('app-spec').value = app.specialization || '';
    document.getElementById('app-univ').value = app.university || '';
    document.getElementById('app-status').value = app.educationStatus || '';
    document.getElementById('app-score').value = app.score || '';
    document.getElementById('app-techskills').value = app.technicalSkills || '';
    document.getElementById('app-softskills').value = app.softSkills || '';
    document.getElementById('app-certs').value = app.certifications || '';
    document.getElementById('app-langsknown').value = app.languagesKnown || '';
    document.getElementById('app-coverletter').value = app.coverLetter || '';
    document.getElementById('app-portfolio').value = app.portfolioURL || '';
    document.getElementById('app-linkedin').value = app.linkedinURL || '';
    document.getElementById('app-github').value = app.githubURL || '';
    document.getElementById('app-exp-comp').value = app.workExpCompany || '';
    document.getElementById('app-exp-title').value = app.workExpTitle || '';
    document.getElementById('app-exp-start').value = app.workExpStart || '';
    document.getElementById('app-exp-end').value = app.workExpEnd || '';
    document.getElementById('app-exp-resp').value = app.workExpResponsibilities || '';
    document.getElementById('app-exp-achieve').value = app.workExpAchievements || '';
    document.getElementById('actual-submit-application-btn').innerText = 'Update Application';
    document.getElementById('resume-warning-msg').style.display = app.resumeData ? 'none' : 'block';
    showView('job-application-form-view');
    toggleFormApplyButtonValidity();
}

function saveCurrentUser(previousEmail = null) {
    console.log('DEBUG: saveCurrentUser called. previousEmail=', previousEmail);
    console.log('DEBUG: currentUser before save:', JSON.parse(JSON.stringify(currentUser)));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    let users = JSON.parse(localStorage.getItem('users')) || [];
    console.log('DEBUG: users before update (count):', users.length);
    const searchEmail = normalizeText(previousEmail || currentUser.email);
    const idx = users.findIndex(u => normalizeText(u.email) === searchEmail && u.role === currentUser.role);
    if(idx >= 0) {
        users[idx] = currentUser;
    } else {
        users.push(currentUser);
    }
    localStorage.setItem('users', JSON.stringify(users));
    console.log('DEBUG: users after update (count):', users.length);
}

function calculateProfileCompletion(user) {
    if(!user) return 0;
    let keys;
    if(user.role === 'employer' || user.role === 'admin') {
        keys = ['company', 'industry', 'companySize', 'website', 'headquarters', 'description', 'hrName', 'hrEmail', 'hrPhone'];
    } else {
        keys = ['name', 'email', 'phone', 'headline', 'location', 'bio', 'resumeData', 'techskills', 'degree', 'college', 'prefRole'];
        const hasLink = user.linkedin || user.portfolio || user.github;
        const filled = keys.reduce((sum, key) => sum + (user[key] ? 1 : 0), 0) + (hasLink ? 1 : 0);
        return Math.min(100, Math.round((filled / (keys.length + 1)) * 100));
    }
    const filled = keys.reduce((sum, key) => sum + (user[key] ? 1 : 0), 0);
    return Math.min(100, Math.round((filled / keys.length) * 100));
}

function updateProfileCompletionUI() {
    if(!currentUser) return;
    const pct = calculateProfileCompletion(currentUser);
    const text = document.getElementById('profile-completion-text');
    const bar = document.getElementById('profile-completion-bar');
    if(text) text.innerText = `${pct}% completed profile`;
    if(bar) bar.style.width = `${pct}%`;
}

function getFilteredJobsList() {
    jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const allJobs = [...jobs, ...staticJobsDatabase];
    const searchVal = (document.getElementById('job-search-input')?.value || '').toLowerCase();
    return allJobs.filter(j =>
        j.title.toLowerCase().includes(searchVal) ||
        j.cat.toLowerCase().includes(searchVal) ||
        j.company.toLowerCase().includes(searchVal) ||
        j.lang.toLowerCase().includes(searchVal) ||
        j.mode.toLowerCase().includes(searchVal)
    );
}

function getJobSaveKey(job) {
    return `${job.title}::${job.company}`;
}

function normalizeSavedJob(entry) {
    if(typeof entry === 'string') {
        const parts = entry.split('::');
        return { title: parts[0] || entry, company: parts[1] || '', loc: '', salary: '', type: '', mode: '', logo: '', date: '' };
    }
    return entry;
}

function isJobSaved(job) {
    if(!currentUser?.savedJobs?.length) return false;
    const key = getJobSaveKey(job);
    return currentUser.savedJobs.some(s => getJobSaveKey(normalizeSavedJob(s)) === key);
}

function toggleSaveCurrentJob() {
    if(!currentUser || currentUser.role !== 'candidate') {
        triggerPopup('Please login as a Candidate to save jobs.', 'error');
        return;
    }
    const filtered = getFilteredJobsList();
    if(!filtered.length) return;
    const job = filtered[selectedJobIndex] || filtered[0];
    if(!currentUser.savedJobs) currentUser.savedJobs = [];
    const key = getJobSaveKey(job);
    const idx = currentUser.savedJobs.findIndex(s => getJobSaveKey(normalizeSavedJob(s)) === key);
    if(idx >= 0) {
        currentUser.savedJobs.splice(idx, 1);
        triggerPopup('Job removed from saved list.', 'success');
    } else {
        currentUser.savedJobs.push({
            title: job.title,
            company: job.company,
            loc: job.loc,
            salary: job.salary,
            type: job.type,
            mode: job.mode,
            logo: job.logo,
            date: job.date
        });
        triggerPopup('Job saved successfully!', 'success');
    }
    saveCurrentUser();
    renderJobs();
    if(document.getElementById('saved-jobs-page')?.style.display === 'block') renderSavedJobsPage();
}

function removeSavedJobAt(index) {
    if(!currentUser?.savedJobs || index < 0 || index >= currentUser.savedJobs.length) return;
    currentUser.savedJobs.splice(index, 1);
    saveCurrentUser();
    renderSavedJobsPage();
}

function renderSavedJobsPage() {
    if(!currentUser || currentUser.role !== 'candidate') {
        showView('home');
        return;
    }
    const container = document.getElementById('saved-jobs-list');
    if(!container) return;
    if(!currentUser.savedJobs?.length) {
        container.innerHTML = '<p style="color:var(--grey);">No saved jobs yet. Bookmark jobs from Find Jobs.</p>';
        return;
    }
    container.innerHTML = currentUser.savedJobs.map((s, index) => {
        const job = normalizeSavedJob(s);
        return `
            <div class="saved-job-card">
                <div>
                    <h3 style="font-weight:700; margin:0 0 6px 0;">${job.title}</h3>
                    <p style="color:var(--primary); margin:0;">${job.company}</p>
                    <p style="color:var(--grey); font-size:0.85rem; margin:6px 0 0 0;">${job.loc || ''} ${job.salary ? '• ' + job.salary : ''}</p>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="btn-secondary" type="button" onclick="showView('job-listings')">Browse jobs</button>
                    <button class="btn-secondary" type="button" onclick="removeSavedJobAt(${index})">Remove</button>
                </div>
            </div>
        `;
    }).join('');
}

function settingsPageBack() {
    if(!currentUser) { showView('home'); return; }
    if(currentUser.role === 'employer') showView('dashboard');
    else showView('job-listings');
}

function closeApplicationsView() {
    if(!currentUser) { showView('home'); return; }
    if(currentUser.role === 'employer') showView('dashboard');
    else showView('job-listings');
}

function setFieldValue(id, value) {
    const el = document.getElementById(id);
    if(el) el.value = value ?? '';
}

function setCheckboxValue(id, checked) {
    const el = document.getElementById(id);
    if(el) el.checked = !!checked;
}

function handleProfileResumeChange(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        currentUser.resumeData = reader.result;
        currentUser.resumeFileName = file.name;
        saveCurrentUser();
        renderProfilePage();
    };
    reader.readAsDataURL(file);
}

function handleProfileResumeExtraChange(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        currentUser.resumeExtraData = reader.result;
        currentUser.resumeExtraFileName = file.name;
        saveCurrentUser();
        const span = document.getElementById('prof-resume-extra-filename');
        if(span) span.innerText = file.name;
        updateProfileCompletionUI();
    };
    reader.readAsDataURL(file);
}

function handleProfilePhotoChange(input) {
    const file = input.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        currentUser.photoData = reader.result;
        currentUser.photoFileName = file.name;
        saveCurrentUser();
        updateProfileCompletionUI();
    };
    reader.readAsDataURL(file);
}

function downloadProfileResume() {
    if(!currentUser || !currentUser.resumeData) {
        triggerPopup('No resume uploaded yet.', 'error');
        return;
    }
    const link = document.createElement('a');
    link.href = currentUser.resumeData;
    link.download = currentUser.resumeFileName || 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadResumeForApplicant(appIdOrEmail) {
    const info = getApplicantResume(appIdOrEmail);
    const resumeData = info.resumeData;
    const resumeFileName = info.resumeFileName;

    if(!resumeData) {
        triggerPopup('Resume not available for this applicant.', 'error');
        return;
    }
    const link = document.createElement('a');
    link.href = resumeData;
    link.download = resumeFileName || 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveProfileData() {
    if(!currentUser) return;
    console.log('DEBUG: saveProfileData called for', currentUser?.email, currentUser?.role);
    let previousEmail = null;
    if(currentUser.role === 'candidate') {
        previousEmail = currentUser.email;
        // Name, email, and phone are not editable and should not be updated
        currentUser.headline = document.getElementById('prof-headline').value.trim();
        currentUser.location = document.getElementById('prof-location').value.trim();
        currentUser.linkedin = document.getElementById('prof-linkedin').value.trim();
        currentUser.portfolio = document.getElementById('prof-portfolio').value.trim();
        currentUser.github = document.getElementById('prof-github').value.trim();
        currentUser.bio = document.getElementById('prof-bio').value.trim();
        currentUser.expOverview = document.getElementById('prof-exp-overview').value.trim();
        currentUser.aboutSkills = document.getElementById('prof-about-skills').value.trim();
        currentUser.careerGoals = document.getElementById('prof-career-goals').value.trim();
        currentUser.degree = document.getElementById('prof-degree').value.trim();
        currentUser.college = document.getElementById('prof-college').value.trim();
        currentUser.specialization = document.getElementById('prof-specialization').value.trim();
        currentUser.score = document.getElementById('prof-score').value.trim();
        currentUser.passyear = document.getElementById('prof-passyear').value.trim();
        currentUser.expCompany = document.getElementById('prof-exp-company').value.trim();
        currentUser.expTitle = document.getElementById('prof-exp-title').value.trim();
        currentUser.expDuration = document.getElementById('prof-exp-duration').value.trim();
        currentUser.expResponsibilities = document.getElementById('prof-exp-resp').value.trim();
        currentUser.expAchievements = document.getElementById('prof-exp-achievements').value.trim();
        currentUser.techskills = document.getElementById('prof-techskills').value.trim();
        currentUser.softskills = document.getElementById('prof-softskills').value.trim();
        currentUser.skillTags = document.getElementById('prof-skill-tags').value.trim();
        currentUser.certName = document.getElementById('prof-cert-name').value.trim();
        currentUser.certOrg = document.getElementById('prof-cert-org').value.trim();
        currentUser.certDate = document.getElementById('prof-cert-date').value;
        currentUser.projectTitle = document.getElementById('prof-project-title').value.trim();
        currentUser.projectDesc = document.getElementById('prof-project-desc').value.trim();
        currentUser.projectTech = document.getElementById('prof-project-tech').value.trim();
        currentUser.projectLink = document.getElementById('prof-project-link').value.trim();
        currentUser.prefRole = document.getElementById('prof-pref-role').value.trim();
        currentUser.prefLocation = document.getElementById('prof-pref-loc').value.trim();
        currentUser.prefSalary = document.getElementById('prof-pref-salary').value.trim();
        currentUser.prefEmployment = document.getElementById('prof-pref-emptype').value;
        currentUser.socialLinkedin = document.getElementById('prof-social-linkedin').value.trim();
        currentUser.socialGithub = document.getElementById('prof-social-github').value.trim();
        currentUser.socialPortfolio = document.getElementById('prof-social-portfolio').value.trim();
        currentUser.socialBehance = document.getElementById('prof-social-behance').value.trim();
    } else if(currentUser.role === 'admin') {
        previousEmail = currentUser.email;
        currentUser.email = document.getElementById('emp-hr-email').value.trim();
        currentUser.hrEmail = currentUser.email;
        currentUser.company = document.getElementById('emp-company-name').value.trim();
        currentUser.logoLetter = document.getElementById('emp-logo-letter').value.trim();
        currentUser.industry = document.getElementById('emp-industry').value.trim();
        currentUser.companySize = document.getElementById('emp-size').value.trim();
        currentUser.website = document.getElementById('emp-website').value.trim();
        currentUser.founded = document.getElementById('emp-founded').value.trim();
        currentUser.headquarters = document.getElementById('emp-headquarters').value.trim();
        currentUser.description = document.getElementById('emp-description').value.trim();
        currentUser.hrName = document.getElementById('emp-hr-name').value.trim();
        currentUser.hrPhone = document.getElementById('emp-hr-phone').value.trim();
    } else {
        currentUser.company = document.getElementById('emp-company-name').value.trim();
        currentUser.logoLetter = document.getElementById('emp-logo-letter').value.trim();
        currentUser.industry = document.getElementById('emp-industry').value.trim();
        currentUser.companySize = document.getElementById('emp-size').value.trim();
        currentUser.website = document.getElementById('emp-website').value.trim();
        currentUser.founded = document.getElementById('emp-founded').value.trim();
        currentUser.headquarters = document.getElementById('emp-headquarters').value.trim();
        currentUser.description = document.getElementById('emp-description').value.trim();
        currentUser.hrName = document.getElementById('emp-hr-name').value.trim();
        currentUser.hrEmail = document.getElementById('emp-hr-email').value.trim();
        currentUser.hrPhone = document.getElementById('emp-hr-phone').value.trim();
    }
    if(currentUser.role === 'candidate' || currentUser.role === 'admin') {
        saveCurrentUser(previousEmail);
    } else {
        saveCurrentUser();
    }
    triggerPopup('Profile updated successfully!', 'success', renderProfilePage);
}

function saveProfilePassword() {
    if(!currentUser) return;
    const oldPass = document.getElementById('settings-old-pass').value.trim();
    const newPass = document.getElementById('settings-new-pass').value.trim();
    const confirmPass = document.getElementById('settings-confirm-pass').value.trim();
    console.log('DEBUG: saveProfilePassword called. currentUser.pass=', currentUser.pass, 'provided oldPass=', oldPass);
    // Allow fallback for the built-in admin credential when currentUser.pass may be missing
    const adminDefaultPass = 'CarrerNestAdmin@123';
    const oldPassIsValid = (typeof currentUser.pass !== 'undefined' && oldPass === currentUser.pass) || (currentUser.role === 'admin' && oldPass === adminDefaultPass);
    if(!oldPassIsValid) {
        triggerPopup('Current password is incorrect.', 'error');
        return;
    }
    if(newPass.length < 8 || newPass !== confirmPass) {
        triggerPopup('New password must match and be at least 8 characters.', 'error');
        return;
    }
    currentUser.pass = newPass;
    saveCurrentUser();
    document.getElementById('settings-old-pass').value = '';
    document.getElementById('settings-new-pass').value = '';
    document.getElementById('settings-confirm-pass').value = '';
    triggerPopup('Password updated successfully.', 'success');
}

function deleteAccount() {
    if(!currentUser) return;
    // Use confirmation modal instead of immediate deletion
    pendingDeleteAction = { type: 'selfDelete', email: currentUser.email };
    document.getElementById('admin-delete-confirm-msg').innerText = 'Do you really want to delete your account? This action cannot be undone.';
    document.getElementById('admin-delete-confirm-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function saveEmployerAccountSettings() {
    if(!currentUser || currentUser.role !== 'employer') return;
    currentUser.notifEmail = document.getElementById('emp-notif-email').checked;
    currentUser.notifSMS = document.getElementById('emp-notif-sms').checked;
    currentUser.emailPrefNews = document.getElementById('emp-email-pref-news').checked;
    currentUser.emailPrefHiring = document.getElementById('emp-email-pref-hiring').checked;
    currentUser.security2FA = document.getElementById('emp-security-2fa').checked;
    currentUser.securityLoginAlerts = document.getElementById('emp-security-login-alerts').checked;
    saveCurrentUser();
    triggerPopup('Settings saved.', 'success');
}

function saveCandidateAccountSettings() {
    if(!currentUser || currentUser.role !== 'candidate') return;
    currentUser.notifEmail = document.getElementById('cand-notif-email').checked;
    currentUser.notifSMS = document.getElementById('cand-notif-sms').checked;
    currentUser.emailPrefNews = document.getElementById('cand-email-pref-news').checked;
    currentUser.emailPrefJobs = document.getElementById('cand-email-pref-jobs').checked;
    currentUser.security2FA = document.getElementById('cand-security-2fa').checked;
    currentUser.securityLoginAlerts = document.getElementById('cand-security-login-alerts').checked;
    saveCurrentUser();
    triggerPopup('Settings saved.', 'success');
}

function saveAccountSettings() {
    if(!currentUser) return;
    if(currentUser.role === 'employer') saveEmployerAccountSettings();
    else saveCandidateAccountSettings();
}

function renderSettingsPage() {
    if(!currentUser) {
        showView('home');
        return;
    }
    const empPanel = document.getElementById('employer-settings-panel');
    const candPanel = document.getElementById('candidate-settings-panel');
    if(currentUser.role === 'employer') {
        if(empPanel) empPanel.style.display = 'block';
        if(candPanel) candPanel.style.display = 'none';
        setCheckboxValue('emp-notif-email', currentUser.notifEmail);
        setCheckboxValue('emp-notif-sms', currentUser.notifSMS);
        setCheckboxValue('emp-email-pref-news', currentUser.emailPrefNews);
        setCheckboxValue('emp-email-pref-hiring', currentUser.emailPrefHiring);
        setCheckboxValue('emp-security-2fa', currentUser.security2FA);
        setCheckboxValue('emp-security-login-alerts', currentUser.securityLoginAlerts);
    } else {
        if(empPanel) empPanel.style.display = 'none';
        if(candPanel) candPanel.style.display = 'block';
        setCheckboxValue('cand-notif-email', currentUser.notifEmail);
        setCheckboxValue('cand-notif-sms', currentUser.notifSMS);
        setCheckboxValue('cand-email-pref-news', currentUser.emailPrefNews);
        setCheckboxValue('cand-email-pref-jobs', currentUser.emailPrefJobs);
        setCheckboxValue('cand-security-2fa', currentUser.security2FA);
        setCheckboxValue('cand-security-login-alerts', currentUser.securityLoginAlerts);
    }
    setFieldValue('settings-old-pass', '');
    setFieldValue('settings-new-pass', '');
    setFieldValue('settings-confirm-pass', '');
}

const EMPLOYER_NON_EDITABLE_FIELD_IDS = ['emp-company-name', 'emp-hr-name', 'emp-hr-email', 'emp-hr-phone'];

function setEmployerProfileLocked(locked) {
    const section = document.getElementById('employer-profile-section');
    if(!section) return;
    section.classList.toggle('employer-profile-locked', !!locked);
    const isAdmin = currentUser && currentUser.role === 'admin';
    section.querySelectorAll('input:not([type="file"]), textarea, select').forEach(el => {
        if(EMPLOYER_NON_EDITABLE_FIELD_IDS.includes(el.id) && !isAdmin) {
            el.disabled = true;
            return;
        }
        el.disabled = !!locked;
    });
    const editBtn = document.getElementById('emp-edit-profile-btn');
    if(editBtn) editBtn.textContent = 'Edit profile';
}

function toggleEmployerProfileEdit() {
    setEmployerProfileLocked(false);
}

const CANDIDATE_NON_EDITABLE_FIELD_IDS = ['prof-fullname', 'prof-email', 'prof-phone'];

function setCandidateProfileLocked(locked) {
    const section = document.getElementById('candidate-profile-section');
    if(!section) return;
    section.classList.toggle('candidate-profile-locked', !!locked);
    section.querySelectorAll('input:not([type="file"]), textarea, select').forEach(el => {
        if(CANDIDATE_NON_EDITABLE_FIELD_IDS.includes(el.id)) {
            el.disabled = true;
            return;
        }
        el.disabled = !!locked;
    });
    const editBtn = document.getElementById('cand-edit-profile-btn');
    if(editBtn) editBtn.textContent = 'Edit profile';
}

function toggleCandidateProfileEdit() {
    setCandidateProfileLocked(false);
}

function initializeCandidateProfileButtons() {
    const editBtn = document.getElementById('cand-edit-profile-btn');
    if(editBtn) {
        editBtn.removeEventListener('click', toggleCandidateProfileEdit);
        editBtn.addEventListener('click', toggleCandidateProfileEdit);
    }
    const saveBtn = document.getElementById('cand-save-profile-btn');
    if(saveBtn) {
        saveBtn.removeEventListener('click', saveProfileData);
        saveBtn.addEventListener('click', saveProfileData);
    }
}

document.addEventListener('DOMContentLoaded', initializeCandidateProfileButtons);

function renderProfilePage() {
    applications = JSON.parse(localStorage.getItem('applications')) || [];
    if(!currentUser) { showView('home'); return; }
    const candidateSection = document.getElementById('candidate-profile-section');
    const employerSection = document.getElementById('employer-profile-section');
    updateProfileCompletionUI();
    if(currentUser.role === 'candidate') {
        candidateSection.style.display = 'block';
        employerSection.style.display = 'none';
        initializeCandidateProfileButtons();
        document.getElementById('prof-fullname').value = currentUser.name || '';
        document.getElementById('prof-email').value = currentUser.email || '';
        document.getElementById('prof-phone').value = currentUser.phone || '';
        setFieldValue('prof-headline', currentUser.headline);
        setFieldValue('prof-location', currentUser.location);
        document.getElementById('prof-linkedin').value = currentUser.linkedin || '';
        document.getElementById('prof-portfolio').value = currentUser.portfolio || '';
        setFieldValue('prof-github', currentUser.github);
        setFieldValue('prof-bio', currentUser.bio || currentUser.summary);
        setFieldValue('prof-exp-overview', currentUser.expOverview);
        setFieldValue('prof-about-skills', currentUser.aboutSkills);
        setFieldValue('prof-career-goals', currentUser.careerGoals);
        document.getElementById('prof-degree').value = currentUser.degree || '';
        document.getElementById('prof-college').value = currentUser.college || '';
        setFieldValue('prof-specialization', currentUser.specialization);
        document.getElementById('prof-score').value = currentUser.score || '';
        document.getElementById('prof-passyear').value = currentUser.passyear || '';
        document.getElementById('prof-exp-company').value = currentUser.expCompany || '';
        document.getElementById('prof-exp-title').value = currentUser.expTitle || '';
        document.getElementById('prof-exp-duration').value = currentUser.expDuration || '';
        document.getElementById('prof-exp-resp').value = currentUser.expResponsibilities || '';
        setFieldValue('prof-exp-achievements', currentUser.expAchievements);
        document.getElementById('prof-techskills').value = currentUser.techskills || '';
        document.getElementById('prof-softskills').value = currentUser.softskills || '';
        setFieldValue('prof-skill-tags', currentUser.skillTags);
        document.getElementById('prof-cert-name').value = currentUser.certName || '';
        document.getElementById('prof-cert-org').value = currentUser.certOrg || '';
        document.getElementById('prof-cert-date').value = currentUser.certDate || '';
        document.getElementById('prof-project-title').value = currentUser.projectTitle || '';
        document.getElementById('prof-project-desc').value = currentUser.projectDesc || '';
        document.getElementById('prof-project-tech').value = currentUser.projectTech || '';
        document.getElementById('prof-project-link').value = currentUser.projectLink || '';
        document.getElementById('prof-pref-role').value = currentUser.prefRole || '';
        document.getElementById('prof-pref-loc').value = currentUser.prefLocation || '';
        document.getElementById('prof-pref-salary').value = currentUser.prefSalary || '';
        document.getElementById('prof-pref-emptype').value = currentUser.prefEmployment || '';
        document.getElementById('prof-resume-filename').innerText = currentUser.resumeFileName || '';
        document.getElementById('prof-download-resume-btn').style.display = currentUser.resumeData ? 'inline-block' : 'none';
        const savedJobsContainer = document.getElementById('profile-saved-jobs');
        if(savedJobsContainer) savedJobsContainer.innerHTML = currentUser.savedJobs && currentUser.savedJobs.length ? currentUser.savedJobs.map(job => `<div style="padding:12px; border-bottom:1px solid #e2e8f0;">${job}</div>`).join('') : '<p style="color:var(--grey);">No saved jobs yet.</p>';
        const appliedJobsContainer = document.getElementById('profile-applied-jobs');
        if(appliedJobsContainer) {
        const candidateApps = applications.filter(app => normalizeText(app.candidateEmail) === normalizeText(currentUser.email));
        if(candidateApps.length === 0) {
            appliedJobsContainer.innerHTML = '<p style="color:var(--grey);">No applications yet.</p>';
        } else {
            appliedJobsContainer.innerHTML = candidateApps.map(app => `
                <div class="app-status-card">
                    <div>
                        <h3 style="font-weight:700; margin-bottom:5px;">${app.jobTitle}</h3>
                        <p style="color:var(--primary); margin:0;">${app.company}</p>
                        <p style="color:var(--grey); font-size:0.8rem; margin:4px 0 0 0;">Applied: ${app.dateApplied}</p>
                    </div>
                    <div><span class="${getStatusBadgeClass(app.status)}">${app.status}</span></div>
                </div>
            `).join('');
        }
        }
        setFieldValue('prof-social-linkedin', currentUser.socialLinkedin || currentUser.linkedin);
        setFieldValue('prof-social-github', currentUser.socialGithub || currentUser.github);
        setFieldValue('prof-social-portfolio', currentUser.socialPortfolio || currentUser.portfolio);
        setFieldValue('prof-social-behance', currentUser.socialBehance);
        const viewBtn = document.getElementById('prof-view-resume-btn');
        if(viewBtn) viewBtn.style.display = currentUser.resumeData ? 'inline-block' : 'none';
        const extraName = document.getElementById('prof-resume-extra-filename');
        if(extraName) extraName.innerText = currentUser.resumeExtraFileName || '';
        const subEl = document.getElementById('profile-subtitle');
        if(subEl) subEl.textContent = 'Update your profile sections below. About / Summary is always editable. Use Edit profile for other fields. Settings are in the nav gear icon.';
        setCandidateProfileLocked(true);
    } else if(currentUser.role === 'admin') {
        candidateSection.style.display = 'none';
        employerSection.style.display = 'block';
        document.getElementById('emp-company-name').value = currentUser.company || '';
        document.getElementById('emp-logo-letter').value = currentUser.logoLetter || (currentUser.company ? currentUser.company.charAt(0) : '');
        document.getElementById('emp-industry').value = currentUser.industry || '';
        document.getElementById('emp-size').value = currentUser.companySize || '';
        document.getElementById('emp-website').value = currentUser.website || '';
        document.getElementById('emp-founded').value = currentUser.founded || '';
        document.getElementById('emp-headquarters').value = currentUser.headquarters || '';
        document.getElementById('emp-description').value = currentUser.description || '';
        document.getElementById('emp-hr-name').value = currentUser.hrName || '';
        document.getElementById('emp-hr-email').value = currentUser.hrEmail || currentUser.email || '';
        document.getElementById('emp-hr-phone').value = currentUser.hrPhone || currentUser.phone || '';
        setEmployerProfileLocked(true);
        const editBtn = document.getElementById('emp-edit-profile-btn');
        if(editBtn) editBtn.style.display = 'inline-block';
        const subEl = document.getElementById('profile-subtitle');
        if(subEl) subEl.textContent = 'Admin profile - edit fields and click Save profile after making changes.';
        updateProfileCompletionUI();
    } else {
        candidateSection.style.display = 'none';
        employerSection.style.display = 'block';
        document.getElementById('emp-company-name').value = currentUser.company || '';
        document.getElementById('emp-logo-letter').value = currentUser.logoLetter || (currentUser.company ? currentUser.company.charAt(0) : '');
        document.getElementById('emp-industry').value = currentUser.industry || '';
        document.getElementById('emp-size').value = currentUser.companySize || '';
        document.getElementById('emp-website').value = currentUser.website || '';
        document.getElementById('emp-founded').value = currentUser.founded || '';
        document.getElementById('emp-headquarters').value = currentUser.headquarters || '';
        document.getElementById('emp-description').value = currentUser.description || '';
        document.getElementById('emp-hr-name').value = currentUser.hrName || '';
        document.getElementById('emp-hr-email').value = currentUser.hrEmail || currentUser.email || '';
        document.getElementById('emp-hr-phone').value = currentUser.hrPhone || currentUser.phone || '';
        const subEl = document.getElementById('profile-subtitle');
        if(subEl) subEl.textContent = 'Update your company details and about section. Password and alerts are under Settings in the nav.';
        setEmployerProfileLocked(true);
        updateProfileCompletionUI();
    }
}

function showEmployerApplicationDetail(appId) {
    applications = JSON.parse(localStorage.getItem('applications')) || [];
    let app = applications.find(a => a.id === appId);
    if(!app) {
        app = applications.find(a => normalizeText(a.candidateEmail) === normalizeText(appId) || String(a.appliedAt) === String(appId));
    }
    if(!app) return;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const candidate = users.find(u => u.role === 'candidate' && normalizeText(u.email) === normalizeText(app.candidateEmail));
    const resumeInfo = getApplicantResume(app);
    const resumeKey = app.id || app.candidateEmail;
    const hasResume = !!resumeInfo.resumeData;
    const detailEl = document.getElementById('emp-application-detail-modal');
    const modal = document.getElementById('emp-details-modal');
    detailEl.innerHTML = `
        <div class="app-detail-card" style="padding: 30px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; margin-bottom:24px;">
                <div style="min-width:200px;">
                    <h3>Candidate Application</h3>
                    <p style="margin:8px 0 0 0; color:#475569; font-size:0.95rem;">Name: <strong>${app.candidateName || app.candidateEmail}</strong></p>
                    <p style="margin:4px 0 0 0; color:#64748b; font-size:0.9rem;">Email: ${app.candidateEmail}</p>
                    <p style="margin:4px 0 0 0; color:#64748b; font-size:0.9rem;">Applied on: ${app.dateApplied}</p>
                </div>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${resumeKey}','Accepted')">Accept</button>
                    <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${resumeKey}','Rejected')">Reject</button>
                </div>
            </div>

            <h4 style="margin: 0 0 12px 0;">Application Summary</h4>
            <div class="app-detail-grid">
                <div><strong>Job Applied</strong><br>${app.jobTitle} at ${app.company}</div>
                <div><strong>Status</strong><br>${app.status}</div>
                <div><strong>Preferred Location</strong><br>${app.preferredLocation || 'N/A'}</div>
                <div><strong>Employment Type</strong><br>${app.employmentType || 'N/A'}</div>
                <div><strong>Notice Period</strong><br>${app.noticePeriod || 'N/A'}</div>
                <div><strong>Expected Salary</strong><br>${app.expectedSalary || 'N/A'}</div>
            </div>

            <h4 style="margin: 24px 0 12px 0;">Personal Information</h4>
            <div class="app-detail-grid">
                <div><strong>Phone</strong><br>${app.candidatePhone || 'N/A'}</div>
                <div><strong>DOB</strong><br>${app.candidateDOB || 'N/A'}</div>
                <div><strong>Gender</strong><br>${app.candidateGender || 'N/A'}</div>
                <div><strong>Address</strong><br>${app.candidateAddress || 'N/A'}</div>
                <div><strong>City</strong><br>${app.candidateCity || 'N/A'}</div>
                <div><strong>State</strong><br>${app.candidateState || 'N/A'}</div>
                <div><strong>Country</strong><br>${app.candidateCountry || 'N/A'}</div>
                <div><strong>Pincode</strong><br>${app.candidatePincode || 'N/A'}</div>
            </div>

            <h4 style="margin: 24px 0 12px 0;">Professional Experience</h4>
            <div class="app-detail-grid">
                <div><strong>Current Job Title</strong><br>${app.currentJobTitle || 'N/A'}</div>
                <div><strong>Current Company</strong><br>${app.currentCompany || 'N/A'}</div>
                <div><strong>Experience</strong><br>${app.totalExperience ? app.totalExperience + ' years' : 'N/A'}</div>
                <div><strong>Current Salary</strong><br>${app.currentSalary || 'N/A'}</div>
                <div><strong>Previous Role</strong><br>${app.workExpTitle || 'N/A'}</div>
                <div><strong>Previous Company</strong><br>${app.workExpCompany || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Work Experience Start</strong><br>${app.workExpStart || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Work Experience End</strong><br>${app.workExpEnd || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Responsibilities</strong><br>${app.workExpResponsibilities || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Achievements</strong><br>${app.workExpAchievements || 'N/A'}</div>
            </div>

            <h4 style="margin: 24px 0 12px 0;">Education & Skills</h4>
            <div class="app-detail-grid">
                <div><strong>Qualification</strong><br>${app.highestQualification || 'N/A'}</div>
                <div><strong>Degree</strong><br>${app.degreeName || 'N/A'}</div>
                <div><strong>Specialization</strong><br>${app.specialization || 'N/A'}</div>
                <div><strong>University</strong><br>${app.university || 'N/A'}</div>
                <div><strong>Status</strong><br>${app.educationStatus || 'N/A'}</div>
                <div><strong>Score</strong><br>${app.score || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Languages</strong><br>${app.languagesKnown || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Technical Skills</strong><br>${app.technicalSkills || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Soft Skills</strong><br>${app.softSkills || 'N/A'}</div>
                <div style="grid-column: span 2;"><strong>Certifications</strong><br>${app.certifications || 'N/A'}</div>
            </div>

            <h4 style="margin: 24px 0 12px 0;">Documents & Links</h4>
            <div class="app-detail-grid">
                <div><strong>Resume</strong><br>${resumeInfo.resumeFileName || (candidate && candidate.resumeFileName) || app.resumeFileName || 'Not uploaded'}</div>
                <div><strong>Cover Letter</strong><br>${app.coverLetter ? app.coverLetter : 'Not provided'}</div>
                <div style="grid-column: span 2; display:flex; gap:12px; flex-wrap:wrap;">
                    ${hasResume ? `<button class="btn-secondary" type="button" onclick="previewApplicationResume('${resumeKey}')">View Resume</button>` : ''}
                    ${hasResume ? `<button class="btn-secondary" type="button" onclick="downloadResumeForApplicant('${resumeKey}')">Download Resume</button>` : ''}
                    ${app.portfolioURL ? `<a class="btn-secondary" href="${app.portfolioURL}" target="_blank" style="text-decoration:none;">Portfolio</a>` : ''}
                    ${app.linkedinURL ? `<a class="btn-secondary" href="${app.linkedinURL}" target="_blank" style="text-decoration:none;">LinkedIn</a>` : ''}
                    ${app.githubURL ? `<a class="btn-secondary" href="${app.githubURL}" target="_blank" style="text-decoration:none;">GitHub</a>` : ''}
                </div>
            </div>

        </div>
    `;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeEmployerApplicationModal() {
    const modal = document.getElementById('emp-details-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

function updateApplicationStatus(appId, status) {
    const idx = applications.findIndex(a => a.id === appId || a.candidateEmail === appId || String(a.appliedAt) === String(appId));
    if(idx < 0) return;
    applications[idx].status = status;
    localStorage.setItem('applications', JSON.stringify(applications));
    renderProfilePage();
    renderDashboard();
    renderMyApplicationsView();
    if(document.getElementById('emp-details-modal')?.style.display === 'flex') {
        closeEmployerApplicationModal();
    }
    triggerPopup(`Application ${status.toLowerCase()} successfully.`, 'success');
}

// --- EMPLOYER FUNCTIONS ---
function toggleJobModal(show, jobId = null) {
    const modal = document.getElementById('job-post-modal');
    const submitBtn = document.getElementById('job-modal-submit-btn');
    editingJobId = jobId || null;

    if(show && editingJobId) {
        const jobToEdit = jobs.find(job => job.id === editingJobId);
        if(jobToEdit) {
            document.getElementById('job-title').value = jobToEdit.title;
            document.getElementById('job-location').value = jobToEdit.loc;
            document.getElementById('job-type-select').value = jobToEdit.type;
            document.getElementById('job-salary').value = jobToEdit.salary;
            document.getElementById('job-vacancies').value = jobToEdit.vacancies || 1;
            document.getElementById('job-category').value = jobToEdit.cat;
            document.getElementById('job-mode').value = jobToEdit.mode;
            document.getElementById('job-address').value = jobToEdit.address;
            document.getElementById('job-desc').value = jobToEdit.desc;
            submitBtn.innerText = 'Update Job';
        }
    }
    if(!show) {
        editingJobId = null;
        submitBtn.innerText = 'Post Job';
        document.getElementById('job-title').value = '';
        document.getElementById('job-location').value = 'India';
        document.getElementById('job-type-select').value = 'Full-Time';
        document.getElementById('job-salary').value = '';
        document.getElementById('job-vacancies').value = '1';
        document.getElementById('job-category').value = 'Technology & IT';
        document.getElementById('job-mode').value = 'Online';
        document.getElementById('job-address').value = '';
        document.getElementById('job-desc').value = '';
    }
    modal.style.display = show ? 'flex' : 'none';
    document.body.style.overflow = show ? 'hidden' : '';
    if(show) {
        // focus the first input for better UX
        setTimeout(() => {
            const first = document.getElementById('job-title');
            if(first) first.focus();
        }, 50);
    }
}

function createJob() {
    const title = document.getElementById('job-title').value.trim();
    const location = document.getElementById('job-location').value.trim();
    const type = document.getElementById('job-type-select').value;
    const salary = document.getElementById('job-salary').value.trim();
    const vacancies = parseInt(document.getElementById('job-vacancies').value, 10) || 1;
    const category = document.getElementById('job-category').value;
    const mode = document.getElementById('job-mode').value;
    const address = document.getElementById('job-address').value.trim();
    const desc = document.getElementById('job-desc').value.trim();

    if(!title || !location || !desc || vacancies < 1) {
        triggerPopup("Please fill the required job details and enter a valid vacancy count.", "error");
        return;
    }

    if(editingJobId) {
        jobs = jobs.map(job => {
            if(job.id === editingJobId) {
                return {
                    ...job,
                    title,
                    loc: location,
                    type,
                    salary,
                    vacancies,
                    cat: category,
                    mode,
                    address,
                    desc,
                    date: new Date().toLocaleDateString()
                };
            }
            return job;
        });
        localStorage.setItem('jobs', JSON.stringify(jobs));
        toggleJobModal(false);
        triggerPopup("Job updated successfully!", "success", () => {
            renderDashboard();
        });
        return;
    }

    const employerName = currentUser.company || currentUser.name || 'Employer';
    const newJob = {
        id: 'JOB-' + Date.now(),
        title,
        company: employerName,
        type,
        cat: category,
        salary,
        loc: location,
        date: new Date().toLocaleDateString(),
        logo: employerName ? employerName.charAt(0).toUpperCase() : 'E',
        desc,
        req: ["Requirement added by Employer"],
        vacancies,
        lang: "Contact Employer",
        exp: "Not Specified",
        mode,
        address
    };

    jobs.unshift(newJob);
    localStorage.setItem('jobs', JSON.stringify(jobs));
    toggleJobModal(false);
    triggerPopup("Job Posted Successfully!", "success", () => {
        renderDashboard();
    });
}

function editJob(jobId) {
    toggleJobModal(true, jobId);
}

function deleteJob(jobId) {
    // Use modal confirmation flow instead of native confirm
    requestDeleteJobById(jobId);
}

function renderDashboard() {
    applications = JSON.parse(localStorage.getItem('applications')) || [];
    jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const container = document.getElementById('dash-content');
    document.getElementById('employer-actions').style.display = 'block';
    
    const companyName = normalizeText(currentUser.company || currentUser.name);
    const allJobs = [...jobs, ...staticJobsDatabase];
    const rawJobs = allJobs.filter(j => normalizeText(j.company) === companyName);
    const myJobs = Array.from(rawJobs.reduce((map, job) => {
        const key = job.id ? job.id : `${normalizeText(job.title)}|${normalizeText(job.loc)}`;
        if(!map.has(key)) map.set(key, job);
        return map;
    }, new Map()).values());
    const myApplications = applications.filter(app => normalizeText(app.employerCompany) === companyName);
    
    let activeVacancies = myJobs.reduce((sum, j) => sum + (j.vacancies || 0), 0);
    const totalApplicants = myApplications.length;
    if(activeVacancies === 0 && myJobs.length > 0) {
        activeVacancies = myJobs.length;
    }
    const profileViewsRaw = activeVacancies > 0 ? activeVacancies * 50000 : (totalApplicants > 0 ? totalApplicants * 20000 : 0);
    const profileViews = profileViewsRaw > 0 ? `${(profileViewsRaw / 100000).toFixed(2).replace(/\.0+$/, '')} Lakh` : '0';
    
    document.getElementById('active-vacancies-count').innerText = activeVacancies;
    document.getElementById('total-applicants-count').innerText = totalApplicants;
    document.getElementById('profile-views-count').innerText = profileViews;
    
    const recentApplications = myApplications
        .slice()
        .sort((a, b) => b.appliedAt - a.appliedAt)
        .slice(0, 5);

    const recentApplicationsHTML = recentApplications.length ? recentApplications.map(app => {
        const appKey = app.id || app.candidateEmail;
        return `
        <div style="background:white; border-radius:10px; padding:16px; margin-bottom:12px; box-shadow:0 2px 7px rgba(15,23,42,.06);">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                <div>
                    <h4 style="margin:0 0 8px 0; color: var(--dark);">${app.candidateName || app.candidateEmail}</h4>
                    <p style="margin:0; color: var(--grey); font-size:0.9rem;"><strong>Role:</strong> ${app.jobTitle}</p>
                    <p style="margin:6px 0 0 0; color: var(--grey); font-size:0.85rem;"><strong>Applied on:</strong> ${app.dateApplied}</p>
                </div>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                    <button class="btn-secondary" type="button" onclick="showEmployerApplicationDetail('${appKey}')">View Profile</button>
                    <button class="btn-secondary" type="button" onclick="previewApplicationResume('${appKey}')">View Resume</button>
                    <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${appKey}','Accepted')">Accept</button>
                    <button class="btn-secondary" type="button" onclick="updateApplicationStatus('${appKey}','Rejected')">Reject</button>
                    <span class="${getStatusBadgeClass(app.status)}" style="padding: 10px 16px; border-radius: 999px; font-weight: 700;">${app.status}</span>
                </div>
            </div>
        </div>
    `;
    }).join('') : '<p style="color: var(--grey); text-align:center;">No recent applications yet.</p>';

    document.getElementById('dashboard-recent-applications').innerHTML = recentApplicationsHTML;
    
    let postingsHTML = '';
    if(myJobs.length === 0) {
        postingsHTML = '<p style="color: var(--grey); text-align: center;">No active job postings yet.</p>';
    } else {
        postingsHTML = '<div style="display: grid; gap: 20px;">';
        myJobs.forEach(j => {
            const jobApplicants = myApplications.filter(app => app.jobTitle === j.title);
            postingsHTML += `
                <div style="background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="display:flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px;">
                        <div style="flex:1; min-width:220px;">
                            <h4 style="margin:0 0 8px 0; font-size:1.15rem; font-weight:700; color:#111827;">${j.title}</h4>
                            <p style="margin:0; color:#475569; font-size:0.9rem;"><strong>Location:</strong> ${j.loc}</p>
                            <p style="margin:4px 0 0 0; color:#475569; font-size:0.9rem;"><strong>Type:</strong> ${j.type} • <strong>Posted:</strong> ${j.date}</p>
                        </div>
                        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                            ${j.id ? `<button class="btn-secondary" type="button" onclick="editJob('${j.id}')">Edit</button>` : ''}
                            ${j.id ? `<button class="btn-secondary" type="button" onclick="deleteJob('${j.id}')">Delete</button>` : ''}
                            <button class="btn-secondary" type="button" onclick="showApplicantsForJob('${j.title.replace(/'/g, "\\'")}')">View Applicants</button>
                            <div style="background:#f8fafc; color:#0f172a; padding:10px 14px; border-radius:999px; font-size:0.9rem;">${jobApplicants.length} Apps</div>
                        </div>
                    </div>
                    <p style="margin:16px 0 0 0; color:#64748b; font-size:0.95rem;">${j.desc}</p>
                </div>
            `;
        });
        postingsHTML += '</div>';
    }
    container.innerHTML = postingsHTML;
    document.getElementById('active-postings-list').style.display = 'none';
}

function submitContactForm() {
    const name = document.getElementById('contact-name').value;
    if(!name) return;
    document.getElementById('contact-form-container').style.display = 'none';
    document.getElementById('contact-success').style.display = 'block';
}

function resetContactForm() {
    document.getElementById('contact-form-container').style.display = 'block';
    document.getElementById('contact-success').style.display = 'none';
    // clear previous inputs so a fresh form appears
    const cf = ['contact-name','contact-email','contact-msg'];
    cf.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
}

updateNav();