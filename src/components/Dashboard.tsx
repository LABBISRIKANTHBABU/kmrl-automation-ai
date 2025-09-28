import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const trains = useQuery(api.trains.getAllTrains);
  const processingLogs = useQuery(api.documents.getProcessingLogs, {});
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedTrain, setSelectedTrain] = useState<any>(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (trains === undefined) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!trains || trains.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Train Data Available</h2>
        <p className="text-gray-600">Initializing train data...</p>
      </div>
    );
  }

  const stats = {
    total: trains.length,
    ready: trains.filter(t => t.finalResult === "Ready").length,
    standby: trains.filter(t => t.finalResult === "Standby").length,
    maintenance: trains.filter(t => t.finalResult === "Maintenance").length,
  };

  const recentProcessing = processingLogs?.slice(0, 5) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready": return "text-green-700 bg-green-100";
      case "Standby": return "text-yellow-700 bg-yellow-100";
      case "Maintenance": return "text-red-700 bg-red-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "Good": return "text-green-600";
      case "Fair": return "text-yellow-600";
      case "Poor": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case "Cleared": return "text-green-600";
      case "Pending": return "text-yellow-600";
      case "Failed": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const viewTrainDetails = (train: any) => {
    setSelectedTrain(train);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI-Powered Train Status Dashboard</h2>
          <p className="text-gray-600">Real-time intelligent train induction monitoring with automated updates</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last Updated</p>
          <p className="text-sm font-medium">{lastUpdated.toLocaleTimeString()}</p>
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-green-600">AI Active</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="ml-2 text-blue-600">🚊</div>
          </div>
          <div className="text-sm text-blue-700">Total Trains</div>
          <div className="text-xs text-blue-600 mt-1">AI Monitored</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
            <div className="ml-2 text-green-600">✅</div>
          </div>
          <div className="text-sm text-green-700">Ready for Service</div>
          <div className="text-xs text-green-600 mt-1">AI Verified</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.standby}</div>
            <div className="ml-2 text-yellow-600">⏸️</div>
          </div>
          <div className="text-sm text-yellow-700">On Standby</div>
          <div className="text-xs text-yellow-600 mt-1">Pending Review</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-red-600">{stats.maintenance}</div>
            <div className="ml-2 text-red-600">🛠️</div>
          </div>
          <div className="text-sm text-red-700">Under Maintenance</div>
          <div className="text-xs text-red-600 mt-1">AI Flagged</div>
        </div>
      </div>

      {/* AI Processing Activity */}
      {recentProcessing.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">🤖 Recent AI Processing Activity</h3>
          <div className="space-y-2">
            {recentProcessing.map((log) => (
              <div key={log._id} className="flex items-center justify-between text-sm">
                <span className="text-purple-700">
                  Train {log.trainId} - {log.processingStatus}
                </span>
                <span className="text-purple-600">
                  {new Date(log.processedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trains Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Train ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Safety Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timetable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crew Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depot Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trains.map((train) => (
                <tr key={train._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{train.trainId}</div>
                    <div className="text-xs text-gray-500">
                      Updated: {new Date(train.lastUpdated).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getHealthColor(train.health)}`}>
                      {train.health}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getSafetyColor(train.safetyStatus)}`}>
                      {train.safetyStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {train.timetable}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${train.crewAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {train.crewAvailable ? "✅ Yes" : "❌ No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {train.depotPosition}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(train.finalResult)}`}>
                      {train.finalResult}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => viewTrainDetails(train)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Train Details Modal */}
      {selectedTrain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Train Details: {selectedTrain.trainId}
                </h3>
                <button
                  onClick={() => setSelectedTrain(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Status Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Final Status</div>
                    <div className={`text-lg font-bold ${
                      selectedTrain.finalResult === "Ready" ? "text-green-600" :
                      selectedTrain.finalResult === "Standby" ? "text-yellow-600" :
                      "text-red-600"
                    }`}>
                      {selectedTrain.finalResult}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Health</div>
                    <div className={`text-lg font-bold ${getHealthColor(selectedTrain.health)}`}>
                      {selectedTrain.health}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Safety</div>
                    <div className={`text-lg font-bold ${getSafetyColor(selectedTrain.safetyStatus)}`}>
                      {selectedTrain.safetyStatus}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Crew</div>
                    <div className={`text-lg font-bold ${selectedTrain.crewAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedTrain.crewAvailable ? "Available" : "Not Available"}
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                {selectedTrain.aiRecommendation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">🤖 AI Recommendations</h4>
                    <div className="text-sm text-blue-800">
                      {selectedTrain.aiRecommendation}
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Technical Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Depot Position:</span>
                        <span className="font-medium">{selectedTrain.depotPosition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timetable Status:</span>
                        <span className="font-medium">{selectedTrain.timetable}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coordination:</span>
                        <span className="font-medium">{selectedTrain.coordinationStatus}</span>
                      </div>
                      {selectedTrain.mileage && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mileage:</span>
                          <span className="font-medium">{selectedTrain.mileage.toLocaleString()} km</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Maintenance Information</h4>
                    <div className="space-y-2 text-sm">
                      {selectedTrain.lastMaintenance && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Maintenance:</span>
                          <span className="font-medium">
                            {new Date(selectedTrain.lastMaintenance).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {new Date(selectedTrain.lastUpdated).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
