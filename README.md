# AIDiscoveryBoard - Your Curated Guide to the World of AI

Welcome to AIDiscoveryBoard, a web application built with Next.js and Firebase Studio designed to be your central hub for exploring the latest in Artificial Intelligence. This platform allows users to discover AI tools, read insightful blog posts, and explore seminal research papers that have shaped the field.

## Features Implemented

This project has been iteratively developed to include a rich set of features:

*   **AI Tools Directory:** A comprehensive, filterable directory of over 100 AI tools across various categories like Chat, Image Generation, and Developer Tools. Each tool has a dedicated card with a description, tags, and a direct link to its official website.
*   **Curated Blog:** A blog featuring over 25 articles on various AI topics, from generative models to ethical considerations. Each blog post is displayed with an image and tags, and users can click to read the full article on a dedicated details page.
*   **Research Paper Collection:** A curated list of over 30 influential AI research papers. This section provides a quick reference to foundational works in the field, complete with titles, authors, publication dates, and direct links to the papers.
*   **Dynamic Homepage:** The homepage serves as a dashboard, featuring a selection of top AI tools, the latest blog posts, and a list of trending AI prompts to inspire users.
*   **Modern & Responsive UI:** The application features a modern, dark-themed user interface built with ShadCN UI components and Tailwind CSS. It includes a collapsible sidebar for easy navigation that remains fixed while content scrolls, ensuring a seamless user experience on both desktop and mobile devices.

## Development Process

This application was built collaboratively using an AI coding partner. The development process involved a series of conversational prompts to incrementally build and refine the application. For example, a request to build out the research papers feature would be handled with the following approach:

**User Prompt:** *"add miimum latest 30 research paper and proper links icon and title proper"*

**AI Action Plan:**
1.  **Understand the Goal:** The user wants to replace the placeholder "Research" page with a rich, functional directory of at least 30 important AI research papers.
2.  **Data Modeling:** Define a data structure (`ResearchPaper`) in `src/lib/data.ts` to hold the necessary information: id, title, authors, publication date, excerpt, a URL to the paper, and relevant tags.
3.  **Data Population:** Populate the data file with a comprehensive list of over 30 seminal AI research papers, ensuring all data fields are filled with accurate information.
4.  **UI/Component Design:** Redesign the `src/app/research/page.tsx` component to map over the new data and render it. This involves using ShadCN `Card` components to create a clean, organized list. Each card will display the paper's title, authors, publication date, and a brief summary.
5.  **Functionality:** Add a button with an `ExternalLink` icon to each card that links directly to the paper's URL, allowing users to access the source material easily.

This iterative, prompt-driven process was used to build every feature of the application, from initial setup to fixing UI bugs and implementing new data-driven pages.
