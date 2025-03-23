# 🤝 Contributing to Okto SDK TS Template

Thank you for your interest in contributing to the Okto SDK TS template! We welcome contributions that help improve the template and make it more valuable for developers building Web3 applications.

## Development Workflow 🧑‍💻

To contribute to this template, please follow this standard Git workflow:

1. **Fork the Repository:** Create your own fork of the `okto-sdkv2-ts-template-app` repository on GitHub.

2. **Create a Feature Branch:** Create a dedicated branch for your contribution, named descriptively:
   ```bash
   git checkout -b feat/your-feature-name 
   # Example: git checkout -b feat/add-whatsapp-authentication
   ```

3. **Commit Your Changes:** Make your changes and commit them. Please adhere to [Conventional Commits](https://www.conventionalcommits.org) for commit message formatting:
   ```bash
   git commit -m "feat: add whatsapp otp authentication"
   ```

4. **Push to Your Fork:** Push your feature branch to your forked repository:
   ```bash
   git push origin feat/your-feature-name
   ```

5. **Submit a Pull Request (PR):** Open a Pull Request against the `main` branch of the main repository.

## Development Standards 📚

### Code Quality

- **TypeScript:** Use TypeScript for all new code
- **ESLint & Prettier:** Ensure your code follows our linting rules
- **Component Structure:** Follow the established component architecture
- **Performance:** Ensure your changes don't negatively impact performance

### Project Structure

Maintain the established project structure:

```
├── app/                # Next.js app directory
│   ├── components/     # Reusable UI components
│   └── page.tsx       # Main page component
├── public/            # Static assets
└── ...configuration files
```

### Best Practices

- **Component Design:** Create reusable, modular components
- **State Management:** Follow established patterns for state management
- **Error Handling:** Implement proper error handling and user feedback
- **Environment Variables:** Document any new environment variables
- **Dependencies:** Minimize new dependencies and justify their addition

## Issue Reporting 🐛

Help us improve by submitting detailed issue reports using these templates:

### Bug Report Template

```markdown
## Bug Description

[Concise summary of the bug]

## Steps to Reproduce

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Expected Behavior

[What should happen]

## Actual Behavior

[What actually happens]

## Environment

- **Operating System:** [e.g., macOS, Windows, Linux]
- **Node.js Version:** [e.g., v18.x]
- **NPM Version:** [e.g., v10.x]
- **Browser:** [e.g., Chrome, Firefox, Safari]
- **Okto SDK Version:** [e.g., @okto_web3/react-sdk v0.2.1]
```

### Feature Request Template

```markdown
## Feature Request: [Title]

## Problem Statement

[Describe the problem this feature would solve]

## Proposed Solution

[Describe your proposed solution]

## Benefits

[List the benefits of implementing this feature]

## Additional Context

[Any other relevant information]
```

## Join the Community 💬

For real-time discussions and support:
- Join our [Discord Server](https://discord.com/invite/okto-916349620383252511)