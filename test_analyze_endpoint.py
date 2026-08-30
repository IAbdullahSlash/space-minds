#!/usr/bin/env python3
"""
Test script for POST /analyze endpoint.
Tests that the endpoint can receive and process an uploaded image and question.
"""

import requests
from io import BytesIO
from PIL import Image
import sys

# Configuration
BACKEND_URL = "http://localhost:8000"
ANALYZE_ENDPOINT = f"{BACKEND_URL}/analyze"

def create_test_image():
    """Create a simple test image (100x100 RGB)."""
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_analyze_endpoint():
    """Test the /analyze endpoint with image and question."""
    
    print("🧪 Testing POST /analyze endpoint...")
    print(f"URL: {ANALYZE_ENDPOINT}\n")
    
    # Create test image
    print("📷 Creating test image...")
    image_file = create_test_image()
    
    # Prepare request
    test_question = "What land cover types are visible in this image?"
    files = {"image": ("test_satellite.jpg", image_file, "image/jpeg")}
    data = {"question": test_question}
    
    print(f"❓ Question: {test_question}")
    print(f"📁 File: test_satellite.jpg (image/jpeg)\n")
    
    try:
        print("⏳ Sending request to backend...")
        response = requests.post(ANALYZE_ENDPOINT, files=files, data=data)
        
        print(f"✅ Response Status: {response.status_code}\n")
        
        if response.status_code == 200:
            result = response.json()
            print("📊 Response JSON:")
            print(f"  - answer: {result.get('answer', 'N/A')[:100]}...")
            print(f"  - visual_description: {result.get('visual_description', 'N/A')[:100]}...")
            print("\n✨ SUCCESS: /analyze endpoint working correctly!")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Details: {response.json()}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend.")
        print(f"   Is the server running at {BACKEND_URL}?")
        return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_ask_endpoint():
    """Verify that POST /ask still works."""
    
    print("\n" + "="*60)
    print("🧪 Verifying POST /ask endpoint still works...")
    ask_endpoint = f"{BACKEND_URL}/ask"
    
    try:
        payload = {"query": "What is BigEarthNet?"}
        print(f"❓ Query: {payload['query']}\n")
        
        response = requests.post(ask_endpoint, json=payload)
        
        if response.status_code == 200:
            print(f"✅ Response Status: {response.status_code}")
            print("✨ SUCCESS: /ask endpoint still working!")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend.")
        return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("Space Minds Backend - Endpoint Tests")
    print("="*60 + "\n")
    
    analyze_ok = test_analyze_endpoint()
    ask_ok = test_ask_endpoint()
    
    print("\n" + "="*60)
    print("📋 Test Summary")
    print("="*60)
    print(f"POST /analyze: {'✅ PASS' if analyze_ok else '❌ FAIL'}")
    print(f"POST /ask:     {'✅ PASS' if ask_ok else '❌ FAIL'}")
    
    sys.exit(0 if (analyze_ok and ask_ok) else 1)
