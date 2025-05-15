import React, { useEffect, useState } from 'react';

const History = () => {
  const [dosingRecords, setDosingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFromLocalStorage = () => {
      try {
        const stored = localStorage.getItem("dosingRecords");
        const parsed = stored ? JSON.parse(stored) : [];
        setDosingRecords(parsed);
      } catch (err) {
        alert(`Error parsing localStorage data: ${err}`);
        setError("Failed to load local data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFromLocalStorage();
  }, []);

  return (
    <div className="p-6 bg-white min-h-screen text-black">
      <h2 className="text-3xl font-bold mb-6">History - Dosed Materials</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border bg-gray-200">
            <thead className="bg-gray-300 text-sm">
              <tr>
                <th className="p-3 border">Material</th>
                <th className="p-3 border">Recipe</th>
                <th className="p-3 border">Barcode</th>
                <th className="p-3 border">Set Point</th>
                <th className="p-3 border">Actual</th>
                <th className="p-3 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {dosingRecords.map((mat) => (
                <tr key={mat.id} className={mat.dosed ? 'bg-green-100' : 'bg-white'}>
                  <td className="p-3 border font-semibold">{mat.title}</td>
                  <td className="p-3 border">{mat.recipe}</td>
                  <td className="p-3 border text-sm">{mat.barcode}</td>
                  <td className="p-3 border">{mat.setPoint} {mat.unit}</td>
                  <td className="p-3 border">{mat.actual} {mat.unit}</td>
                  <td className="p-3 border">{mat.dosed ? 'Dosed ✅' : 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History;
