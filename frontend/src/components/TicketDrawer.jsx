import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notes } from '../services/api';
import toast from 'react-hot-toast';


// badge colors to match main list
const STATUS_COLORS = {
  open: "bg-emerald-900/40 text-emerald-300 border border-emerald-800",
  pending: "bg-amber-900/40 text-amber-300 border border-amber-800",
  resolved: "bg-gray-800 text-gray-300 border border-gray-700"
};


const PRIORITY_COLORS = {
  high: 'bg-rose-900/40 text-rose-300 border border-rose-800',
  medium: 'bg-orange-900/40 text-orange-300 border border-orange-800',
  low: 'bg-sky-900/40 text-sky-300 border border-sky-800'
}


export default function TicketDrawer({ ticket, onClose, onUpdate }) {
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [notetext, setNoteText] = useState('');
  const queryClient = useQueryClient();


  const { data: ticketNotes, isLoading: notesLoading } = useQuery({
    queryKey: ['notes', ticket.id],
    queryFn: async () => {
      const response = await notes.getByTicket(ticket.id);
      console.log('Notes response:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    },
    initialData: [],
  });


   const handleaddNote = () => {
    console.log(' Buttons clicked!');
    console.log(' Note text:', notetext);
    console.log(' Ticket ID:', ticket.id);
    
    if (!notetext.trim()) {
      console.warn(' Note text is empty');
      return;
    }
    
    console.log(' Calling mutationd');
    addNote_Mutation.mutate(notetext);
  };


  const addNote_Mutation = useMutation({
    mutationFn: (text) => {
      console.log('Mutation called with text:', text);
      return notes.create(ticket.id, { text });
    },
    onMutate: async (text) => {
      console.log(' onMutate - Optimistic update');
      await queryClient.cancelQueries(['notes', ticket.id]);
      const previousNotes = queryClient.getQueryData(['notes', ticket.id]);
      
      console.log('Previous notes:', previousNotes);
      
      const currentNotess = Array.isArray(previousNotes) ? previousNotes : [];
      
      const optimisticNote = {
        id: Date.now(),
        text,
        user_name: 'You',
        created_at: new Date().toISOString()
      };
      
      queryClient.setQueryData(['notes', ticket.id], [optimisticNote, ...currentNotess]);
      
      return { previousNotes };
    },
    onError: (err, variables, context) => {
      console.error(' onError - rolling back', err);
      queryClient.setQueryData(['notes', ticket.id], context.previousNotes || []);
      toast.error('Failed add notes');
    },
    onSuccess: (data) => {
      console.log(' onSuccess - Note added', data);
      setNoteText('');
      queryClient.invalidateQueries(['notes', ticket.id]);
      toast.success('Note added');
    },
  });


  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* backdrop with bluish tint */}
      <div 
        className="absolute inset-0 transition-opacity pointer-events-auto"
        onClick={onClose}
      ></div>


      {/* Drawer Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-gray-900 shadow-2xl overflow-y-auto pointer-events-auto border-l border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Ticket Details</h2>
            <p className="text-sm text-gray-400 mt-0.5">#{ticket.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl font-bold leading-none transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800"
          >
            ✕
          </button>
        </div>


        {/* Content */}
        <div className="p-6">
          {/* Ticket info */}
          <div className="mb-6 bg-gray-800/50 p-5 rounded-xl border border-gray-800">
            <h3 className="font-bold text-lg mb-2 text-gray-100">{ticket.title}</h3>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">{ticket.description}</p>
            
            {/* status and priority badges */}
            <div className="flex gap-2 mb-4">
              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              
              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[priority]}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">
                <span className="font-semibold text-gray-300">Customer:</span> {ticket.customer_email}
              </p>
              <p className="text-gray-400">
                <span className="font-semibold text-gray-300">Created:</span> {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
          </div>


          {/* Status Dropdown */}
          <div className="mb-5">
            <label className="block mb-2 font-semibold text-gray-300 text-sm">Update Status</label>
            <div className="relative">
              <select
                className="w-full p-3 bg-gray-800 border-2 border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-600 appearance-none cursor-pointer hover:border-gray-600 transition-colors"
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setStatus(newStatus);
                  onUpdate({ 
                    id: ticket.id, 
                    updates: { status: newStatus, priority } 
                  });
                }}
              >
                <option value="open" className="bg-gray-800 text-gray-200 py-2">Open</option>
                <option value="pending" className="bg-gray-800 text-gray-200 py-2">Pending</option>
                <option value="resolved" className="bg-gray-800 text-gray-200 py-2">Resolved</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>


          {/* Priority Dropdown */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-300 text-sm">Update Priority</label>
            <div className="relative">
              <select
                className="w-full p-3 bg-gray-800 border-2 border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-600 appearance-none cursor-pointer hover:border-gray-600 transition-colors"
                value={priority}
                onChange={(e) => {
                  const newPriority = e.target.value;
                  setPriority(newPriority);
                  onUpdate({ 
                    id: ticket.id, 
                    updates: { status, priority: newPriority } 
                  });
                }}
              >
                <option value="low" className="bg-gray-800 text-gray-200 py-2">Low</option>
                <option value="medium" className="bg-gray-800 text-gray-200 py-2">Medium</option>
                <option value="high" className="bg-gray-800 text-gray-200 py-2">High</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>


          {/* divider */}
          <hr className="my-7 border-gray-800" />


          {/* Notes Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-100">Internal Notes</h3>
            
            {/* Add Note form */}
            <div className="mb-6">
              <textarea
                className="w-full p-3 bg-gray-800 border-2 border-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-600 placeholder-gray-500 resize-none hover:border-gray-600 transition-colors"
                rows="4"
                placeholder="Add a note to this ticket..."
                value={notetext}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button
                onClick={handleaddNote}
                className="mt-3 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                disabled={!notetext.trim()}
              >
                Add Note
              </button>
            </div>


            {/* Notes List */}
            <div className="space-y-3">
              {notesLoading ? (
                <p className="text-center text-gray-500 py-8">Loading notes...</p>
              ) : ticketNotes && ticketNotes.length > 0 ? (
                ticketNotes.map((note) => (
                  <div key={note.id} className="bg-gray-800/60 p-4 rounded-lg border border-gray-700/50 hover:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-cyan-400">{note.user_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{note.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-800 border-dashed">
                  <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <p className="text-gray-400 font-medium">No notes yet</p>
                  <p className="text-sm mt-1 text-gray-500">Be the first to add a note</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
