/**
 * API layer for communicating with the FastAPI RAG backend.
 * Uses Vite environment variables for configuration.
 */

const getApiUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
  return baseUrl
}

/**
 * Send a question to the RAG backend and get an answer.
 * @param {string} query - The user's question
 * @returns {Promise} - The backend response with answer and sources
 * @throws {Error} - Network or HTTP errors
 */
export async function askQuestion(query) {
  if (!query || !query.trim()) {
    throw new Error('Query cannot be empty')
  }

  const url = `${getApiUrl()}/ask`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query.trim() }),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    // Handle fetch errors (network issues, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the RAG backend. Please make sure the FastAPI server is running on http://127.0.0.1:8000')
    }
    throw error
  }
}

/**
 * Analyze a satellite image with a question using multimodal RAG.
 * @param {Object} imageData - Image data object with { dataUrl, name }
 * @param {string} question - The user's question about the image
 * @returns {Promise} - The backend response with answer, visual_description, and sources
 * @throws {Error} - Network or HTTP errors
 */
export async function analyzeImage(imageData, question) {
  if (!question || !question.trim()) {
    throw new Error('Question cannot be empty')
  }

  if (!imageData || !imageData.dataUrl) {
    throw new Error('Image data is missing')
  }

  const url = `${getApiUrl()}/analyze`

  try {
    // Convert data URL to Blob
    const response = await fetch(imageData.dataUrl)
    const blob = await response.blob()

    // Create FormData with image and question
    const formData = new FormData()
    formData.append('image', blob, imageData.name || 'image')
    formData.append('question', question.trim())

    // Send to backend
    // Note: Do NOT set Content-Type header - browser will set multipart/form-data boundary
    const fetchResponse = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!fetchResponse.ok) {
      throw new Error(`Backend error: ${fetchResponse.status} ${fetchResponse.statusText}`)
    }

    const data = await fetchResponse.json()
    return data
  } catch (error) {
    // Handle fetch errors (network issues, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the RAG backend. Please make sure the FastAPI server is running on http://127.0.0.1:8000')
    }
    throw error
  }
}

/**
 * Analyze temporal change between two satellite images using multimodal RAG.
 * @param {Object} beforeImage - Image data object for the earlier observation { dataUrl, name }
 * @param {Object} afterImage - Image data object for the later observation { dataUrl, name }
 * @param {string} question - The user's question about the change
 * @returns {Promise} - The backend response with answer, before_description, and after_description
 * @throws {Error} - Network or HTTP errors
 */
export async function analyzeImageChange(beforeImage, afterImage, question) {
  if (!question || !question.trim()) {
    throw new Error('Question cannot be empty')
  }

  if (!beforeImage || !beforeImage.dataUrl) {
    throw new Error('Before image data is missing')
  }

  if (!afterImage || !afterImage.dataUrl) {
    throw new Error('After image data is missing')
  }

  const url = `${getApiUrl()}/analyze-change`

  try {
    // Convert data URLs to Blobs
    const beforeResponse = await fetch(beforeImage.dataUrl)
    const beforeBlob = await beforeResponse.blob()
    const afterResponse = await fetch(afterImage.dataUrl)
    const afterBlob = await afterResponse.blob()

    // Create FormData with both images and question
    const formData = new FormData()
    formData.append('before_image', beforeBlob, beforeImage.name || 'before_image')
    formData.append('after_image', afterBlob, afterImage.name || 'after_image')
    formData.append('question', question.trim())

    // Send to backend
    // Note: Do NOT set Content-Type header - browser will set multipart/form-data boundary
    const fetchResponse = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!fetchResponse.ok) {
      throw new Error(`Backend error: ${fetchResponse.status} ${fetchResponse.statusText}`)
    }

    const data = await fetchResponse.json()
    return data
  } catch (error) {
    // Handle fetch errors (network issues, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the RAG backend. Please make sure the FastAPI server is running on http://127.0.0.1:8000')
    }
    throw error
  }
}
