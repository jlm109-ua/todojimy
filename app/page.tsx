'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Draggable from 'react-draggable';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { ChevronDown, ChevronUp, Plus, Check, Trash2 } from 'lucide-react';
import Background from './components/Background';
import { supabase } from './lib/supabaseClient';
import { CategoryInput } from './components/CategoryInputProps';

interface Task {
  id: string;
  title: string;
  description: string;
  importance: string;
  category: string;
  expanded: boolean;
  completed: boolean;
  position?: { x: number; y: number };
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    importance: 'medium',
    category: '',
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(sortTasks(data));
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('category')
      .not('category', 'is', null);
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      const uniqueCategories = Array.from(
        new Set(data.map((item) => item.category))
      );
      setCategories(uniqueCategories);
    }
  };

  const addTask = async () => {
    if (newTask.title.trim() !== '') {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...newTask, completed: false, expanded: false }])
        .select();
      if (error) {
        console.error('Error adding task:', error);
      } else {
        setTasks((prevTasks) => sortTasks([...prevTasks, data[0]]));
        setNewTask({
          title: '',
          description: '',
          importance: 'medium',
          category: '',
        });
        if (!categories.includes(newTask.category) && newTask.category !== '') {
          setCategories([...categories, newTask.category]);
        }
      }
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

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Error deleting task:', error);
    } else {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    }
  };

  const updateTaskPosition = (
    id: string,
    position: { x: number; y: number }
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, position } : task))
    );
    // Update the position in the database asynchronously
    supabase
      .from('tasks')
      .update({ position })
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating task position:', error);
        }
      });
  };

  const filteredTasks =
    selectedCategory === null
      ? tasks
      : selectedCategory === 'none'
      ? tasks.filter((task) => !task.category)
      : tasks.filter((task) => task.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-gray-100 overflow-hidden">
      <Canvas className="fixed inset-0 -z-10">
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} />
        <Background />
      </Canvas>

      {/* Floating form for desktop, fixed at top for mobile */}
      <div
        className={`${
          isMobile
            ? 'fixed top-12 left-0 right-0 z-20 bg-black'
            : 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20'
        } transition-all duration-300 ${
          isFormVisible
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div
          className={`bg-black bg-opacity-80 p-6 shadow-lg ${
            isMobile ? 'w-full' : 'max-w-md rounded-lg'
          }`}
        >
          <h1 className="text-2xl font-bold text-center mb-4">ToDo</h1>
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="bg-black border-white rounded-none font-mono text-sm"
            />
            <Textarea
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="bg-black border-white rounded-none font-mono text-sm"
            />
            <Select
              value={newTask.importance}
              onValueChange={(value) =>
                setNewTask({ ...newTask, importance: value })
              }
            >
              <SelectTrigger className="bg-black border-white rounded-none font-mono text-sm">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <CategoryInput
              value={newTask.category}
              onChange={(value) => setNewTask({ ...newTask, category: value })}
              categories={categories}
            />
            <Button
              onClick={addTask}
              className="w-full bg-red-600 hover:bg-red-700 rounded-none font-mono text-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Toggle form visibility button (moved lower) */}
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        className="fixed top-4 right-4 z-30 bg-red-600 hover:bg-red-700 text-white p-2"
      >
        {isFormVisible ? 'Hide Form' : 'Show Form'}
      </button>

      {/* Category filter (moved lower) */}
      <div className="fixed top-4 left-4 z-30 w-64">
        <Select
          value={selectedCategory === null ? 'all' : selectedCategory}
          onValueChange={(value) =>
            setSelectedCategory(value === 'all' ? null : value)
          }
        >
          <SelectTrigger className="bg-black border-white rounded-none font-mono text-sm">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="none">No category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks */}
      <div
        className={`${
          isMobile ? 'mt-4 px-4 pb-4' : 'absolute inset-0'
        } overflow-hidden`}
      >
        {filteredTasks.map((task) =>
          isMobile ? (
            <div
              key={task.id}
              className="mb-4 bg-black p-4 border border-white shadow-lg rounded-lg"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
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
                    onClick={() => toggleCompleted(task.id)}
                    className="hover:bg-gray-800"
                  >
                    <Check
                      className={`h-4 w-4 ${
                        task.completed ? 'text-green-500' : 'text-gray-500'
                      }`}
                    />
                  </Button>
                  <div
                    className={`w-3 h-3 ${getImportanceColor(task.importance)}`}
                  />
                  <span className="text-xs text-gray-400">
                    {task.category || 'No category'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="hover:bg-gray-800"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <h3
                className={`font-mono text-sm mt-2 ${
                  task.completed ? 'line-through text-gray-500' : ''
                }`}
              >
                {task.title}
              </h3>
              {task.expanded && task.description && (
                <p className="mt-2 text-sm text-gray-400 font-mono">
                  {task.description}
                </p>
              )}
            </div>
          ) : (
            <Draggable
              key={task.id}
              defaultPosition={task.position || { x: 0, y: 0 }}
              onStop={(e, data) =>
                updateTaskPosition(task.id, { x: data.x, y: data.y })
              }
            >
              <div className="absolute items-center bg-black p-4 border border-white shadow-lg rounded-lg w-64">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
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
                      onClick={() => toggleCompleted(task.id)}
                      className="hover:bg-gray-800"
                    >
                      <Check
                        className={`h-4 w-4 ${
                          task.completed ? 'text-green-500' : 'text-gray-500'
                        }`}
                      />
                    </Button>
                    <div
                      className={`w-3 h-3 ${getImportanceColor(
                        task.importance
                      )}`}
                    />
                    <span className="text-xs text-gray-400">
                      {task.category || 'No category'}
                    </span>
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
                <h3
                  className={`font-mono text-sm ${
                    task.completed ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {task.title}
                </h3>
                {task.expanded && task.description && (
                  <p className="mt-2 text-sm text-gray-400 font-mono">
                    {task.description}
                  </p>
                )}
              </div>
            </Draggable>
          )
        )}
      </div>
    </div>
  );
}
