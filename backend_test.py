#!/usr/bin/env python3
"""
Backend API Testing Script for Department Management System
Tests all CRUD endpoints for departments, teaching staff, and courses
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        print("❌ Frontend .env file not found")
        return None
    return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("❌ Could not get backend URL from frontend/.env")
    sys.exit(1)

API_BASE = f"{BASE_URL}/api"
print(f"🔗 Testing backend at: {API_BASE}")

# Test data
test_department_data = {
    "name": "Computer Science",
    "chair": "Dr. Sarah Johnson"
}

test_staff_data = {
    "name": "Prof. Michael Chen",
    "email": "m.chen@university.edu",
    "specialization": "Machine Learning"
}

test_course_data = {
    "code": "CS101",
    "name": "Introduction to Programming",
    "credits": 3,
    "semester": "Fall 2024"
}

# Global variables to store created IDs for cleanup
created_department_id = None
created_staff_id = None
created_course_id = None

def print_test_header(test_name):
    print(f"\n{'='*60}")
    print(f"🧪 {test_name}")
    print('='*60)

def print_result(success, message, details=None):
    status = "✅" if success else "❌"
    print(f"{status} {message}")
    if details:
        print(f"   Details: {details}")

def test_health_check():
    """Test basic API connectivity"""
    print_test_header("API Health Check")
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            print_result(True, "API is accessible")
            return True
        else:
            print_result(False, f"API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print_result(False, f"Failed to connect to API: {str(e)}")
        return False

def test_department_crud():
    """Test Department CRUD operations"""
    global created_department_id
    
    print_test_header("Department CRUD Operations")
    
    # Test POST /api/departments
    print("\n📝 Testing POST /api/departments")
    try:
        response = requests.post(f"{API_BASE}/departments", json=test_department_data, timeout=10)
        if response.status_code == 200:
            dept_data = response.json()
            created_department_id = dept_data.get('id')
            print_result(True, "Department created successfully", f"ID: {created_department_id}")
        else:
            print_result(False, f"Failed to create department: {response.status_code}", response.text)
            return False
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return False
    
    # Test GET /api/departments
    print("\n📋 Testing GET /api/departments")
    try:
        response = requests.get(f"{API_BASE}/departments", timeout=10)
        if response.status_code == 200:
            departments = response.json()
            if isinstance(departments, list) and len(departments) > 0:
                print_result(True, f"Retrieved {len(departments)} departments")
            else:
                print_result(False, "No departments found or invalid response format")
        else:
            print_result(False, f"Failed to get departments: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
    
    # Test GET /api/departments/{id}
    if created_department_id:
        print(f"\n🔍 Testing GET /api/departments/{created_department_id}")
        try:
            response = requests.get(f"{API_BASE}/departments/{created_department_id}", timeout=10)
            if response.status_code == 200:
                dept = response.json()
                if dept.get('name') == test_department_data['name']:
                    print_result(True, "Department retrieved by ID successfully")
                else:
                    print_result(False, "Department data mismatch")
            else:
                print_result(False, f"Failed to get department by ID: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_result(False, f"Request failed: {str(e)}")
    
    # Test PUT /api/departments/{id}
    if created_department_id:
        print(f"\n✏️ Testing PUT /api/departments/{created_department_id}")
        update_data = {"chair": "Dr. Updated Chair"}
        try:
            response = requests.put(f"{API_BASE}/departments/{created_department_id}", json=update_data, timeout=10)
            if response.status_code == 200:
                updated_dept = response.json()
                if updated_dept.get('chair') == "Dr. Updated Chair":
                    print_result(True, "Department updated successfully")
                else:
                    print_result(False, "Department update data mismatch")
            else:
                print_result(False, f"Failed to update department: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_result(False, f"Request failed: {str(e)}")
    
    return True

def test_teaching_staff_crud():
    """Test Teaching Staff CRUD operations"""
    global created_staff_id, created_department_id
    
    print_test_header("Teaching Staff CRUD Operations")
    
    if not created_department_id:
        print_result(False, "No department available for staff testing")
        return False
    
    # Add department_id to staff data
    staff_data = test_staff_data.copy()
    staff_data['department_id'] = created_department_id
    
    # Test POST /api/teaching-staff
    print("\n📝 Testing POST /api/teaching-staff")
    try:
        response = requests.post(f"{API_BASE}/teaching-staff", json=staff_data, timeout=10)
        if response.status_code == 200:
            staff_data_response = response.json()
            created_staff_id = staff_data_response.get('id')
            print_result(True, "Teaching staff created successfully", f"ID: {created_staff_id}")
        else:
            print_result(False, f"Failed to create teaching staff: {response.status_code}", response.text)
            return False
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return False
    
    # Test GET /api/teaching-staff
    print("\n📋 Testing GET /api/teaching-staff")
    try:
        response = requests.get(f"{API_BASE}/teaching-staff", timeout=10)
        if response.status_code == 200:
            staff_list = response.json()
            if isinstance(staff_list, list) and len(staff_list) > 0:
                print_result(True, f"Retrieved {len(staff_list)} teaching staff members")
            else:
                print_result(False, "No teaching staff found or invalid response format")
        else:
            print_result(False, f"Failed to get teaching staff: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
    
    # Test GET /api/teaching-staff with department filter
    print(f"\n🔍 Testing GET /api/teaching-staff?department_id={created_department_id}")
    try:
        response = requests.get(f"{API_BASE}/teaching-staff?department_id={created_department_id}", timeout=10)
        if response.status_code == 200:
            filtered_staff = response.json()
            if isinstance(filtered_staff, list):
                print_result(True, f"Retrieved {len(filtered_staff)} staff members for department")
            else:
                print_result(False, "Invalid response format for filtered staff")
        else:
            print_result(False, f"Failed to get filtered teaching staff: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
    
    # Test GET /api/teaching-staff/{id}
    if created_staff_id:
        print(f"\n🔍 Testing GET /api/teaching-staff/{created_staff_id}")
        try:
            response = requests.get(f"{API_BASE}/teaching-staff/{created_staff_id}", timeout=10)
            if response.status_code == 200:
                staff = response.json()
                if staff.get('name') == test_staff_data['name']:
                    print_result(True, "Teaching staff retrieved by ID successfully")
                else:
                    print_result(False, "Teaching staff data mismatch")
            else:
                print_result(False, f"Failed to get teaching staff by ID: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_result(False, f"Request failed: {str(e)}")
    
    # Test PUT /api/teaching-staff/{id}
    if created_staff_id:
        print(f"\n✏️ Testing PUT /api/teaching-staff/{created_staff_id}")
        update_data = {"specialization": "Deep Learning and AI"}
        try:
            response = requests.put(f"{API_BASE}/teaching-staff/{created_staff_id}", json=update_data, timeout=10)
            if response.status_code == 200:
                updated_staff = response.json()
                if updated_staff.get('specialization') == "Deep Learning and AI":
                    print_result(True, "Teaching staff updated successfully")
                else:
                    print_result(False, "Teaching staff update data mismatch")
            else:
                print_result(False, f"Failed to update teaching staff: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_result(False, f"Request failed: {str(e)}")
    
    return True

def test_course_crud():
    """Test Course CRUD operations"""
    global created_course_id, created_department_id, created_staff_id
    
    print_test_header("Course CRUD Operations")
    
    if not created_department_id:
        print_result(False, "No department available for course testing")
        return False
    
    # Add department_id to course data
    course_data = test_course_data.copy()
    course_data['department_id'] = created_department_id
    if created_staff_id:
        course_data['teaching_staff_id'] = created_staff_id
    
    # Test POST /api/courses
    print("\n📝 Testing POST /api/courses")
    try:
        response = requests.post(f"{API_BASE}/courses", json=course_data, timeout=10)
        if response.status_code == 200:
            course_data_response = response.json()
            created_course_id = course_data_response.get('id')
            print_result(True, "Course created successfully", f"ID: {created_course_id}")
        else:
            print_result(False, f"Failed to create course: {response.status_code}", response.text)
            return False
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
        return False
    
    # Test GET /api/courses
    print("\n📋 Testing GET /api/courses")
    try:
        response = requests.get(f"{API_BASE}/courses", timeout=10)
        if response.status_code == 200:
            courses = response.json()
            if isinstance(courses, list) and len(courses) > 0:
                print_result(True, f"Retrieved {len(courses)} courses")
            else:
                print_result(False, "No courses found or invalid response format")
        else:
            print_result(False, f"Failed to get courses: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
    
    # Test GET /api/courses with department filter
    print(f"\n🔍 Testing GET /api/courses?department_id={created_department_id}")
    try:
        response = requests.get(f"{API_BASE}/courses?department_id={created_department_id}", timeout=10)
        if response.status_code == 200:
            filtered_courses = response.json()
            if isinstance(filtered_courses, list):
                print_result(True, f"Retrieved {len(filtered_courses)} courses for department")
            else:
                print_result(False, "Invalid response format for filtered courses")
        else:
            print_result(False, f"Failed to get filtered courses: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
    
    # Test PUT /api/courses/{id}
    if created_course_id:
        print(f"\n✏️ Testing PUT /api/courses/{created_course_id}")
        update_data = {"credits": 4, "name": "Advanced Programming Concepts"}
        try:
            response = requests.put(f"{API_BASE}/courses/{created_course_id}", json=update_data, timeout=10)
            if response.status_code == 200:
                updated_course = response.json()
                if updated_course.get('credits') == 4:
                    print_result(True, "Course updated successfully")
                else:
                    print_result(False, "Course update data mismatch")
            else:
                print_result(False, f"Failed to update course: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_result(False, f"Request failed: {str(e)}")
    
    return True

def test_data_validation():
    """Test data validation scenarios"""
    print_test_header("Data Validation Testing")
    
    # Test creating department with missing fields
    print("\n❌ Testing POST /api/departments with missing fields")
    try:
        response = requests.post(f"{API_BASE}/departments", json={"name": "Incomplete Dept"}, timeout=10)
        if response.status_code == 422:  # FastAPI validation error
            print_result(True, "Correctly rejected department with missing chair field")
        else:
            print_result(False, f"Expected 422 validation error, got {response.status_code}")
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
    
    # Test creating staff with non-existent department_id
    print("\n❌ Testing POST /api/teaching-staff with invalid department_id")
    invalid_staff_data = {
        "name": "Test Staff",
        "email": "test@university.edu",
        "department_id": "non-existent-id",
        "specialization": "Testing"
    }
    try:
        response = requests.post(f"{API_BASE}/teaching-staff", json=invalid_staff_data, timeout=10)
        if response.status_code == 400:
            print_result(True, "Correctly rejected staff with invalid department_id")
        else:
            print_result(False, f"Expected 400 error, got {response.status_code}")
    except requests.exceptions.RequestException as e:
        print_result(False, f"Request failed: {str(e)}")
    
    # Test deleting department with existing staff
    if created_department_id and created_staff_id:
        print(f"\n❌ Testing DELETE /api/departments/{created_department_id} with existing staff")
        try:
            response = requests.delete(f"{API_BASE}/departments/{created_department_id}", timeout=10)
            if response.status_code == 400:
                print_result(True, "Correctly prevented deletion of department with existing staff")
            else:
                print_result(False, f"Expected 400 error, got {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_result(False, f"Request failed: {str(e)}")
    
    # Test updating with invalid data
    if created_staff_id:
        print(f"\n❌ Testing PUT /api/teaching-staff/{created_staff_id} with invalid department_id")
        try:
            response = requests.put(f"{API_BASE}/teaching-staff/{created_staff_id}", 
                                  json={"department_id": "invalid-id"}, timeout=10)
            if response.status_code == 400:
                print_result(True, "Correctly rejected update with invalid department_id")
            else:
                print_result(False, f"Expected 400 error, got {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_result(False, f"Request failed: {str(e)}")

def test_dependency_constraints():
    """Test dependency constraint scenarios"""
    print_test_header("Dependency Constraint Testing")
    
    # Test deleting staff with assigned courses
    if created_staff_id and created_course_id:
        print(f"\n❌ Testing DELETE /api/teaching-staff/{created_staff_id} with assigned courses")
        try:
            response = requests.delete(f"{API_BASE}/teaching-staff/{created_staff_id}", timeout=10)
            if response.status_code == 400:
                print_result(True, "Correctly prevented deletion of staff with assigned courses")
            else:
                print_result(False, f"Expected 400 error, got {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_result(False, f"Request failed: {str(e)}")

def cleanup_test_data():
    """Clean up test data in reverse dependency order"""
    print_test_header("Cleanup Test Data")
    
    # Delete course first
    if created_course_id:
        try:
            response = requests.delete(f"{API_BASE}/courses/{created_course_id}", timeout=10)
            if response.status_code == 200:
                print_result(True, f"Deleted test course {created_course_id}")
            else:
                print_result(False, f"Failed to delete course: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_result(False, f"Failed to delete course: {str(e)}")
    
    # Delete staff second
    if created_staff_id:
        try:
            response = requests.delete(f"{API_BASE}/teaching-staff/{created_staff_id}", timeout=10)
            if response.status_code == 200:
                print_result(True, f"Deleted test staff {created_staff_id}")
            else:
                print_result(False, f"Failed to delete staff: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_result(False, f"Failed to delete staff: {str(e)}")
    
    # Delete department last
    if created_department_id:
        try:
            response = requests.delete(f"{API_BASE}/departments/{created_department_id}", timeout=10)
            if response.status_code == 200:
                print_result(True, f"Deleted test department {created_department_id}")
            else:
                print_result(False, f"Failed to delete department: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print_result(False, f"Failed to delete department: {str(e)}")

def main():
    """Run all tests"""
    print("🚀 Starting Department Management Backend API Tests")
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run tests in order
    if not test_health_check():
        print("\n❌ Health check failed. Aborting tests.")
        return False
    
    success = True
    success &= test_department_crud()
    success &= test_teaching_staff_crud()
    success &= test_course_crud()
    
    # Run validation tests
    test_data_validation()
    test_dependency_constraints()
    
    # Cleanup
    cleanup_test_data()
    
    print(f"\n{'='*60}")
    if success:
        print("✅ All core CRUD operations completed successfully!")
    else:
        print("❌ Some tests failed. Check the output above for details.")
    print(f"⏰ Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print('='*60)
    
    return success

if __name__ == "__main__":
    main()