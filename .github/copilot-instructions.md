**Coding Guidelines for Inflation Impact Website**

---

### **1. Project Structure & Code Organization**

- Use a **component-based architecture** with reusable React components.
- Keep components **small and focused** (single responsibility principle).
- Separate concerns in the `src/` directory:
  - **`assets`** → Static assets (images, icons).
  - **`components`** → UI components (buttons, inputs, charts, etc.).
  - **`layouts`** → Layout components (header, footer).
  - **`pages`** → Page-specific components (home, simulator).
  - **`services`** → API services (fetching data, handling API calls).
  - **`styles`** → Global styles (TailwindCSS).
  - **`utils`** → Utility functions (inflation calculations, social sharing, etc).

### **2. Writing Clean TS/React Code**
- Use **descriptive variable and function names**.
- Write **self-documenting code** (avoid unnecessary comments).
- Use **arrow functions** for functional components.
- Use **async/await** for asynchronous code.
- Avoid using **magic numbers**; define constants for fixed values.
- Use **template literals** for string interpolation.
- Use **default parameters** for functions where applicable.
- Use **optional chaining** and **nullish coalescing** for safer property access.
- Use **array destructuring** for cleaner code.
- Use **React hooks** for state and lifecycle management.
- Use **React.memo** for performance optimization of functional components.
- Use **PropTypes** or **TypeScript** for type checking in React components.
- Use **useEffect** for side effects in functional components.

### **3. Testing & Quality Assurance**
- Use TDD (Test Driven Development) approach: write tests before implementing features.
- Write **unit tests** for all utility functions and components.
- Write **integration tests** for components that interact with APIs.
- Write **snapshot tests** for components to ensure UI consistency.
- Write **end-to-end tests** for critical user flows (e.g., simulator, data fetching).
- Use **Jest** for unit testing.
- Use **React Testing Library** for component testing.
- Use **Playwright** for end-to-end testing.
- Ensure **100% test coverage**.
- Use **Prettier** for code formatting.
- Use **ESLint** for linting JavaScript and TypeScript code.
- Use **TypeScript** for type safety and better developer experience.
- Use **commitlint** to enforce commit message conventions.
- Make sure to run type checks, formatting, linting, and tests before committing code.
- Use **Husky** and **lint-staged** for pre-commit hooks to run type checks, formatters, linters and tests.

### **4. CI**
- Use **GitHub Actions** for continuous integration.
- Run **formatting, **linting**, **type-checking**, and **tests** on every pull request 
  and commit to the main branch.
- Use **Netlify** for continuous deployment.
- Use **release-please** for automated versioning and changelog generation.

### **5. Deployment**
- Use **Netlify** and **release-please** for deployment out of the main branch.

### **6. Performance**
- Use **Lighthouse** for performance testing.
- Aim for a **Lighthouse score** of 90+ for performance, accessibility, and SEO.
- Run Lighthouse audits after every deployment and rollback if score is below 90.
- Optimize images and assets for faster loading times.
- Use **code splitting** and **lazy loading** for large components.

### **7. TypeScript Best Practices**

- Use **strict typing** (`strict: true` in `tsconfig.json`).
- Define **types/interfaces** for all props and state variables.
- Prefer **TypeScript enums** over string literals for fixed values.
- Use **utility types** where applicable (`Partial<T>`, `Readonly<T>`).

### **8. API Calls & Data Handling**

- Use the **OECD API** to fetch inflation data dynamically.
- Handle **CORS issues** properly (use proxy if needed).
- Cache API responses where possible to improve performance.
- Fetch data **client-side** (Astro generates static files, React handles interactivity).

### **9. UI & Styling**

- Use **TailwindCSS** for styling.
- Ensure **responsiveness** (mobile-first design, flexible layouts).
- Maintain **high contrast & readability** for accessibility.
- Follow **BEM** for class naming.

### **10. Graph & Visualization**

- Use **Recharts** for data visualization.
- Graph should emphasize **difference between nominal and inflation-adjusted salaries**.
- Display **percentage loss due to inflation** clearly.
- Implement **animations**: show nominal salary first, then inflation-adjusted.
- Ensure **hover tooltips** display exact values for each month.

### **11. Social Media Sharing**

- Implement **Open Graph meta tags** for Twitter/X, Facebook, LinkedIn.
- Only share **anonymized data** (hide exact salary values, only % loss).

### **12. Accessibility (a11y) Standards**

- Follow **WCAG 2.1 AA guidelines**.
- Use **semantic HTML** (`<button>` instead of `<div onClick>`).
- Ensure all interactive elements are **keyboard navigable**.
- Provide **ARIA labels** where necessary.
- Test with screen readers (e.g., NVDA, VoiceOver).

---

These guidelines ensure clean, maintainable, and accessible code while keeping the website performant and user-friendly. Let me know if you’d like any changes!