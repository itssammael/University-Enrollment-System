import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
// JWT library removed to avoid webpack polyfill issues
// Using simple mock authentication instead
import {
  BookOpen,
  Users,
  GraduationCap,
  Award,
  Search,
  Plus,
  Edit,
  Moon,
  Sun,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Home,
  UserCheck,
  Building,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  UserPlus
} from 'lucide-react';
import { departmentApi, teachingStaffApi, courseApi, courseRequestApi } from './services/api';

const App = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('Admin');
  const [currentStudentId, setCurrentStudentId] = useState('S001');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  
  // UI state
  const [activeModule, setActiveModule] = useState('/');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [showAddTeachingStaffModal, setShowAddTeachingStaffModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [enrollmentForm, setEnrollmentForm] = useState({ studentId: '', sectionId: '' });
  const [newStudentForm, setNewStudentForm] = useState({ name: '', departmentId: '', email: '', gpa: '' });
  const [newDepartmentForm, setNewDepartmentForm] = useState({ name: '', chair: '' });
  const [editDepartmentForm, setEditDepartmentForm] = useState({ name: '', chair: '' });
  const [newTeachingStaffForm, setNewTeachingStaffForm] = useState({ name: '', email: '', departmentId: '', specialization: '' });
  
  // Course Assignment state
  const [showCourseAssignmentModal, setShowCourseAssignmentModal] = useState(false);
  const [showCourseRequestModal, setShowCourseRequestModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [courseRequests, setCourseRequests] = useState([]);
  const [staffCourses, setStaffCourses] = useState([]);
  const [unassignedCourses, setUnassignedCourses] = useState([]);
  const [currentUserDepartment, setCurrentUserDepartment] = useState('D001'); // Mock department for current user
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data state - using state instead of const for dynamic updates
  const [departments, setDepartments] = useState([
    { id: 'D001', name: 'Computer Science', chair: 'Dr. Smith' },
    { id: 'D002', name: 'Mathematics', chair: 'Dr. Johnson' },
    { id: 'D003', name: 'Physics', chair: 'Dr. Brown' },
    { id: 'D004', name: 'Chemistry', chair: 'Dr. Davis' }
  ]);

  const [teachingStaff, setTeachingStaff] = useState([
    { id: 'TS001', name: 'Prof. Adams', email: 'adams@university.edu', departmentId: 'D001', specialization: 'Algorithms' },
    { id: 'TS002', name: 'Prof. Baker', email: 'baker@university.edu', departmentId: 'D001', specialization: 'Machine Learning' },
    { id: 'TS003', name: 'Prof. Clark', email: 'clark@university.edu', departmentId: 'D001', specialization: 'Data Structures' },
    { id: 'TS004', name: 'Prof. Davis', email: 'davis@university.edu', departmentId: 'D002', specialization: 'Calculus' },
    { id: 'TS005', name: 'Prof. Evans', email: 'evans@university.edu', departmentId: 'D003', specialization: 'Physics' },
    { id: 'TS006', name: 'Prof. Foster', email: 'foster@university.edu', departmentId: 'D004', specialization: 'Chemistry' }
  ]);

  const [students, setStudents] = useState([
    { id: 'S001', name: 'Alice Johnson', departmentId: 'D001', gpa: 3.8, status: 'Enrolled', email: 'alice@university.edu' },
    { id: 'S002', name: 'Bob Smith', departmentId: 'D001', gpa: 3.6, status: 'Enrolled', email: 'bob@university.edu' },
    { id: 'S003', name: 'Carol Davis', departmentId: 'D002', gpa: 3.9, status: 'Enrolled', email: 'carol@university.edu' },
    { id: 'S004', name: 'David Wilson', departmentId: 'D002', gpa: 3.4, status: 'On Leave', email: 'david@university.edu' },
    { id: 'S005', name: 'Emma Brown', departmentId: 'D003', gpa: 3.7, status: 'Enrolled', email: 'emma@university.edu' },
    { id: 'S006', name: 'Frank Miller', departmentId: 'D003', gpa: 3.5, status: 'Enrolled', email: 'frank@university.edu' },
    { id: 'S007', name: 'Grace Lee', departmentId: 'D004', gpa: 3.8, status: 'Enrolled', email: 'grace@university.edu' },
    { id: 'S008', name: 'Henry Taylor', departmentId: 'D004', gpa: 3.3, status: 'Enrolled', email: 'henry@university.edu' },
    { id: 'S009', name: 'Ivy Chen', departmentId: 'D001', gpa: 4.0, status: 'Enrolled', email: 'ivy@university.edu' },
    { id: 'S010', name: 'Jack Anderson', departmentId: 'D002', gpa: 3.2, status: 'Enrolled', email: 'jack@university.edu' }
  ]);

  const [courses, setCourses] = useState([
    { id: 'C001', code: 'CS101', name: 'Introduction to Programming', credits: 3, departmentId: 'D001', teaching_staff_id: 'TS001', schedule_day: 'MWF', schedule_time: '10:00 AM', room: 'A101', semester: 'Fall 2024' },
    { id: 'C002', code: 'CS201', name: 'Data Structures', credits: 4, departmentId: 'D001', teaching_staff_id: 'TS003', schedule_day: 'TTh', schedule_time: '2:00 PM', room: 'A102', semester: 'Fall 2024' },
    { id: 'C003', code: 'CS301', name: 'Machine Learning', credits: 3, departmentId: 'D001', teaching_staff_id: null, schedule_day: 'MWF', schedule_time: '1:00 PM', room: 'A103', semester: 'Fall 2024' },
    { id: 'C004', code: 'CS401', name: 'Advanced Algorithms', credits: 4, departmentId: 'D001', teaching_staff_id: null, schedule_day: 'TTh', schedule_time: '10:00 AM', room: 'A104', semester: 'Fall 2024' },
    { id: 'C005', code: 'MATH101', name: 'Calculus I', credits: 4, departmentId: 'D002', teaching_staff_id: 'TS004', schedule_day: 'MWF', schedule_time: '9:00 AM', room: 'B101', semester: 'Fall 2024' },
    { id: 'C006', code: 'MATH201', name: 'Linear Algebra', credits: 3, departmentId: 'D002', teaching_staff_id: null, schedule_day: 'TTh', schedule_time: '11:00 AM', room: 'B102', semester: 'Fall 2024' },
    { id: 'C007', code: 'PHYS101', name: 'General Physics', credits: 3, departmentId: 'D003', teaching_staff_id: 'TS005', schedule_day: 'MWF', schedule_time: '8:00 AM', room: 'C101', semester: 'Fall 2024' },
    { id: 'C008', code: 'CHEM101', name: 'General Chemistry', credits: 3, departmentId: 'D004', teaching_staff_id: 'TS006', schedule_day: 'TTh', schedule_time: '1:00 PM', room: 'D101', semester: 'Fall 2024' }
  ]);

  const [sections, setSections] = useState([
    { id: 'SEC001', courseId: 'C001', instructor: 'Prof. Adams', semester: 'Fall 2024', room: 'A101', time: 'MWF 10:00 AM', capacity: 30, currentEnrollment: 25 },
    { id: 'SEC002', courseId: 'C001', instructor: 'Prof. Baker', semester: 'Fall 2024', room: 'A102', time: 'TTh 2:00 PM', capacity: 30, currentEnrollment: 28 },
    { id: 'SEC003', courseId: 'C002', instructor: 'Prof. Clark', semester: 'Fall 2024', room: 'B201', time: 'MWF 1:00 PM', capacity: 25, currentEnrollment: 22 },
    { id: 'SEC004', courseId: 'C003', instructor: 'Prof. Davis', semester: 'Fall 2024', room: 'C301', time: 'TTh 10:00 AM', capacity: 35, currentEnrollment: 30 },
    { id: 'SEC005', courseId: 'C004', instructor: 'Prof. Evans', semester: 'Fall 2024', room: 'D401', time: 'MWF 9:00 AM', capacity: 40, currentEnrollment: 35 },
    { id: 'SEC006', courseId: 'C005', instructor: 'Prof. Foster', semester: 'Fall 2024', room: 'E501', time: 'TTh 3:00 PM', capacity: 30, currentEnrollment: 20 },
    { id: 'SEC007', courseId: 'C001', instructor: 'Prof. Green', semester: 'Spring 2025', room: 'A103', time: 'MWF 11:00 AM', capacity: 30, currentEnrollment: 15 },
    { id: 'SEC008', courseId: 'C002', instructor: 'Prof. Hill', semester: 'Spring 2025', room: 'B202', time: 'TTh 1:00 PM', capacity: 25, currentEnrollment: 18 },
    { id: 'SEC009', courseId: 'C003', instructor: 'Prof. King', semester: 'Spring 2025', room: 'C302', time: 'MWF 2:00 PM', capacity: 35, currentEnrollment: 25 },
    { id: 'SEC010', courseId: 'C004', instructor: 'Prof. Lewis', semester: 'Spring 2025', room: 'D402', time: 'TTh 11:00 AM', capacity: 40, currentEnrollment: 30 }
  ]);

  const [grades, setGrades] = useState([
    { studentId: 'S001', sectionId: 'SEC001', finalGrade: 'A' },
    { studentId: 'S002', sectionId: 'SEC001', finalGrade: 'B+' },
    { studentId: 'S003', sectionId: 'SEC004', finalGrade: 'A-' },
    { studentId: 'S004', sectionId: 'SEC004', finalGrade: 'B' },
    { studentId: 'S005', sectionId: 'SEC005', finalGrade: 'A' },
    { studentId: 'S006', sectionId: 'SEC005', finalGrade: 'B-' },
    { studentId: 'S007', sectionId: 'SEC006', finalGrade: 'A+' },
    { studentId: 'S008', sectionId: 'SEC006', finalGrade: 'B' },
    { studentId: 'S009', sectionId: 'SEC002', finalGrade: 'A+' },
    { studentId: 'S010', sectionId: 'SEC003', finalGrade: 'B-' },
    { studentId: 'S001', sectionId: 'SEC003', finalGrade: 'A' },
    { studentId: 'S002', sectionId: 'SEC004', finalGrade: 'B+' },
    { studentId: 'S003', sectionId: 'SEC001', finalGrade: 'A' },
    { studentId: 'S004', sectionId: 'SEC002', finalGrade: 'C+' },
    { studentId: 'S005', sectionId: 'SEC003', finalGrade: 'A-' },
    { studentId: 'S006', sectionId: 'SEC001', finalGrade: 'B' },
    { studentId: 'S007', sectionId: 'SEC005', finalGrade: 'A' },
    { studentId: 'S008', sectionId: 'SEC004', finalGrade: 'B-' },
    { studentId: 'S009', sectionId: 'SEC006', finalGrade: 'A+' },
    { studentId: 'S010', sectionId: 'SEC005', finalGrade: 'C' }
  ]);

  // Mock enrollment trend data
  const enrollmentTrendData = [
    { semester: 'Spring 2023', newStudents: 45 },
    { semester: 'Fall 2023', newStudents: 52 },
    { semester: 'Spring 2024', newStudents: 48 },
    { semester: 'Fall 2024', newStudents: 58 }
  ];

  // Calculate GPA distribution
  const getGpaDistribution = () => {
    const ranges = {
      '4.0-3.5': 0,
      '3.4-3.0': 0,
      '2.9-2.5': 0,
      '<2.5': 0
    };
    
    students.forEach(student => {
      if (student.gpa >= 3.5) ranges['4.0-3.5']++;
      else if (student.gpa >= 3.0) ranges['3.4-3.0']++;
      else if (student.gpa >= 2.5) ranges['2.9-2.5']++;
      else ranges['<2.5']++;
    });
    
    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  };

  // Authentication functions
  const handleLogin = (e) => {
    e.preventDefault();
    // Mock JWT token (just a simple object for frontend-only authentication)
    const mockToken = JSON.stringify({ role: userRole, email: loginForm.email, exp: Date.now() + 3600000 }); // 1 hour expiry
    localStorage.setItem('token', mockToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole('Admin');
  };

  const switchRole = (role) => {
    setUserRole(role);
    if (role === 'Student') {
      setCurrentStudentId('S001');
    }
    setActiveModule('/');
  };

  // Helper functions
  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : '';
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : '';
  };

  const getCourseCode = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.code : '';
  };

  const getStudentSchedule = (studentId) => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    return studentGrades.map(grade => {
      const section = sections.find(s => s.id === grade.sectionId);
      const course = courses.find(c => c.id === section?.courseId);
      return {
        ...section,
        courseCode: course?.code,
        courseName: course?.name
      };
    });
  };

  const getEnrolledStudents = (sectionId) => {
    const sectionGrades = grades.filter(g => g.sectionId === sectionId);
    return sectionGrades.map(grade => {
      const student = students.find(s => s.id === grade.studentId);
      return {
        ...student,
        finalGrade: grade.finalGrade
      };
    });
  };

  // CRUD Operations
  const addStudent = (e) => {
    e.preventDefault();
    const newId = `S${String(students.length + 1).padStart(3, '0')}`;
    const newStudent = {
      id: newId,
      name: newStudentForm.name,
      departmentId: newStudentForm.departmentId,
      gpa: parseFloat(newStudentForm.gpa),
      status: 'Enrolled',
      email: newStudentForm.email
    };
    setStudents([...students, newStudent]);
    setNewStudentForm({ name: '', departmentId: '', email: '', gpa: '' });
    setShowAddStudentModal(false);
  };

  const updateGrade = (studentId, sectionId, newGrade) => {
    setGrades(grades.map(g => 
      g.studentId === studentId && g.sectionId === sectionId 
        ? { ...g, finalGrade: newGrade }
        : g
    ));
  };

  const attemptEnrollment = (e) => {
    e.preventDefault();
    const section = sections.find(s => s.id === enrollmentForm.sectionId);
    
    if (section.currentEnrollment >= section.capacity) {
      alert('Section is at full capacity!');
      return;
    }

    // Check if student is already enrolled
    const alreadyEnrolled = grades.some(g => 
      g.studentId === enrollmentForm.studentId && g.sectionId === enrollmentForm.sectionId
    );

    if (alreadyEnrolled) {
      alert('Student is already enrolled in this section!');
      return;
    }

    // Update section enrollment
    setSections(sections.map(s => 
      s.id === enrollmentForm.sectionId 
        ? { ...s, currentEnrollment: s.currentEnrollment + 1 }
        : s
    ));

    // Add to grades
    setGrades([...grades, {
      studentId: enrollmentForm.studentId,
      sectionId: enrollmentForm.sectionId,
      finalGrade: 'In Progress'
    }]);

    setEnrollmentForm({ studentId: '', sectionId: '' });
    alert('Enrollment successful!');
  };

  // Department Management Functions
  const addDepartment = (e) => {
    e.preventDefault();
    const newId = `D${String(departments.length + 1).padStart(3, '0')}`;
    const newDepartment = {
      id: newId,
      name: newDepartmentForm.name,
      chair: newDepartmentForm.chair
    };
    setDepartments([...departments, newDepartment]);
    setNewDepartmentForm({ name: '', chair: '' });
    setShowAddDepartmentModal(false);
  };

  const updateDepartment = (e) => {
    e.preventDefault();
    setDepartments(departments.map(dept => 
      dept.id === selectedDepartment.id 
        ? { ...dept, name: editDepartmentForm.name, chair: editDepartmentForm.chair }
        : dept
    ));
    setShowEditDepartmentModal(false);
    setSelectedDepartment(null);
    setEditDepartmentForm({ name: '', chair: '' });
  };

  const deleteDepartment = (departmentId) => {
    // Check if department has teaching staff
    const hasStaff = teachingStaff.some(staff => staff.departmentId === departmentId);
    if (hasStaff) {
      alert('Cannot delete department with existing teaching staff!');
      return;
    }

    // Check if department has students
    const hasStudents = students.some(student => student.departmentId === departmentId);
    if (hasStudents) {
      alert('Cannot delete department with enrolled students!');
      return;
    }

    if (confirm('Are you sure you want to delete this department?')) {
      setDepartments(departments.filter(dept => dept.id !== departmentId));
    }
  };

  const addTeachingStaff = (e) => {
    e.preventDefault();
    const newId = `TS${String(teachingStaff.length + 1).padStart(3, '0')}`;
    const newStaff = {
      id: newId,
      name: newTeachingStaffForm.name,
      email: newTeachingStaffForm.email,
      departmentId: newTeachingStaffForm.departmentId,
      specialization: newTeachingStaffForm.specialization
    };
    setTeachingStaff([...teachingStaff, newStaff]);
    setNewTeachingStaffForm({ name: '', email: '', departmentId: '', specialization: '' });
    setShowAddTeachingStaffModal(false);
  };

  const getTeachingStaffByDepartment = (departmentId) => {
    return teachingStaff.filter(staff => staff.departmentId === departmentId);
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDepartmentName(student.departmentId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate metrics
  const totalStudents = students.length;
  const activeEnrollment = sections.reduce((total, section) => total + section.currentEnrollment, 0);
  const averageGPA = (students.reduce((total, student) => total + student.gpa, 0) / students.length).toFixed(2);
  const totalCourses = courses.length;

  // Navigation based on role
  const getNavigationItems = () => {    
    if (userRole === 'Admin') {
      return [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/departments', label: 'Department Management', icon: Building },
        { path: '/students', label: 'Student Management', icon: Users },
        { path: '/sections', label: 'Course Catalog & Grading', icon: BookOpen },
        { path: '/enrollment', label: 'Enrollment Workflow', icon: UserCheck }
      ];
    } else if (userRole === 'Chair' || userRole === 'Secretary') {
      return [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/departments', label: 'Department Management', icon: Building },
        { path: '/students', label: 'Student Management', icon: Users },
        { path: '/sections', label: 'Course Catalog & Grading', icon: BookOpen },
        { path: '/enrollment', label: 'Enrollment Workflow', icon: UserCheck }
      ];
    } else if (userRole === 'Teaching Staff') {
      return [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/my-courses', label: 'My Courses', icon: BookOpen }
      ];
    } else if (userRole === 'Student') {
      return [
        { path: '/portal', label: 'Student Portal', icon: User }
      ];
    }
    
    return [];
  };

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(token);
        if (decoded && decoded.exp > Date.now()) {
          setIsAuthenticated(true);
          setUserRole(decoded.role);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  // Theme classes - memoized to prevent unnecessary re-renders
  const themeClasses = useMemo(() => ({
    bg: isDarkMode ? 'bg-slate-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-slate-800' : 'bg-white',
    text: isDarkMode ? 'text-slate-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
    border: isDarkMode ? 'border-slate-700' : 'border-gray-200',
    accent: 'text-blue-400',
    accentBg: 'bg-blue-600 hover:bg-blue-700',
    input: isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-gray-300 text-gray-900'
  }), [isDarkMode]);

  // Login Component
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className={`max-w-md w-full mx-4 p-8 rounded-lg shadow-lg ${themeClasses.cardBg}`}>
          <div className="text-center mb-8">
            <GraduationCap className={`mx-auto h-12 w-12 ${themeClasses.accent}`} />
            <h1 className={`mt-4 text-2xl font-bold ${themeClasses.text}`}>University Enrollment System</h1>
            <p className={`mt-2 ${themeClasses.textSecondary}`}>Sign in to your account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Email</label>
              <input
                type="email"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                placeholder="Enter your email"
                data-testid="login-email-input"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Password</label>
              <input
                type="password"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="Enter your password"
                data-testid="login-password-input"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Role</label>
              <select
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                data-testid="role-select"
              >
                <option value="Admin">Admin</option>
                <option value="Chair">Chair</option>
                <option value="Secretary">Secretary</option>
                <option value="Teaching Staff">Teaching Staff</option>
                <option value="Student">Student</option>
              </select>
            </div>
            
            <button
              type="submit"
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white ${themeClasses.accentBg} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              data-testid="login-submit-button"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Dashboard</h1>
        <div className="flex space-x-2">
          {['Admin', 'Chair', 'Secretary', 'Teaching Staff', 'Student'].map(role => (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className={`px-3 py-1 text-sm rounded ${
                userRole === role 
                  ? `${themeClasses.accentBg} text-white` 
                  : `${themeClasses.cardBg} ${themeClasses.text} border ${themeClasses.border}`
              }`}
              data-testid={`role-switch-${role.toLowerCase().replace(' ', '-')}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg shadow ${themeClasses.cardBg}`} data-testid="total-students-metric">
          <div className="flex items-center">
            <Users className={`h-8 w-8 ${themeClasses.accent}`} />
            <div className="ml-4">
              <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Total Students</p>
              <p className={`text-2xl font-bold ${themeClasses.text}`}>{totalStudents}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow ${themeClasses.cardBg}`} data-testid="active-enrollment-metric">
          <div className="flex items-center">
            <BookOpen className={`h-8 w-8 ${themeClasses.accent}`} />
            <div className="ml-4">
              <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Active Enrollment</p>
              <p className={`text-2xl font-bold ${themeClasses.text}`}>{activeEnrollment}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow ${themeClasses.cardBg}`} data-testid="average-gpa-metric">
          <div className="flex items-center">
            <Award className={`h-8 w-8 ${themeClasses.accent}`} />
            <div className="ml-4">
              <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Average GPA</p>
              <p className={`text-2xl font-bold ${themeClasses.text}`}>{averageGPA}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow ${themeClasses.cardBg}`} data-testid="total-courses-metric">
          <div className="flex items-center">
            <GraduationCap className={`h-8 w-8 ${themeClasses.accent}`} />
            <div className="ml-4">
              <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Total Courses</p>
              <p className={`text-2xl font-bold ${themeClasses.text}`}>{totalCourses}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg shadow ${themeClasses.cardBg}`}>
          <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Enrollment Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#475569' : '#e5e7eb'} />
              <XAxis dataKey="semester" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
              <YAxis stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  color: isDarkMode ? '#f1f5f9' : '#1f2937'
                }} 
              />
              <Line type="monotone" dataKey="newStudents" stroke="#60a5fa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className={`p-6 rounded-lg shadow ${themeClasses.cardBg}`}>
          <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>GPA Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getGpaDistribution()}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#475569' : '#e5e7eb'} />
              <XAxis dataKey="range" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
              <YAxis stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  color: isDarkMode ? '#f1f5f9' : '#1f2937'
                }} 
              />
              <Bar dataKey="count" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Student Management Component
  const StudentManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Student Management</h1>
        <button
          onClick={() => setShowAddStudentModal(true)}
          className={`flex items-center px-4 py-2 rounded-lg text-white ${themeClasses.accentBg}`}
          data-testid="add-student-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </button>
      </div>
      
      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-3 h-4 w-4 ${themeClasses.textSecondary}`} />
          <input
            type="text"
            placeholder="Search students by name or department..."
            className={`w-full pl-10 pr-4 py-2 border rounded-lg ${themeClasses.input}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="student-search-input"
          />
        </div>
      </div>
      
      {/* Student Table */}
      <div className={`overflow-x-auto rounded-lg shadow ${themeClasses.cardBg}`}>
        <table className="min-w-full">
          <thead className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Name</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Department</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>GPA</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Status</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Email</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${themeClasses.border}`}>
            {filteredStudents.map((student) => (
              <tr key={student.id} data-testid={`student-row-${student.id}`}>
                <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.text}`}>{student.name}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{getDepartmentName(student.departmentId)}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.text}`}>{student.gpa}</td>
                <td className={`px-6 py-4 whitespace-nowrap`}>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    student.status === 'Enrolled' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{student.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Course Catalog & Grading Component
  const CourseCatalogGrading = () => (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Course Catalog & Grading</h1>
      
      {/* Section List */}
      <div className={`overflow-x-auto rounded-lg shadow ${themeClasses.cardBg}`}>
        <table className="min-w-full">
          <thead className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Course</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Instructor</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Semester</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Room</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Time</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Capacity</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${themeClasses.border}`}>
            {sections.map((section) => (
              <tr key={section.id} data-testid={`section-row-${section.id}`}>
                <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.text}`}>
                  {getCourseCode(section.courseId)} - {getCourseName(section.courseId)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{section.instructor}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{section.semester}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{section.room}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{section.time}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.text}`}>
                  {section.currentEnrollment}/{section.capacity}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap`}>
                  <button
                    onClick={() => {
                      setSelectedSection(section);
                      setShowGradeModal(true);
                    }}
                    className={`flex items-center px-3 py-1 text-sm rounded text-white ${themeClasses.accentBg}`}
                    data-testid={`manage-grades-${section.id}`}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Manage Grades
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Enrollment Workflow Component
  const EnrollmentWorkflow = () => (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Enrollment Workflow</h1>
      
      <div className={`max-w-md mx-auto p-6 rounded-lg shadow ${themeClasses.cardBg}`}>
        <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Enroll Student</h2>
        <form onSubmit={attemptEnrollment} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text}`}>Select Student</label>
            <select
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
              value={enrollmentForm.studentId}
              onChange={(e) => setEnrollmentForm({...enrollmentForm, studentId: e.target.value})}
              required
              data-testid="enrollment-student-select"
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.id})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text}`}>Select Section</label>
            <select
              className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
              value={enrollmentForm.sectionId}
              onChange={(e) => setEnrollmentForm({...enrollmentForm, sectionId: e.target.value})}
              required
              data-testid="enrollment-section-select"
            >
              <option value="">Choose a section...</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {getCourseCode(section.courseId)} - {section.instructor} ({section.currentEnrollment}/{section.capacity})
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white ${themeClasses.accentBg} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            data-testid="attempt-enrollment-button"
          >
            Attempt Enrollment
          </button>
        </form>
      </div>
    </div>
  );

  // Student Portal Component
  const StudentPortal = () => {
    const currentStudent = students.find(s => s.id === currentStudentId);
    const studentSchedule = getStudentSchedule(currentStudentId);
    
    return (
      <div className="space-y-6" data-testid="student-portal">
        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Student Portal</h1>
        
        {/* Profile Card */}
        <div className={`p-6 rounded-lg shadow ${themeClasses.cardBg}`} data-testid="student-profile-card">
          <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${themeClasses.textSecondary}`}>Name</p>
              <p className={`text-lg font-medium ${themeClasses.text}`}>{currentStudent?.name}</p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.textSecondary}`}>Department</p>
              <p className={`text-lg font-medium ${themeClasses.text}`}>{getDepartmentName(currentStudent?.departmentId)}</p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.textSecondary}`}>GPA</p>
              <p className={`text-lg font-medium ${themeClasses.text}`}>{currentStudent?.gpa}</p>
            </div>
            <div>
              <p className={`text-sm ${themeClasses.textSecondary}`}>Email</p>
              <p className={`text-lg font-medium ${themeClasses.text}`}>{currentStudent?.email}</p>
            </div>
          </div>
        </div>
        
        {/* Course Schedule */}
        <div className={`rounded-lg shadow ${themeClasses.cardBg}`}>
          <div className="p-6">
            <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Current Semester Schedule</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Course Code</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Course Name</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Instructor</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Room</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Time</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${themeClasses.border}`}>
                {studentSchedule.map((section) => (
                  <tr key={section.id} data-testid={`schedule-row-${section.id}`}>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${themeClasses.text}`}>{section.courseCode}</td>
                    <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.text}`}>{section.courseName}</td>
                    <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{section.instructor}</td>
                    <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{section.room}</td>
                    <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{section.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Department Management Component
  const DepartmentManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Department Management</h1>
        {userRole === 'Admin' && (
          <button
            onClick={() => setShowAddDepartmentModal(true)}
            className={`flex items-center px-4 py-2 rounded-lg text-white ${themeClasses.accentBg}`}
            data-testid="add-department-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </button>
        )}
      </div>
      
      {/* Department List */}
      <div className={`overflow-x-auto rounded-lg shadow ${themeClasses.cardBg}`}>
        <table className="min-w-full">
          <thead className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Name</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Chair</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Teaching Staff</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${themeClasses.border}`}>
            {departments.map((department) => {
              const departmentStaff = getTeachingStaffByDepartment(department.id);
              return (
                <tr key={department.id} data-testid={`department-row-${department.id}`}>
                  <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.text} font-medium`}>{department.name}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{department.chair}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.text}`}>{departmentStaff.length} staff</td>
                  <td className={`px-6 py-4 whitespace-nowrap flex space-x-2`}>
                    {(userRole === 'Chair' || userRole === 'Secretary') && (
                      <button
                        onClick={() => {
                          setNewTeachingStaffForm({...newTeachingStaffForm, departmentId: department.id});
                          setShowAddTeachingStaffModal(true);
                        }}
                        className={`flex items-center px-3 py-1 text-sm rounded text-white bg-green-600 hover:bg-green-700`}
                        data-testid={`add-staff-${department.id}`}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Staff
                      </button>
                    )}
                    {userRole === 'Admin' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedDepartment(department);
                            setEditDepartmentForm({ name: department.name, chair: department.chair });
                            setShowEditDepartmentModal(true);
                          }}
                          className={`flex items-center px-3 py-1 text-sm rounded text-white ${themeClasses.accentBg}`}
                          data-testid={`edit-department-${department.id}`}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteDepartment(department.id)}
                          className={`flex items-center px-3 py-1 text-sm rounded text-white bg-red-600 hover:bg-red-700`}
                          data-testid={`delete-department-${department.id}`}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Teaching Staff Section */}
      <div className={`rounded-lg shadow ${themeClasses.cardBg}`}>
        <div className="p-6">
          <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>Teaching Staff</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Name</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Email</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Department</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${themeClasses.textSecondary}`}>Specialization</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${themeClasses.border}`}>
              {teachingStaff.map((staff) => (
                <tr key={staff.id} data-testid={`staff-row-${staff.id}`}>
                  <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.text} font-medium`}>{staff.name}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{staff.email}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{getDepartmentName(staff.departmentId)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${themeClasses.textSecondary}`}>{staff.specialization}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Add Student Modal
  const AddStudentModal = () => {
    if (!showAddStudentModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-lg ${themeClasses.cardBg}`} data-testid="add-student-modal">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Add New Student</h2>
            <button
              onClick={() => setShowAddStudentModal(false)}
              className={`${themeClasses.textSecondary} hover:${themeClasses.text}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={addStudent} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Name</label>
              <input
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={newStudentForm.name}
                onChange={(e) => setNewStudentForm({...newStudentForm, name: e.target.value})}
                data-testid="new-student-name-input"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Department</label>
              <select
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={newStudentForm.departmentId}
                onChange={(e) => setNewStudentForm({...newStudentForm, departmentId: e.target.value})}
                data-testid="new-student-department-select"
              >
                <option value="">Select Department...</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Email</label>
              <input
                type="email"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={newStudentForm.email}
                onChange={(e) => setNewStudentForm({...newStudentForm, email: e.target.value})}
                data-testid="new-student-email-input"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>GPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="4.0"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={newStudentForm.gpa}
                onChange={(e) => setNewStudentForm({...newStudentForm, gpa: e.target.value})}
                data-testid="new-student-gpa-input"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-white ${themeClasses.accentBg}`}
                data-testid="add-student-submit-button"
              >
                Add Student
              </button>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className={`flex-1 py-2 px-4 border rounded-md ${themeClasses.border} ${themeClasses.text}`}
                data-testid="add-student-cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Grade Management Modal
  const GradeModal = () => {
    if (!showGradeModal || !selectedSection) return null;
    
    const enrolledStudents = getEnrolledStudents(selectedSection.id);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`max-w-2xl w-full mx-4 p-6 rounded-lg shadow-lg ${themeClasses.cardBg}`} data-testid="grade-modal">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
              Manage Grades - {getCourseCode(selectedSection.courseId)}
            </h2>
            <button
              onClick={() => setShowGradeModal(false)}
              className={`${themeClasses.textSecondary} hover:${themeClasses.text}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {enrolledStudents.map(student => (
              <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className={`font-medium ${themeClasses.text}`}>{student.name}</p>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>{student.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={student.finalGrade}
                    onChange={(e) => updateGrade(student.id, selectedSection.id, e.target.value)}
                    className={`px-3 py-1 border rounded ${themeClasses.input}`}
                    data-testid={`grade-select-${student.id}`}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="C-">C-</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={() => setShowGradeModal(false)}
              className={`px-4 py-2 border rounded-md ${themeClasses.border} ${themeClasses.text}`}
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowGradeModal(false);
                alert('Grades saved successfully!');
              }}
              className={`px-4 py-2 text-white rounded-md ${themeClasses.accentBg}`}
              data-testid="save-grades-button"
            >
              Save Grades
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Department Modal
  const AddDepartmentModal = () => {
    if (!showAddDepartmentModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-lg ${themeClasses.cardBg}`} data-testid="add-department-modal">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Add New Department</h2>
            <button
              onClick={() => setShowAddDepartmentModal(false)}
              className={`${themeClasses.textSecondary} hover:${themeClasses.text}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={addDepartment} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Department Name</label>
              <input
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={newDepartmentForm.name}
                onChange={(e) => setNewDepartmentForm({...newDepartmentForm, name: e.target.value})}
                data-testid="new-department-name-input"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Department Chair</label>
              <input
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={newDepartmentForm.chair}
                onChange={(e) => setNewDepartmentForm({...newDepartmentForm, chair: e.target.value})}
                data-testid="new-department-chair-input"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-white ${themeClasses.accentBg}`}
                data-testid="add-department-submit-button"
              >
                Add Department
              </button>
              <button
                type="button"
                onClick={() => setShowAddDepartmentModal(false)}
                className={`flex-1 py-2 px-4 border rounded-md ${themeClasses.border} ${themeClasses.text}`}
                data-testid="add-department-cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Edit Department Modal
  const EditDepartmentModal = () => {
    if (!showEditDepartmentModal || !selectedDepartment) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-lg ${themeClasses.cardBg}`} data-testid="edit-department-modal">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Edit Department</h2>
            <button
              onClick={() => setShowEditDepartmentModal(false)}
              className={`${themeClasses.textSecondary} hover:${themeClasses.text}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={updateDepartment} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Department Name</label>
              <input
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={editDepartmentForm.name}
                onChange={(e) => setEditDepartmentForm({...editDepartmentForm, name: e.target.value})}
                data-testid="edit-department-name-input"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Department Chair</label>
              <input
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={editDepartmentForm.chair}
                onChange={(e) => setEditDepartmentForm({...editDepartmentForm, chair: e.target.value})}
                data-testid="edit-department-chair-input"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-white ${themeClasses.accentBg}`}
                data-testid="edit-department-submit-button"
              >
                Update Department
              </button>
              <button
                type="button"
                onClick={() => setShowEditDepartmentModal(false)}
                className={`flex-1 py-2 px-4 border rounded-md ${themeClasses.border} ${themeClasses.text}`}
                data-testid="edit-department-cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add Teaching Staff Modal
  const AddTeachingStaffModal = () => {
    if (!showAddTeachingStaffModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-lg ${themeClasses.cardBg}`} data-testid="add-teaching-staff-modal">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Add Teaching Staff</h2>
            <button
              onClick={() => setShowAddTeachingStaffModal(false)}
              className={`${themeClasses.textSecondary} hover:${themeClasses.text}`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={addTeachingStaff} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Name</label>
              <input
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={newTeachingStaffForm.name}
                onChange={(e) => setNewTeachingStaffForm({...newTeachingStaffForm, name: e.target.value})}
                data-testid="new-staff-name-input"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Email</label>
              <input
                type="email"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={newTeachingStaffForm.email}
                onChange={(e) => setNewTeachingStaffForm({...newTeachingStaffForm, email: e.target.value})}
                data-testid="new-staff-email-input"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Department</label>
              <select
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={newTeachingStaffForm.departmentId}
                onChange={(e) => setNewTeachingStaffForm({...newTeachingStaffForm, departmentId: e.target.value})}
                data-testid="new-staff-department-select"
              >
                <option value="">Select Department...</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text}`}>Specialization</label>
              <input
                type="text"
                required
                className={`mt-1 block w-full px-3 py-2 border rounded-md ${themeClasses.input}`}
                value={newTeachingStaffForm.specialization}
                onChange={(e) => setNewTeachingStaffForm({...newTeachingStaffForm, specialization: e.target.value})}
                data-testid="new-staff-specialization-input"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-white ${themeClasses.accentBg}`}
                data-testid="add-staff-submit-button"
              >
                Add Staff
              </button>
              <button
                type="button"
                onClick={() => setShowAddTeachingStaffModal(false)}
                className={`flex-1 py-2 px-4 border rounded-md ${themeClasses.border} ${themeClasses.text}`}
                data-testid="add-staff-cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render current module
  const renderCurrentModule = () => {
    switch (activeModule) {
      case '/': return <Dashboard />;
      case '/departments': return <DepartmentManagement />;
      case '/students': return <StudentManagement />;
      case '/sections': return <CourseCatalogGrading />;
      case '/enrollment': return <EnrollmentWorkflow />;
      case '/portal': return <StudentPortal />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg}`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 ${themeClasses.cardBg} border-r ${themeClasses.border} transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className={`h-8 w-8 ${themeClasses.accent}`} />
            <h1 className={`text-xl font-bold ${themeClasses.text}`}>UEMS</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`md:hidden ${themeClasses.textSecondary}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-8">
          {getNavigationItems().map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => {
                  setActiveModule(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-2 text-left ${
                  activeModule === item.path 
                    ? `${themeClasses.accent} bg-blue-600 bg-opacity-10` 
                    : `${themeClasses.text} hover:bg-opacity-5 hover:bg-blue-600`
                }`}
                data-testid={`nav-${item.path.replace('/', '') || 'dashboard'}`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Header */}
        <header className={`${themeClasses.cardBg} border-b ${themeClasses.border} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`md:hidden mr-4 ${themeClasses.textSecondary}`}
                data-testid="mobile-menu-button"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>Welcome back</p>
                <p className={`font-medium ${themeClasses.text}`}>{userRole}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${themeClasses.textSecondary} hover:${themeClasses.text}`}
                data-testid="theme-toggle-button"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button
                onClick={handleLogout}
                className={`flex items-center px-3 py-2 text-sm rounded-lg ${themeClasses.textSecondary} hover:${themeClasses.text}`}
                data-testid="logout-button"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {renderCurrentModule()}
        </main>
      </div>

      {/* Modals */}
      <AddStudentModal />
      <GradeModal />
      <AddDepartmentModal />
      <EditDepartmentModal />
      <AddTeachingStaffModal />
    </div>
  );
};

export default App;
