import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tickets } from "../services/api";
import { useDebounce } from "../hooks/useDebounce";
import TicketDrawer from "./TicketDrawer";
import toast from "react-hot-toast";
import LoadingSkeleton from "./LoadingSkeleton";

const STATUS_COLORS = {
  open: "bg-emerald-900/40 text-emerald-300 border border-emerald-800",
  pending: "bg-amber-900/40 text-amber-300 border border-amber-800",
  resolved: "bg-gray-800 text-gray-300 border border-gray-700"
};

const PRIORITY_COLORS = {
  high: 'bg-rose-900/40 text-rose-300 border border-rose-800',
  medium: 'bg-orange-900/40 text-orange-300 border border-orange-800',
  low: 'bg-sky-900/40 text-sky-300 border border-sky-800'
};

export default function TicketList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const debouncedSearch = useDebounce(search, 300);
  const queryClient = useQueryClient();
  const scrollPos = useRef(0);

  const getQueryKey = () => ["tickets", { page, status, priority, search: debouncedSearch }];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: getQueryKey(),
    queryFn: () =>
      tickets.getAll({
        page,
        limit: 10,
        status,
        priority,
        search: debouncedSearch,
      }),
    select: (response) => response.data,
    refetchInterval: 10000,
  });

  useEffect(() => {
    function handleScroll() {
      scrollPos.current = window.scrollY;
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if(data && scrollPos.current > 0) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPos.current);
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => tickets.update(id, updates),
    
    onMutate: async ({ id, updates }) => {
      const qKey = getQueryKey();
      await queryClient.cancelQueries({ queryKey: ["tickets"] });
      
      const previousData = queryClient.getQueryData(qKey);

      queryClient.setQueryData(qKey, (old) => {
        if(!old?.tickets) return old;
        
        return {
          ...old,
          tickets: old.tickets.map((ticket) =>
            ticket.id === id ? { ...ticket, ...updates } : ticket
          ),
        };
      });

      return { previousData };
    },
    
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getQueryKey(), context.previousData);
      }
      toast.error("Failed to update ticket");
    },
    
    onSuccess: () => {
      toast.success("Ticket updated");
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    }
  });

  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-100">Support Tickets</h1>
        <LoadingSkeleton />
      </div>
    );
  }

  const isLastPage = data?.pagination?.totalPages 
    ? page >= data.pagination.totalPages 
    : (data?.tickets?.length || 0) < 10;

  return (
    <div className="min-h-screen bg-gray-950 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Tickets</h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Manage customer support requests</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 sm:px-5 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors font-medium border border-gray-700 text-sm sm:text-base w-full sm:w-auto"
          >
            Sign Out
          </button>
        </div>

        {/* Filter controls - Responsive */}
        <div className="bg-gray-900 p-3 sm:p-5 rounded-xl shadow-lg mb-4 sm:mb-6 border border-gray-800">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="Search..."
              className="w-full sm:flex-1 sm:min-w-[200px] px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-200 placeholder-gray-500 text-sm sm:text-base"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 text-sm sm:text-base"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 text-sm sm:text-base"
              value={priority}
              onChange={e => {
                setPriority(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Loading indicator */}
        {isFetching && !isLoading && (
          <div className="bg-blue-950/50 border-l-4 border-blue-500 text-blue-300 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 sm:mb-5 text-xs sm:text-sm flex items-center">
            <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Updating tickets...
          </div>
        )}

        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden md:block bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.tickets?.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-100">{ticket.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{ticket.customer_email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data?.tickets?.length === 0 && (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-1">No tickets found</h3>
              <p className="text-gray-500 text-sm">
                {search || status || priority
                  ? "Try adjusting your filters to see more results"
                  : "There are no support tickets yet"}
              </p>
            </div>
          )}
        </div>

        {/* Mobile Card View - Hidden on desktop */}
        <div className="md:hidden space-y-3">
          {data?.tickets?.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-100 text-sm flex-1 pr-2">{ticket.title}</h3>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_COLORS[ticket.status]}`}>
                  {ticket.status}
                </span>
              </div>
              
              <p className="text-xs text-gray-400 mb-3 truncate">{ticket.customer_email}</p>
              
              <div className="flex justify-between items-center">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_COLORS[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {data?.tickets?.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 mb-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-200 mb-1">No tickets found</h3>
              <p className="text-gray-500 text-xs">
                {search || status || priority
                  ? "Try adjusting your filters"
                  : "No support tickets yet"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination - Responsive */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
            {data?.pagination?.total ? (
              <span>
                Page <span className="font-medium text-gray-300">{page}</span> of <span className="font-medium text-gray-300">{data.pagination.totalPages}</span> 
                <span className="text-gray-600 mx-2">·</span>
                <span className="font-medium text-gray-300">{data.pagination.total}</span> tickets
              </span>
            ) : null}
          </div>
          <div className="flex gap-2 justify-center sm:justify-end">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              ← Prev
            </button>
            <div className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm">
              {page}
            </div>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={isLastPage}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <TicketDrawer
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={updateMutation.mutate}
        />
      )}
    </div>
  );
}
