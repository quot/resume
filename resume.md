---
RESUME_LATEST_URL: "acote.dev/resume"
---

# Alex Coté

```contact-list
{
  "entries": [
    [
      {
        "label": "{{RESUME_EMAIL}}",
        "href": "mailto:{{RESUME_EMAIL}}"
      },
      {
        "label": "{{RESUME_PHONE}}",
        "href": "tel:{{RESUME_PHONE}}"
      }
    ],
    [
      {
        "label": "linkedin.com/in/alexcoté",
        "href": "https://linkedin.com/in/alexcoté"
      },
      {
        "label": "github.com/quot",
        "href": "https://github.com/quot"
      }
    ]
  ]
}
```

<!-- Location removed for now.
  [{ "label": "Jackson, MS" }]
-->

Backend Software Engineer | JVM, Kotlin, Kafka, Search, Distributed Systems

<!-- 
## Summary

yadda yadda yadda
-->

## Experience

```resume-entry
{
  "include": true,
  "title": "Software Developer",
  "company": "C Spire",
  "location": "Ridgeland, MS",
  "dates": "Jul 2018 - Present",
  "bullets": [
    "Maintain and manage 200+ middleware JVM (Java, Scala, Kotlin) microservices along with various systems they interact with (Solr, Kafka, Redis).",

    "Implemented eSIM activation flows with Microsoft and Idemia, enabling customers to activate service directly from Windows tablets.",

    "Built an event-driven search indexing system to manage customer search used by POS systems and backend services that require fast data retrieval. Search data indexed with all change events. Used Kafka for event messaging, Solr for indexing and search, and Kafka Connect to stream data into Solr. Project included creating a service that allows full reindexing using Akka Streams to process all customer data (10M+ records) from multiple databases within 2 hours.",

    "Created the C Spire OSS employee working group to fund open source software used within C Spire, build policies to allow for contributing back to open source projects, and begin work on open sourcing projects made within C Spire. The group works heavily with C Spire's Security, Legal, and Executive teams to make official changes in how the company interacts with OSS.",

    "Built an internal wiki for developers to easily manage documentation through markdown files managed by git. The existing setup uses GitLab actions with a custom preprocessor to build a static internal site. Currently used by ~50 developers and has been picked up to be the starting point of an AI knowledge base for all developers within the company.",

    "Led the team-wide adoption of Kotlin, Ktor, and Gradle for new microservices, replacing Scala/Akka HTTP/Maven as the default backend stack."
  ]
}
```

```resume-entry
{
  "include": false,
  "title": "System Administrator",
  "company": "MSU Dept. of Computer Science and Engineering",
  "location": "Starkville, MS",
  "dates": "Jan 2018 - Jul 2018",
  "bullets": [
    "Manage and maintain computers throughout the department along with server-side support as needed.",
    "Restructure the work environment and rework System Administrator procedures to make the position easier to manage for future employees."
  ]
}
```

```resume-entry
{
  "include": false,
  "title": "Facilitator for Graduate Class Recordings",
  "company": "Bagley College of Engineering",
  "location": "Starkville, MS",
  "dates": "Jan 2014 - Dec 2017",
  "bullets": [
    "Ensured recordings and lectures proceeded smoothly by setting up and maintaining recording equipment.",
    "Assisted professors with classroom equipment needed during lectures."
  ]
}
```

```resume-entry
{
  "include": false,
  "title": "Sales Consultant / Customer Service Agent",
  "company": "Best Buy",
  "location": "Madison, MS",
  "dates": "Jan 2011 - Dec 2013",
  "bullets": [
    "Helped customers with computer and mobile device purchasing decisions and cellular plan consulting.",
    "Handled first-level Geek Squad troubleshooting, customer appointments, and day-to-day money management for the store."
  ]
}
```


## Projects

```project-entry
{
  "include": true,
  "title": "Zig 3D Mesh Generator",
  "link": "https://github.com/quot/donut",
  "bullets": [
    "A work-in-progress project mainly used for learning Zig and graphics programming.",
    "Using Zig, Sokol, and OpenGL to build meshes from n-gon faces with automatic normal creation.",
    "The project's goal is to eventually be a hobby-level 3D modelling software that allows for fast and easy low-poly modelling from scratch."
  ]
}
```

```resume-entry
{
  "include": true,
  "title": "Back-End Lead",
  "company": "MSU Software Engineering Senior Design Course",
  "location": "Starkville, MS",
  "dates": "Aug 2017 - May 2018",
  "bullets": [
    "Led a four-person backend team (alongside a four-person frontend team) that designed and developed the backend for a Senior Design course project.",
    "The project was a full-stack system for the MSU School of Veterinary Medicine to collect and analyze animal medical data across all MSU farms."
  ]
}
```

## Skills

```skill-entry
{
  "include": true,
  "category": "Languages",
  "skills": ["Java", "Kotlin", "Scala", "Python", "Zig", "SQL", "JavaScript", "HTML/CSS"]
}
```

```skill-entry
{
  "include": true,
  "category": "Backend",
  "skills": ["Spring Boot", "Ktor", "Akka", "Akka HTTP", "Hibernate", "Apache Camel", "HTMX"]
}
```

```skill-entry
{
  "include": true,
  "category": "Data & Infrastructure",
  "skills": ["Kafka", "Kafka Connect", "Solr", "Redis", "Docker", "Podman", "Linux", "Git", "Maven", "Gradle"]
}
```

```skill-entry
{
  "include": false,
  "category": "Certifications",
  "skills": ["A+ Certified (expired)"]
}
```


## Education

```resume-entry
{
  "include": true,
  "title": "Software Engineering B.S.",
  "dates": "Jan 2014 - Jul 2018",
  "company": "Mississippi State University",
  "location": "Starkville, MS",
  "bullets": [
    "Member of MSU's ACM and ACM-W clubs.",
    "Worked as a System Admin for the CS department during the last year managing staff PCs and Linux servers."
  ]
}
```

```resume-entry
{
  "include": false,
  "title": "Software Engineering A.A.S.",
  "dates": "Aug 2010 - Dec 2014",
  "company": "Holmes Community College",
  "location": "Ridgeland, MS",
  "bullets": [
    "Received Software Engineering A.A.S. in May 2013.",
    "Dean's Scholarship recipient.",
    "2013 CIST Student of the Year."
  ]
}
```