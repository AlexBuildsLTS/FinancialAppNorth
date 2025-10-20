export const requestClientAccess = async (clientEmail: string): Promise<void> => {
  console.log(`Attempting to request client access for: ${clientEmail}`);
  // In a real application, this would involve an API call (e.g., using fetch or an Axios client).
  // For demonstration, we'll simulate a successful or failed request.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (clientEmail.includes('@') && clientEmail.includes('.')) {
        // Simulate a successful response after a delay
        console.log(`Successfully requested client access for ${clientEmail}`);
        resolve();
      } else {
        // Simulate an error response
        console.error(`Failed to request client access for ${clientEmail}: Invalid email format`);
        reject(new Error('Invalid email format. Please provide a valid email address.'));
      }
    }, 1500); // Simulate network latency
  });
};
