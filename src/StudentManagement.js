import React, { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../src/components/ui/card";
import { Input } from "../src/components/ui/input";
import { Button } from "../src/components/ui/button";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../src/components/ui/dialog";

const API_URL = "http://localhost:8080/api/students";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    className: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(API_URL+"/fetch");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const validateInputs = () => {
    let errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.age || isNaN(formData.age)) errors.age = "Valid age is required";
    if (!formData.className) errors.className = "Class is required";
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10 || isNaN(formData.phoneNumber)) errors.phoneNumber = "Valid phone number is required";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL+"/insert";
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error("Failed to save student");
      toast.success(editingId ? "Student updated successfully" : "Student added successfully");
      fetchStudents();
      setIsDialogOpen(false);
      setEditingId(null);
      setFormData({ name: '', age: '', className: '', phoneNumber: '' });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (student) => {
    setFormData(student);
    setEditingId(student.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete student");
      toast.success("Student deleted successfully");
      fetchStudents();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-800">
                Student Management System
              </CardTitle>
              <CardDescription className="mt-2 text-gray-600">
                Manage and track student records efficiently
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Student' : 'Add New Student'}</DialogTitle>
                  <DialogDescription>Fill in the student details below</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input name="name" placeholder="Student Name" value={formData.name} onChange={handleInputChange} required />
                  {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
                  <Input name="age" placeholder="Age" value={formData.age} onChange={handleInputChange} required />
                  {errors.age && <span className="text-red-500 text-sm">{errors.age}</span>}
                  <Input name="className" placeholder="Class" value={formData.className} onChange={handleInputChange} required />
                  {errors.className && <span className="text-red-500 text-sm">{errors.className}</span>}
                  <Input name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} required />
                  {errors.phoneNumber && <span className="text-red-500 text-sm">{errors.phoneNumber}</span>}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setEditingId(null);
                    setFormData({ name: '', age: '', className: '', phoneNumber: '' });
                    setErrors({});
                  }}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'} Student</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input className="pl-10" placeholder="Search students by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4">
            {filteredStudents.map(student => (
              <Card key={student.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{student.name}</h3>
                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
                      <span>Age: {student.age}</span>
                      <span>Class: {student.className}</span>
                      <span>Phone: {student.phoneNumber}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(student)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(student.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;
