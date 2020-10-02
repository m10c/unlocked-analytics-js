import Analytics from './Analytics';

// Singleton
const analytics = new Analytics();
Object.freeze(analytics);

export default analytics;
