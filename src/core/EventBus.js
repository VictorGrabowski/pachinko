/**
 * EventBus - Centralized Event Communication
 * 
 * Replaces direct scene.get().events.emit() pattern with a decoupled event system.
 * Scenes and modules can emit/listen to events without knowing about each other.
 * 
 * Event Naming Convention:
 *   - Use colon-separated namespaces: 'score:update', 'ball:launched', 'game:over'
 *   - Domain prefixes: score, ball, game, ui, audio, budget
 * 
 * Usage:
 *   // Emitting events (GameScene):
 *   EventBus.emit('score:update', { score: 100, multiplier: 2 });
 *   EventBus.emit('ball:launched', { ball, velocity });
 * 
 *   // Listening to events (UIScene):
 *   EventBus.on('score:update', this.handleScoreUpdate, this);
 * 
 *   // Remember to clean up in scene shutdown:
 *   EventBus.off('score:update', this.handleScoreUpdate, this);
 * 
 * @module core/EventBus
 */

import Phaser from "phaser";

/**
 * Singleton event emitter for cross-module communication
 * Extends Phaser's EventEmitter for consistency with game framework
 */
const EventBus = new Phaser.Events.EventEmitter();

/**
 * Standard event names used across the game
 * Import these constants to avoid typos in event names
 */
export const GameEvents = {
    // Score events
    SCORE_UPDATE: 'score:update',
    SCORE_MULTIPLIER: 'score:multiplier',
    SCORE_COMBO: 'score:combo',

    // Ball events
    BALL_LAUNCHED: 'ball:launched',
    BALL_LOST: 'ball:lost',
    BALL_HIT_PIN: 'ball:hitPin',
    BALL_HIT_BUCKET: 'ball:hitBucket',

    // Game flow events
    GAME_START: 'game:start',
    GAME_OVER: 'game:over',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',

    // Budget events
    BUDGET_UPDATE: 'budget:update',
    BUDGET_WIN: 'budget:win',
    BUDGET_BET_PLACED: 'budget:betPlaced',

    // UI events
    UI_BALLS_UPDATE: 'ui:ballsUpdate',
    UI_MESSAGE: 'ui:message',
    UI_FLASH: 'ui:flash',

    // Audio events
    AUDIO_PLAY: 'audio:play',
    AUDIO_STOP: 'audio:stop',

    // Feature events
    FEATURE_TOGGLED: 'feature:toggled',

    // Theme events
    PALETTE_CHANGED: 'palette:changed',
};

export default EventBus;
