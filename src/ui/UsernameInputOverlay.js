/**
 * Username Input Overlay - HTML-based input for username entry
 * Styled to match Japanese aesthetic with Phaser game
 */
import LanguageManager from '../managers/LanguageManager.js';
import { DESIGN_CONSTANTS } from '../config/gameConfig.js';

export default class UsernameInputOverlay {
  constructor(scene, onSubmit) {
    this.scene = scene;
    this.onSubmit = onSubmit;
    this.container = null;
    this.inputElement = null;
    this.isVisible = false;
    
    this.languageManager = LanguageManager;
  }

  /**
   * Show the username input overlay
   */
  show() {
    if (this.isVisible) return;
    
    this.isVisible = true;
    this.createOverlay();
    
    // Focus input after a short delay to ensure it's rendered
    setTimeout(() => {
      if (this.inputElement) {
        this.inputElement.focus();
      }
    }, 100);
  }

  /**
   * Hide and remove the overlay
   */
  hide() {
    if (!this.isVisible) return;
    
    this.isVisible = false;
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    this.container = null;
    this.inputElement = null;
  }

  /**
   * Create the HTML overlay elements
   */
  createOverlay() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'username-overlay';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(26, 26, 46, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      font-family: serif;
    `;

    // Create modal panel
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: linear-gradient(135deg, rgba(46, 58, 89, 0.95), rgba(26, 26, 46, 0.98));
      border: 3px solid #FFD700;
      border-radius: 12px;
      padding: 40px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      text-align: center;
    `;

    // Title
    const title = document.createElement('h2');
    title.textContent = this.languageManager.getText('username.title');
    title.style.cssText = `
      color: #FFD700;
      font-size: 32px;
      margin: 0 0 10px 0;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    `;

    // Prompt text
    const prompt = document.createElement('p');
    prompt.textContent = this.languageManager.getText('username.prompt');
    prompt.style.cssText = `
      color: #F4A460;
      font-size: 18px;
      margin: 0 0 30px 0;
    `;

    // Input field
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.placeholder = this.languageManager.getText('username.placeholder');
    this.inputElement.maxLength = 12;
    this.inputElement.style.cssText = `
      width: 100%;
      padding: 12px;
      font-size: 18px;
      border: 2px solid #F4A460;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
      color: #FFD700;
      font-family: serif;
      text-align: center;
      outline: none;
      transition: all 0.3s;
      box-sizing: border-box;
    `;

    // Input focus effects
    this.inputElement.addEventListener('focus', () => {
      this.inputElement.style.borderColor = '#FFD700';
      this.inputElement.style.background = 'rgba(255, 255, 255, 0.15)';
      this.inputElement.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
    });

    this.inputElement.addEventListener('blur', () => {
      this.inputElement.style.borderColor = '#F4A460';
      this.inputElement.style.background = 'rgba(255, 255, 255, 0.1)';
      this.inputElement.style.boxShadow = 'none';
    });

    // Validation text
    const validation = document.createElement('p');
    validation.textContent = this.languageManager.getText('username.validation');
    validation.style.cssText = `
      color: #F4A460;
      font-size: 12px;
      margin: 8px 0 20px 0;
      opacity: 0.7;
    `;

    // Error message
    const errorMsg = document.createElement('p');
    errorMsg.id = 'username-error';
    errorMsg.style.cssText = `
      color: #FF6B35;
      font-size: 14px;
      margin: 10px 0 0 0;
      min-height: 20px;
      font-weight: bold;
    `;

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.textContent = this.languageManager.getText('username.submit');
    submitBtn.style.cssText = `
      background: linear-gradient(135deg, #FFD700, #F4A460);
      border: none;
      border-radius: 8px;
      padding: 14px 32px;
      font-size: 18px;
      font-weight: bold;
      color: #2E3A59;
      cursor: pointer;
      font-family: serif;
      transition: all 0.3s;
      margin-top: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    `;

    submitBtn.addEventListener('mouseenter', () => {
      submitBtn.style.transform = 'scale(1.05)';
      submitBtn.style.boxShadow = '0 6px 12px rgba(255, 215, 0, 0.5)';
    });

    submitBtn.addEventListener('mouseleave', () => {
      submitBtn.style.transform = 'scale(1)';
      submitBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    });

    // Submit handler
    const handleSubmit = () => {
      const username = this.inputElement.value.trim();
      
      if (this.validateUsername(username)) {
        errorMsg.textContent = '';
        this.hide();
        if (this.onSubmit) {
          this.onSubmit(username);
        }
      } else {
        errorMsg.textContent = this.languageManager.getText('username.error');
        this.inputElement.style.borderColor = '#FF6B35';
        
        // Shake animation
        this.inputElement.style.animation = 'shake 0.4s';
        setTimeout(() => {
          this.inputElement.style.animation = '';
        }, 400);
      }
    };

    submitBtn.addEventListener('click', handleSubmit);

    // Enter key to submit
    this.inputElement.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    });

    // Assemble modal
    modal.appendChild(title);
    modal.appendChild(prompt);
    modal.appendChild(this.inputElement);
    modal.appendChild(validation);
    modal.appendChild(submitBtn);
    modal.appendChild(errorMsg);

    this.container.appendChild(modal);

    // Add shake animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);

    // Add to DOM
    document.body.appendChild(this.container);
  }

  /**
   * Validate username
   * @param {string} username - Username to validate
   * @returns {boolean} Valid or not
   */
  validateUsername(username) {
    if (!username || username.length < 3 || username.length > 12) {
      return false;
    }
    
    // Allow alphanumeric characters, spaces, and some special characters
    const validPattern = /^[a-zA-Z0-9\s_-]+$/;
    return validPattern.test(username);
  }

  /**
   * Update text when language changes
   */
  updateLanguage() {
    if (!this.isVisible || !this.container) return;
    
    // Re-create overlay with new language
    this.hide();
    this.show();
  }
}
