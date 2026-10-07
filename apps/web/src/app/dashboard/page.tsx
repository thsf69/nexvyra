'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { getDashboardMetrics, DashboardMetrics } from '@/lib/api/dashboard';

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getDashboardMetrics();
      if (res.data) setMetrics(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const renderMetricCard = (label: string, value: number, bgColor: string, textColor: string) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-4xl font-bold tracking-tight ${textColor}`}>{value}</span>
      </div>
      <div className={`mt-4 h-1 w-full rounded-full ${bgColor} opacity-20`}></div>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Overview of your workspace, tasks, and project progress.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-32">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-6 rounded-xl text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchMetrics}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : metrics ? (
          <>
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderMetricCard('Total Projects', metrics.totalProjects, 'bg-indigo-600', 'text-indigo-900')}
              {renderMetricCard('Projects In Progress', metrics.projectsInProgress, 'bg-blue-600', 'text-blue-900')}
              {renderMetricCard('Total Tasks', metrics.totalTasks, 'bg-gray-600', 'text-gray-900')}
              {renderMetricCard('Pending Tasks', metrics.pendingTasks, 'bg-yellow-600', 'text-yellow-900')}
              {renderMetricCard('Completed Tasks', metrics.completedTasks, 'bg-green-600', 'text-green-900')}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Task Progress Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Task Completion</h2>
                {metrics.totalTasks === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No tasks tracked yet.</p>
                    <Link href="/tasks/new" className="text-indigo-600 font-medium hover:text-indigo-800">
                      Create your first task
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-2xl font-bold text-green-600">
                        {Math.round((metrics.completedTasks / metrics.totalTasks) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                      <div
                        className="bg-green-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${Math.round((metrics.completedTasks / metrics.totalTasks) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{metrics.completedTasks} Completed</span>
                      <span>{metrics.pendingTasks} Pending</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/projects/new"
                    className="flex flex-col justify-center items-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors group text-center"
                  >
                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📂</span>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">Create Project</span>
                  </Link>
                  <Link
                    href="/tasks/new"
                    className="flex flex-col justify-center items-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-colors group text-center"
                  >
                    <span className="text-xl mb-1 group-hover:scale-110 transition-transform">✅</span>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">Create Task</span>
                  </Link>
                  <Link
                    href="/projects"
                    className="flex flex-col justify-center items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group text-center"
                  >
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">View All Projects</span>
                  </Link>
                  <Link
                    href="/tasks"
                    className="flex flex-col justify-center items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group text-center"
                  >
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">View All Tasks</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Empty States / Starter Call to Action */}
            {metrics.totalProjects === 0 && metrics.totalTasks === 0 && (
              <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-8 text-center">
                <h2 className="text-xl font-bold text-indigo-900 mb-2">Welcome to NEXVYRA!</h2>
                <p className="text-indigo-700 mb-6 max-w-lg mx-auto">
                  Your workspace is currently empty. Get started by creating your first project and adding tasks to track your work.
                </p>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create First Project
                </Link>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
