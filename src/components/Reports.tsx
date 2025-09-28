import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export default function Reports() {
  const reports = useQuery(api.reports.getReports, {});
  const generateDailyReport = useAction(api.reports.generateDailyReport);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const result = await generateDailyReport();
      toast.success("Daily report generated successfully!");
      console.log("Generated report:", result);
    } catch (error) {
      console.error("Report generation error:", error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const viewReport = (report: any) => {
    try {
      const reportData = JSON.parse(report.reportData);
      setSelectedReport({ ...report, parsedData: reportData });
    } catch (error) {
      toast.error("Failed to parse report data");
    }
  };

  if (reports === undefined) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
            <p className="text-gray-600">
              Generate and view system reports for train operations
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </div>
            ) : (
              "Generate Daily Report"
            )}
          </button>
        </div>

        {/* Report Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedReport.reportType.charAt(0).toUpperCase() + selectedReport.reportType.slice(1)} Report
                  </h3>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                {selectedReport.parsedData && (
                  <div className="space-y-6">
                    {/* Report Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedReport.parsedData.totalTrains}
                        </div>
                        <div className="text-sm text-blue-700">Total Trains</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedReport.parsedData.readyTrains}
                        </div>
                        <div className="text-sm text-green-700">Ready</div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedReport.parsedData.standbyTrains}
                        </div>
                        <div className="text-sm text-yellow-700">Standby</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedReport.parsedData.maintenanceTrains}
                        </div>
                        <div className="text-sm text-red-700">Maintenance</div>
                      </div>
                    </div>

                    {/* Health & Safety Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Health Status</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-green-600">Good:</span>
                            <span className="font-medium">{selectedReport.parsedData.healthStats.good}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-600">Fair:</span>
                            <span className="font-medium">{selectedReport.parsedData.healthStats.fair}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-600">Poor:</span>
                            <span className="font-medium">{selectedReport.parsedData.healthStats.poor}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Safety Status</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-green-600">Cleared:</span>
                            <span className="font-medium">{selectedReport.parsedData.safetyStats.cleared}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-600">Pending:</span>
                            <span className="font-medium">{selectedReport.parsedData.safetyStats.pending}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-600">Failed:</span>
                            <span className="font-medium">{selectedReport.parsedData.safetyStats.failed}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Train Details */}
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Train Details</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Train ID
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Health
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Safety
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Crew
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedReport.parsedData.trains.map((train: any) => (
                              <tr key={train.trainId}>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                  {train.trainId}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    train.finalResult === "Ready" ? "bg-green-100 text-green-800" :
                                    train.finalResult === "Standby" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                  }`}>
                                    {train.finalResult}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900">{train.health}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{train.safetyStatus}</td>
                                <td className="px-4 py-2 text-sm">
                                  {train.crewAvailable ? "✅" : "❌"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports List */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Reports</h3>
          
          {reports && reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(report.generatedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.generatedBy.slice(-8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => viewReport(report)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-gray-500 mb-4">No reports generated yet</p>
              <p className="text-sm text-gray-400">Click "Generate Daily Report" to create your first report</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
