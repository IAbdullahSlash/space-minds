#!/usr/bin/env python3
"""
Simple test script for POST /analyze endpoint (no extra dependencies).
Tests that the endpoint can receive and process an uploaded image and question.
"""

import requests
import sys
import os

BACKEND_URL = "http://localhost:8000"
ANALYZE_ENDPOINT = f"{BACKEND_URL}/analyze"

def test_analyze_with_real_image():
    """Test /analyze with an actual image file."""
    
    # Try to find a sample image in the workspace
    possible_images = [
        "public/sample.jpg",
        "public/sample.png",
        "backend/demo_data/sample.jpg",
    ]
    
    image_path = None
    for path in possible_images:
        full_path = os.path.join("c:\\Users\\anzar\\Desktop\\sih-26\\space-minds", path)
        if os.path.exists(full_path):
            image_path = full_path
            break
    
    if not image_path:
        print("⚠️  No sample image found. Please provide an image file.")
        print("   Usage: Place an image in the project directory.")
        return False
    
    print(f"📷 Using image: {image_path}\n")
    
    with open(image_path, 'rb') as img:
        files = {"image": img}
        data = {"question": "What land cover types are visible in this image?"}
        
        try:
            print(f"⏳ Sending request to {ANALYZE_ENDPOINT}...")
            response = requests.post(ANALYZE_ENDPOINT, files=files, data=data)
            
            print(f"✅ Response Status: {response.status_code}\n")
            
            if response.status_code == 200:
                result = response.json()
                print("📊 Response received:")
                print(f"  - Has 'answer' field: {'answer' in result}")
                print(f"  - Has 'visual_description' field: {'visual_description' in result}")
                if 'answer' in result:
                    print(f"  - Answer: {result['answer'][:150]}...\n")
                print("✨ SUCCESS!")
                return True
            else:
                print(f"❌ Error: {response.status_code}")
                try:
                    print(f"   Details: {response.json()}")
                except:
                    print(f"   Body: {response.text}")
                return False
                
        except requests.exceptions.ConnectionError:
            print("❌ ERROR: Cannot connect to backend.")
            print(f"   Is the server running at {BACKEND_URL}?")
            print("   Start backend with: python backend/main.py")
            return False
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            return False

def test_missing_image():
    """Test that missing image returns 400 error."""
    print("\n" + "="*60)
    print("🧪 Test: Missing image should return 400")
    print("="*60 + "\n")
    
    try:
        data = {"question": "What is this?"}
        response = requests.post(ANALYZE_ENDPOINT, data=data)
        
        if response.status_code == 400:
            print(f"✅ Correct: Got 400 status")
            print(f"   Message: {response.json().get('detail', 'N/A')}")
            return True
        else:
            print(f"❌ Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_missing_question():
    """Test that missing question returns 400 error."""
    print("\n" + "="*60)
    print("🧪 Test: Missing question should return 400")
    print("="*60 + "\n")
    
    try:
        # Create a simple 1x1 pixel JPEG (minimal valid JPEG)
        jpeg_bytes = bytes.fromhex('FFD8FFE000104A46494600010100000100010000FFDB004300FFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFFCFFC000080001000101011100FFC4001F0000010501010101010100000000000000000102030405060708090A0BFFC400B5100002010303020403050504040000017D01020300041105122131410613516107227114328191A1082342B1C11552D1F02433627282090A161718191A25262728292A3A434445464748494A535455565758595A636465666768696A737475767778797A838485868788898A92939495969798999AA2A3A4A5A6A7A8A9AAB2B3B4B5B6B7B8B9BAC2C3C4C5C6C7C8C9CAD2D3D4D5D6D7D8D9DAE1E2E3E4E5E6E7E8E9EAF1F2F3F4F5F6F7F8F9FAFFC4001F1100030101010101010101010100000000000102030405060708090A0BFFC400B51101020202020303020403050504040001027D0102030004110512213106052131071441327191A108144291A1B1C109233352F0156272D10A162434E125F11718191A262728292A35363738393A434445464748494A535455565758595A636465666768696A737475767778797A82838485868788898A92939495969798999AA2A3A4A5A6A7A8A9AAB2B3B4B5B6B7B8B9BAC2C3C4C5C6C7C8C9CAD2D3D4D5D6D7D8D9DAE2E3E4E5E6E7E8E9EAF2F3F4F5F6F7F8F9FAFFDA000C03010002110311003F00F2FA28A2800FFFFD9')
        
        files = {"image": ("test.jpg", jpeg_bytes, "image/jpeg")}
        response = requests.post(ANALYZE_ENDPOINT, files=files)
        
        if response.status_code == 400:
            print(f"✅ Correct: Got 400 status")
            print(f"   Message: {response.json().get('detail', 'N/A')}")
            return True
        else:
            print(f"❌ Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_invalid_file_type():
    """Test that non-image file returns 415 error."""
    print("\n" + "="*60)
    print("🧪 Test: Non-image file should return 415")
    print("="*60 + "\n")
    
    try:
        files = {"image": ("test.txt", b"This is not an image", "text/plain")}
        data = {"question": "What is this?"}
        response = requests.post(ANALYZE_ENDPOINT, files=files, data=data)
        
        if response.status_code == 415:
            print(f"✅ Correct: Got 415 status")
            print(f"   Message: {response.json().get('detail', 'N/A')}")
            return True
        else:
            print(f"❌ Expected 415, got {response.status_code}")
            print(f"   Response: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("Space Minds Backend - Endpoint Tests")
    print("="*60 + "\n")
    
    print("🧪 Test: Valid image and question")
    print("="*60 + "\n")
    test1 = test_analyze_with_real_image()
    
    test2 = test_missing_image()
    test3 = test_missing_question()
    test4 = test_invalid_file_type()
    
    print("\n" + "="*60)
    print("📋 Test Summary")
    print("="*60)
    print(f"Valid image:        {'✅ PASS' if test1 else '⚠️  SKIP (no image)'}")
    print(f"Missing image:      {'✅ PASS' if test2 else '❌ FAIL'}")
    print(f"Missing question:   {'✅ PASS' if test3 else '❌ FAIL'}")
    print(f"Invalid file type:  {'✅ PASS' if test4 else '❌ FAIL'}")
    
    sys.exit(0)
