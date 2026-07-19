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
  "title": "Software Developer II",
  "company": "Previously: Software Developer I, Jul 2018–Jul 2020",
  "location": "Ridgeland, MS",
  "dates": "Jul 2020–Present"
}
```

<!-- ***Previously:** Software Developer I, Jul 2018–Jul 2020* -->
*C Spire*

- Develop, maintain, and support 200+ JVM-based middleware services across Java, Scala, and Kotlin, integrating with Kafka, Solr, Redis, Oracle databases, vendor APIs, and internal business systems.
- Lead technical design and coordinate implementation across projects involving up to four other developers; mentor new employees and interns through onboarding, architecture training, and hands-on project work.
- Led a four-person effort to replace an hourly Solr 4.x customer-indexing process with an event-driven Kafka, Kafka Connect, and Solr 8 platform, reducing search-data latency from up to one hour to near real time across web, POS, and backend systems.
  - Built an Akka-based reindexing service that streams and combines 100M+ source records across multiple Oracle databases, reducing a complete rebuild from more than two days to approximately 90 minutes.
- Built the team’s first production service using Kotlin, Ktor, and Gradle and established an implementation pattern supporting an ongoing migration away from Scala, Akka HTTP, and Maven.
- Helped design and build a UI-configurable wireless promotion engine using Java, Scala, Spring, Oracle, and Drools, replacing manually coded rules with a durable decision-tree model later reused for Home-service promotions and still operating without fundamental redesign six years after launch.
- Independently built a searchable Git and Markdown based developer knowledge platform used by approximately 50 developers and later selected as the foundation for a company-wide developer AI knowledge base.
- Founded C Spire’s open-source working group, secured CIO sponsorship and funding, and partnered with Legal and Cyber Security to establish the company’s first license and contribution processes; multiple employee patches have since been accepted upstream.
- Participate in rotating production on-call coverage and serve as an escalation point for complex incidents across customer search, ordering, billing, and integration systems.
- Implemented OAuth-secured Akka HTTP APIs connecting Microsoft and Idemia’s eSIM activation flow with internal account, device-registration, service-plan, and billing systems.


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
  "title": "Helios - Sublime Text Plugin",
  "dates": "May 2025 - Present",
  "location": "Python, Sublime Text APIs",
  "link": "https://github.com/quot/Helios"
}
```

- Sublime Text plugin implementing Helix-inspired modal editing with normal, insert, select, and view modes and mode-aware keybindings.
- Built movement and selection commands, registers, yank/delete/change operations, paste behavior, plugin-state management, and reusable abstractions over Sublime Text APIs.


<!-- ```resume-entry
{
  "title": "Zig 3D Mesh Generator",
  "dates": "Apr 2026 - Present",
  "location": "Zig, Sokol, OpenGL",
  "link": "https://github.com/quot/donut"
}
```

- Building an experimental 3D mesh generation tool in Zig using Sokol and OpenGL.
- Generates mesh geometry from n-gon faces with automatic normal calculation while exploring low-poly modeling workflows and custom mesh data structures. -->


<!-- ```resume-entry
{
  "title": "Backend Lead",
  "company": "MSU Software Engineering Senior Design Course",
  "location": "PostgreSQL, PostGraphile",
  "dates": "Aug 2017 - May 2018"
}
```

- Led a four-person backend team (alongside a four-person frontend team) that designed and developed the backend for a Senior Design course project.
- The project was a full-stack system for the MSU School of Veterinary Medicine to collect and analyze animal medical data across all MSU farms. -->

## Skills

```skill-entry
{
  "category": "Languages",
  "skills": ["Java", "Kotlin", "Scala", "Python", "SQL", "JavaScript", "Zig"]
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
  "skills": ["Kafka", "Kafka Connect", "Solr", "Redis", "Oracle Database", "Docker", "Linux", "Git", "Maven", "Gradle"]
}
```

<!-- ```skill-entry
{
  "category": "Web",
  "skills": ["HTMX", "HTML/CSS", "JavaScript"]
}
``` -->

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
- Managed department workstations and Linux servers as a computer science department system administrator.

<!-- ```resume-entry
{
  "title": "Software Engineering A.A.S.",
  "dates": "Aug 2010 - May 2013",
  "company": "Holmes Community College",
  "location": "Ridgeland, MS"
}
```

- Dean's Scholarship recipient.
- 2013 CIST Student of the Year. -->

<!-- This Holmes entry includes the extra year spent working on a networking degree.
```resume-entry
{
  "title": "Software Engineering A.A.S.",
  "dates": "Aug 2010 - Dec 2014",
  "company": "Holmes Community College",
  "location": "Ridgeland, MS"
}
``` -->
