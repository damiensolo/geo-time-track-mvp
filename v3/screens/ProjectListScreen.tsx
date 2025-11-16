import React, { useState, useRef } from 'react';
import { PROJECTS } from '../../constants';
import type { Project } from '../../types';
import { PinIcon, ChevronRightIcon } from '../../components/icons';
import { useDragToScroll } from '../../hooks/useDragToScroll';

interface ProjectListScreenProps {
  onSelectProject: (project: Project) => void;
}

const ProjectListScreen: React.FC<ProjectListScreenProps> = ({ onSelectProject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useDragToScroll(scrollRef);

  const filteredProjects = PROJECTS.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200">
        <input
          type="search"
          placeholder="Search Projects"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-base bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div ref={scrollRef} className="flex-grow overflow-y-auto no-scrollbar">
        <ul className="divide-y divide-slate-200">
          {filteredProjects.map((project) => (
            <li key={project.id}>
                <button 
                    onClick={() => onSelectProject(project)} 
                    className="w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                    <div className="flex-1 min-w-0">
                        <p className="text-[17px] font-semibold text-blue-600 truncate">{project.name}</p>
                        <div className="flex items-center mt-1 text-slate-500">
                            <PinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                            <p className="text-[15px] truncate">{project.address}</p>
                        </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-slate-300 ml-4" />
                </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProjectListScreen;