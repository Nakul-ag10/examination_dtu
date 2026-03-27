import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Trash2, Edit, Search, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Faculty {
  id: string;
  employeeId: string;
  employeeName: string;
  section: string;
}

interface CourseEntry {
  id: string;
  program: string;
  semester: string;
  course: string;
  courseCode: string;
  subjectName: string;
  faculties: Faculty[];
  createdAt: Date;
}

export const Tab1: React.FC = () => {
  const [formData, setFormData] = useState({
    program: '',
    semester: '',
    course: '',
    courseCode: '',
    subjectName: '',
  });

  const [faculties, setFaculties] = useState<Faculty[]>([
    { id: '1', employeeId: '', employeeName: '', section: '' }
  ]);

  const [entries, setEntries] = useState<CourseEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFacultyChange = (id: string, field: keyof Faculty, value: string) => {
    setFaculties(prev =>
      prev.map(f => f.id === id ? { ...f, [field]: value } : f)
    );
  };

  const addFacultyRow = () => {
    const newFaculty: Faculty = {
      id: Date.now().toString(),
      employeeId: '',
      employeeName: '',
      section: '',
    };
    setFaculties(prev => [...prev, newFaculty]);
  };

  const removeFacultyRow = (id: string) => {
    if (faculties.length > 1) {
      setFaculties(prev => prev.filter(f => f.id !== id));
    }
  };

  const validateForm = () => {
    if (!formData.program || !formData.semester || !formData.course ||
        !formData.courseCode || !formData.subjectName) {
      toast.error('Please fill in all course details');
      return false;
    }

    const hasIncompleteFaculty = faculties.some(f =>
      !f.employeeId || !f.employeeName || !f.section
    );

    if (hasIncompleteFaculty) {
      toast.error('Please complete all faculty information');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newEntry: CourseEntry = {
      id: editingId || Date.now().toString(),
      ...formData,
      faculties: [...faculties],
      createdAt: new Date(),
    };

    if (editingId) {
      setEntries(prev => prev.map(entry => entry.id === editingId ? newEntry : entry));
      toast.success('Course entry updated successfully!');
      setEditingId(null);
    } else {
      setEntries(prev => [...prev, newEntry]);
      toast.success('Course entry added successfully!');
    }

    // Reset form
    setFormData({
      program: '',
      semester: '',
      course: '',
      courseCode: '',
      subjectName: '',
    });
    setFaculties([{ id: '1', employeeId: '', employeeName: '', section: '' }]);
  };

  const handleEdit = (entry: CourseEntry) => {
    setFormData({
      program: entry.program,
      semester: entry.semester,
      course: entry.course,
      courseCode: entry.courseCode,
      subjectName: entry.subjectName,
    });
    setFaculties(entry.faculties);
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info('Editing course entry');
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast.success('Course entry deleted');
  };

  const filteredEntries = entries.filter(entry =>
    entry.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <Card className="shadow-lg border-0 animate-in slide-in-from-top duration-500">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Course Entry' : 'Add New Course Entry'}</CardTitle>
          <CardDescription>
            Fill in the course details and assign faculty members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program">Program *</Label>
                <Select value={formData.program} onValueChange={(value) => handleFormChange('program', value)}>
                  <SelectTrigger id="program" className="transition-all hover:border-primary">
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B.Tech">B.Tech</SelectItem>
                    <SelectItem value="M.Tech">M.Tech</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="BBA">BBA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester *</Label>
                <Select value={formData.semester} onValueChange={(value) => handleFormChange('semester', value)}>
                  <SelectTrigger id="semester" className="transition-all hover:border-primary">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Input
                  id="course"
                  placeholder="e.g., Computer Science"
                  value={formData.course}
                  onChange={(e) => handleFormChange('course', e.target.value)}
                  className="transition-all hover:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code *</Label>
                <Input
                  id="courseCode"
                  placeholder="e.g., CS101"
                  value={formData.courseCode}
                  onChange={(e) => handleFormChange('courseCode', e.target.value)}
                  className="transition-all hover:border-primary"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="subjectName">Subject Name *</Label>
                <Input
                  id="subjectName"
                  placeholder="e.g., Data Structures and Algorithms"
                  value={formData.subjectName}
                  onChange={(e) => handleFormChange('subjectName', e.target.value)}
                  className="transition-all hover:border-primary"
                />
              </div>
            </div>

            {/* Faculty Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Faculty Details *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFacultyRow}
                  className="gap-2 transition-all hover:bg-primary hover:text-primary-foreground"
                >
                  <Plus className="w-4 h-4" />
                  Add Faculty
                </Button>
              </div>

              <div className="space-y-3">
                {faculties.map((faculty, index) => (
                  <Card key={faculty.id} className="p-4 bg-secondary/30 border border-border/50 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`empId-${faculty.id}`}>Employee ID</Label>
                        <Input
                          id={`empId-${faculty.id}`}
                          placeholder="e.g., EMP001"
                          value={faculty.employeeId}
                          onChange={(e) => handleFacultyChange(faculty.id, 'employeeId', e.target.value)}
                          className="transition-all hover:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`empName-${faculty.id}`}>Employee Name</Label>
                        <Input
                          id={`empName-${faculty.id}`}
                          placeholder="e.g., Dr. John Doe"
                          value={faculty.employeeName}
                          onChange={(e) => handleFacultyChange(faculty.id, 'employeeName', e.target.value)}
                          className="transition-all hover:border-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`section-${faculty.id}`}>Section</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`section-${faculty.id}`}
                            placeholder="e.g., CSE-1"
                            value={faculty.section}
                            onChange={(e) => handleFacultyChange(faculty.id, 'section', e.target.value)}
                            className="transition-all hover:border-primary"
                          >
                            {/* <SelectTrigger id={`section-${faculty.id}`} className="transition-all hover:border-primary">
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                            <SelectContent>
                              {['A', 'B', 'C', 'D', 'E', 'F'].map(section => (
                                <SelectItem key={section} value={section}>Section {section}</SelectItem>
                              ))}
                            </SelectContent> */}
                          </Input>
                          {faculties.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeFacultyRow(faculty.id)}
                              className="transition-all hover:scale-105"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full md:w-auto gap-2 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update Entry' : 'Submit Entry'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="shadow-lg border-0 animate-in slide-in-from-bottom duration-500">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Course Entries</CardTitle>
              <CardDescription>View and manage all submitted course entries</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all hover:border-primary"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No course entries found.</p>
              <p className="text-sm mt-2">Add your first entry using the form above.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Program</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Faculty Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <TableCell>{entry.program}</TableCell>
                      <TableCell>Sem {entry.semester}</TableCell>
                      <TableCell>{entry.course}</TableCell>
                      <TableCell className="font-mono">{entry.courseCode}</TableCell>
                      <TableCell>{entry.subjectName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                          {entry.faculties.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                            className="gap-2 transition-all hover:bg-primary hover:text-primary-foreground"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            className="gap-2 transition-all hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
