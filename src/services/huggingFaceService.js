import {API_URL} from '../const'
export const query = async ({ inputs, character }) => {
  try {
    const response = await fetch(`${API_URL}/api/llm/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({ inputs, character })
    });

    if (!response.ok) {
      throw new Error('Server request failed');
    }

    const data = await response.json();
    return data.response; // This is the cleaned and processed text from the server
  } catch (error) {
    console.error('Error calling server API:', error);
    throw error;
  }
};
