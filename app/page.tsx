'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, Plus, Check, Trash2 } from 'lucide-react';
import Background from '@/components/Background';
import { supabase } from '@/lib/supabaseClient';

interface Task {
  id: string;
  title: string;
  description: string;
  importance: string;
  expanded: boolean;
  completed: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    importance: 'medium',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(sortTasks(data));
    }
  };

  const addTask = async () => {
    if (newTask.title.trim() !== '') {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...newTask, completed: false }])
        .select();
      if (error) {
        console.error('Error adding task:', error);
      } else {
        setTasks((prevTasks) => sortTasks([...prevTasks, data[0]]));
        setNewTask({ title: '', description: '', importance: 'medium' });
      }
    }
  };

  const toggleExpand = async (id: string) => {
    const taskToUpdate = tasks.find((task) => task.id === id);
    if (taskToUpdate) {
      const { error } = await supabase
        .from('tasks')
        .update({ expanded: !taskToUpdate.expanded })
        .eq('id', id);
      if (error) {
        console.error('Error updating task:', error);
      } else {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, expanded: !task.expanded } : task
          )
        );
      }
    }
  };

  const toggleCompleted = async (id: string) => {
    const taskToUpdate = tasks.find((task) => task.id === id);
    if (taskToUpdate) {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !taskToUpdate.completed })
        .eq('id', id);
      if (error) {
        console.error('Error updating task:', error);
      } else {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          )
        );
      }
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Error deleting task:', error);
    } else {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const sortTasks = (tasksToSort: Task[]): Task[] => {
    const importanceOrder = { high: 3, medium: 2, low: 1 };
    return tasksToSort.sort(
      (a, b) =>
        importanceOrder[b.importance as keyof typeof importanceOrder] -
        importanceOrder[a.importance as keyof typeof importanceOrder]
    );
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col">
      <Canvas className="fixed inset-0 -z-10">
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} />
        <Background />
      </Canvas>
      <div className="flex-none p-4 bg-black bg-opacity-80 z-10">
        <h1 className="text-2xl font-bold text-center mb-6">Dark ToDo App</h1>
        <div className="space-y-2 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Título de la tarea"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="bg-gray-900 border-gray-700 rounded-none font-mono text-sm"
          />
          <Textarea
            placeholder="Descripción (opcional)"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="bg-gray-900 border-gray-700 rounded-none font-mono text-sm"
          />
          <Select
            value={newTask.importance}
            onValueChange={(value) =>
              setNewTask({ ...newTask, importance: value })
            }
          >
            <SelectTrigger className="bg-gray-900 border-gray-700 rounded-none font-mono text-sm">
              <SelectValue placeholder="Importancia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={addTask}
            className="w-full bg-blue-600 hover:bg-blue-700 rounded-none font-mono text-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Añadir Tarea
          </Button>
        </div>
      </div>
      <div className="flex-grow overflow-auto p-4">
        <div className="space-y-2 max-w-md mx-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-900 p-4 border border-gray-700"
            >
              <div className="flex justify-between items-center">
                <h3
                  className={`font-mono text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}
                >
                  {task.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 ${getImportanceColor(task.importance)}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCompleted(task.id)}
                    className="hover:bg-gray-800"
                  >
                    <Check
                      className={`h-4 w-4 ${task.completed ? 'text-green-500' : 'text-gray-500'}`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(task.id)}
                    className="hover:bg-gray-800"
                  >
                    {task.expanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="hover:bg-gray-800"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              {task.expanded && task.description && (
                <p className="mt-2 text-sm text-gray-400 font-mono">
                  {task.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
