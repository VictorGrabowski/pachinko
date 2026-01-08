# Contributing to Pachinko Game

Thank you for your interest in contributing! This document provides guidelines for collaborating on this project.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open browser at `http://localhost:3000`

## Code Conventions

### Naming Conventions
- **Classes**: PascalCase (e.g., `GameScene`, `Ball`, `AudioSystem`)
- **Functions/Variables**: camelCase (e.g., `launchBall`, `scoreValue`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DESIGN_CONSTANTS`, `MAX_LIVES`)
- **Files**: Match class names (e.g., `GameScene.js`, `Ball.js`)

### File Organization
- One class per file
- Group imports by category (Phaser, local entities, utilities)
- Add blank lines between import groups

### Comments
- Use JSDoc for all public methods
- Inline comments for complex logic only
- Keep comments concise and meaningful

### Example Class Structure
```javascript
import Phaser from 'phaser';
import { DESIGN_CONSTANTS } from '../config/gameConfig.js';

/**
 * Brief class description
 */
export default class MyClass extends Phaser.Scene {
  constructor() {
    super({ key: 'MyClass' });
  }

  /**
   * Method description
   * @param {type} paramName - Description
   */
  myMethod(paramName) {
    // Implementation
  }
}
```

## Git Workflow

### Branch Naming
- Features: `feature/description` (e.g., `feature/combo-system`)
- Bug fixes: `bugfix/description` (e.g., `bugfix/ball-collision`)
- Refactoring: `refactor/description` (e.g., `refactor/scene-structure`)

### Commit Messages
Use conventional commits format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add combo multiplier system
fix: resolve pin collision detection issue
docs: update architecture documentation
```

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes with clear commits
3. Ensure code passes linting and tests
4. Update documentation if needed
5. Open PR with clear description
6. Request review from at least one developer
7. Address review feedback
8. Squash commits before merging

## Testing

### Running Tests
```bash
npm run test
```

### Test Coverage
- Aim for 80%+ code coverage
- Write unit tests for all entities and systems
- Write integration tests for scene interactions

### Manual Testing Checklist
- [ ] Game starts without errors
- [ ] Ball physics work correctly
- [ ] Pin collisions register properly
- [ ] Score updates correctly
- [ ] Lives decrement on ball loss
- [ ] Game over triggers correctly
- [ ] Menu navigation works
- [ ] Visual effects display properly

## Documentation

### When to Update Docs
- Adding new systems or major features → Update `ARCHITECTURE.md`
- Design decisions or aesthetic changes → Update `DESIGN_PHILOSOPHY.md`
- API changes → Update `API_REFERENCE.md`
- New contributors → Update `CONTRIBUTING.md`

### Documentation Style
- Be concise but thorough
- Include code examples where helpful
- Explain the "why" not just the "what"
- Keep language accessible

## Code Review Guidelines

### As a Reviewer
- Be constructive and respectful
- Point out both positives and areas for improvement
- Check for code quality, not just functionality
- Verify documentation is updated
- Test the changes locally when possible

### As a Reviewee
- Respond to all comments
- Be open to feedback
- Explain your reasoning when needed
- Make requested changes promptly

## Performance Guidelines

- Maintain 60fps during gameplay
- Limit active particles (< 100 simultaneous)
- Reuse objects when possible (object pooling)
- Profile performance for major changes
- Optimize asset sizes

## Accessibility

- Ensure game is playable with mouse/touch
- Provide clear visual feedback
- Use readable font sizes
- Maintain good color contrast
- Consider colorblind-friendly palettes

## Questions?

If you have questions or need help:
1. Check existing documentation
2. Search closed issues
3. Ask in team chat/Discord
4. Open a discussion issue

Thank you for contributing! 🎌
