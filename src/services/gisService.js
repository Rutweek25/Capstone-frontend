/**
 * Singleton Google Identity Services (GIS) Manager
 *
 * Ensures window.google.accounts.id.initialize is called exactly once per client ID,
 * preventing repeated initialization warnings under React Strict Mode, route changes,
 * or component re-renders, while maintaining active callback references.
 */

let initializedClientId = null
let activeCredentialHandler = null

export const gisService = {
  /**
   * Initializes Google Identity Services if not already initialized for this client ID.
   * Dynamically routes credential responses to the currently active handler.
   *
   * @param {string} clientId - The Google OAuth client ID
   * @param {Function} onCredentialResponse - The handler for received Google ID token
   * @returns {boolean} Whether GIS is successfully initialized
   */
  initialize(clientId, onCredentialResponse) {
    activeCredentialHandler = onCredentialResponse

    if (typeof window === 'undefined' || !window.google?.accounts?.id || !clientId) {
      return false
    }

    // Prevent duplicate window.google.accounts.id.initialize calls
    if (initializedClientId === clientId) {
      return true
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (typeof activeCredentialHandler === 'function') {
            activeCredentialHandler(response)
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      })
      initializedClientId = clientId
      return true
    } catch (err) {
      console.warn('GIS singleton initialization error:', err)
      return false
    }
  },

  /**
   * Renders the official Google Sign-In button into a target DOM element.
   *
   * @param {HTMLElement} element - The DOM element to render the button into
   * @param {Object} options - Google renderButton configuration options
   */
  renderButton(element, options = {}) {
    if (typeof window === 'undefined' || !window.google?.accounts?.id || !element) {
      return false
    }

    try {
      element.innerHTML = ''
      window.google.accounts.id.renderButton(element, {
        theme: 'filled_black',
        size: 'large',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 320,
        ...options
      })
      return true
    } catch (err) {
      console.warn('GIS button render error:', err)
      return false
    }
  },

  /**
   * Checks if GIS SDK script is loaded on window
   */
  isLoaded() {
    return typeof window !== 'undefined' && Boolean(window.google?.accounts?.id)
  },

  /**
   * Clears active handler on component unmount if it matches
   */
  unregisterHandler(handler) {
    if (activeCredentialHandler === handler) {
      activeCredentialHandler = null
    }
  }
}

export default gisService
