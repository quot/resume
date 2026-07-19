# Alex Coté

Backend Software Engineer | JVM, Kotlin, Kafka, Search, Distributed Systems

## C Spire

Ridgeland, Mississippi | Jul 2018–Present

**Software Developer II** - Jul 2020 - Present

**Software Developer I** - Jul 2018 - Jul 2020

- Maintain and support 200+ JVM-based middleware services across Java, Scala, and Kotlin, integrating with Kafka, Solr, Redis, Oracle databases, vendor APIs, and internal business systems.
- Lead technical design and coordinate implementation across projects involving up to four other developers while mentoring new employees and interns.
- Participate in rotating production on-call coverage and serve as an escalation point for complex incidents involving customer search, ordering, billing, and integration systems.

### Leadership & Organizational Impact

#### Open-Source Software Working Group

- 2025-Present

<!--
#### Summary
* Founded C Spire’s open-source working group and secured CIO sponsorship to fund projects used by the company.
* Partnered with Legal and Cyber Security to create the company’s first approved-license, contribution, and security processes, enabling developers to submit upstream patches; multiple contributions have already been accepted.
-->

* Founded an employee-led open-source working group to help C Spire support projects the company depends on and allow developers to contribute fixes and improvements upstream.
* Recruited an initial group of four employees and established a flat decision-making structure in which members jointly evaluate priorities, funding, and policy.
* Secured executive sponsorship and funding from the CIO for direct support of open-source projects used by the company.
* Partnered with Legal to define approved open-source licenses and establish a review process for adding new licenses.
* Worked with Cyber Security to create contribution policies and procedures that allow employees to share fixes safely without exposing company secrets, customer information, or security vulnerabilities.
* Helped resolve contractual and governance barriers that had previously prevented employees from contributing company-developed patches to external projects.
* Established the company’s first formal processes for funding and contributing to open-source software.
* Created a voting process for evaluating funding requests based on company usage, project size, and community need.
* Enabled developers across the company to propose open-source projects for funding and contribute approved changes upstream.
* Helped return patches to smaller upstream projects, with multiple contributions already accepted.
* Continue to expand the group through developer outreach after securing support from executive leadership, Legal, and Security.

----------------------


#### Technical Leadership and Mentoring

- 2020 - Present

<!--
#### Summary
* Lead technical design and coordinate work for projects involving up to four other developers; mentor new hires and interns through environment setup, architecture training, project selection, and implementation support.
* Review code and architecture, participate in rotating production on-call coverage, and serve as an escalation point for complex incidents involving systems where I am a subject-matter expert.
-->

* Mentor new employees and interns by helping configure development environments, explaining the team’s service architecture, selecting hands-on tickets and projects, and supporting them through technical roadblocks.
* Lead project design and work coordination for efforts ranging from individual assignments to teams of three or four developers.
* Break larger initiatives into implementation tasks, assign work based on developer experience, and provide technical guidance throughout delivery.
* Review code from less-experienced developers and help improve implementation quality, maintainability, and alignment with team practices.
* Participate in a rotating week-long production on-call schedule and provide after-hours incident support for backend services and integrations.
* Serve as an escalation point when the assigned on-call engineer needs help diagnosing complex production issues.
* Review project plans and architectural changes involving systems where you have deep domain knowledge, particularly customer search and related integration services.

----------------------


### Technical Projects

#### Event-Driven Customer Search Platform

- 2019-2021

<!--
#### Summary
* Led a five-person effort to replace an hourly Solr 4.x customer-indexing job with an event-driven Kafka, Kafka Connect, and Solr 8 platform, reducing search-data latency from up to an hour to near real time across web, POS, and backend systems.
* Built an Akka-based reindexing service that streams and combines data from multiple Oracle databases, reducing full processing time from more than two days to about 90 minutes for 3 million customers and 100M+ source records.
* Designed centralized search APIs, fuzzy and cross-business search capabilities, reconciliation jobs, and Grafana alerting, reducing database load and providing a reliable recovery path for missing or incorrect search data.
-->

