---
RESUME_NAME: "Alex Coté"
RESUME_LATEST_URL: "resume.acote.dev"
---

# {{RESUME_NAME}}

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
        "href": "tel:{{RESUME_PHONE_HREF}}"
      }
    ],
    [
      {
        "label": "linkedin.com/in/-alexcote",
        "href": "https://linkedin.com/in/-alexcote"
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

```tag-line
Backend Software Engineer | JVM, Kotlin, Kafka, Search, Distributed Systems
```

<!-- 
## Summary

yadda yadda yadda
-->

## Experience

```resume-entry
{
  "title": "Software Developer",
  "company": "C Spire",
  "location": "Ridgeland, MS",
  "dates": "Jul 2018 - Present"
}
```

- Maintain and support 200+ JVM-based middleware microservices across Java, Scala, and Kotlin, integrating with systems such as Solr, Kafka, Redis, and internal business platforms.
- Built an event-driven customer search indexing platform used by POS systems and backend services for low-latency customer data retrieval.
  - Designed Kafka-based change-event pipelines and Solr indexing workflows to keep customer search data synchronized across multiple source systems.
  - Developed a parallel Akka Streams reindexing service that processes 10M+ customer records from multiple databases in under 2 hours.
- Implemented eSIM activation integrations with Microsoft and Idemia, enabling customers to activate wireless service directly from Windows tablets.
- Founded the C Spire OSS employee working group to fund open source software, establish contribution policies, and support the release of internal projects.
  - Partner with Security, Legal, and Executive teams to define company-wide policies for open source usage, contribution, and project release.
- Created an internal Markdown/Git-based developer documentation platform used by ~50 developers and adopted as the foundation for a company-wide developer AI knowledge base.
- Led team-wide adoption of Kotlin, Ktor, and Gradle for new microservices, replacing Scala, Akka HTTP, and Maven as the team’s default backend stack.

<!--
```resume-entry
{
  "title": "System Administrator",
  "company": "MSU Dept. of Computer Science and Engineering",
  "location": "Starkville, MS",
  "dates": "Jan 2018 - Jul 2018"
}
```
-->

<!--
```resume-entry
{
  "title": "Facilitator for Graduate Class Recordings",
  "company": "Bagley College of Engineering",
  "location": "Starkville, MS",
  "dates": "Jan 2014 - Dec 2017"
}
```
-->

<!--
```resume-entry
{
  "title": "Sales Consultant / Customer Service Agent",
  "company": "Best Buy",
  "location": "Madison, MS",
  "dates": "Jan 2011 - Dec 2013"
}
```
-->


## Projects

```resume-entry
{
  "title": "Zig 3D Mesh Generator",
  "dates": "Apr 2026 - Present",
  "link": "https://github.com/quot/donut"
}
```

- Building an experimental 3D mesh generation tool in Zig using Sokol and OpenGL.
- Generates mesh geometry from n-gon faces with automatic normal calculation.
- Exploring low-poly modeling workflows, graphics programming, and custom mesh data structures.

```resume-entry
{
  "title": "Backend Lead",
  "company": "MSU Software Engineering Senior Design Course",
  "location": "Starkville, MS",
  "dates": "Aug 2017 - May 2018"
}
```

- Led a four-person backend team (alongside a four-person frontend team) that designed and developed the backend for a Senior Design course project.
- The project was a full-stack system for the MSU School of Veterinary Medicine to collect and analyze animal medical data across all MSU farms.

## Skills

```skill-entry
{
  "category": "Languages",
  "skills": ["Java", "Kotlin", "Scala", "Python", "Zig", "SQL", "JavaScript", "HTML/CSS"]
}
```

```skill-entry
{
  "category": "Backend",
  "skills": ["Spring Boot", "Ktor", "Akka", "Akka HTTP", "Hibernate", "Apache Camel"]
}
```

```skill-entry
{
  "category": "Data & Infrastructure",
  "skills": ["Kafka", "Kafka Connect", "Solr", "Redis", "Docker", "Podman", "Linux", "Git", "Maven", "Gradle"]
}
```

```skill-entry
{
  "category": "Web",
  "skills": ["HTMX", "HTML/CSS", "JavaScript"]
}
```

<!--
```skill-entry
{
  "category": "Certifications",
  "skills": ["A+ Certified (expired)"]
}
```
-->


## Education

```resume-entry
{
  "title": "Software Engineering B.S.",
  "dates": "Jan 2014 - Jul 2018",
  "company": "Mississippi State University",
  "location": "Starkville, MS"
}
```

<!-- - Member of MSU's ACM and ACM-W clubs. -->
- Worked as a CS department system administrator managing staff PCs and Linux servers.

```resume-entry
{
  "title": "Software Engineering A.A.S.",
  "dates": "Aug 2010 - May 2013",
  "company": "Holmes Community College",
  "location": "Ridgeland, MS"
}
```

- Dean's Scholarship recipient.
- 2013 CIST Student of the Year.

<!-- This Holmes entry includes the extra year spent working on a networking degree.
```resume-entry
{
  "title": "Software Engineering A.A.S.",
  "dates": "Aug 2010 - Dec 2014",
  "company": "Holmes Community College",
  "location": "Ridgeland, MS"
}
``` -->
