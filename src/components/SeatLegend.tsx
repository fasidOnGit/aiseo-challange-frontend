export function SeatLegend() {
  return (
    <div className="seat-legend bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Venue Guide</h3>
      
      {/* Section Types */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Section Types</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded border border-blue-400 bg-blue-50"></div>
            <span className="text-sm text-gray-700">Premium (Tier 1)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded border border-green-400 bg-green-50"></div>
            <span className="text-sm text-gray-700">Standard (Tier 2)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded border border-amber-400 bg-amber-50"></div>
            <span className="text-sm text-gray-700">Economy (Tier 3)</span>
          </div>
        </div>
      </div>

      {/* Seat Status */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Seat Status</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-green-500 rounded-md bg-white"></div>
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-green-500 rounded-md bg-green-500"></div>
            <span className="text-sm text-gray-700">Selected</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-amber-500 rounded-md bg-amber-500"></div>
            <span className="text-sm text-gray-700">Reserved</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-red-500 rounded-md bg-red-500"></div>
            <span className="text-sm text-gray-700">Sold</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-purple-500 rounded-md bg-purple-500"></div>
            <span className="text-sm text-gray-700">Held</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Click on available seats to select/deselect them. Reserved, sold, and held seats cannot be selected.
        </p>
      </div>
    </div>
  );
}