* Led the design and implementation of a new customer search platform with a four-person development team, replacing an hourly batch-indexing process and an outdated Solr 4.x deployment with an event-driven Kafka and Solr 8 architecture.
* Reduced the delay between customer-data changes and searchable results from as much as an hour to near real time by publishing account updates to Kafka and indexing them through Kafka Connect.
* Designed the platform to serve customer search needs across Wireless, Home, and Enterprise systems, supporting searches by customer and account identifiers, phone numbers, names, addresses, contacts, order IDs, device IDs, and related attributes.
* Reorganized a rigid search model built around three large document types into seven focused Kafka topics and corresponding search data structures, providing greater flexibility and easier expansion.
* Built a full customer-data reindexing and repair service that queries Oracle customer, billing, and device databases, combines and filters relevant records, and publishes normalized search data through Kafka.
* Reduced full reindexing time from more than two days to approximately 90 minutes for roughly 3 million active and inactive customers representing more than 100 million source records and generated messages.
* Achieved the performance improvement through streaming database reads, bounded batching, memory-conscious processing, and parallel execution using Akka actors.
* Designed the reindexing service to support either targeted client IDs or a complete rebuild, providing a reliable recovery mechanism for missing or incorrectly indexed data.
* Established a centralized internal search abstraction so business-facing services expose domain-specific search APIs while forwarding queries to a shared search service, reducing direct coupling to Solr and allowing the underlying search engine to be replaced more easily.
* Added cross-line-of-business and fuzzy-search capabilities that made customer data easier for other development teams to access while reducing reliance on slower, more complex SQL queries.
* Improved reliability by adding scheduled reconciliation jobs that detect missed source-system changes and republish the affected customer data.
* Implemented Grafana monitoring and alerting for indexing failures, with internal tools for manually querying, repopulating, and troubleshooting search data.
* Improved frontend user experience and reduced database load for company websites, point-of-sale systems, and backend applications that rely on customer search.
* Continued as the platform’s subject-matter expert for upgrades and architectural changes after transferring routine maintenance and bug fixes to other developers.

----------------------


#### Developer Documentation and Knowledge Platform

- 2024-2026

<!--
#### Summary
* Independently built a Git and Markdown-based developer knowledge platform using Hugo, GitLab CI/CD, GitLab Pages, and LunrJS, consolidating 20 years of technical documentation into a searchable site used by approximately 50 developers.
* Created migration and preprocessing tooling to repair legacy content and established the documentation model later adopted as the foundation for a company-wide developer AI knowledge base.
-->

* Independently designed and built an internal developer knowledge platform after repeated migrations between documentation systems caused broken links, missing assets, lost content, and declining usability.
* Consolidated approximately 20 years of technical documentation into a centralized Git repository using Markdown, including service architecture, API references, operational procedures, team policies, troubleshooting guidance, and vendor information.
* Developed a documentation preprocessing tool to correct common migration issues, normalize formatting, and prepare legacy content for publishing.
* Built an internal static documentation site using Hugo, GitLab Pages, and LunrJS, providing fast full-text search without requiring a backend service.
* Created GitLab CI/CD pipelines that automatically rebuild and deploy the site whenever documentation is updated.
* Selected Git and Markdown to give developers a familiar, plain-text contribution workflow with version history and code-review compatibility.
* Migrated the team away from an unpopular ServiceNow documentation workflow after the company retired Confluence.
* Grew adoption to approximately 50 developers across the System Integration team and neighboring development groups.
* Improved knowledge sharing, onboarding, troubleshooting, and operational support by giving developers a searchable source for historical and current technical information.
* Established the documentation model that was later selected as the foundation for a broader company developer AI knowledge base.
* Completed the initial design, migration, tooling, deployment, and rollout independently as a self-directed side project.

----------------------


#### JVM Platform Modernization

- 2025-Present

<!--
#### Summary
* Built the team’s first Kotlin/Ktor/Gradle service, establishing a production example for an ongoing migration away from Scala, Akka HTTP, and Maven and helping evaluate a more approachable, maintainable JVM stack for approximately 40 engineers.
-->

