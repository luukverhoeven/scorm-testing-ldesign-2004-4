import { Scorm2004API } from '../types';

class ScormService {
  private api: Scorm2004API | null = null;
  public version: string = "2004 4th Edition";

  /**
   * Recursive function to find the API_1484_11 object in window hierarchy
   * SCORM 2004 uses API_1484_11, NOT API (which is SCORM 1.2)
   */
  private findAPI(win: any): Scorm2004API | null {
    let attempts = 0;
    const maxAttempts = 500;
    
    while ((win.API_1484_11 == null) && (win.parent != null) && (win.parent !== win)) {
      attempts++;
      if (attempts > maxAttempts) {
        return null;
      }
      win = win.parent;
    }
    
    return win.API_1484_11;
  }

  public initialize(): boolean {
    try {
        // Search in current window
        this.api = this.findAPI(window);
        
        // If not found and we have an opener (popup scenario)
        if (!this.api && window.opener) {
            this.api = this.findAPI(window.opener);
        }

        if (this.api) {
            const result = this.api.Initialize("");
            return result === "true";
        }
        return false;
    } catch (e) {
        console.error("Error finding SCORM API", e);
        return false;
    }
  }

  public terminate(): boolean {
    if (!this.api) return false;
    const result = this.api.Terminate("");
    return result === "true";
  }

  public getValue(element: string): string {
    if (!this.api) return "";
    return this.api.GetValue(element);
  }

  public setValue(element: string, value: string): boolean {
    if (!this.api) return false;
    const result = this.api.SetValue(element, value);
    return result === "true";
  }

  public commit(): boolean {
    if (!this.api) return false;
    const result = this.api.Commit("");
    return result === "true";
  }

  public getLastError(): string {
    if (!this.api) return "";
    return this.api.GetLastError();
  }

  public getErrorString(errorCode: string): string {
    if (!this.api) return "";
    return this.api.GetErrorString(errorCode);
  }
  
  public getDiagnostic(errorCode: string): string {
      if(!this.api) return "";
      return this.api.GetDiagnostic(errorCode);
  }

  public isConnected(): boolean {
    return this.api !== null;
  }
}

export const scormService = new ScormService();