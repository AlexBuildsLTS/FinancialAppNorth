import { supabase } from '../lib/supabase';

export async function generateContent(prompt: string, userId?: string, image?: string): Promise<string> {
  // Validate prompt with detailed checks
  if (!prompt) {
    console.error('[GeminiService] Prompt is null or undefined');
    throw new Error('Prompt is required and must be a non-empty string');
  }
  
  if (typeof prompt !== 'string') {
    console.error('[GeminiService] Prompt is not a string:', typeof prompt, prompt);
    throw new Error('Prompt must be a string');
  }
  
  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length === 0) {
    console.error('[GeminiService] Prompt is empty after trimming');
    throw new Error('Prompt cannot be empty');
  }
  
  // Ensure minimum prompt length
  if (trimmedPrompt.length < 10) {
    console.warn('[GeminiService] Prompt is suspiciously short:', trimmedPrompt);
  }

  try {
    // Build request body with proper validation
    const requestBody: { prompt: string; userId?: string; image?: string } = {
      prompt: trimmedPrompt,
    };
    
    if (userId && typeof userId === 'string' && userId.trim().length > 0) {
      requestBody.userId = userId.trim();
    }
    
    if (image && typeof image === 'string' && image.trim().length > 0) {
      // Remove data URL prefix if present
      const cleanImage = image.includes(',') ? image.split(',')[1] : image.trim();
      if (cleanImage.length > 0) {
        requestBody.image = cleanImage;
      }
    }

    // Ensure request body is properly formatted
    const finalRequestBody = JSON.parse(JSON.stringify(requestBody));
    
    console.log('[GeminiService] Calling edge function with:', {
      promptLength: trimmedPrompt.length,
      promptPreview: trimmedPrompt.substring(0, 100),
      hasUserId: !!finalRequestBody.userId,
      hasImage: !!finalRequestBody.image,
      requestBodyKeys: Object.keys(finalRequestBody),
      requestBodyStringified: JSON.stringify(finalRequestBody)
    });

    let responseData: any;
    let responseError: any;
    
    try {
      const result = await supabase.functions.invoke('ai-chat', {
        body: finalRequestBody
      });
      
      responseData = result.data;
      responseError = result.error;
      
      // If we have an error, try to extract more details
      if (responseError) {
        // The Supabase client might wrap the error, try to get the actual response
        const errorObj = responseError as any;
        
        console.error('[GeminiService] Full error object structure:', {
          keys: Object.keys(errorObj),
          message: errorObj.message,
          name: errorObj.name,
          status: errorObj.status,
          statusText: errorObj.statusText,
          context: errorObj.context,
          response: errorObj.response,
          data: errorObj.data,
          body: errorObj.body,
          // Try to stringify the entire object to see what we have
          stringified: JSON.stringify(errorObj, null, 2)
        });
        
        // For FunctionsHttpError, the error message might be in the message itself
        if (errorObj.message && typeof errorObj.message === 'string') {
          // Try to parse JSON from the message if it contains JSON
          const messageMatch = errorObj.message.match(/\{.*\}/s);
          if (messageMatch) {
            try {
              const parsed = JSON.parse(messageMatch[0]);
              if (parsed.error) {
                return `AI Error: ${parsed.error}${parsed.details ? ` (${parsed.details})` : ''}`;
              }
            } catch (e) {
              // Not JSON in message
            }
          }
        }
        
        // Try multiple ways to access the error response
        if (errorObj.context?.body) {
          try {
            const errorBody = typeof errorObj.context.body === 'string' 
              ? JSON.parse(errorObj.context.body)
              : errorObj.context.body;
            console.error('[GeminiService] Error from context.body:', errorBody);
            if (errorBody?.error) {
              return `AI Error: ${errorBody.error}${errorBody.details ? ` (${errorBody.details})` : ''}`;
            }
          } catch (parseErr) {
            // Ignore
          }
        }
        
        // Try to get error from response property
        if (errorObj.response) {
          try {
            const errorBody = typeof errorObj.response === 'string'
              ? JSON.parse(errorObj.response)
              : errorObj.response;
            console.error('[GeminiService] Error from response:', errorBody);
            if (errorBody?.error) {
              return `AI Error: ${errorBody.error}${errorBody.details ? ` (${errorBody.details})` : ''}`;
            }
          } catch (parseErr) {
            // Ignore
          }
        }
        
        // Try to get error from data property
        if (errorObj.data) {
          try {
            const errorBody = typeof errorObj.data === 'string'
              ? JSON.parse(errorObj.data)
              : errorObj.data;
            console.error('[GeminiService] Error from data:', errorBody);
            if (errorBody?.error) {
              return `AI Error: ${errorBody.error}${errorBody.details ? ` (${errorBody.details})` : ''}`;
            }
          } catch (parseErr) {
            // Ignore
          }
        }
        
        // Try to get error from body property
        if (errorObj.body) {
          try {
            const errorBody = typeof errorObj.body === 'string'
              ? JSON.parse(errorObj.body)
              : errorObj.body;
            console.error('[GeminiService] Error from body:', errorBody);
            if (errorBody?.error) {
              return `AI Error: ${errorBody.error}${errorBody.details ? ` (${errorBody.details})` : ''}`;
            }
          } catch (parseErr) {
            // Ignore
          }
        }
        
        // Last resort: use the error message or status
        if (errorObj.message) {
          return `AI Error: ${errorObj.message}`;
        }
        if (errorObj.status) {
          return `AI Error: Request failed with status ${errorObj.status}`;
        }
      }
    } catch (invokeError: any) {
      console.error('[GeminiService] Invoke exception:', {
        error: invokeError,
        message: invokeError?.message,
        stack: invokeError?.stack,
        name: invokeError?.name,
        // Try to extract response from the error
        response: invokeError?.response,
        data: invokeError?.data,
        context: invokeError?.context
      });
      
      // If it's a FunctionsHttpError, try to extract the response body
      if (invokeError?.response) {
        try {
          const errorBody = await invokeError.response.text();
          console.error('[GeminiService] Error response body:', errorBody);
          try {
            const errorJson = JSON.parse(errorBody);
            if (errorJson.error) {
              return `AI Error: ${errorJson.error}${errorJson.details ? ` (${errorJson.details})` : ''}`;
            }
          } catch (parseErr) {
            // Not JSON, use raw text
            if (errorBody) {
              return `AI Error: ${errorBody.substring(0, 200)}`;
            }
          }
        } catch (textErr) {
          // Couldn't read response body
        }
      }
      
      // Try to get error from context
      if (invokeError?.context?.body) {
        try {
          const errorBody = typeof invokeError.context.body === 'string'
            ? JSON.parse(invokeError.context.body)
            : invokeError.context.body;
          if (errorBody?.error) {
            return `AI Error: ${errorBody.error}${errorBody.details ? ` (${errorBody.details})` : ''}`;
          }
        } catch (parseErr) {
          // Ignore
        }
      }
      
      return "I'm having trouble connecting to the AI. Please try again in a moment.";
    }

    if (responseError) {
      // Log comprehensive error details
      console.error('[GeminiService] Edge Function Error:', {
        error: responseError,
        message: responseError.message,
        context: responseError.context,
        status: responseError.status,
        statusText: responseError.statusText,
        name: responseError.name,
        // Try to extract error details from the response
        response: (responseError as any)?.response,
        body: (responseError as any)?.body,
        data: (responseError as any)?.data
      });
      
      // Try to extract error message from the error object or response
      let errorMessage = "I'm having trouble connecting to the AI. Please try again in a moment.";
      
      // Check if error has a message property
      if (responseError.message) {
        errorMessage = `AI Error: ${responseError.message}`;
      }
      
      // Check if error has response data with error details
      if ((responseError as any)?.response) {
        try {
          const errorData = typeof (responseError as any).response === 'string' 
            ? JSON.parse((responseError as any).response)
            : (responseError as any).response;
          
          if (errorData?.error) {
            errorMessage = `AI Error: ${errorData.error}`;
            if (errorData.details) {
              console.error('[GeminiService] Error details:', errorData.details);
            }
          }
        } catch (parseErr) {
          // Ignore parse errors
        }
      }
      
      // Check if error has data property with error details
      if ((responseError as any)?.data) {
        try {
          const errorData = (responseError as any).data;
          if (errorData?.error) {
            errorMessage = `AI Error: ${errorData.error}`;
            if (errorData.details) {
              console.error('[GeminiService] Error details:', errorData.details);
            }
          }
        } catch (parseErr) {
          // Ignore parse errors
        }
      }
      
      return errorMessage;
    }

    if (!responseData) {
      console.warn('[GeminiService] No data returned from edge function');
      return "I received no response from the AI.";
    }

    if (!responseData.text || typeof responseData.text !== 'string') {
      console.warn('[GeminiService] Invalid response format:', responseData);
      return "I received an invalid response from the AI.";
    }

    return responseData.text;
  } catch (error: any) {
    console.error('[GeminiService] AI Service Failed:', {
      error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    return "AI Service is temporarily unavailable.";
  }
}