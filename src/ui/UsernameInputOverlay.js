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
    // Get colors from DESIGN_CONSTANTS (convert hex to CSS)
    const goldColor = '#FFD700';
    const primaryColor = '#F4A460';
    const accentColor = '#FF6B35';
    const bgColor = '#2E3A59';
    const sakuraColor = '#FFB7C5';
    
    // Create container with fade-in animation
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
      animation: fadeIn 0.3s ease-out;
    `;

    // Create modal panel with Japanese-inspired design
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: linear-gradient(180deg, rgba(46, 58, 89, 0.98), rgba(26, 26, 46, 0.99));
      border: 3px solid ${goldColor};
      border-radius: 16px;
      padding: 45px 40px;
      max-width: 420px;
      width: 90%;
      box-shadow: 0 0 40px rgba(255, 215, 0, 0.25), inset 0 0 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      position: relative;
      animation: slideUp 0.4s ease-out;
    `;

    // Japanese decorative element (top)
    const decorTop = document.createElement('div');
    decorTop.innerHTML = '✿ ─── ✿';
    decorTop.style.cssText = `
      color: ${sakuraColor};
      font-size: 18px;
      letter-spacing: 8px;
      margin-bottom: 15px;
      opacity: 0.7;
    `;

    // Title with Japanese characters
    const titleJp = document.createElement('div');
    titleJp.textContent = 'ようこそ';
    titleJp.style.cssText = `
      color: ${primaryColor};
      font-size: 16px;
      margin-bottom: 5px;
      letter-spacing: 4px;
      opacity: 0.8;
    `;

    // Title
    const title = document.createElement('h2');
    title.textContent = this.languageManager.getText('username.title');
    title.style.cssText = `
      color: ${goldColor};
      font-size: 36px;
      margin: 0 0 8px 0;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      letter-spacing: 3px;
    `;

    // Decorative line under title
    const titleLine = document.createElement('div');
    titleLine.style.cssText = `
      width: 80px;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${goldColor}, transparent);
      margin: 0 auto 20px auto;
    `;

    // Prompt text
    const prompt = document.createElement('p');
    prompt.textContent = this.languageManager.getText('username.prompt');
    prompt.style.cssText = `
      color: ${primaryColor};
      font-size: 18px;
      margin: 0 0 25px 0;
    `;

    // Input field with enhanced styling
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.placeholder = this.languageManager.getText('username.placeholder');
    this.inputElement.maxLength = 12;
    this.inputElement.style.cssText = `
      width: 100%;
      padding: 14px 16px;
      font-size: 20px;
      border: 2px solid ${primaryColor};
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      color: ${goldColor};
      font-family: serif;
      text-align: center;
      outline: none;
      transition: all 0.3s ease;
      box-sizing: border-box;
      letter-spacing: 1px;
    `;

    // Input focus effects
    this.inputElement.addEventListener('focus', () => {
      this.inputElement.style.borderColor = goldColor;
      this.inputElement.style.background = 'rgba(255, 255, 255, 0.12)';
      this.inputElement.style.boxShadow = `0 0 15px rgba(255, 215, 0, 0.4)`;
    });

    this.inputElement.addEventListener('blur', () => {
      this.inputElement.style.borderColor = primaryColor;
      this.inputElement.style.background = 'rgba(255, 255, 255, 0.08)';
      this.inputElement.style.boxShadow = 'none';
    });

    // Validation text
    const validation = document.createElement('p');
    validation.textContent = this.languageManager.getText('username.validation');
    validation.style.cssText = `
      color: ${sakuraColor};
      font-size: 13px;
      margin: 10px 0 25px 0;
      opacity: 0.7;
    `;

    // Error message
    const errorMsg = document.createElement('p');
    errorMsg.id = 'username-error';
    errorMsg.style.cssText = `
      color: ${accentColor};
      font-size: 14px;
      margin: 12px 0 0 0;
      min-height: 20px;
      font-weight: bold;
    `;

    // Submit button with enhanced Japanese styling
    const submitBtn = document.createElement('button');
    submitBtn.textContent = this.languageManager.getText('username.submit');
    submitBtn.style.cssText = `
      background: linear-gradient(135deg, ${goldColor}, ${primaryColor});
      border: none;
      border-radius: 10px;
      padding: 16px 40px;
      font-size: 18px;
      font-weight: bold;
      color: ${bgColor};
      cursor: pointer;
      font-family: serif;
      transition: all 0.3s ease;
      margin-top: 5px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      letter-spacing: 1px;
    `;

    submitBtn.addEventListener('mouseenter', () => {
      submitBtn.style.transform = 'scale(1.05) translateY(-2px)';
      submitBtn.style.boxShadow = `0 8px 20px rgba(255, 215, 0, 0.4)`;
    });

    submitBtn.addEventListener('mouseleave', () => {
      submitBtn.style.transform = 'scale(1) translateY(0)';
      submitBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
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
        this.inputElement.style.borderColor = accentColor;
        
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

    // Japanese decorative element (bottom)
    const decorBottom = document.createElement('div');
    decorBottom.innerHTML = '─── ❀ ───';
    decorBottom.style.cssText = `
      color: ${sakuraColor};
      font-size: 14px;
      letter-spacing: 6px;
      margin-top: 25px;
      opacity: 0.5;
    `;

    // Assemble modal
    modal.appendChild(decorTop);
    modal.appendChild(titleJp);
    modal.appendChild(title);
    modal.appendChild(titleLine);
    modal.appendChild(prompt);
    modal.appendChild(this.inputElement);
    modal.appendChild(validation);
    modal.appendChild(submitBtn);
    modal.appendChild(errorMsg);
    modal.appendChild(decorBottom);

    this.container.appendChild(modal);

    // Add animations and shake CSS
    const style = document.createElement('style');
    style.id = 'username-overlay-styles';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { 
          opacity: 0;
          transform: translateY(20px);
        }
        to { 
          opacity: 1;
          transform: translateY(0);
        }
      }
      #username-overlay input::placeholder {
        color: rgba(244, 164, 96, 0.5);
      }
    `;
    
    // Only add style if not already present
    if (!document.getElementById('username-overlay-styles')) {
      document.head.appendChild(style);
    }

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
