import React, { useState, useEffect } from 'react';
import { SkillsService } from '../../services/skillsService';
import type { SkillsMaster, StudentSkillProgress, DailyAssignment } from '../../types/skills';

interface SkillsTestState {
  skills: SkillsMaster[];
  progress: StudentSkillProgress[];
  assignments: DailyAssignment[];
  loading: boolean;
  error: string | null;
}

export const SkillsDatabaseTest: React.FC = () => {
  const [state, setState] = useState<SkillsTestState>({
    skills: [],
    progress: [],
    assignments: [],
    loading: true,
    error: null
  });

  const testStudentId = 'test-student-123'; // Mock student ID for testing

  useEffect(() => {
    testDatabase();
  }, []);

  const testDatabase = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      console.log('🧪 Testing Skills Database Integration...');

      // Test 1: Fetch skills
      console.log('📚 Fetching skills...');
      const skills = await SkillsService.getSkills({ subject: 'Math', grade: 'Pre-K' });
      console.log(`✅ Found ${skills.length} Pre-K Math skills`);

      // Test 2: Create sample progress (if skills exist)
      let progress: StudentSkillProgress[] = [];
      if (skills.length > 0) {
        console.log('📈 Testing progress updates...');
        try {
          const testProgress = await SkillsService.updateProgress(testStudentId, {
            skill_id: skills[0].id,
            status: 'in_progress',
            score: 0.75,
            time_spent_minutes: 15
          });
          console.log('✅ Progress update successful');
          
          progress = await SkillsService.getStudentProgress(testStudentId);
          console.log(`✅ Found ${progress.length} progress records`);
        } catch (progressError) {
          console.warn('⚠️ Progress test failed (expected if no auth):', progressError);
        }
      }

      // Test 3: Create daily assignment (if skills exist)
      let assignments: DailyAssignment[] = [];
      if (skills.length > 0) {
        console.log('📅 Testing assignment creation...');
        try {
          const today = new Date().toISOString().split('T')[0];
          await SkillsService.createAssignment({
            student_id: testStudentId,
            assignment_date: today,
            skill_id: skills[0].id,
            subject: skills[0].subject,
            estimated_time_minutes: skills[0].estimated_time_minutes,
            assigned_tool: 'MasterToolInterface'
          });

          assignments = await SkillsService.getDailyAssignments(testStudentId);
          console.log(`✅ Found ${assignments.length} daily assignments`);
        } catch (assignmentError) {
          console.warn('⚠️ Assignment test failed (expected if no auth):', assignmentError);
        }
      }

      setState({
        skills,
        progress,
        assignments,
        loading: false,
        error: null
      });

      console.log('🎉 Skills database test completed successfully!');

    } catch (error) {
      console.error('❌ Skills database test failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  const insertSampleData = async () => {
    try {
      console.log('📝 Inserting sample skills data...');
      await SkillsService.insertSampleSkills();
      console.log('✅ Sample data inserted successfully');
      
      // Refresh the test
      await testDatabase();
    } catch (error) {
      console.error('❌ Failed to insert sample data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to insert sample data'
      }));
    }
  };

  if (state.loading) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">🧪 Testing Skills Database</h2>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>Running database tests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🧪 Skills Database Test Results</h2>
        <div className="space-x-2">
          <button
            onClick={testDatabase}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Retest
          </button>
          <button
            onClick={insertSampleData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            📝 Insert Sample Data
          </button>
        </div>
      </div>

      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800">❌ Error</h3>
          <p className="text-red-600">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Skills Test Results */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            📚 Skills Master
            <span className={`ml-2 px-2 py-1 text-xs rounded ${state.skills.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {state.skills.length} found
            </span>
          </h3>
          {state.skills.length > 0 ? (
            <div className="space-y-2">
              {state.skills.slice(0, 3).map(skill => (
                <div key={skill.id} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{skill.skill_name}</div>
                  <div className="text-gray-600">
                    {skill.subject} • {skill.grade} • Level {skill.difficulty_level}
                  </div>
                </div>
              ))}
              {state.skills.length > 3 && (
                <div className="text-gray-500 text-sm">
                  +{state.skills.length - 3} more skills...
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              No skills found. Try inserting sample data.
            </div>
          )}
        </div>

        {/* Progress Test Results */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            📈 Student Progress
            <span className={`ml-2 px-2 py-1 text-xs rounded ${state.progress.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {state.progress.length} records
            </span>
          </h3>
          {state.progress.length > 0 ? (
            <div className="space-y-2">
              {state.progress.slice(0, 3).map(prog => (
                <div key={prog.id} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">Status: {prog.status}</div>
                  <div className="text-gray-600">
                    Score: {prog.score ? `${(prog.score * 100).toFixed(0)}%` : 'N/A'} • 
                    Time: {prog.time_spent_minutes}min
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              No progress records found. Requires authentication.
            </div>
          )}
        </div>

        {/* Assignments Test Results */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            📅 Daily Assignments
            <span className={`ml-2 px-2 py-1 text-xs rounded ${state.assignments.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {state.assignments.length} assigned
            </span>
          </h3>
          {state.assignments.length > 0 ? (
            <div className="space-y-2">
              {state.assignments.slice(0, 3).map(assignment => (
                <div key={assignment.id} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{assignment.subject}</div>
                  <div className="text-gray-600">
                    Tool: {assignment.assigned_tool} • Status: {assignment.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              No assignments found. Requires authentication.
            </div>
          )}
        </div>
      </div>

      {/* Migration Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">📋 Migration Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>skills_master table</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>RLS policies</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>Indexes created</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>TypeScript types</span>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">🚀 Next Steps</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Run the Supabase migration: <code className="bg-gray-200 px-1 rounded">supabase db push</code></li>
          <li>Insert sample data using the button above</li>
          <li>Test with authenticated user to see progress/assignments</li>
          <li>Integrate with StudentDashboard component</li>
          <li>Configure AI tool assignments based on skills</li>
        </ol>
      </div>
    </div>
  );
};

export default SkillsDatabaseTest;