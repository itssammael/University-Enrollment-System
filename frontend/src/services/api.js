const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Department API
export const departmentApi = {
  getAll: () => apiRequest('/departments'),
  create: (department) => apiRequest('/departments', {
    method: 'POST',
    body: JSON.stringify(department),
  }),
  update: (id, department) => apiRequest(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(department),
  }),
  delete: (id) => apiRequest(`/departments/${id}`, {
    method: 'DELETE',
  }),
};

// Teaching Staff API
export const teachingStaffApi = {
  getAll: (departmentId) => {
    const params = departmentId ? `?department_id=${departmentId}` : '';
    return apiRequest(`/teaching-staff${params}`);
  },
  getById: (id) => apiRequest(`/teaching-staff/${id}`),
  create: (staff) => apiRequest('/teaching-staff', {
    method: 'POST',
    body: JSON.stringify(staff),
  }),
  update: (id, staff) => apiRequest(`/teaching-staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(staff),
  }),
  delete: (id) => apiRequest(`/teaching-staff/${id}`, {
    method: 'DELETE',
  }),
  getCourses: (staffId) => apiRequest(`/staff/${staffId}/courses`),
};

// Course API
export const courseApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.department_id) params.append('department_id', filters.department_id);
    if (filters.teaching_staff_id) params.append('teaching_staff_id', filters.teaching_staff_id);
    
    const queryString = params.toString();
    return apiRequest(`/courses${queryString ? `?${queryString}` : ''}`);
  },
  create: (course) => apiRequest('/courses', {
    method: 'POST',
    body: JSON.stringify(course),
  }),
  update: (id, course) => apiRequest(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(course),
  }),
  assign: (courseId, staffId) => apiRequest(`/courses/${courseId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ course_id: courseId, teaching_staff_id: staffId }),
  }),
  unassign: (courseId) => apiRequest(`/courses/${courseId}/unassign`, {
    method: 'DELETE',
  }),
  getUnassignedByDepartment: (departmentId) => apiRequest(`/departments/${departmentId}/unassigned-courses`),
};

// Course Request API
export const courseRequestApi = {
  create: (request) => apiRequest('/course-requests', {
    method: 'POST',
    body: JSON.stringify(request),
  }),
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.department_id) params.append('department_id', filters.department_id);
    if (filters.teaching_staff_id) params.append('teaching_staff_id', filters.teaching_staff_id);
    if (filters.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    return apiRequest(`/course-requests${queryString ? `?${queryString}` : ''}`);
  },
  update: (id, update) => apiRequest(`/course-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(update),
  }),
};

export default {
  departmentApi,
  teachingStaffApi,
  courseApi,
  courseRequestApi,
};