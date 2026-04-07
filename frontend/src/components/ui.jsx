export function StatCard({ title, value, icon: Icon, color = 'indigo', subtitle }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
}

export function DataTable({ columns, data, onRowClick, emptyMessage = 'No data found' }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500">
        Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-gray-100 text-gray-700',
    ADMIN: 'bg-purple-100 text-purple-700',
    TEACHER: 'bg-blue-100 text-blue-700',
    STUDENT: 'bg-green-100 text-green-700',
    PRESENT: 'bg-green-100 text-green-700',
    ABSENT: 'bg-red-100 text-red-700',
    LATE: 'bg-amber-100 text-amber-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
