import { useState, useEffect, useRef, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { interpretApiError } from '../../services/api';
import { ErrorState, PermissionDenied } from '../common/DataState';
import EmptyState from '../common/EmptyState';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';

const SUB_TABS = [
  { id: 'materials', label: 'Materials' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'sessions', label: 'Live Sessions' },
  { id: 'announcements', label: 'Announcements' },
];


function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      {label ? <label className="block text-sm font-medium mb-1">{label}</label> : null}
      <select value={value} onChange={onChange} className="w-full border rounded px-3 py-2">
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default function AdminCourseContent({ focus = null }) {
  const toast = useToast();
  const showError = toast.error;
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('materials');
  const [loading, setLoading] = useState(true);
  const [loadFailure, setLoadFailure] = useState(null);
  const [coursesFailure, setCoursesFailure] = useState(null);
  const [items, setItems] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });
  const [formData, setFormData] = useState({});
  const focusRef = useRef(focus);
  focusRef.current = focus;

  useEffect(() => {
    (async () => {
      try {
        const [coursesData, instructorsData] = await Promise.all([
          adminService.getCourses(0, 100, false),
          adminService.getInstructors(0, 100),
        ]);
        const list = coursesData.items || [];
        setCourses(list);
        setCoursesFailure(null);
        setInstructors(instructorsData.items || []);
        const preferred = focus?.courseId;
        if (preferred && list.some((course) => course.id === preferred)) {
          setSelectedCourseId(preferred);
          setActiveSubTab('assignments');
        } else if (list.length) {
          setSelectedCourseId(list[0].id);
        }
      } catch (err) {
        setCourses([]);
        setCoursesFailure(await interpretApiError(err, 'Failed to load courses'));
      }
    })();
  }, [toast, focus?.courseId]);

  const loadItems = useCallback(async () => {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      setSubmissions([]);
      setSelectedAssignmentId(null);
      let data;
      if (activeSubTab === 'materials') data = await adminService.getMaterials(selectedCourseId);
      else if (activeSubTab === 'assignments') data = await adminService.getAssignments(selectedCourseId);
      else if (activeSubTab === 'sessions') data = await adminService.getSessions(selectedCourseId);
      else data = await adminService.getAnnouncements(0, 100, selectedCourseId);
      const nextItems = data.items || [];
      setItems(nextItems);
      setLoadFailure(null);
      const currentFocus = focusRef.current;
      if (
        activeSubTab === 'assignments'
        && currentFocus?.assignmentId
        && selectedCourseId === currentFocus.courseId
      ) {
        setSelectedAssignmentId(currentFocus.assignmentId);
        try {
          const subs = await adminService.getSubmissions(currentFocus.assignmentId);
          setSubmissions(Array.isArray(subs) ? subs : []);
        } catch (err) {
          const failure = await interpretApiError(err, 'Failed to load submissions');
          showError(failure.kind === 'denied' ? `Permission denied. ${failure.message}` : failure.message);
        }
      }
    } catch (err) {
      setItems([]);
      setLoadFailure(await interpretApiError(err, 'Failed to load course content'));
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, activeSubTab, showError]);

  useEffect(() => {
    if (selectedCourseId) loadItems();
  }, [selectedCourseId, loadItems]);

  useEffect(() => {
    if (!focus?.submissionId || loading) return;
    document.getElementById(`submission-${focus.submissionId}`)?.scrollIntoView({ block: 'center' });
  }, [focus?.submissionId, loading, submissions]);

  function resetForm() {
    setFormData({});
    setEditingItem(null);
    setShowForm(false);
  }

  function openCreateForm() {
    const course = courses.find((c) => c.id === selectedCourseId);
    const defaults = {
      materials: {
        course_id: selectedCourseId,
        title: '',
        description: '',
        material_type: 'video',
        content_url: '',
        order: 0,
        is_published: true,
        is_required: false,
      },
      assignments: {
        course_id: selectedCourseId,
        title: '',
        description: '',
        instructions: '',
        due_date: '',
        max_marks: 100,
        assignment_type: 'homework',
        is_published: true,
      },
      sessions: {
        course_id: selectedCourseId,
        title: '',
        description: '',
        session_type: 'online',
        start_time: '',
        end_time: '',
        meeting_link: '',
        location: '',
        instructor_id: course?.instructor_id || '',
      },
      announcements: {
        course_id: selectedCourseId,
        title: '',
        content: '',
        priority: 'normal',
        is_published: true,
      },
    };
    setFormData(defaults[activeSubTab]);
    setEditingItem(null);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.due_date) payload.due_date = new Date(payload.due_date).toISOString();
      if (payload.start_time) payload.start_time = new Date(payload.start_time).toISOString();
      if (payload.end_time) payload.end_time = new Date(payload.end_time).toISOString();
      if (activeSubTab === 'materials') {
        if (editingItem) await adminService.updateMaterial(editingItem.id, payload);
        else await adminService.createMaterial(payload);
      } else if (activeSubTab === 'assignments') {
        if (editingItem) await adminService.updateAssignment(editingItem.id, payload);
        else await adminService.createAssignment(payload);
      } else if (activeSubTab === 'sessions') {
        if (editingItem) await adminService.updateSession(editingItem.id, payload);
        else await adminService.createSession(payload);
      } else if (editingItem) await adminService.updateAnnouncement(editingItem.id, payload);
      else await adminService.createAnnouncement(payload);
      toast.success(editingItem ? 'Updated' : 'Created');
      resetForm();
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return;
    try {
      if (activeSubTab === 'materials') await adminService.deleteMaterial(id);
      else if (activeSubTab === 'assignments') await adminService.deleteAssignment(id);
      else if (activeSubTab === 'sessions') await adminService.deleteSession(id);
      else await adminService.deleteAnnouncement(id);
      toast.success('Deleted');
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  }

  function handleEdit(item) {
    const data = { ...item };
    if (data.due_date) data.due_date = data.due_date.slice(0, 16);
    if (data.start_time) data.start_time = data.start_time.slice(0, 16);
    if (data.end_time) data.end_time = data.end_time.slice(0, 16);
    setFormData(data);
    setEditingItem(item);
    setShowForm(true);
  }

  async function loadSubmissions(assignmentId) {
    try {
      setSelectedAssignmentId(assignmentId);
      const data = await adminService.getSubmissions(assignmentId);
      setSubmissions(data || []);
    } catch {
      toast.error('Failed to load submissions');
    }
  }

  async function handleGrade(submissionId) {
    try {
      await adminService.gradeSubmission(
        submissionId,
        parseFloat(gradeForm.marks),
        gradeForm.feedback || null,
      );
      toast.success('Graded');
      setGradeForm({ marks: '', feedback: '' });
      if (selectedAssignmentId) loadSubmissions(selectedAssignmentId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grade');
    }
  }

  const setField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="border rounded px-3 py-2 text-sm">
            {courses.map((c) => (<option key={c.id} value={c.id}>{c.title}</option>))}
          </select>
          <Button onClick={openCreateForm}>+ Add {activeSubTab.slice(0, -1)}</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
        {SUB_TABS.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-t text-sm font-medium ${activeSubTab === tab.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {showForm && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingItem ? 'Edit' : 'Add'} {activeSubTab.slice(0, -1)}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Title" value={formData.title || ''} onChange={(e) => setField('title', e.target.value)} required />
            {activeSubTab === 'materials' && (
              <>
                <SelectField label="Type" value={formData.material_type || 'video'} onChange={(e) => setField('material_type', e.target.value)} options={['video', 'document', 'link', 'assignment_instruction']} />
                <Input label="Content URL" value={formData.content_url || ''} onChange={(e) => setField('content_url', e.target.value)} />
                <Input label="Order" type="number" value={formData.order ?? 0} onChange={(e) => setField('order', parseInt(e.target.value, 10))} />
              </>
            )}
            {activeSubTab === 'assignments' && (
              <>
                <div><label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3} value={formData.description || ''} onChange={(e) => setField('description', e.target.value)} required /></div>
                <Input label="Due Date" type="datetime-local" value={formData.due_date || ''} onChange={(e) => setField('due_date', e.target.value)} />
                <Input label="Max Marks" type="number" value={formData.max_marks ?? 100} onChange={(e) => setField('max_marks', parseFloat(e.target.value))} />
                <SelectField label="Type" value={formData.assignment_type || 'homework'} onChange={(e) => setField('assignment_type', e.target.value)} options={['homework', 'project', 'quiz', 'exam']} />
              </>
            )}
            {activeSubTab === 'sessions' && (
              <>
                <SelectField label="Session Type" value={formData.session_type || 'online'} onChange={(e) => setField('session_type', e.target.value)} options={['online', 'physical', 'hybrid']} />
                <Input label="Start" type="datetime-local" value={formData.start_time || ''} onChange={(e) => setField('start_time', e.target.value)} required />
                <Input label="End" type="datetime-local" value={formData.end_time || ''} onChange={(e) => setField('end_time', e.target.value)} required />
                <Input label="Meeting Link" value={formData.meeting_link || ''} onChange={(e) => setField('meeting_link', e.target.value)} />
                <Input label="Location" value={formData.location || ''} onChange={(e) => setField('location', e.target.value)} />
                <SelectField label="Instructor" value={formData.instructor_id || ''} onChange={(e) => setField('instructor_id', e.target.value)} options={instructors.map((i) => ({ value: i.id, label: i.full_name || i.specialization || 'Instructor not assigned' }))} />
              </>
            )}
            {activeSubTab === 'announcements' && (
              <>
                <SelectField label="Priority" value={formData.priority || 'normal'} onChange={(e) => setField('priority', e.target.value)} options={['low', 'normal', 'high', 'urgent']} />
                <p className="block text-sm font-medium mb-1">Content</p>
                <textarea className="w-full border rounded px-3 py-2" rows={4} value={formData.content || ''} onChange={(e) => setField('content', e.target.value)} required />
              </>
            )}
            {activeSubTab !== 'announcements' && activeSubTab !== 'assignments' && (
              <>
                <p className="block text-sm font-medium mb-1">Description</p>
                <textarea className="w-full border rounded px-3 py-2" rows={2} value={formData.description || ''} onChange={(e) => setField('description', e.target.value)} />
              </>
            )}
            {activeSubTab !== 'sessions' && (
              <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_published ?? true} onChange={(e) => setField('is_published', e.target.checked)} /><span className="text-sm">Published</span></label>
            )}
            <div className="flex gap-2 pt-2"><Button type="submit">{editingItem ? 'Update' : 'Create'}</Button><Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button></div>
          </form>
        </Card>
      )}

      {coursesFailure ? (
        coursesFailure.kind === 'denied'
          ? <PermissionDenied message={coursesFailure.message} />
          : <ErrorState message={coursesFailure.message} onRetry={() => window.location.reload()} />
      ) : loadFailure ? (
        loadFailure.kind === 'denied'
          ? <PermissionDenied message={loadFailure.message} />
          : <ErrorState message={loadFailure.message} onRetry={loadItems} />
      ) : loading ? <p className="text-center py-8 text-gray-500">Loading...</p> : items.length === 0 ? (
        <EmptyState
          icon="courses"
          title="Nothing in this section yet"
          description="Create an item for this course when you are ready to publish it to students."
        />
      ) : (
        <div className="space-y-3">{items.map((item) => (
          <Card
            key={item.id}
            id={`assignment-${item.id}`}
            className={focus?.assignmentId === item.id ? 'ring-2 ring-blue-600' : ''}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="font-semibold">{item.title}</h4>
                {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                {item.content && <p className="text-sm text-gray-600 mt-1">{item.content}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Button className="text-sm" onClick={() => handleEdit(item)}>Edit</Button>
                {activeSubTab === 'assignments' && <Button className="text-sm" onClick={() => loadSubmissions(item.id)}>Submissions</Button>}
                <Button className="text-sm bg-red-500" onClick={() => handleDelete(item.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}</div>
      )}

      {selectedAssignmentId && (
        <Card className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Submissions</h3>
          {submissions.map((sub) => (
            <div
              key={sub.id}
              id={`submission-${sub.id}`}
              className={`border rounded p-4 mb-3 ${focus?.submissionId === sub.id ? 'ring-2 ring-blue-600' : ''}`}
            >
              <p className="text-sm">Student: {sub.student_id} | {sub.status}</p>
              {sub.submission_text && <p className="text-sm mt-2">{sub.submission_text}</p>}
              {sub.status !== 'graded' && (
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Marks" type="number" value={gradeForm.marks} onChange={(e) => setGradeForm((p) => ({ ...p, marks: e.target.value }))} />
                  <Input placeholder="Feedback" value={gradeForm.feedback} onChange={(e) => setGradeForm((p) => ({ ...p, feedback: e.target.value }))} />
                  <Button onClick={() => handleGrade(sub.id)}>Grade</Button>
                </div>
              )}
            </div>
          ))}
          <Button variant="secondary" onClick={() => { setSelectedAssignmentId(null); setSubmissions([]); }}>Close</Button>
        </Card>
      )}
    </div>
  );
}
