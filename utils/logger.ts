/**
 * Logger personalizado para la aplicación
 * Los logs aparecen en la terminal de Expo cuando ejecutas npm start
 */

const isDevelopment = __DEV__;

export class AppLogger {
  /**
   * Log de información general
   */
  static log(message: string, data?: any) {
    if (isDevelopment) {
      console.log(`📘 [APP] ${message}`, data ? data : '');
    }
  }

  /**
   * Log de éxito
   */
  static success(message: string, data?: any) {
    if (isDevelopment) {
      console.log(`✅ [SUCCESS] ${message}`, data ? data : '');
    }
  }

  /**
   * Log de error
   */
  static error(message: string, error?: any) {
    console.error(`❌ [ERROR] ${message}`, error ? error : '');
  }

  /**
   * Log de advertencia
   */
  static warn(message: string, data?: any) {
    if (isDevelopment) {
      console.warn(`⚠️ [WARNING] ${message}`, data ? data : '');
    }
  }

  /**
   * Log de información de API
   */
  static api(method: string, url: string, data?: any) {
    if (isDevelopment) {
      console.log(`🌐 [API ${method}] ${url}`, data ? data : '');
    }
  }

  /**
   * Log de respuesta de API
   */
  static apiResponse(status: number, url: string, data?: any) {
    if (isDevelopment) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`${emoji} [API RESPONSE ${status}] ${url}`, data ? data : '');
    }
  }

  /**
   * Log de autenticación
   */
  static auth(message: string, data?: any) {
    if (isDevelopment) {
      console.log(`🔐 [AUTH] ${message}`, data ? data : '');
    }
  }

  /**
   * Log de storage
   */
  static storage(action: string, key: string, data?: any) {
    if (isDevelopment) {
      console.log(`💾 [STORAGE ${action}] ${key}`, data ? data : '');
    }
  }

  /**
   * Log de navegación
   */
  static navigation(action: string, screen: string) {
    if (isDevelopment) {
      console.log(`🧭 [NAVIGATION] ${action} -> ${screen}`);
    }
  }

  /**
   * Log debug detallado
   */
  static debug(message: string, data?: any) {
    if (isDevelopment) {
      console.log(`🔍 [DEBUG] ${message}`, data ? data : '');
    }
  }
}

export default AppLogger;
