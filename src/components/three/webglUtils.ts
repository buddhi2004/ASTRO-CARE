export interface WebGLCapabilities {
  supported: boolean;
  isSoftwareGl: boolean;
  reason?: string;
}

let cachedCapabilities: WebGLCapabilities | null = null;

export function detectWebGLCapabilities(forceRefresh = false): WebGLCapabilities {
  if (cachedCapabilities && !forceRefresh) return cachedCapabilities;
  if (typeof document === 'undefined') {
    return { supported: false, isSoftwareGl: true, reason: 'Document unavailable.' };
  }

  let creationErrorReason: string | undefined;
  const canvas = document.createElement('canvas');
  const handleCreationError = (ev: Event) => {
    const status = (ev as WebGLContextEvent).statusMessage;
    if (status) creationErrorReason = status;
  };
  canvas.addEventListener('webglcontextcreationerror', handleCreationError, false);

  try {
    const attrs: WebGLContextAttributes = {
      alpha: true,
      antialias: false,
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false,
    };

    const gl =
      (canvas.getContext('webgl2', attrs) as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl', attrs) as WebGLRenderingContext | null);

    if (!gl || gl.isContextLost()) {
      cachedCapabilities = {
        supported: false,
        isSoftwareGl: true,
        reason:
          creationErrorReason ||
          'WebGL context could not be created in this browser session.',
      };
      return cachedCapabilities;
    }

    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');

    // IMPORTANT: Never call WEBGL_lose_context.loseContext() on the probe canvas.
    // Calling loseContext() signals to Chromium that the page caused context loss,
    // which can cause Chromium to block subsequent WebGL context creation.
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    cachedCapabilities = { supported: true, isSoftwareGl };
    return cachedCapabilities;
  } catch (err) {
    cachedCapabilities = {
      supported: false,
      isSoftwareGl: true,
      reason:
        creationErrorReason ||
        (err instanceof Error ? err.message : 'WebGL context initialization failed.'),
    };
    return cachedCapabilities;
  } finally {
    canvas.removeEventListener('webglcontextcreationerror', handleCreationError, false);
  }
}