* Built the System Integration team’s first Kotlin service, establishing a working production example for using Kotlin, Ktor, and Gradle in place of the team’s traditional Scala, Akka HTTP, Spring, and Maven stack.
* Used the service to define an initial project structure and implementation pattern that other developers could study and adopt for new backend services.
* Helped evaluate Kotlin as a longer-term JVM language that preserves functional programming capabilities while providing a more approachable development experience for engineers unfamiliar with Scala.
* Contributed to the team’s response to declining Scala ecosystem support, the complexity of major Scala upgrades, and Akka’s licensing changes.
* Demonstrated substantially faster compilation and a simpler developer experience with the new stack.
* Helped build team familiarity with Kotlin, Ktor, and Gradle through hands-on use while broader standards, service-generation tooling, and migration plans continue to be developed for a team of approximately 40 engineers.
* Participated in planning for gradual Kotlin adoption within existing JVM services while limiting the initial rollout to new development.

----------------------


#### Dynamic Wireless Promotion Engine

- 2019-2020

<!--
#### Summary
* Helped design and build a UI-configurable promotion engine for Wireless ordering, replacing manually maintained Drools rules with flexible decision trees supporting customer type, sales channel, store, device, contract term, date range, and discount structure.
* Designed a durable rule and data model that evaluates competing promotions, revalidates eligibility at checkout, supports billing-cycle credits, and has remained largely unchanged since its 2020 launch; the architecture was later reused for Home-service promotions.
-->

* Helped design and implement a configurable promotion engine for C Spire’s Wireless ordering platform, replacing a limited system that required manually coded Drools rules and custom workarounds for promotions beyond basic new-customer and device-upgrade offers.
* Contributed to the design of a UI-driven decision-tree model supporting order type, sales channel, individual store locations, device models, contract length, date ranges, and flat-rate or percentage discounts.
* Identified a scalable method for evaluating complex promotion paths by representing decision combinations as ordered permutations, helping establish the core decision-tree architecture.
* Designed promotion data as a persistent tree of uniquely identified qualifications, decisions, and discount values stored in Oracle, allowing promotions and applied discounts to remain traceable throughout ordering, billing, and customer-facing workflows.
* Built billing-cycle logic for applying promotional credits and discounts using Scala and Java Spring microservices.
* Supported generation of Drools rules from promotion configurations, with eligibility evaluated whenever a customer’s cart changed and independently revalidated during order submission.
* Enabled customers to qualify for multiple promotions while automatically receiving the highest-value discount, eliminating previous restrictions caused by conflicting offers.
* Preserved backward compatibility by converting all active legacy promotions into the new system before launch.
* Enabled Marketing staff to create and manage promotions directly, reducing dependency on engineering resources and allowing offers to be launched more quickly with substantially broader qualification options.
* Released the platform to production in 2020 for a Wireless business serving approximately 2 million customers across roughly 150 retail locations.
* Established an architecture that has required no fundamental redesign in six years and was later reused as the foundation for C Spire’s Home-service promotion platform.

----------------------


#### Small-Business Service Enablement

- 2022-2024

<!--
#### Summary
* Led the design and implementation of multi-account Wireless billing for small businesses, consolidating multiple accounts under a primary invoicing account and eliminating manual invoice creation by business representatives.
* Extended the Home ordering platform with a new small-business account type and support for multiple internet and phone connections, enabling eligible companies to avoid enterprise-grade equipment and specialized installation.
-->

**Wireless Multi-Account Billing and Invoicing**

* Led the design of a multi-account billing model that allowed several Wireless accounts to roll up to a designated primary business account for centralized invoicing.
* Implemented new account relationships and billing workflows in Java and Scala Spring services, with Oracle Database persistence and Drools-based order rules.
* Supported business-specific billing requirements, including extended payment terms, centralized payment by an authorized employee, and negotiated bulk-purchase arrangements that were not supported by the standard consumer ordering model.
* Integrated invoice data with the Billing team’s templating process, replacing a manual workflow in which business representatives created invoices after each order.
* Helped enable small businesses to purchase through standard retail channels without entering the company’s more complex Enterprise sales process.
* Released the system to production, where it has supported an estimated 200–300 business customers over several years.

