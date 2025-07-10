# CV Data Persistence Flow

This document outlines the definitive data flow for uploading, analyzing, and persisting CV data to a developer's profile within the application. This diagram represents the **correct and intended** workflow, including the necessary fixes for data synchronization.

```mermaid
graph TD
    subgraph "Browser"
        A[User uploads CV via UploadForm] --> B{POST /api/cv/upload};
        AA[User accepts AI suggestion] --> BB{PUT /api/cv-analysis/[id]};
    end

    subgraph "API Backend (Next.js)"
        B --> C[1. Upload to AWS S3];
        C --> D["2. Create 'CV' document in MongoDB\n(status: PENDING)"];
        D --> E{3. Analyze CV};
        E --> F[Parse File to Text];
        F --> G["Send Text to AI Model\n(GPT/Gemini)"];
        G --> H[Receive Structured JSON];
        H --> I["4. Create 'CvAnalysis' document\nin MongoDB with JSON result"];
        I --> J["5. Run Background Profile Sync"];

        BB --> K["1. Validate incoming data"];
        K --> L["2. Update 'CvAnalysis' document\nin MongoDB with new result"];
        L --> M["3. Run Background Profile Sync"];
    end

    subgraph "Background Sync Utility"
        J --> N["syncCvDataToProfile() utility"];
        M --> N;
        N --> O["Transforms Analysis JSON\nto Profile Schema"];
        O --> P["Updates Developer Profile collections\n(Experience, Education, Skills, etc.)"];
    end

    subgraph "Data Storage"
        style S3 fill:#FF9900,stroke:#333,stroke-width:2px
        style DB fill:#4DB33D,stroke:#333,stroke-width:2px
        style DB_Analysis fill:#4DB33D,stroke:#333,stroke-width:2px
        style DB_Profile fill:#4DB33D,stroke:#333,stroke-width:2px
        
        C -- Raw File --> S3[AWS S3 Bucket];
        D -- Metadata --> DB["MongoDB\n'CVs' collection"];
        I -- Parsed Data --> DB_Analysis["MongoDB\n'CvAnalyses' collection"];
        L -- Updated Parsed Data --> DB_Analysis;
        P -- Profile Data --> DB_Profile["MongoDB\nDeveloper Profile Collections"];
    end

    subgraph "Data Retrieval & Caching"
        style Redis fill:#D82C20,stroke:#333,stroke-width:2px

        Q["Frontend requests analysis\nGET /api/cv-analysis/[id]"] --> R{Check Redis Cache};
        R -- Cache Hit --> S[Return from Redis];
        R -- Cache Miss --> T{"Fetch from MongoDB\n'CvAnalyses' collection"};
        T --> U[Save to Redis Cache];
        U --> V[Return from DB];
        S --> W[Display on Page];
        V --> W;
    end

    subgraph "User-Facing Triggers"
         A; AA;
    end
``` 