from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from contextlib import asynccontextmanager 

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
# 1. Define the lifespan context manager
@asynccontextmanager
async def lifespan_handler(app: FastAPI):
    # STARTUP LOGIC: You can add startup tasks here if needed
    logger.info("Application starting up...")
    
    yield # <--- Application is now running and serving requests
    
    # SHUTDOWN LOGIC: This replaces @app.on_event("shutdown")
    logger.info("Application shutting down, closing DB client...")
    client.close() # ⬅️ Your shutdown logic moved here
    logger.info("DB client closed.")

# Create the main app without a prefix
app = FastAPI(lifespan=lifespan_handler)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class Department(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    chair: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DepartmentCreate(BaseModel):
    name: str
    chair: str

class DepartmentUpdate(BaseModel):
    name: str = None
    chair: str = None

class TeachingStaff(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    department_id: str
    specialization: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TeachingStaffCreate(BaseModel):
    name: str
    email: str
    department_id: str
    specialization: str

class TeachingStaffUpdate(BaseModel):
    name: str = None
    email: str = None
    department_id: str = None
    specialization: str = None

class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    name: str
    credits: int
    department_id: str
    teaching_staff_id: Optional[str] = None
    schedule_day: Optional[str] = None
    schedule_time: Optional[str] = None
    room: Optional[str] = None
    capacity: int = 30
    current_enrollment: int = 0
    semester: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CourseCreate(BaseModel):
    code: str
    name: str
    credits: int
    department_id: str
    teaching_staff_id: Optional[str] = None
    schedule_day: Optional[str] = None
    schedule_time: Optional[str] = None
    room: Optional[str] = None
    capacity: int = 30
    semester: Optional[str] = None

class CourseUpdate(BaseModel):
    code: str = None
    name: str = None
    credits: int = None
    department_id: str = None
    teaching_staff_id: str = None
    schedule_day: str = None
    schedule_time: str = None
    room: str = None
    capacity: int = None
    semester: str = None

class CourseAssignment(BaseModel):
    course_id: str
    teaching_staff_id: str

class CourseRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str
    teaching_staff_id: str
    department_id: str
    request_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # pending, approved, rejected
    requested_by: str  # staff member name
    notes: Optional[str] = None

class CourseRequestCreate(BaseModel):
    course_id: str
    teaching_staff_id: str
    notes: Optional[str] = None

class CourseRequestUpdate(BaseModel):
    status: str  # approved, rejected
    notes: Optional[str] = None

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    role: str  # Admin, Chair, Secretary, Teaching Staff, Student
    department_id: Optional[str] = None
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    role: str
    department_id: Optional[str] = None
    name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Department endpoints
@api_router.post("/departments", response_model=Department)
async def create_department(department: DepartmentCreate):
    department_dict = department.dict()
    department_obj = Department(**department_dict)
    await db.departments.insert_one(department_obj.dict())
    return department_obj

@api_router.get("/departments", response_model=List[Department])
async def get_departments():
    departments = await db.departments.find().to_list(1000)
    return [Department(**dept) for dept in departments]

@api_router.get("/departments/{department_id}", response_model=Department)
async def get_department(department_id: str):
    department = await db.departments.find_one({"id": department_id})
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return Department(**department)

@api_router.put("/departments/{department_id}", response_model=Department)
async def update_department(department_id: str, department_update: DepartmentUpdate):
    update_data = {k: v for k, v in department_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.departments.update_one(
        {"id": department_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    
    updated_department = await db.departments.find_one({"id": department_id})
    return Department(**updated_department)

@api_router.delete("/departments/{department_id}")
async def delete_department(department_id: str):
    # Check if there are teaching staff in this department
    staff_count = await db.teaching_staff.count_documents({"department_id": department_id})
    if staff_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete department with existing teaching staff")
    
    result = await db.departments.delete_one({"id": department_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    
    return {"message": "Department deleted successfully"}

# Teaching Staff endpoints
@api_router.post("/teaching-staff", response_model=TeachingStaff)
async def create_teaching_staff(staff: TeachingStaffCreate):
    # Verify department exists
    department = await db.departments.find_one({"id": staff.department_id})
    if not department:
        raise HTTPException(status_code=400, detail="Department not found")
    
    staff_dict = staff.dict()
    staff_obj = TeachingStaff(**staff_dict)
    await db.teaching_staff.insert_one(staff_obj.dict())
    return staff_obj

@api_router.get("/teaching-staff", response_model=List[TeachingStaff])
async def get_teaching_staff(department_id: str = None):
    if department_id:
        staff_list = await db.teaching_staff.find({"department_id": department_id}).to_list(1000)
    else:
        staff_list = await db.teaching_staff.find().to_list(1000)
    return [TeachingStaff(**staff) for staff in staff_list]

@api_router.get("/teaching-staff/{staff_id}", response_model=TeachingStaff)
async def get_teaching_staff_member(staff_id: str):
    staff = await db.teaching_staff.find_one({"id": staff_id})
    if not staff:
        raise HTTPException(status_code=404, detail="Teaching staff member not found")
    return TeachingStaff(**staff)

@api_router.put("/teaching-staff/{staff_id}", response_model=TeachingStaff)
async def update_teaching_staff(staff_id: str, staff_update: TeachingStaffUpdate):
    update_data = {k: v for k, v in staff_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Verify department exists if department_id is being updated
    if "department_id" in update_data:
        department = await db.departments.find_one({"id": update_data["department_id"]})
        if not department:
            raise HTTPException(status_code=400, detail="Department not found")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.teaching_staff.update_one(
        {"id": staff_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Teaching staff member not found")
    
    updated_staff = await db.teaching_staff.find_one({"id": staff_id})
    return TeachingStaff(**updated_staff)

@api_router.delete("/teaching-staff/{staff_id}")
async def delete_teaching_staff(staff_id: str):
    # Check if staff has assigned courses
    course_count = await db.courses.count_documents({"teaching_staff_id": staff_id})
    if course_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete teaching staff with assigned courses")
    
    result = await db.teaching_staff.delete_one({"id": staff_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Teaching staff member not found")
    
    return {"message": "Teaching staff member deleted successfully"}

# Course endpoints
@api_router.post("/courses", response_model=Course)
async def create_course(course: CourseCreate):
    # Verify department exists
    department = await db.departments.find_one({"id": course.department_id})
    if not department:
        raise HTTPException(status_code=400, detail="Department not found")
    
    # Verify teaching staff exists if provided
    if course.teaching_staff_id:
        staff = await db.teaching_staff.find_one({"id": course.teaching_staff_id})
        if not staff:
            raise HTTPException(status_code=400, detail="Teaching staff member not found")
    
    course_dict = course.dict()
    course_obj = Course(**course_dict)
    await db.courses.insert_one(course_obj.dict())
    return course_obj

@api_router.get("/courses", response_model=List[Course])
async def get_courses(department_id: str = None, teaching_staff_id: str = None):
    query = {}
    if department_id:
        query["department_id"] = department_id
    if teaching_staff_id:
        query["teaching_staff_id"] = teaching_staff_id
    
    courses = await db.courses.find(query).to_list(1000)
    return [Course(**course) for course in courses]

@api_router.put("/courses/{course_id}", response_model=Course)
async def update_course(course_id: str, course_update: CourseUpdate):
    update_data = {k: v for k, v in course_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Verify department exists if department_id is being updated
    if "department_id" in update_data:
        department = await db.departments.find_one({"id": update_data["department_id"]})
        if not department:
            raise HTTPException(status_code=400, detail="Department not found")
    
    # Verify teaching staff exists if teaching_staff_id is being updated
    if "teaching_staff_id" in update_data:
        staff = await db.teaching_staff.find_one({"id": update_data["teaching_staff_id"]})
        if not staff:
            raise HTTPException(status_code=400, detail="Teaching staff member not found")
    
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.courses.update_one(
        {"id": course_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    updated_course = await db.courses.find_one({"id": course_id})
    return Course(**updated_course)

# Helper function to check time conflicts
async def check_time_conflicts(teaching_staff_id: str, schedule_day: str, schedule_time: str, exclude_course_id: str = None):
    """Check if a teaching staff member has conflicting schedules"""
    query = {
        "teaching_staff_id": teaching_staff_id,
        "schedule_day": schedule_day,
        "schedule_time": schedule_time
    }
    if exclude_course_id:
        query["id"] = {"$ne": exclude_course_id}
    
    conflicting_courses = await db.courses.find(query).to_list(1000)
    return conflicting_courses

# Course Assignment endpoints
@api_router.post("/courses/{course_id}/assign")
async def assign_course_to_staff(course_id: str, assignment: CourseAssignment):
    """Assign a course to teaching staff (for Chair/Secretary)"""
    
    # Verify course exists
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Verify teaching staff exists
    staff = await db.teaching_staff.find_one({"id": assignment.teaching_staff_id})
    if not staff:
        raise HTTPException(status_code=404, detail="Teaching staff member not found")
    
    # Verify staff is from same department as course
    if staff["department_id"] != course["department_id"]:
        raise HTTPException(status_code=400, detail="Teaching staff must be from the same department as the course")
    
    # Check for time conflicts if course has schedule
    if course.get("schedule_day") and course.get("schedule_time"):
        conflicts = await check_time_conflicts(
            assignment.teaching_staff_id, 
            course["schedule_day"], 
            course["schedule_time"], 
            course_id
        )
        if conflicts:
            conflict_names = [f"{c['code']} - {c['name']}" for c in conflicts]
            raise HTTPException(
                status_code=400, 
                detail=f"Time conflict with existing courses: {', '.join(conflict_names)}"
            )
    
    # Update course assignment
    result = await db.courses.update_one(
        {"id": course_id},
        {"$set": {"teaching_staff_id": assignment.teaching_staff_id, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Return updated course
    updated_course = await db.courses.find_one({"id": course_id})
    return Course(**updated_course)

@api_router.delete("/courses/{course_id}/unassign")
async def unassign_course_from_staff(course_id: str):
    """Unassign a course from teaching staff"""
    
    result = await db.courses.update_one(
        {"id": course_id},
        {"$set": {"teaching_staff_id": None, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    updated_course = await db.courses.find_one({"id": course_id})
    return Course(**updated_course)

# Course Request endpoints (for Teaching Staff)
@api_router.post("/course-requests", response_model=CourseRequest)
async def create_course_request(request: CourseRequestCreate):
    """Create a course request by teaching staff"""
    
    # Verify course exists
    course = await db.courses.find_one({"id": request.course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Verify teaching staff exists
    staff = await db.teaching_staff.find_one({"id": request.teaching_staff_id})
    if not staff:
        raise HTTPException(status_code=404, detail="Teaching staff member not found")
    
    # Verify staff is from same department as course
    if staff["department_id"] != course["department_id"]:
        raise HTTPException(status_code=400, detail="You can only request courses from your department")
    
    # Check if course is already assigned
    if course.get("teaching_staff_id"):
        raise HTTPException(status_code=400, detail="Course is already assigned to another staff member")
    
    # Check if there's already a pending request for this course by this staff
    existing_request = await db.course_requests.find_one({
        "course_id": request.course_id,
        "teaching_staff_id": request.teaching_staff_id,
        "status": "pending"
    })
    if existing_request:
        raise HTTPException(status_code=400, detail="You already have a pending request for this course")
    
    request_dict = request.dict()
    request_obj = CourseRequest(
        **request_dict,
        department_id=staff["department_id"],
        requested_by=staff["name"]
    )
    
    await db.course_requests.insert_one(request_obj.dict())
    return request_obj

@api_router.get("/course-requests", response_model=List[CourseRequest])
async def get_course_requests(department_id: str = None, teaching_staff_id: str = None, status: str = None):
    """Get course requests with optional filters"""
    query = {}
    if department_id:
        query["department_id"] = department_id
    if teaching_staff_id:
        query["teaching_staff_id"] = teaching_staff_id
    if status:
        query["status"] = status
    
    requests = await db.course_requests.find(query).to_list(1000)
    return [CourseRequest(**req) for req in requests]

@api_router.put("/course-requests/{request_id}", response_model=CourseRequest)
async def update_course_request(request_id: str, update: CourseRequestUpdate):
    """Update course request status (for Chair/Secretary)"""
    
    request_doc = await db.course_requests.find_one({"id": request_id})
    if not request_doc:
        raise HTTPException(status_code=404, detail="Course request not found")
    
    # If approving the request, assign the course
    if update.status == "approved":
        course = await db.courses.find_one({"id": request_doc["course_id"]})
        if course and course.get("teaching_staff_id"):
            raise HTTPException(status_code=400, detail="Course is already assigned to another staff member")
        
        # Check for time conflicts
        if course and course.get("schedule_day") and course.get("schedule_time"):
            conflicts = await check_time_conflicts(
                request_doc["teaching_staff_id"], 
                course["schedule_day"], 
                course["schedule_time"]
            )
            if conflicts:
                conflict_names = [f"{c['code']} - {c['name']}" for c in conflicts]
                raise HTTPException(
                    status_code=400, 
                    detail=f"Cannot approve: Time conflict with existing courses: {', '.join(conflict_names)}"
                )
        
        # Assign the course
        await db.courses.update_one(
            {"id": request_doc["course_id"]},
            {"$set": {"teaching_staff_id": request_doc["teaching_staff_id"], "updated_at": datetime.utcnow()}}
        )
    
    # Update request status
    update_data = update.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.course_requests.update_one(
        {"id": request_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course request not found")
    
    updated_request = await db.course_requests.find_one({"id": request_id})
    return CourseRequest(**updated_request)

@api_router.get("/staff/{staff_id}/courses", response_model=List[Course])
async def get_staff_courses(staff_id: str):
    """Get all courses assigned to a specific teaching staff member"""
    
    # Verify staff exists
    staff = await db.teaching_staff.find_one({"id": staff_id})
    if not staff:
        raise HTTPException(status_code=404, detail="Teaching staff member not found")
    
    courses = await db.courses.find({"teaching_staff_id": staff_id}).to_list(1000)
    return [Course(**course) for course in courses]

@api_router.get("/departments/{department_id}/unassigned-courses", response_model=List[Course])
async def get_unassigned_courses_by_department(department_id: str):
    """Get all unassigned courses in a department"""
    
    # Verify department exists
    department = await db.departments.find_one({"id": department_id})
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    courses = await db.courses.find({
        "department_id": department_id,
        "$or": [
            {"teaching_staff_id": {"$exists": False}},
            {"teaching_staff_id": None}
        ]
    }).to_list(1000)
    
    return [Course(**course) for course in courses]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)



# @app.on_event("shutdown")
# async def shutdown_db_client():
#     client.close()