**Home Small-Business Ordering**

* Implemented a new Home small-business account type that allowed eligible companies to purchase internet and phone services without requiring enterprise-grade equipment, specialized installation, or the Enterprise ordering process.
* Built the account model and Drools rules governing which products and services were permitted for the new business account type.
* Expanded a Home ordering system designed around one service of each type to support multiple concurrent internet and phone connections.
* Modified deeply embedded ordering assumptions while maintaining compatibility with existing consumer Home orders.
* Delivered the project using Java and Scala Spring services, Oracle databases, and Drools-based rule processing.
* Released the new ordering flow to production, providing a simpler service path for smaller business customers.

----------------------


#### Customer Communications Platform

- 2019-Present

<!--
#### Summary
* Support a centralized Java/Spring communications platform sending 10,000–50,000 daily customer emails and SMS messages; integrated third-party SMS delivery and designed long-term activity logging to help teams identify overlapping or excessive lifecycle communications.
-->

* Support and enhance a centralized customer communications platform used across C Spire to send approximately 10,000–50,000 daily emails and SMS messages, including order receipts, billing reminders, installation notices, and promotional communications.
* Maintain Java and Spring services backed by Oracle Database and used by teams across the company through synchronous APIs.
* Integrated external SMS vendors, including Kaleyra shortcode messaging, for marketing communications requiring additional compliance and legal safeguards.
* Designed a long-term communications logging system to provide visibility into which messages were sent during customer lifecycle events, helping teams identify overlapping communications and cases where customers received excessive messages from multiple systems.
* Designed and built a full-stack template-management and communications-activity interface intended to let other teams manage templates and review delivery history; the implementation was completed but not launched after project priorities changed.
* Provide ongoing production support and incremental enhancements for templating, personalization, attachments, branding, and communications used across multiple lines of business.

----------------------


#### Windows Tablet eSIM Activation Integration

- 2018

<!--
#### Summary
* Implemented OAuth-secured Akka HTTP APIs for Microsoft and Idemia’s Windows tablet eSIM activation flow, enabling customers to verify their accounts, register devices, add service plans, and begin recurring billing without visiting a store.
-->

* Implemented C Spire’s carrier-side integration for a Microsoft-led eSIM activation experience that allowed customers to activate cellular service directly from compatible Windows tablets purchased outside carrier retail channels.
* Built Akka HTTP REST APIs used by Idemia to submit customer verification and device activation requests after a user selected C Spire as their carrier.
* Secured vendor requests using OAuth and worked within a network-restricted integration environment that limited endpoint access to Idemia traffic.
* Connected the activation flow to internal account, device-registration, service-plan, and recurring-billing systems so customers could add tablet service without visiting a store or contacting a representative.
* Supported one of C Spire’s earliest consumer eSIM use cases beyond Apple Watch activation, helping provide a seamless self-service onboarding experience during the early adoption of eSIM-capable Windows devices.
* Diagnosed integration issues and maintained progress despite limited vendor responsiveness and unreliable test coordination.

----------------------


#### Wireless Ordering Platform

- 2018-2022

* Maintain backend services supporting Wireless orders placed through C Spire’s website and retail point-of-sale systems.
* Support complex carts containing combinations of devices, accessories, plan changes, bill payments, and service additions or removals.
* Maintain shared cart logic consumed by frontend applications and Drools-based validation that adds required services, prevents incompatible selections, and enforces ordering rules as carts are built.
* Support order submission workflows that update billing records, apply promotions, associate devices with subscriptions, calculate taxes, process payments, and activate, deactivate, or modify customer services.
* Work across integrations with Oracle databases, Netcracker-managed billing systems, internal inventory and catalog platforms, and Elavon payment processing.
* Contributed to adjacent ordering initiatives, including the Wireless promotion-engine redesign and a simplified ordering path for small-business customers that avoided the company’s more complex enterprise-ordering process.
