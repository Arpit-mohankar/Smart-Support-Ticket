export default function LoadingSkeleton() {
  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">Title</th>
            <th className="p-4 text-left">Customer</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Priority</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="border-t animate-pulse">
              <td className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </td>
              <td className="p-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
